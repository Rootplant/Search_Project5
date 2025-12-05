// src/components/charts/NaverIFrameChart.jsx
import React from 'react';

const NaverIFrameChart = ({ stockCode, width = "100%", height = "550px" }) => {
    
    // 💡 네이버 금융 모바일 차트 페이지 URL을 사용합니다. 
    // 모바일 페이지가 iframe에서 크기 조정에 더 유연합니다.
    const iframeSrc = `https://m.stock.naver.com/item/main.nhn#/stocks/${stockCode}/chart`;
    
    // 주의: 네이버 금융은 KRX 종목 코드를 그대로 사용합니다. (예: 005930)

    return (
        <iframe
            src={iframeSrc}
            width={width}
            height={height}
            frameBorder="0" 
            allowFullScreen={true}
            style={{ 
                // 네이버 차트가 페이지 전체에 맞게 보이도록 style을 설정합니다.
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                display: 'block',
                width: '100%',
                boxSizing: 'border-box'
            }}
            title={`Naver Finance Chart for ${stockCode}`}
        />
    );
};

export default NaverIFrameChart;