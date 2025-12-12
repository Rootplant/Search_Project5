# -*- coding: utf-8 -*-
import json
import requests
import asyncio
import websockets
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import time 

try:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
except Exception:
    pass

FLASK_PORT = 5000
SPRING_URL = "http://localhost:8484/api/stocks/realtime" 
WS_URL = "ws://ops.koreainvestment.com:31000" 
MAX_SUBS = 30  

# ------------------------
# 상태 관리 (모든 스레드에서 접근)
# ------------------------
subscribed_codes = set()        
active_remote_subs = set()      
lock = threading.Lock()         
# 🔥 추가: 구독 요청 타임스탬프를 저장하여 짧은 시간 동안 subscribed_codes 보호
subscribe_lock_timestamps = {} 
SUBSCRIBE_LOCK_DURATION = 0.5 # 0.5초 (경합 시간이 짧으므로 충분함)

# ------------------------
# 전역 이벤트 루프 생성 및 설정
# ------------------------
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# ------------------------
# 통합 명령 큐 생성 
# ------------------------
command_queue = asyncio.Queue() 

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
            return f"MAX {MAX_SUBS} SUBSCRIPTIONS OVER", 400
        
        # 1. subscribed_codes에 추가 (사용자 최종 의도 기록)
        subscribed_codes.add(code) 
        
        # 2. 🔥 구독 시간 기록 (0.5초 동안 /unsubscribe의 제거를 막음)
        subscribe_lock_timestamps[code] = time.time()

    # 큐에 명령 튜플을 넣기: (종목코드, "SUBSCRIBE")
    asyncio.run_coroutine_threadsafe(command_queue.put((code, "SUBSCRIBE")), loop)

    print(f"✅ [구독 요청] {code} => 현재 구독 목록 ({len(subscribed_codes)}/{MAX_SUBS}): {subscribed_codes}")
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
    current_time = time.time()
    
    with lock:
        for c in codes:
            c = str(c).strip()
            
            # 🔥 핵심 수정: 0.5초 내에 구독된 종목은 subscribed_codes에서 제거하지 않고 보류
            lock_time = subscribe_lock_timestamps.get(c, 0)
            if lock_time > current_time - SUBSCRIBE_LOCK_DURATION:
                print(f"⚠️ [해제 무시] {c}는 최근 {SUBSCRIBE_LOCK_DURATION}초 내 재구독되어 subscribed_codes에서 제거 보류.")
                # 이 종목은 subscribed_codes에 남아있으므로 WS Manager가 해제하지 않음
                continue
                
            if c in subscribed_codes:
                # subscribed_codes에서 제거
                subscribed_codes.discard(c)
                codes_to_process.append(c)
                print(f"🧹 [구독 해제 요청] {c} (subscribed_codes에서 제거)")

    # 큐에 명령 튜플을 넣기: (종목코드, "UNSUBSCRIBE")
    for c in codes_to_process:
        asyncio.run_coroutine_threadsafe(command_queue.put((c, "UNSUBSCRIBE")), loop)

    print(f"=> 현재 구독 목록 ({len(subscribed_codes)}/{MAX_SUBS}): {subscribed_codes}")
    return "OK", 200

@app.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    """현재 구독 중인 목록 조회"""
    with lock:
        return jsonify(sorted(list(subscribed_codes))), 200

# ------------------------
# Spring 전송 로직 (로그 전체 활성화)
# ------------------------
def send_stock_to_spring(code, currentPrice, priceChange, changeRate):
    """실시간 주가를 Spring Boot 서버로 POST 전송"""
    payload = {
        "code": code,
        "currentPrice": currentPrice,
        "priceChange": priceChange,
        "changeRate": changeRate
    }
    print(f"➡ Spring 전송: {payload}")  # 로그 활성화
    headers = {"Content-Type": "application/json"}
    try:
        requests.post(SPRING_URL, headers=headers, data=json.dumps(payload), timeout=5)
    except Exception as e:
        print("❌ Spring 전송 실패:", e)

