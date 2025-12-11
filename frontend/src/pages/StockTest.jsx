import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";

export default function StockTest() {
  const { code } = useParams();

  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [changeRate, setChangeRate] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!code) return;

    // 구독 요청
    fetch(`http://localhost:5000/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    }).then(() => console.log("✅ Flask 구독 요청:", code));

    // STOMP 연결
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8484/ws-stock"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      subscriptionRef.current = client.subscribe(
        `/topic/stock/${code}`,
        (msg) => {
          const data = JSON.parse(msg.body);
          setCurrentPrice(data.currentPrice);
          setPriceChange(data.priceChange);
          setChangeRate(data.changeRate);
        }
      );
    };

    client.activate();
    stompClientRef.current = client;

    // 창 종료 시 구독 해제
    const handleBeforeUnload = () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current) stompClientRef.current.deactivate();

      // sendBeacon 문자열 그대로 전송
      const url = "http://localhost:5000/unsubscribe";
      const data = JSON.stringify({ code });
      navigator.sendBeacon(url, data);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [code]);

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", width: "300px" }}>
      <h3>📈 실시간 주식 [{code}]</h3>
      <p>현재가: <b>{currentPrice !== null ? currentPrice : "대기 중..."}</b></p>
      <p>전일대비: <b style={{ color: Number(priceChange) < 0 ? "blue" : "red" }}>{priceChange !== null ? priceChange : "-"}</b></p>
      <p>등락률: <b style={{ color: Number(changeRate) < 0 ? "blue" : "red" }}>{changeRate !== null ? `${changeRate}%` : "-"}</b></p>
    </div>
  );
}
