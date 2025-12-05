# crawler_stock_industry.py - 업종 자동 크롤링 (최적화 버전)
import requests
from bs4 import BeautifulSoup
import oracledb
import time
import re

# ===============================
# DB 연결 정보
# ===============================
DB_USER = "opendata_user"
DB_PASSWORD = "opendata123"
DB_DSN = "192.168.10.34:1521/XE"

# ===============================
# 네이버 종목 페이지 URL
# ===============================
BASE_URL = "https://finance.naver.com/item/main.naver?code="

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

# ===============================
# 업종이 없는 종목을 미리 스킵하기 위한 패턴
# ===============================

def should_skip(stock_code, stock_name):
    """ETF, ETN, 리츠, 스팩, 우선주 등을 스킵"""
    name = stock_name.replace(" ", "")

    skip_keywords = [
        "스팩", "SPAC", "스펙",
        "리츠", "REIT",
        "ETF", "ETN",
        "인덱스", "TIGER", "KODEX", "ARIRANG", "KOSEF", "KBSTAR"
    ]

    for kw in skip_keywords:
        if kw.lower() in name.lower():
            return True

    # 우선주 (보통주와 달리 업종이 없는 경우가 많음)
    if stock_code.endswith("5") or stock_code.endswith("7"):
        return True

    return False


# ===============================
# 업종 크롤링 (최적화 버전)
# ===============================
def fetch_industry(stock_code):
    url = BASE_URL + stock_code
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        # 1) 기본 selector (가장 일반적인 구조)
        for th in soup.find_all("th"):
            if th.get_text(strip=True) == "업종":
                td = th.find_next_sibling("td")
                if td:
                    a = td.find("a")
                    if a:
                        return a.get_text(strip=True)
                    return td.get_text(strip=True)

        # 2) fallback: 업종 상세 링크
        alt = soup.find("a", href=lambda x: x and "sise_group_detail" in x)
        if alt:
            return alt.get_text(strip=True)

        # 3) fallback: dt/dd 구조
        for dt in soup.find_all("dt"):
            if dt.get_text(strip=True) == "업종":
                dd = dt.find_next_sibling("dd")
                if dd:
                    return dd.get_text(strip=True)

        return None

    except Exception:
        return None


# ===============================
# STOCK_INDUSTRY Insert/Update
# ===============================
def upsert_industry(conn, stock_code, industry):
    cursor = conn.cursor()
    sql = """
        MERGE INTO STOCK_INDUSTRY i
        USING (SELECT :code AS STOCK_CODE, :industry AS INDUSTRY FROM dual) s
        ON (i.STOCK_CODE = s.STOCK_CODE)
        WHEN MATCHED THEN
            UPDATE SET i.INDUSTRY = s.INDUSTRY
        WHEN NOT MATCHED THEN
            INSERT (STOCK_CODE, INDUSTRY)
            VALUES (s.STOCK_CODE, s.INDUSTRY)
    """
    cursor.execute(sql, {"code": stock_code, "industry": industry})
    conn.commit()
    cursor.close()


# ===============================
# STOCK_INFO 업데이트
# ===============================
def update_stock_info(conn):
    cursor = conn.cursor()
    sql = """
        UPDATE STOCK_INFO si
        SET si.INDUSTRY = (
            SELECT industry 
            FROM STOCK_INDUSTRY si2
            WHERE si2.STOCK_CODE = si.STOCK_CODE
        )
        WHERE EXISTS (
            SELECT 1 FROM STOCK_INDUSTRY si2
            WHERE si2.STOCK_CODE = si.STOCK_CODE
        )
    """
    cursor.execute(sql)
    updated = cursor.rowcount
    conn.commit()
    cursor.close()
    return updated


# ===============================
# MAIN
# ===============================
def main():
    print("=== INDUSTRY 자동 수집 시작 ===")

    try:
        oracledb.init_oracle_client()
    except:
        pass

    conn = oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)

    # STOCK_INFO에서 종목코드 가져오기
    cursor = conn.cursor()
    cursor.execute("SELECT STOCK_CODE, STOCK_NAME FROM STOCK_INFO ORDER BY STOCK_CODE")
    stocks = cursor.fetchall()
    cursor.close()

    print(f"총 {len(stocks)}개 종목 업종 수집 시작\n")

    success = 0
    fail = 0
    skipped = 0
    cached = 0

    for code, name in stocks:

        # -------- 캐싱: 이미 업종이 있으면 스킵 --------
        c = conn.cursor()
        c.execute("SELECT INDUSTRY FROM STOCK_INDUSTRY WHERE STOCK_CODE = :code", {"code": code})
        row = c.fetchone()
        c.close()

        if row and row[0] is not None:
            print(f"[{code}] {name} → ✓ 캐싱됨 (스킵)")
            cached += 1
            continue

        # -------- 업종 자체가 없는 종목 스킵 --------
        if should_skip(code, name):
            print(f"[{code}] {name} → ⚠ 업종 없음(ETF/스팩/우선주 등) → 자동 스킵")
            skipped += 1
            continue

        print(f"[{code}] {name} → 업종 크롤링 중...")

        industry = fetch_industry(code)

        if industry:
            print(f"   ✓ 업종: {industry}")
            upsert_industry(conn, code, industry)
            success += 1
        else:
            print(f"   ⚠ 업종 정보 없음")
            fail += 1

        time.sleep(0.1)  # 속도 개선


    updated = update_stock_info(conn)
    conn.close()

    print("\n=== INDUSTRY 자동 수집 완료 ===")
    print(f"성공: {success}개")
    print(f"실패: {fail}개")
    print(f"스킵(ETF/스팩/우선주): {skipped}개")
    print(f"캐싱 스킵: {cached}개")
    print(f"STOCK_INFO INDUSTRY 갱신: {updated}개")


if __name__ == "__main__":
    main()
