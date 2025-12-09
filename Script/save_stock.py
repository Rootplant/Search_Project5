import requests
import oracledb
import kis_auth as ka

# ✅ KIS 인증
ka.auth(svr="vps", product="01")
headers = ka.get_headers()

# ✅ Oracle 연결 (oracledb 사용)
conn = oracledb.connect("opendata_user/opendata123@192.168.10.34:1521/ORCL")
cursor = conn.cursor()

# ✅ 종목 조회 함수
def get_stock_list(market_code):
    url = "https://openapivts.koreainvestment.com:29443/uapi/domestic-stock/v1/quotations/inquire-stock-list"
    
    params = {
        "fid_cond_mrkt_div_code": market_code,  # J:코스피, Q:코스닥
        "fid_cond_scr_div_code": "11111"
    }

    res = requests.get(url, headers=headers, params=params)
    return res.json()["output"]

# ✅ 코스피 + 코스닥 전체 수집
kospi = get_stock_list("J")
kosdaq = get_stock_list("Q")

all_stock = kospi + kosdaq

# ✅ DB 저장
for stock in all_stock:
    sql = """
    MERGE INTO stock_master s
    USING DUAL
    ON (s.stock_code = :1)
    WHEN MATCHED THEN
        UPDATE SET stock_name = :2, market_type = :3
    WHEN NOT MATCHED THEN
        INSERT (stock_code, stock_name, market_type)
        VALUES (:1, :2, :3)
    """

    cursor.execute(sql, (
        stock["pdno"],         # 종목코드
        stock["prdt_name"],    # 종목명
        stock["mrkt_ctg"]      # 시장
    ))

conn.commit()
cursor.close()
conn.close()

print("✅ 전체 종목 저장 완료")
