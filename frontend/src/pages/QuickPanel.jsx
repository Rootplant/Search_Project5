// src/components/QuickPanel.jsx
import styled from "styled-components";

const Panel = styled.div`
    position: absolute;  
    right: -120px;   /* 숫자 줄이면 그래프쪽으로 이동 */
    top: 45px;      
    width: 240px;

    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);

    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    strong {
        font-size: 15px;
    }

    span {
        font-size: 13px;
        color: #555;
    }
`;
const PanelWrapper = styled.div`
    position: absolute;
    right: -260px;   /* ← InsightCards의 left:-260px과 동일한 대칭 */
    top: 120px;      /* ← InsightCards의 top과 동일하게 맞춤 */
`;


export default function QuickPanel({ recent, favorite }) {
    return (
        <PanelWrapper>
            <Panel>
                <Section>
                    <strong>최근 검색 종목</strong>
                    {recent.length === 0 ? (
                        <span>기록 없음</span>
                    ) : recent.map((s, i) => <span key={i}>{s}</span>)}
                </Section>

                <Section>
                    <strong>즐겨찾기</strong>
                    {favorite.length === 0 ? (
                        <span>없음</span>
                    ) : favorite.map((s, i) => <span key={i}>{s}</span>)}
                </Section>
            </Panel>
        </PanelWrapper>
    );
}
