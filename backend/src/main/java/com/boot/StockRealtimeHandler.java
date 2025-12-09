package com.boot;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;


import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class StockRealtimeHandler extends TextWebSocketHandler {

	private final Map<String, List<WebSocketSession>> stockSessions = new ConcurrentHashMap<>();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, String> req = new ObjectMapper().readValue(message.getPayload(), Map.class);
        if ("subscribe".equals(req.get("action"))) {
            String code = req.get("stockCode");
            stockSessions.computeIfAbsent(code, k -> new CopyOnWriteArrayList<>()).add(session);

            // Python Flask 구독 호출
            new Thread(() -> {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    Map<String, String> body = Map.of("code", code);
                    HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
                    new RestTemplate().postForObject("http://localhost:5000/subscribe", entity, String.class);
                } catch (Exception e) { e.printStackTrace(); }
            }).start();
        }
    }

    public void pushStockData(String stockCode, Object data) {
        List<WebSocketSession> sessions = stockSessions.get(stockCode);
        if (sessions != null) {
            sessions.forEach(s -> {
                try {
                    s.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(data)));
                } catch (Exception e) { e.printStackTrace(); }
            });
        }
    }
}
