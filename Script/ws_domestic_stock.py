# -*- coding: utf-8 -*-
import json
import requests
import asyncio
import websockets
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    # Windows 환경에서 asyncio 정책 설정 (필요 없는 경우 제거 가능)
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
except Exception:
    pass

FLASK_PORT = 5000
SPRING_URL = "http://localhost:8484/api/stocks/realtime" # 데이터를 전송할 Spring Boot 서버 URL
WS_URL = "ws://ops.koreainvestment.com:31000" # 한국투자증권 실시간 웹소켓 URL
MAX_SUBS = 30

# ------------------------
# 상태 관리 (모든 스레드에서 접근)
# ------------------------
subscribed_codes = set()        # React/사용자가 원하는 최종 구독 종목 목록
active_remote_subs = set()      # 실제 WS 서버에 현재 등록된 종목 목록
lock = threading.Lock()         # 상태 변수에 대한 접근 동기화 락

# ------------------------
# 전역 이벤트 루프 생성 및 설정
# ------------------------
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# ------------------------
# asyncio 큐 생성 (loop 인자를 제거)
# ------------------------
subscribe_queue = asyncio.Queue()  # loop=loop 제거
unsubscribe_queue = asyncio.Queue() # loop=loop 제거

# ------------------------
# Flask 앱 설정
# ------------------------
app = Flask(__name__)
CORS(app)

@app.route("/subscribe", methods=["POST"])
def subscribe():
    """새 종목 구독 요청 처리 (Flask -> 큐)"""
    data = request.get_json(force=True, silent=True)
    if not data or "code" not in data:
        return "NO CODE", 400
    
    code = str(data["code"]).strip()
    if not code:
        return "NO CODE", 400

    with lock:
        if len(subscribed_codes) >= MAX_SUBS and code not in subscribed_codes:
            return f"MAX {MAX_SUBS} SUBSCRIPTIONS", 400
        subscribed_codes.add(code)

    # 큐에 넣기 (전역 루프 사용)
    asyncio.run_coroutine_threadsafe(subscribe_queue.put(code), loop)

    print(f"✅ [구독 요청] {code} => 현재 구독 목록: {subscribed_codes}")
    return "OK", 200

@app.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    """종목 구독 해제 요청 처리 (Flask -> 큐)"""
    data = request.get_json(force=True, silent=True)
    if not data:
        return "NO BODY", 400

    codes = data.get("codes")
    if not codes:
        codes = [data.get("code")]
    if not codes or not isinstance(codes, list):
        return "NO CODES or Invalid Format", 400

    codes_to_process = []
    with lock:
        for c in codes:
            c = str(c).strip()
            if c in subscribed_codes:
                subscribed_codes.discard(c)
                codes_to_process.append(c)
                print(f"🧹 [구독 해제 요청] {c} (subscribed_codes에서 제거)")

    # 큐에 넣기 (전역 루프 사용)
    for c in codes_to_process:
        asyncio.run_coroutine_threadsafe(unsubscribe_queue.put(c), loop)

    print(f"=> 현재 구독 목록: {subscribed_codes}")
    return "OK", 200

@app.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    """현재 구독 중인 목록 조회"""
    with lock:
        return jsonify(sorted(list(subscribed_codes))), 200

# ------------------------
# Spring 전송 로직
# ------------------------
def send_stock_to_spring(code, currentPrice, priceChange, changeRate):
    """실시간 주가를 Spring Boot 서버로 POST 전송"""
    payload = {
        "code": code,
        "currentPrice": currentPrice,
        "priceChange": priceChange,
        "changeRate": changeRate
    }
    print(f"➡ Spring 전송: {payload}")
    headers = {"Content-Type": "application/json"}
    try:
        # 비동기 환경이 아닌 스레드에서 동기 요청을 보냄
        requests.post(SPRING_URL, headers=headers, data=json.dumps(payload), timeout=5)
    except Exception as e:
        print("❌ Spring 전송 실패:", e)

def parse_and_forward_stock_payload(packed_str):
    """웹소켓에서 수신한 데이터를 파싱하고 Spring으로 전송"""
    try:
        # 데이터 구조: 종목코드^시간^현재가^전일대비구분^전일대비^등락율^...
        pValue = packed_str.split('^')
        code = pValue[0]
        currentPrice = pValue[2]
        priceChange = pValue[4]
        changeRate = pValue[5]

        with lock:
            # 사용자가 더 이상 원하지 않는 종목이면 전송하지 않음
            if code not in subscribed_codes:
                return

        send_stock_to_spring(code, currentPrice, priceChange, changeRate)
    except Exception as e:
        print("❌ 파싱 에러:", e, "원본:", packed_str)

