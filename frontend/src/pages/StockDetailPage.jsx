import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// ==========================================
// 1. 스타일 객체 정의
// ==========================================
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    borderBottom: '2px solid #333',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  stockTitle: {
    margin: '0',
    color: '#333',
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  stockCode: {
    fontSize: '18px',
    color: '#666',
    marginLeft: '10px',
    fontWeight: 'normal',
  },
  priceContainer: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '15px',
  },
  price: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  changeInfo: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  metaData: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
    display: 'flex',
    gap: '20px',
  },
  metaSpan: {
    display: 'inline-block',
  },
  section: {
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
  },
  sectionTitle: {
    marginBottom: '15px',
    borderLeft: '4px solid #007bff',
    paddingLeft: '10px',
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#333',
  },
  sentimentBarContainer: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    height: '20px',
    backgroundColor: '#eee',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
  },
  sentimentStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  newsItemWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    padding: '15px 0',
  },
  newsContent: {
    flex: 1,
    paddingRight: '15px',
  },
  newsLink: {
    textDecoration: 'none',
    // color는 동적으로 처리 (render 부분 참고)
    fontWeight: 'bold',
    fontSize: '17px',
    display: 'block',
    marginBottom: '8px',
    cursor: 'pointer', // 클릭 가능 표시
  },
  newsSummary: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  newsInfo: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    gap: '10px',
  },
  sentimentBadge: {
    fontWeight: 'bold',
    marginRight: '5px',
  },
  noNews: {
    textAlign: 'center',
    color: '#888',
  },
  starButton: {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    color: '#FFD700',
    transition: 'transform 0.2s',
    padding: '0 10px',
  },
  starButtonEmpty: {
    color: '#ccc',
  },
  newsStarButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#ccc',
    padding: '5px',
    transition: 'color 0.2s',
    marginTop: '5px',
  },
  newsStarActive: {
    color: '#FFD700',
  },
};

// ==========================================
// 2. 컴포넌트 로직
// ==========================================

