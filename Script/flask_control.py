from flask import Flask, request

app = Flask(__name__)
current_stock_code = None

@app.route("/subscribe", methods=["POST"])
def subscribe():
    global current_stock_code
    data = request.json
    current_stock_code = data["code"]
    print("✅ 종목 변경됨:", current_stock_code)
    return "OK"

@app.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    global current_stock_code
    data = request.json
    code = data.get("code")
    if code and code == current_stock_code:
        print("🧹 구독 해제됨:", current_stock_code)
        current_stock_code = None
    return "OK"


def get_current_code():
    return current_stock_code

if __name__ == "__main__":
    app.run(port=5000)