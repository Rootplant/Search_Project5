// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import InsightCards from "./InsightCards";
import QuickPanel from "./QuickPanel";
import KeywordTrendPanel from "./KeywordTrendPanel";
import AiInsightPanel from "./AiInsightPanel";


/* ===============================
   Styled Components
================================*/

const DashboardContainer = styled.div`
  padding: 32px 0 40px;
  max-width: 1120px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 13px;
  color: var(--text-light);
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .filter-left,
  .filter-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 12px;

    padding: 10px 16px;
    border: 1.8px solid var(--border-light);
    border-radius: 12px;
    background: #fff;

    width: 260px;
    transition: all 0.2s ease;
  }

  .search-box:focus-within {
    border-color: #f97373;
    box-shadow: 0 0 0 4px rgba(249, 115, 115, 0.18);
  }

  .search-icon {
    font-size: 17px;
    color: #666;
  }

  .search-input {
    border: none;
    outline: none;
    font-size: 15px;
    width: 100%;
    color: #333;
  }
  .search-input::placeholder {
    color: #aaa;
  }

  select {
    padding: 6px 12px;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    font-size: 13px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  select:focus {
    border-color: #f97373;
    box-shadow: 0 0 0 3px rgba(249, 115, 115, 0.2);
  }
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  margin-bottom: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  padding: 18px 20px;
`;

const ChartCard = styled(Card)`
  min-height: 447px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px;
`;

const TableCard = styled(Card)`
  margin-top: 0;
`;

const SentimentTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    font-size: 13px;
  }

  th {
    background: var(--bg-light);
    cursor: pointer;
  }

  td:last-child,
  th:last-child {
    text-align: right;
    padding-right: 14px;
  }
`;

const RatioBarContainer = styled.div`
  background: var(--bg-light);
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
`;

const PositiveRatioBar = styled.div`
  width: ${({ percent }) => percent}%;
  height: 100%;
  background: var(--red-up);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;

  button {
    min-width: 32px;
    height: 30px;
    border-radius: 6px;
    border: 1px solid #ddd;
    cursor: pointer;
    background: white;
    color: #333;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 13px;
  }

  button.active {
    background: #f97373;
    color: white;
    border-color: #f97373;
  }