def parse_and_forward_stock_payload(packed_str):
    """웹소켓에서 수신한 데이터를 파싱하고 Spring으로 전송"""
    try:
        pValue = packed_str.split('^')
        code = pValue[0]
        currentPrice = pValue[2]
        priceChange = pValue[4]
        changeRate = pValue[5]

        with lock:
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
    g_approval_key = "18e7b1ee-18a3-468d-b2ed-53de0b6d510a"
    custtype = "P"
    reconnect_backoff = 1

    while True:
        try:
            async with websockets.connect(WS_URL, ping_interval=None) as websocket:
                print("🔗 WebSocket 연결 성공")
                reconnect_backoff = 1 
                
                with lock:
                    codes_to_resubscribe = list(active_remote_subs)
                    active_remote_subs.clear() 

                for code in codes_to_resubscribe:
                    await command_queue.put((code, "SUBSCRIBE"))

                while True:
                    # 1. 구독/해제 명령 처리 (통합)
                    while not command_queue.empty():
                        code, command = await command_queue.get()
                        
                        # 구독 명령 처리
                        if command == "SUBSCRIBE":
                            with lock:
                                # subscribed_codes에 '있어야' 구독 진행 (최종 의도 확인)
                                if code not in subscribed_codes:
                                    continue 
                            
                            if code not in active_remote_subs:
                                payload = {
                                    "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "1", "content-type": "utf-8"},
                                    "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                                }
                                await websocket.send(json.dumps(payload))
                                with lock:
                                    active_remote_subs.add(code)
                                print(f"✅ [서버 구독 완료] {code}")

                        # 해제 명령 처리
                        elif command == "UNSUBSCRIBE":
                            with lock:
                                # subscribed_codes에 '없어야' 해제 진행 (최종 의도 확인)
                                if code in subscribed_codes:
                                    # Flask가 subscribed_codes에서 제거하지 못하고 보호된 종목
                                    print(f"ℹ️ [서버 해제 보류] {code} - Flask 요청은 있었으나 재구독 의도 감지.")
                                    continue 
                            
                            if code in active_remote_subs:
                                payload = {
                                    "header": {"approval_key": g_approval_key, "custtype": custtype, "tr_type": "0", "content-type": "utf-8"},
                                    "body": {"input": {"tr_id": "H0STCNT0", "tr_key": code}}
                                }
                                await websocket.send(json.dumps(payload))
                                with lock:
                                    active_remote_subs.discard(code)
                                print(f"🛑 [서버 구독 해제 완료] {code}")

                    # 2. WS 데이터 수신 (Recv)
                    try:
                        data = await asyncio.wait_for(websocket.recv(), timeout=0.1) 
                        if data and isinstance(data, bytes):
                            data = data.decode('utf-8', errors='ignore')
                        
                        if data and data[0] == '0':
                            parts = data.split('|')
                            if len(parts) >= 4 and parts[1] == "H0STCNT0":
                                parse_and_forward_stock_payload(parts[3])
                        
                    except asyncio.TimeoutError:
                        pass 
                    except websockets.ConnectionClosed:
                        raise

        except Exception as e:
            print(f"❌ WebSocket 예외: {e}. {reconnect_backoff}초 후 재접속 시도.")
            await asyncio.sleep(reconnect_backoff)
            reconnect_backoff = min(10, reconnect_backoff * 2) 
        else:
            reconnect_backoff = 1

# ------------------------
# Main (앱 실행) - 깔끔한 종료 로직
# ------------------------
if __name__ == "__main__":
    flask_thread = threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=FLASK_PORT, debug=False, use_reloader=False),
        daemon=True
    )
    flask_thread.start()

    print(f"🐍 Python Real-time Stock Proxy Started on Port {FLASK_PORT}")
    try:
        main_task = loop.create_task(single_socket_manager())
        loop.run_until_complete(main_task)
        
    except KeyboardInterrupt:
        print("\n프로그램 종료 요청 감지.")
    except Exception as e:
        print(f"메인 루프 실행 중 예외 발생: {e}")
        
    finally:
        print("🧹 asyncio 태스크 정리 및 루프 종료 중...")
        
        # 모든 실행 중인 태스크를 취소하고 정리
        tasks = [t for t in asyncio.all_tasks(loop) if t is not main_task and not t.done()]
        for task in tasks:
            task.cancel()
            
        if tasks:
            try:
                loop.run_until_complete(asyncio.wait(tasks, timeout=2))
            except Exception:
                pass 

        loop.close()
        print("✅ 프로그램 종료 완료.")