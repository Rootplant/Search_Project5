// src/pages/TestStockDetailPage.jsx
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
// 🚨 새로 만든 IFrame 컴포넌트로 변경
import InvestingIFrameChart from '../components/charts/InvestingIFrameChart'; 

// --- 스타일 정의 (유지) ---
const PageContainer = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ChartWrapper = styled.div`
    width: 100%;
    height: 600px; /* IFrame 높이보다 약간 크게 설정 */
    margin-top: 30px;
`;

// 💡 KRX 종목코드를 Investing.com pair_ID로 변환하는 매핑 함수
const mapKrxToInvestingPairID = (krxCode) => {
    switch (krxCode) {
        case '005930': return '005930'; // 삼성전자
        case '068270': return '1056345'; // 셀트리온
        case '000660': return '8851'; // SK하이닉스
        default: return '005930'; // 기본값: 삼성전자
    }
}


function TestStockDetailPage() {
    
    const { code: krxStockCode } = useParams();

    // 🌟 KRX 코드를 Investing.com pair_ID로 변환
    const investingPairID = mapKrxToInvestingPairID(krxStockCode);
    
    // 차트 크기를 ChartWrapper 높이에 맞춥니다.
    const chartHeight = "550px"; 

    return (
        <PageContainer>
            <h1>📊 종목 상세 차트: KRX:{krxStockCode}</h1>
            <p>인베스팅닷컴 IFrame 위젯을 이용한 차트입니다. **(DNS 오류 우회)**</p>
            
            <ChartWrapper>
                {/* 🌟 InvestingIFrameChart 컴포넌트 삽입 */}
                <InvestingIFrameChart 
                    pairID={investingPairID} 
                    height={chartHeight}
                    width="100%"
                />
            </ChartWrapper>

            <hr/>
            <p style={{ marginTop: '20px', textAlign: 'center', color: '#888' }}>
                데이터는 인베스팅닷컴에서 직접 제공하는 iframe을 통해 로드됩니다.
            </p>
        </PageContainer>
    );
}

export default TestStockDetailPage;