// src/components/charts/TradingViewChart.jsx
import React, { useEffect, useRef } from 'react';

// 트레이딩뷰 위젯을 초기화할 때 필요한 기본 설정 객체입니다.
const defaultWidgetConfig = {
    // 💡 KRX 삼성전자를 기본값으로 설정
    "symbol": "KRX:005930", 
    "interval": "D", // 일봉
    "timezone": "Asia/Seoul",
    "theme": "light",
    "style": "1",
    "locale": "kr",
    "toolbar_bg": "#f1f3f6",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "calendar": false,
    "withdateranges": true,
    "range": "6M",
    "hide_side_toolbar": false,
    "save_image": false,
    "details": false,
    "studies": [],
    "show_popup_button": false,
    "popup_width": "1000",
    "popup_height": "650"
};

const TradingViewChart = ({ widgetConfig = defaultWidgetConfig }) => {
    const chartContainerRef = useRef(null);
    const containerId = useRef(`tradingview-chart-${Math.random().toString(36).substring(2, 9)}`);

    // 위젯 초기화 함수
    const initializeWidget = () => {
        if (chartContainerRef.current && window.TradingView) {
            
            // 기존 위젯 제거 후 새로 그리기 (재초기화 시 중요)
            chartContainerRef.current.innerHTML = '';
            
            new window.TradingView.widget({
                // 🌟 순서: 기본 설정을 먼저 적용한 뒤, 외부 설정을 덮어씌웁니다.
                ...defaultWidgetConfig, 
                ...widgetConfig,
                
                // 필수 옵션
                container_id: containerId.current,
                autosize: true, 
            });
        }
    };

    useEffect(() => {
        const loadScriptAndInitialize = () => {
             if (window.TradingView) {
                initializeWidget();
             } else {
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.type = 'text/javascript';
                script.async = true;
                script.onload = initializeWidget; 
                document.head.appendChild(script);
             }
        };

        loadScriptAndInitialize();

        // 클린업 함수
        return () => {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = '';
            }
        };
    }, [widgetConfig.symbol]); // 종목 코드가 바뀔 때 차트 재생성

    return (
        <div 
            id={containerId.current}
            ref={chartContainerRef}
            style={{ width: '100%', height: '550px' }}
        />
    );
};

export default TradingViewChart;