`;

/* ===============================
   Component
================================*/

function DashboardPage() {
  const [sentimentData, setSentimentData] = useState([]);
  const [top10, setTop10] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [period, setPeriod] = useState("30일");
  const periodToDays = { "7일": 7, "30일": 30, "90일": 90 };

  const [sortField, setSortField] = useState("stockName");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [aiInsights, setAiInsights] = useState([]);   // 🔹 AI 인사이트 문자열 리스트


  // 🔹 최근 검색 종목
  const [recent, setRecent] = useState([]);

  /* ===============================
     최근 검색 불러오기 (첫 렌더링)
     
  =================================*/
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentKeywords") || "[]");
    setRecent(saved);
  }, []);

  /* ===============================
     최근 검색 저장 함수
  =================================*/
  const saveRecentKeyword = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setRecent((prev) => {
      const withoutDup = prev.filter((k) => k !== trimmed);
      const next = [trimmed, ...withoutDup].slice(0, 2); // 최대 5개
      localStorage.setItem("recentKeywords", JSON.stringify(next));
      return next;
    });
  };

  /* ===============================
     키 통일 함수 (대문자 → 소문자)
  =================================*/
  const normalize = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((k) => {
      newObj[k.toLowerCase()] = obj[k];
    });
    return newObj;
  };

  /* ===============================
     데이터 로딩
  =================================*/
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const days = periodToDays[period];

        // 감성 대시보드 데이터
        const res = await axios.get("/api/news/sentiment/dashboard", {
          params: { days },
        });

        const processed = res.data.map((raw) => {
          const item = normalize(raw);
          return {
            stockCode: item.stock_code,
            stockName: item.stock_name,
            positiveRatio: Number(
              item.positive_ratio || item.positiveratio || 0
            ),
            negativeRatio: Number(
              item.negative_ratio || item.negativeratio || 0
            ),
            articleCount: Number(item.totalnews || item.total_news || 0),
          };
        });

        setSentimentData(processed);

        // 인기 TOP10
        const resTop = await axios.get("/api/news/top10");
        const processedTop = resTop.data.map((raw) => {
          const item = normalize(raw);
          return {
            stockName: item.stock_name,
            articleCount: Number(item.article_count),
          };
        });
        setTop10(processedTop);

        // 🔹 AI 인사이트 (새로 추가)
        const resInsight = await axios.get("/api/news/insights", {
          params: { days },
        });
        setAiInsights(resInsight.data || []);   // 문자열 배열 기대
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  /* ===============================
     정렬 + 검색
  =================================*/
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = [...sentimentData]
    .filter((item) =>
      item.stockName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const A = a[sortField];
      const B = b[sortField];

      if (typeof A === "string") {
        return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }
      return sortOrder === "asc" ? A - B : B - A;
    });

  /* ===============================
     페이징
  =================================*/
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // ===============================
// AI 자연어 인사이트 생성
// ===============================

let aiText = "데이터 분석 중입니다.";

if (sentimentData.length > 0) {
  const mostPositive = sentimentData.reduce((a, b) =>
    a.positiveRatio > b.positiveRatio ? a : b
  );

  const mostNegative = sentimentData.reduce((a, b) =>
    a.negativeRatio > b.negativeRatio ? a : b
  );

  const mostNews = sentimentData.reduce((a, b) =>
    a.articleCount > b.articleCount ? a : b
  );

  aiText =
    `최근 시장에서는 ${mostPositive.stockName}이(가) 가장 긍정적인 흐름을 보이고 있습니다. ` +
    `반면 ${mostNegative.stockName}은(는) 부정 비율이 높아 투자자들의 우려가 커지고 있습니다. ` +
    `지난 기간 동안 가장 많은 뉴스가 쌓인 종목은 ${mostNews.stockName}으로, 시장 관심이 집중된 모습입니다.`;
}


  /* ===============================
     차트 데이터 = 정렬된 리스트 상위 10
  =================================*/
  const chartData = sortedData.slice(0, 10);

  return (
    <>
      <DashboardContainer>
        <div style={{ position: "relative" }}>
          {/* 좌측 인사이트 카드 */}
          <InsightCards
            stats={{
              totalNews: sentimentData.reduce(
                (a, b) => a + b.articleCount,
                0
              ),
              avgPositive: (
                sentimentData.reduce(
                  (a, b) => a + b.positiveRatio,
                  0
                ) / (sentimentData.length || 1)
              ).toFixed(1),
              avgNegative: (
                sentimentData.reduce(
                  (a, b) => a + b.negativeRatio,
                  0
                ) / (sentimentData.length || 1)
              ).toFixed(1),
              topStock: top10.length > 0 ? top10[0].stockName : "없음",
            }}
          />
          {/* 우측 AI 인사이트 패널 */}
          <AiInsightPanel insights={aiInsights} />
          {/* 우측 퀵 패널 – 최근 검색 연결 */}
          <QuickPanel recent={recent} favorite={["LG화학"]} />
          <KeywordTrendPanel keywords={["실적발표", "주가상승", "목표가상향"]} />
          
          <PageHeader>
            <Title><h2>감성 분석 대시보드</h2></Title>
            <Description>
              주요 코스피 종목 뉴스 감성을 한눈에 확인할 수 있습니다.
            </Description>
          </PageHeader>

          {/* 필터 영역 */}
          <FilterBar>
            <div className="filter-left">
              기간
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="7일">최근 7일</option>
                <option value="30일">최근 30일</option>
                <option value="90일">최근 90일</option>
              </select>
            </div>

            <div className="filter-right">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  type="text"
                  value={searchTerm}
                  placeholder="종목명 검색"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveRecentKeyword(searchTerm);
                    }
                  }}
                />
              </div>
            </div>
          </FilterBar>
        </div>

        {/* 상단 Grid (TOP10 + 그래프) */}
        <TopGrid>
          {/* TOP10 */}
          <div>
            <SectionTitle>인기 종목 TOP 10</SectionTitle>
            <TableCard>
              {top10.length === 0 ? (
                <p>데이터 없음</p>
              ) : (
                <SentimentTable>
                  <thead>
                    <tr>
                      <th>순위</th>
                      <th>종목명</th>
                      <th>기사 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top10.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.stockName}</td>
                        <td>{item.articleCount}건</td>
                      </tr>
                    ))}
                  </tbody>
                </SentimentTable>
              )}
            </TableCard>
          </div>

          {/* 그래프 */}
          <div>
            <SectionTitle>종목별 감성 비율</SectionTitle>
            <ChartCard>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <XAxis dataKey="stockName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="positiveRatio"
                    fill="#f97373"
                    name="긍정 비율(%)"
                  />
                  <Bar
                    dataKey="negativeRatio"
                    fill="#60a5fa"
                    name="부정 비율(%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TopGrid>

        {/* 상세 데이터 */}
        <SectionTitle>종목별 상세 데이터</SectionTitle>
        <TableCard>
          <SentimentTable>
            <thead>
              <tr>
                <th onClick={() => handleSort("stockName")}>
                  종목명{" "}
                  {sortField === "stockName" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("positiveRatio")}>
                  긍정 비율{" "}
                  {sortField === "positiveRatio" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("negativeRatio")}>
                  부정 비율{" "}
                  {sortField === "negativeRatio" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("articleCount")}>
                  기사 수{" "}
                  {sortField === "articleCount" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((item) => (
                <tr key={item.stockCode}>
                  <td>{item.stockName}</td>

                  <td>
                    <RatioBarContainer>
                      <PositiveRatioBar percent={item.positiveRatio} />
                    </RatioBarContainer>
                    {item.positiveRatio.toFixed(1)}%
                  </td>

                  <td>
                    <RatioBarContainer>
                      <div
                        style={{
                          width: `${item.negativeRatio}%`,
                          height: "100%",
                          background: "var(--blue-down)",
                        }}
                      ></div>
                    </RatioBarContainer>
                    {item.negativeRatio.toFixed(1)}%
                  </td>

                  <td>{item.articleCount}건</td>
                </tr>
              ))}
            </tbody>
          </SentimentTable>

          {/* 페이징 */}
          <Pagination>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              이전
            </button>

            {Array.from({ length: totalPages || 1 }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              다음
            </button>
          </Pagination>
        </TableCard>
      </DashboardContainer>
    </>
  );
}

export default DashboardPage;
