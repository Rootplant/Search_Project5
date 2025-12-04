import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // URL 변수 꺼내는 훅
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
`;

const Header = styled.div`
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const StockTitle = styled.h1`
  margin: 0;
  color: #333;
  span { font-size: 18px; color: #666; margin-left: 10px; font-weight: normal; }
`;

const PriceInfo = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #d60000; /* 상승색 (나중에 데이터 따라 변경 가능) */
  margin-top: 10px;
`;

const Section = styled.div`
  margin-bottom: 40px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  border-left: 4px solid var(--primary-blue, #007bff);
  padding-left: 10px;
`;

// 뉴스 리스트 스타일
const NewsItem = styled.div`
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  a { text-decoration: none; color: #333; font-weight: bold; font-size: 16px; }
  a:hover { text-decoration: underline; color: var(--primary-blue, #007bff); }
  p { font-size: 13px; color: #666; margin-top: 5px; }
`;

function StockDetailPage() {
  // 1. URL에서 stockCode 꺼내기 (예: 005930)
  const { stockCode } = useParams();

  const [data, setData] = useState(null); // 백엔드에서 받은 전체 데이터
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // ⭐ 2. 백엔드 API 호출 (명세서에 적힌 주소: /api/stocks/{stockCode})
        const response = await axios.get(`/api/stocks/${stockCode}`);
        
        console.log("상세 정보 수신:", response.data);
        setData(response.data);

      } catch (error) {
        console.error("상세 정보 조회 실패", error);
        alert("정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [stockCode]);

  if (loading) return <Container>로딩중...</Container>;
  if (!data) return <Container>데이터가 없습니다.</Container>;

  // 백엔드 DTO 구조에 맞춰서 변수 꺼내기 (StockDetailResponseDTO 참고)
  const { stockInfo, newsList, sentiment } = data;

  return (
    <Container>
      {/* 1. 기본 정보 섹션 */}
      <Header>
        <StockTitle>
          {stockInfo?.stockName} <span>{stockInfo?.stockCode}</span>
        </StockTitle>
        <PriceInfo>
          {stockInfo?.price?.toLocaleString()}원
        </PriceInfo>
        <div style={{ marginTop: '10px', color: '#666' }}>
            {stockInfo?.industry} | {stockInfo?.marketType}
        </div>
      </Header>

      {/* 2. 감성 분석 섹션 */}
      <Section>
        <SectionTitle>🤖 AI 뉴스 감성 분석</SectionTitle>
        <div style={{ display: 'flex', gap: '20px', fontSize: '18px' }}>
            <div style={{ color: '#d60000' }}>긍정: {sentiment?.positiveCount}건</div>
            <div style={{ color: '#0051c7' }}>부정: {sentiment?.negativeCount}건</div>
            <div style={{ color: '#666' }}>중립: {sentiment?.neutralCount}건</div>
        </div>
        {/* 그래프나 요약 멘트가 있다면 여기에 추가 */}
      </Section>

      {/* 3. 관련 뉴스 섹션 */}
      <Section>
        <SectionTitle>📰 관련 주요 뉴스</SectionTitle>
        {newsList && newsList.length > 0 ? (
            newsList.map((news, index) => (
                <NewsItem key={index}>
                    {/* 뉴스 제목에 링크 걸기 (url 필드가 있다고 가정) */}
                    <a href={news.url} target="_blank" rel="noopener noreferrer">
                        {news.title}
                    </a>
                    <p>{news.publisher} | {news.date}</p>
                </NewsItem>
            ))
        ) : (
          // 주석
            <p>관련 뉴스가 없습니다.</p>
        )}
      </Section>

    </Container>
  );
}

export default StockDetailPage;