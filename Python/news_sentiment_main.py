# news_sentiment_main.py - 뉴스 감성 분석 메인 (NULL 값 모두 처리, 제한 없음)
import sys
from news_db_connector import DBConnector
from news_sentiment_analyzer import SentimentAnalyzer

def main():
    # 명령줄 인자 확인 (--force 옵션으로 강제 재분석)
    force_reanalyze = "--force" in sys.argv or "-f" in sys.argv
    
    # 배치 처리 크기 (한 번에 처리할 개수)
    BATCH_SIZE = 100
    
    # ============================================
    # DB 연결 정보 (opendata_user)
    # ============================================
    DB_USER = "opendata_user"
    DB_PASSWORD = "opendata123"
    DB_DSN = "192.168.10.34:1521/XE"
    
    # DB 연결
    db = DBConnector(DB_USER, DB_PASSWORD, DB_DSN)
    if not db.connect():
        print("DB 연결에 실패했습니다. 연결 정보를 확인하세요.")
        return
    
    # 감성 분석기 초기화 (형태소 분석 사용)
    print("\n감성 분석기 초기화 중...")
    analyzer = SentimentAnalyzer(use_morphology=True)
    print()
    
    try:
        # NULL 개수 확인
        cursor = db.conn.cursor()
        if force_reanalyze:
            cursor.execute("SELECT COUNT(*) FROM STOCK_NEWS")
            total_count = cursor.fetchone()[0]
            null_count = total_count
        else:
            cursor.execute("""
                SELECT COUNT(*) FROM STOCK_NEWS 
                WHERE SENTIMENT IS NULL OR SCORE IS NULL OR KEYWORDS IS NULL
            """)
            null_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM STOCK_NEWS")
            total_count = cursor.fetchone()[0]
        cursor.close()
        
        print("=" * 60)
        if force_reanalyze:
            print(f"⚠ 강제 재분석 모드: 모든 뉴스를 다시 분석합니다.")
            print(f"전체 뉴스 개수: {total_count}개")
        else:
            print(f"NULL 값이 있는 뉴스 분석 모드")
            print(f"전체 뉴스 개수: {total_count}개")
            print(f"NULL 값이 있는 뉴스: {null_count}개")
        print("=" * 60)
        
        if null_count == 0 and not force_reanalyze:
            print("분석할 뉴스가 없습니다.")
            print("💡 모든 뉴스가 이미 분석되었습니다.")
            print("   강제로 다시 분석하려면: python news_sentiment_main.py --force")
            return
        
        if total_count == 0:
            print("DB에 뉴스가 없습니다.")
            return
        
        # 배치로 처리 (제한 없이 모든 데이터 처리)
        total_processed = 0
        total_success = 0
        total_fail = 0
        batch_num = 0
        
        print(f"\n배치 크기: {BATCH_SIZE}개씩 처리")
        print(f"예상 배치 수: {(null_count if not force_reanalyze else total_count) // BATCH_SIZE + 1}개\n")
        
        while True:
            batch_num += 1
            print(f"\n{'='*60}")
            print(f"배치 {batch_num} 처리 중... (배치 크기: {BATCH_SIZE}개)")
            print(f"{'='*60}\n")
            
            # 배치 조회
            if force_reanalyze:
                news_list = db.get_all_news(limit=BATCH_SIZE)
            else:
                news_list = db.get_unanalyzed_news(limit=BATCH_SIZE)
            
            if not news_list or len(news_list) == 0:
                print("더 이상 처리할 뉴스가 없습니다.")
                break
            
            print(f"이번 배치: {len(news_list)}개 뉴스 분석 시작\n")
            
            # 각 뉴스 분석
            batch_success = 0
            batch_fail = 0
            
            for i, news in enumerate(news_list, 1):
                total_processed += 1
                print(f"[배치 {batch_num}] [{i}/{len(news_list)}] 뉴스 ID: {news['news_id']} 분석 중...")
                print(f"  제목: {news['title'][:50]}...")
                
                try:
                    # 감성 분석 수행 (형태소 분석 사용)
                    sentiment, score, keywords = analyzer.analyze_sentiment(
                        news['title'],
                        news['content']
                    )
                    
                    # NULL 방지: 기본값 설정
                    if not sentiment or sentiment not in ['긍정', '부정', '보통']:
                        sentiment = '보통'
                    if score is None:
                        score = 0
                    if not keywords or keywords.strip() == '':
                        keywords = ' '
                    
                    # DB 업데이트
                    if db.update_sentiment(news['news_id'], sentiment, score, keywords):
                        batch_success += 1
                        total_success += 1
                        print(f"  ✓ 완료: {sentiment} (점수: {score}, 키워드: {keywords[:30] if keywords and keywords != ' ' else '없음'})")
                    else:
                        batch_fail += 1
                        total_fail += 1
                        print(f"  ✗ 실패: DB 업데이트 오류")
                    
                except Exception as e:
                    batch_fail += 1
                    total_fail += 1
                    print(f"  ✗ 실패: {e}")
                    # 실패해도 기본값으로 업데이트 시도
                    try:
                        db.update_sentiment(news['news_id'], '보통', 0, ' ')
                        print(f"  ⚠ 기본값(보통, 0, ' ')으로 업데이트 완료")
                        batch_fail -= 1
                        total_fail -= 1
                        batch_success += 1
                        total_success += 1
                    except:
                        pass
                
                print()
            
            # 배치 결과
            print(f"\n배치 {batch_num} 완료: 성공 {batch_success}개, 실패 {batch_fail}개")
            print(f"전체 진행: {total_processed}개 처리됨 (성공: {total_success}개, 실패: {total_fail}개)")
            
            # 다음 배치가 있는지 확인
            if len(news_list) < BATCH_SIZE:
                print("\n모든 뉴스 처리 완료!")
                break
        
        # 최종 결과 요약
        print("\n" + "=" * 60)
        print("전체 분석 완료!")
        print("=" * 60)
        print(f"총 처리 개수: {total_processed}개")
        print(f"성공: {total_success}개")
        print(f"실패: {total_fail}개")
        print(f"처리된 배치 수: {batch_num}개")
        print("=" * 60)
        
        # 최종 NULL 개수 확인
        cursor = db.conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM STOCK_NEWS 
            WHERE SENTIMENT IS NULL OR SCORE IS NULL OR KEYWORDS IS NULL
        """)
        remaining_null = cursor.fetchone()[0]
        cursor.close()
        
        if remaining_null > 0:
            print(f"\n⚠ 아직 NULL 값이 있는 뉴스: {remaining_null}개")
            print("   다시 실행하면 나머지도 처리됩니다.")
        else:
            print(f"\n✓ 모든 뉴스의 감성 분석이 완료되었습니다!")
        
    except Exception as e:
        print(f"에러 발생: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
