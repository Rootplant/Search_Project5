import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

// ==========================================
// 1. 스타일 객체 정의
// ==========================================
const styles = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    borderBottom: '2px solid #333',
    paddingBottom: '15px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#555',
    margin: '30px 0 15px 0',
    borderLeft: '4px solid #007bff',
    paddingLeft: '10px',
    fontWeight: 'bold',
  },
  stockItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  code: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    textAlign: 'right',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#d60000',
  },
  newsListContainer: {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  // ⭐ [수정] 뉴스 아이템 래퍼 (Flex 적용)
  newsItemWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '15px',
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
  },
  // ⭐ [추가] 뉴스 텍스트 영역
  newsContent: {
    flex: 1,
    paddingRight: '15px',
  },
  newsLink: {
    textDecoration: 'none',
    display: 'block',
    cursor: 'pointer',
  },
  newsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
    lineHeight: '1.4',
  },
  newsMeta: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  emptyMsg: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    gap: '8px',
  },
  pageBtn: (isActive) => ({
    padding: '8px 12px',
    border: '1px solid #ddd',
    backgroundColor: isActive ? '#007bff' : 'white',
    color: isActive ? 'white' : '#333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
  }),
  // ⭐ [추가] 별표 버튼 스타일
  newsStarButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#ccc',
    padding: '0 5px',
    transition: 'color 0.2s',
    marginTop: '2px', // 제목 높이 보정
  },
  newsStarActive: {
    color: '#FFD700',
  },
};

function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [stocks, setStocks] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ [추가] 찜한 뉴스 ID 저장용 State
  const [savedBookmarks, setSavedBookmarks] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  // 1. 검색 데이터 및 찜 목록 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // (1) 검색 API 호출
        const response = await axios.get(`/api/stocks/search?keyword=${keyword}`);
        setStocks(response.data.stocks || []);
        setNewsList(response.data.news || []);

        // (2) 로그인 상태라면 찜 목록 불러오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const myNewsRes = await axios.get('/api/mypage/favorites/news', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                let rawList = myNewsRes.data;
                if (!Array.isArray(rawList) && rawList.data) rawList = rawList.data;
                if (!Array.isArray(rawList) && rawList.list) rawList = rawList.list;

                if (Array.isArray(rawList)) {
                    // ID만 추출해서 문자열로 저장
                    const ids = rawList.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return String(item.newsId || item.id);
                        }
                        return String(item);
                    }).filter(id => id && id !== 'undefined');
                    
                    setSavedBookmarks(ids);
                }
            } catch (e) {
                console.error("찜 목록 로딩 실패 (로그인 안 된 경우 무시):", e);
            }
        }

      } catch (error) {
        console.error("검색 실패", error);
      } finally {
        setLoading(false);
      }
    };

    if (keyword) {
      fetchData();
    }
  }, [keyword]);

  // ⭐ [추가] 뉴스 찜하기 핸들러
  const handleToggleNewsBookmark = async (news) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요한 기능입니다.");

    const newsId = news.newsId || news.id;
    if (!newsId) return alert("뉴스 ID 정보가 없습니다.");

    const strNewsId = String(newsId);
    const isBookmarked = savedBookmarks.includes(strNewsId);

    try {
        if (isBookmarked) {
            // 삭제 요청
            await axios.delete(`/api/mypage/favorites/news/${newsId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedBookmarks(prev => prev.filter(id => id !== strNewsId));
            alert("스크랩을 취소했습니다.");
        } else {
            // 추가 요청
            await axios.post('/api/mypage/favorites/news', 
                { newsId: newsId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSavedBookmarks(prev => [...prev, strNewsId]);
            alert("뉴스를 스크랩했습니다.");
        }
    } catch (error) {
        console.error("뉴스 찜 오류:", error);
        alert("처리 중 오류가 발생했습니다.");
    }
  };

  // 현재 페이지 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentStocks = stocks.slice(indexOfFirstItem, indexOfLastItem);
  const currentNews = newsList.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 버튼 수 계산
  const maxItems = Math.max(stocks.length, newsList.length);
  const totalPages = Math.ceil(maxItems / itemsPerPage);
  
  // 뉴스용 페이지 수 (뉴스 섹션 페이지네이션용)
  const newsTotalPages = Math.ceil(newsList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>'{keyword}' 검색 결과</h2>

      {loading ? (
        <p style={{textAlign:'center', marginTop:'50px'}}>검색 중...</p>
      ) : (
        <>
            {/* 1. 종목 검색 결과 */}
            <h3 style={styles.sectionTitle}>📈 종목 ({stocks.length})</h3>
            {currentStocks.length === 0 ? (
                <p style={styles.emptyMsg}>검색된 종목이 없습니다.</p>
            ) : (
                currentStocks.map((stock) => (
                <Link 
                    to={`/stock/${stock.stockCode}`} 
                    key={stock.stockCode} 
                    style={styles.link}
                >
                    <div style={styles.stockItem}>
                        <div style={styles.stockInfo}>
                            <span style={styles.name}>{stock.stockName}</span>
                            <span style={styles.code}>{stock.marketType} | {stock.stockCode}</span>
                        </div>
                        <div style={styles.price}>
                            {stock.price ? stock.price.toLocaleString() : '-'}원 
                            <span style={{fontSize: '12px', marginLeft: '5px', color: '#333'}}>
                            {stock.changeRate !== undefined ? `(${stock.changeRate}%)` : ''}
                            </span>
                        </div>
                    </div>
                </Link>
                ))
            )}

            {/* 2. 뉴스 검색 결과 (별표 추가됨) */}
            <h3 style={styles.sectionTitle}>📰 관련 뉴스 ({newsList.length})</h3>
            {currentNews.length === 0 ? (
                <p style={styles.emptyMsg}>관련 뉴스가 없습니다.</p>
            ) : (
                <div style={styles.newsListContainer}>
                    {currentNews.map((news, idx) => {
                        const newsId = news.newsId || news.id || idx;
                        // 찜 여부 확인
                        const isBookmarked = savedBookmarks.includes(String(newsId));

                        return (
                            <div key={newsId} style={styles.newsItemWrapper}>
                                <div style={styles.newsContent}>
                                    <a 
                                        href={news.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={styles.newsLink}
                                    >
                                        <div style={styles.newsTitle}>{news.title}</div>
                                        <div style={styles.newsMeta}>
                                            <span>{news.newsDate ? new Date(news.newsDate).toLocaleDateString() : ''}</span>
                                        </div>
                                    </a>
                                </div>

                                {/* ⭐ 별표 버튼 */}
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
                    })}
                </div>
            )}

            {/* 페이지네이션 UI */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            ...styles.pageBtn(false),
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? 'default' : 'pointer'
                        }}
                    >
                        &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            style={styles.pageBtn(currentPage === number)}
                        >
                            {number}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            ...styles.pageBtn(false),
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? 'default' : 'pointer'
                        }}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}

export default SearchResultPage;