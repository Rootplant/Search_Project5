// src/components/AiInsightPanel.jsx
import styled from "styled-components";

const Wrapper = styled.div`
    position: absolute;
    right: -380px;   /* QuickPanel과 동일하게 정렬 */
    top: 510px;      /* 키워드 패널 아래 배치 */
`;

const Box = styled.div`
    width: 240px;
    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);

    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Title = styled.strong`
    font-size: 15px;
`;

const Item = styled.span`
    font-size: 13px;
    color: #555;
`;

export default function AiInsightPanel({ insights = [] }) {
    return (
        <Wrapper>
            <Box>
                <Title>AI 인사이트</Title>

                {insights.length === 0 ? (
                    <Item>데이터 없음</Item>
                ) : (
                    insights.map((t, i) => (
                        <Item key={i}>· {t}</Item>
                    ))
                )}
            </Box>
        </Wrapper>
    );
}
