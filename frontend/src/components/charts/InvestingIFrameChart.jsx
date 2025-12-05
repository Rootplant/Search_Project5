// src/components/charts/InvestingIFrameChart.jsx (수정된 코드)
import React from 'react';

const InvestingIFrameChart = ({ pairID, width = "100%", height = "500px" }) => {

    // 🌟 실시간에 가깝도록 interval과 plotStyle을 수정했습니다.
    // interval=60: 1분봉으로 설정 (실시간으로 움직이는 것처럼 보이게 함)
    // plotStyle=candlestick: 캔들스틱으로 설정하여 움직임을 역동적으로 표현
    const iframeSrc = `https://ssltvc.investing.com/?pair_ID=${pairID}&height=${height}&width=${width}&interval=60&plotStyle=candlestick&domain_ID=18&lang_ID=18&timezone_ID=26`;
    
    return (
        <iframe
            src={iframeSrc}
            width={width}
            height={height}
            frameBorder="0"
            allowFullScreen={true}
            style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px', 
                display: 'block',
                width: '100%',
                boxSizing: 'border-box'
            }}
            title={`Investing Chart for Pair ID ${pairID}`}
        />
    );
};

export default InvestingIFrameChart;