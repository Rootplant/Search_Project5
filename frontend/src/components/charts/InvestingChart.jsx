import React, { useEffect, useRef } from 'react';

// 인베스팅닷컴 위젯 초기 설정을 정의합니다.
const defaultWidgetConfig = {
    "symbol": "1055630", // 예시 종목 코드 (인베스팅닷컴의 신한지주 코드)
    "interval": "30",   // 30분봉
    "width": "100%", 
    "height": "500px",
    "locale": "ko",
    "save_image": false,
    "theme": "light"
};

const InvestingChart = ({ widgetConfig = defaultWidgetConfig }) => {
    // 💡 차트 컨테이너 ID를 useRef를 통해 고정하고 참조합니다.
    const chartContainerRef = useRef(null);
    const containerId = useRef(`investingcom-chart-${Math.random().toString(36).substring(2, 9)}`);

    // 위젯 초기화 함수
    const initializeWidget = () => {
        const container = chartContainerRef.current;
        
        if (container && window.InvestingCom && window.InvestingCom.widget) {
            // **기존 내용 확실히 제거 (재초기화 시 중요)**
            container.innerHTML = ''; 

            // 🌟 Spread Operator 순서: 기본 설정을 먼저 깔고, 외부 설정을 덮어씌웁니다.
            window.InvestingCom.widget.init({
                ...defaultWidgetConfig, 
                ...widgetConfig,
                // 필수: 위젯이 삽입될 DOM 요소의 ID를 지정 (고정된 ref ID 사용)
                container: containerId.current, 
            });
        }
    };

    useEffect(() => {
        // 스크립트 로드 및 초기화
        const loadScriptAndInitialize = () => {
            if (window.InvestingCom && window.InvestingCom.widget) {
                initializeWidget();
            } else {
                const script = document.createElement('script');
                script.src = 'https://i-widget.investing.com/latest/widget.js'; 
                script.type = 'text/javascript';
                script.async = true;
                script.onload = initializeWidget; 
                document.head.appendChild(script);
            }
        };

        loadScriptAndInitialize();

        // 클린업: 컴포넌트 언마운트 시 또는 종속성 변경 시
        return () => {
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = '';
            }
        };
    }, [widgetConfig.symbol]); // 💡 종목 코드가 바뀔 때만 재실행 (최적화)

    return (
        <div 
            id={containerId.current} // 💡 고정된 ID 사용
            ref={chartContainerRef}
            style={{ width: '100%', height: '500px' }} // 차트 크기 지정
        />
    );
};

export default InvestingChart;