# ------------------------
# WebSocket Manager (Core Logic)
# ------------------------
async def single_socket_manager():
    """웹소켓 연결 및 구독 상태 관리 (비동기 코루틴)"""
    # WS 연결을 위한 인증 정보 (실제 사용 시 유효한 키로 변경 필요)
    g_approval_key = "18e7b1ee-18a3-468d-b2ed-53de0b6d510a"
    custtype = "P" # 개인
    reconnect_backoff = 1 # 재접속 딜레이 (초)

    while True:
        try:
            # 웹소켓 연결
            async with websockets.connect(WS_URL, ping_interval=None) as websocket:
                print("🔗 WebSocket 연결 성공")
                reconnect_backoff = 1 # 성공 시 딜레이 초기화
                
                # 재연결 시 기존 구독 목록을 다시 등록
                with lock:
                    codes_to_resubscribe = list(active_remote_subs)
                    active_remote_subs.clear() # 재등록을 위해 초기화

                for code in codes_to_resubscribe:
                    # 큐 대신 직접 등록 처리
                    await subscribe_queue.put(code)

                # 메인 루프: 큐 처리 및 데이터 수신
                while True:
                    # 1. 구독 요청 처리 (Subscribe)
                    while not subscribe_queue.empty():
                        code = await subscribe_queue.get()
                        
                        with lock:
                            if code not in subscribed_codes:
                                continue # 이미 Flask에서 해제되었으면 구독 안함
                        
                        if code not in active_remote_subs:
                            # WS 서버에 구독 요청
                            payload = {
                                "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "1", "content-type": "utf-8"},
                                "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                            }
                            await websocket.send(json.dumps(payload))
                            with lock:
                                active_remote_subs.add(code)
                            print(f"✅ [서버 구독 완료] {code}")

                    # 2. 구독 해제 요청 처리 (Unsubscribe) - **수정된 핵심 로직**
                    while not unsubscribe_queue.empty():
                        code = await unsubscribe_queue.get()
                        
                        # 큐에서 꺼낸 종목이 subscribed_codes에 '여전히' 있다면 해제를 보류 (재구독 요청이 바로 뒤따랐다는 의미)
                        with lock:
                            if code in subscribed_codes:
                                print(f"ℹ️ [서버 해제 보류] {code} - subscribed_codes에 남아있어 해제하지 않음.")
                                continue 
                        
                        if code in active_remote_subs:
                            # WS 서버에 해제 요청
                            payload = {
                                "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "0", "content-type": "utf-8"},
                                "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                            }
                            await websocket.send(json.dumps(payload))
                            with lock:
                                active_remote_subs.discard(code)
                            print(f"🛑 [서버 구독 해제 완료] {code}")

                    # 3. WS 데이터 수신 (Recv)
                    try:
                        # 짧은 타임아웃을 주어 큐 처리와 데이터 수신을 번갈아 가며 진행
                        data = await asyncio.wait_for(websocket.recv(), timeout=0.1) 
                        if data and isinstance(data, bytes):
                            data = data.decode('utf-8', errors='ignore')
                        
                        # 실제 데이터 패킷 (0|H0STCNT0|...) 처리
                        if data and data[0] == '0':
                            parts = data.split('|')
                            if len(parts) >= 4 and parts[1] == "H0STCNT0":
                                parse_and_forward_stock_payload(parts[3])
                        
                        # WS 연결 확인 패킷 (1|H0STCNT0|...)은 무시
                        
                    except asyncio.TimeoutError:
                        # 타임아웃 발생 시 큐 처리로 돌아가기 위해 패스
                        pass 
                    except websockets.ConnectionClosed:
                        # 연결이 끊겼으므로 재연결 로직으로 이동
                        raise

        except Exception as e:
            # 연결 실패 또는 예외 발생
            print(f"❌ WebSocket 예외: {e}. {reconnect_backoff}초 후 재접속 시도.")
            await asyncio.sleep(reconnect_backoff)
            reconnect_backoff = min(10, reconnect_backoff * 2) # 백오프 시간 증가 (최대 10초)
        else:
            reconnect_backoff = 1

# ------------------------
# Main (앱 실행)
# ------------------------
if __name__ == "__main__":
    # Flask 쓰레드 실행
    flask_thread = threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=FLASK_PORT, debug=False, use_reloader=False),
        daemon=True
    )
    flask_thread.start()

    # WebSocket manager 실행 (메인 쓰레드에서 asyncio 이벤트 루프 실행)
    print(f"🐍 Python Real-time Stock Proxy Started on Port {FLASK_PORT}")
    try:
        loop.run_until_complete(single_socket_manager())
    except KeyboardInterrupt:
        print("프로그램 종료 (KeyboardInterrupt)")
    except Exception as e:
        print(f"메인 루프 실행 중 예외 발생: {e}")
    finally:
        # 종료 시 리소스 정리
        loop.stop()
        loop.close()