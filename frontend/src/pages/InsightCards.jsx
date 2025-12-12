// src/components/InsightCards.jsx
import styled from "styled-components";

const SideContainer = styled.div`
    position: absolute;
    left: -260px; /* 대시보드 기준 왼쪽으로 배치 */
    top: 120px;

    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Card = styled.div`
    width: 230px;
    background: white;
    padding: 18px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);

    display: flex;
    flex-direction: column;
    gap: 6px;

    font-size: 14px;
`;
const Wrapper = styled.div`
  position: absolute;
  left: -140px;   /* 🔥 왼쪽으로 더 이동 */
  top: 40px;
`;


export default function InsightCards({ stats }) {
    return (
        <Wrapper>
            <SideContainer>
                <Card>
                    <strong>전체 뉴스 수</strong>
                    <span>{stats.totalNews} 건</span>
                </Card>

                <Card>
                    <strong>평균 긍정률</strong>
                    <span>{stats.avgPositive}%</span>
                </Card>

                <Card>
                    <strong>평균 부정률</strong>
                    <span>{stats.avgNegative}%</span>
                </Card>

                <Card>
                    <strong>Top 뉴스 종목</strong>
                    <span>{stats.topStock}</span>
                </Card>
            </SideContainer>
        </Wrapper>
    );
}
