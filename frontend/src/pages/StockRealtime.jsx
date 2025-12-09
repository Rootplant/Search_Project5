import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StockRealtime() {
  const { stockCode } = useParams();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8484/ws/stocks');

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'subscribe', stockCode }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(data.price); // 예: price 필드만 화면에 표시
    };

    return () => ws.close();
  }, [stockCode]);

  return <div>{price ? `${price} 원` : '로딩중...'}</div>;
}

export default StockRealtime;