function StockDetailPage() {
  const { stockCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ⭐ [변경됨] 단순 ID 배열이 아니라, { newsId, isRead } 객체 배열을 저장합니다.
  const [savedBookmarks, setSavedBookmarks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 주식 상세 정보 불러오기
        const stockRes = await axios.get(`/api/stocks/${stockCode}`);
        setData(stockRes.data);

        // 2. 로그인 상태라면 찜 목록(종목, 뉴스) 불러오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            // (1) 관심 종목 확인
            try {
                const myRes = await axios.get('/api/mypage/info', authHeader);
                const myStocks = myRes.data.stocks || [];
                const isFav = myStocks.some(s => s.stockCode === stockCode);
                setIsFavorite(isFav);
            } catch (e) {
                console.error("종목 찜 확인 실패:", e);
            }

            // ⭐ (2) 관심 뉴스 목록 확인 (읽음 여부 포함된 DTO 리스트)
            try {
                const myNewsRes = await axios.get('/api/mypage/favorites/news', authHeader);
                // console.log("서버에서 가져온 뉴스 찜 목록:", myNewsRes.data);

                let rawList = myNewsRes.data;
                if (!Array.isArray(rawList) && rawList.data) rawList = rawList.data;
                if (!Array.isArray(rawList) && rawList.list) rawList = rawList.list;

                if (Array.isArray(rawList)) {
                    // 필요한 정보(ID, 읽음여부)만 뽑아서 저장
                    const bookmarks = rawList.map(item => ({
                        newsId: String(item.newsId || item.id), // ID는 문자열로 통일
                        isRead: item.isRead // 'Y' or 'N'
                    })).filter(b => b.newsId !== 'undefined');
                    
                    setSavedBookmarks(bookmarks);
                }
            } catch (e) {
                console.error("뉴스 찜 목록 로드 실패:", e);
            }
        }
      } catch (error) {
        console.error("상세 정보 조회 실패", error);
        alert("정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stockCode]);

  // 종목 찜하기 핸들러
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요한 기능입니다.");

    try {
        if (isFavorite) {
            await axios.delete(`/api/mypage/favorites/stock/${stockCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(false);
            alert("관심 종목에서 삭제되었습니다.");
        } else {
            await axios.post('/api/mypage/favorites/stock', { stockCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(true);
            alert("관심 종목에 추가되었습니다.");
        }
    } catch (error) {
        console.error("찜하기 실패", error);
        alert("처리에 실패했습니다.");
    }
  };

  // 뉴스 찜하기(별표) 핸들러
  const handleToggleNewsBookmark = async (news) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요한 기능입니다.");

    const newsId = news.newsId || news.id;
    const strNewsId = String(newsId);
    
    // 현재 찜 상태 확인
    const isBookmarked = savedBookmarks.some(b => b.newsId === strNewsId);

    try {
        if (isBookmarked) {
            // 삭제 요청
            await axios.delete(`/api/mypage/favorites/news/${newsId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 목록에서 제거
            setSavedBookmarks(prev => prev.filter(b => b.newsId !== strNewsId));
            alert("스크랩을 취소했습니다.");
        } else {
            // 추가 요청
            await axios.post('/api/mypage/favorites/news', 
                { newsId: newsId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // 목록에 추가 (새로 추가된 건 안 읽은 상태 'N')
            setSavedBookmarks(prev => [...prev, { newsId: strNewsId, isRead: 'N' }]);
            alert("뉴스를 스크랩했습니다.");
        }
    } catch (error) {
        console.error("뉴스 찜 오류:", error);
        alert("처리 중 오류가 발생했습니다.");
    }
  };

  // ⭐ [추가됨] 뉴스 클릭 시 읽음 처리 핸들러
  const handleNewsClick = async (newsId, url, isBookmarked) => {
    // 1. 뉴스 새 창 열기 (기본 동작)
    window.open(url, '_blank', 'noopener,noreferrer');

    // 2. 찜한 뉴스라면 서버에 '읽음' 신호 보내기
    const token = localStorage.getItem('accessToken');
    if (token && isBookmarked) {
        try {
            await axios.post('/api/mypage/favorites/news/read', 
                { newsId: newsId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 3. 화면 상태 즉시 업데이트 (회색으로 변경)
            setSavedBookmarks(prev => prev.map(b => 
                b.newsId === String(newsId) ? { ...b, isRead: 'Y' } : b
            ));
            console.log("읽음 처리 완료:", newsId);
        } catch (e) {
            console.error("읽음 처리 실패:", e);
        }
    }
  };

  if (loading) return <div style={styles.container}>로딩중...</div>;
  if (!data) return <div style={styles.container}>데이터가 없습니다.</div>;

  const { stockInfo, newsList, sentiment } = data;

  const changeRate = stockInfo.changeRate || 0;
  const priceChange = stockInfo.priceChange || 0;
  const priceColor = changeRate > 0 ? '#d60000' : changeRate < 0 ? '#0051c7' : '#333';
  const priceSign = changeRate > 0 ? '▲' : changeRate < 0 ? '▼' : '-';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
            <div style={styles.stockTitleGroup}>
                <h1 style={styles.stockTitle}>
                {stockInfo.stockName} <span style={styles.stockCode}>{stockInfo.stockCode}</span>
                </h1>
                
                <div style={styles.priceContainer}>
                    <div style={{ ...styles.price, color: priceColor }}>
                        {stockInfo.price ? stockInfo.price.toLocaleString() : 0}원
                    </div>
                    <div style={{ ...styles.changeInfo, color: priceColor }}>
                        {priceSign} {Math.abs(priceChange).toLocaleString()} 
                        <span style={{ marginLeft: '5px' }}>({changeRate}%)</span>
                    </div>
                </div>
            </div>

            <button 
                style={{ ...styles.starButton, ...(isFavorite ? {} : styles.starButtonEmpty) }} 
                onClick={handleToggleFavorite}
                title={isFavorite ? "관심종목 해제" : "관심종목 추가"}
            >
                {isFavorite ? '★' : '☆'}
            </button>
        </div>

        <div style={styles.metaData}>
            <span style={styles.metaSpan}><strong>시장:</strong> {stockInfo.marketType || '-'}</span>
            <span style={styles.metaSpan}><strong>업종:</strong> {stockInfo.industry || '-'}</span>
            <span style={styles.metaSpan}><strong>시가총액:</strong> {stockInfo.marketCap || '-'}</span>
            <span style={styles.metaSpan}><strong>기준일:</strong> {stockInfo.updatedAt || '-'}</span>
        </div>
      </div>

      {/* 감성 분석 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🤖 AI 뉴스 감성 분석</h3>
        <div style={styles.sentimentBarContainer}>
            <div style={styles.barWrapper}>
                <div style={{ width: `${sentiment?.positiveRate}%`, backgroundColor: '#d60000' }} />
                <div style={{ width: `${sentiment?.neutralRate}%`, backgroundColor: '#999' }} />
                <div style={{ width: `${sentiment?.negativeRate}%`, backgroundColor: '#0051c7' }} />
            </div>
            
            <div style={styles.sentimentStats}>
                <div style={{ color: '#d60000' }}>긍정 {sentiment?.positiveCount}건</div>
                <div style={{ color: '#0051c7' }}>부정 {sentiment?.negativeCount}건</div>
            </div>
        </div>
      </div>

      {/* ⭐ [수정됨] 뉴스 리스트 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📰 관련 주요 뉴스</h3>
        {newsList && newsList.length > 0 ? (
            newsList.map((news) => {
                const newsId = news.newsId || news.id;
                
                // 1. 이 뉴스가 내 찜 목록에 있는지 찾기
                const bookmark = savedBookmarks.find(b => b.newsId === String(newsId));
                const isBookmarked = !!bookmark; // 존재하면 true
                
                // 2. 찜했다면, 읽음 상태인지 확인 ('Y'면 true)
                const isRead = bookmark && bookmark.isRead === 'Y';

                return (
                    <div key={newsId} style={styles.newsItemWrapper}>
                        <div style={styles.newsContent}>
                            {/* ⭐ 제목 클릭 시 handleNewsClick 실행 */}
                            <a 
                                href={news.url} 
                                onClick={(e) => {
                                    e.preventDefault(); // 기본 이동 막고
                                    handleNewsClick(newsId, news.url, isBookmarked); // 커스텀 함수 실행
                                }}
                                style={{
                                    ...styles.newsLink,
                                    // 읽었으면 회색(#bbb), 안 읽었으면 검정(#333)
                                    color: isRead ? '#bbb' : '#333',
                                    textDecoration: isRead ? 'line-through' : 'none' // (선택) 취소선
                                }}
                            >
                                {news.title}
                            </a>
                            <div style={styles.newsSummary}>{news.content}</div>
                            <div style={styles.newsInfo}>
                                <span style={{ 
                                    ...styles.sentimentBadge, 
                                    color: news.sentiment === '긍정' ? '#d60000' : news.sentiment === '부정' ? '#0051c7' : '#666' 
                                }}>
                                    [{news.sentiment}]
                                </span>
                                <span>{news.newsDate}</span>
                                <span>키워드: {news.keywords}</span>
                            </div>
                        </div>

                        {/* 별표 버튼 */}
                        <button
                            onClick={() => handleToggleNewsBookmark(news)}
                            style={{ 
                                ...styles.newsStarButton, 
                                ...(isBookmarked ? styles.newsStarActive : {}) 
                            }}
                            title={isBookmarked ? "스크랩 취소" : "뉴스 스크랩"}
                        >
                            {isBookmarked ? '★' : '☆'}
                        </button>
                    </div>
                );
            })
        ) : (
            <p style={styles.noNews}>관련 뉴스가 없습니다.</p>
        )}
      </div>

    </div>
  );
}

export default StockDetailPage;