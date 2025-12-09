import sys, logging, threading, requests, json
from flask import Flask, request, jsonify

sys.path.extend(['..', '.'])
import kis_auth as ka
from domestic_stock_functions_ws import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ka.auth(svr="vps", product="01")
ka.auth_ws(svr="vps")
trenv = ka.getTREnv()

kws = ka.KISWebSocket(api_url="/tryitout")
subscriptions = set()

app = Flask(__name__)

@app.route("/subscribe", methods=["POST"])
def subscribe():
    """React/Spring에서 stockCode 구독 요청"""
    code = request.json["code"]
    if code not in subscriptions:
        subscriptions.add(code)
        kws.subscribe(request=asking_price_total, data=[code])
        kws.subscribe(request=ccnl_total, data=[code])
    return jsonify({"status": "ok"})

def on_result(ws, tr_id, result, data_info):
    """실시간 데이터 수신 시 Spring Boot로 push"""
    try:
        requests.post(
            "http://localhost:8484/api/stocks/realtime",
            json={"stockCode": result.get("pdno"), "data": result},
            timeout=0.5
        )
    except Exception as e:
        logger.error(f"Push 실패: {e}")

def start_kis_ws():
    kws.start(on_result=on_result)

def start_flask():
    app.run(port=5000)

if __name__ == "__main__":
    threading.Thread(target=start_flask, daemon=True).start()
    start_kis_ws()
