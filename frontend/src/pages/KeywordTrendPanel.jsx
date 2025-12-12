// src/components/KeywordTrendPanel.jsx
import styled from "styled-components";

const Wrapper = styled.div`
    position: absolute;
    right: -380px;   /* QuickPanel과 동일하게 정렬 */
    top: 350px;      /* QuickPanel 밑으로 내려간 위치 */
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

export default function KeywordTrendPanel({ keywords }) {
    return (
        <Wrapper>
            <Box>
                <Title>인기 키워드</Title>
                {keywords.length === 0 ? (
                    <Item>키워드 없음</Item>
                ) : (
                    keywords.map((k, i) => <Item key={i}>· {k}</Item>)
                )}
            </Box>
        </Wrapper>
    );
}
