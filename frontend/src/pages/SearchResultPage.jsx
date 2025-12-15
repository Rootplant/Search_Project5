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
  newsItem: {
    display: 'block',
    textDecoration: 'none',
    padding: '15px',
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
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
    display: 'flex',
    justifyContent: 'space-between',
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
  // ⭐ [추가] 페이지네이션 스타일
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
};

function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [stocks, setStocks] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ [추가] 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지당 보여줄 개수 (5개씩)

  // 검색어가 바뀌면 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/stocks/search?keyword=${keyword}`);
        setStocks(response.data.stocks || []);
        setNewsList(response.data.news || []);
      } catch (error) {
        console.error("검색 실패", error);
      } finally {
        setLoading(false);
      }
    };

    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword]);

  // ⭐ [추가] 현재 페이지에 해당하는 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentStocks = stocks.slice(indexOfFirstItem, indexOfLastItem);
  const currentNews = newsList.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 버튼 수 계산 (종목과 뉴스 중 더 긴 목록 기준)
  const maxItems = Math.max(stocks.length, newsList.length);
  const totalPages = Math.ceil(maxItems / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 페이지 변경 시 맨 위로 스크롤
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>'{keyword}' 검색 결과</h2>

      {loading ? (
        <p style={{textAlign:'center', marginTop:'50px'}}>검색 중...</p>
      ) : (
        <>
            {/* 1. 종목 검색 결과 섹션 */}
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

            {/* 2. 뉴스 검색 결과 섹션 */}
            <h3 style={styles.sectionTitle}>📰 관련 뉴스 ({newsList.length})</h3>
            {currentNews.length === 0 ? (
                <p style={styles.emptyMsg}>관련 뉴스가 없습니다.</p>
            ) : (
                <div style={styles.newsListContainer}>
                    {currentNews.map((news, idx) => (
                        <a 
                            key={news.newsId || idx} 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.newsItem}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <div style={styles.newsTitle}>{news.title}</div>
                            <div style={styles.newsMeta}>
                                <span>{news.newsDate ? new Date(news.newsDate).toLocaleDateString() : ''}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* ⭐ [추가] 페이지네이션 UI */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    {/* 이전 버튼 */}
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

                    {/* 페이지 번호 버튼들 */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            style={styles.pageBtn(currentPage === number)}
                        >
                            {number}
                        </button>
                    ))}

                    {/* 다음 버튼 */}
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