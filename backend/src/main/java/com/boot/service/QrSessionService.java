package com.boot.service;

import com.boot.dto.QrSessionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.encoder.QRCode;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class QrSessionService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    /**
     * QR 세션 생성
     */
    public String createSession() {

        String sessionId = UUID.randomUUID().toString();
        String key = "qr:session:" + sessionId;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireAt = now.plusMinutes(5);

        QrSessionDTO qr = new QrSessionDTO(
                "WAITING",
                null,
                null,
                now.format(FORMAT),
                expireAt.format(FORMAT)
        );

        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(qr);

            redisTemplate.opsForValue().set(key, json, 5, TimeUnit.MINUTES);

        } catch (Exception e) {
            throw new RuntimeException("QR 세션 생성 실패");
        }

        return sessionId;
    }


    /**
     * QR 세션 조회
     */
    public QrSessionDTO getSession(String sessionId) {

        String key = "qr:session:" + sessionId;
        String value = redisTemplate.opsForValue().get(key);

        if (value == null) return null;

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(value, QrSessionDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("QR 세션 파싱 실패");
        }
    }


    /**
     * 모바일에서 QR 승인
     */
    public void approveSession(String sessionId, String email, String provider) {

        String key = "qr:session:" + sessionId;
        QrSessionDTO session = getSession(sessionId);

        if (session == null) {
            throw new RuntimeException("QR 세션이 존재하지 않거나 만료되었습니다.");
        }

        session.setStatus("APPROVED");
        session.setEmail(email);
        session.setProvider(provider);

        try {
            ObjectMapper mapper = new ObjectMapper();
            String updated = mapper.writeValueAsString(session);

            redisTemplate.opsForValue().set(key, updated, 5, TimeUnit.MINUTES);

        } catch (Exception e) {
            throw new RuntimeException("QR 승인 처리 실패");
        }
    }


    /**
     * QR 이미지 생성 (PNG)
     */
    public byte[] generateQr(String text) throws Exception {

        int width = 300;
        int height = 300;

        BitMatrix matrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", bos);

        return bos.toByteArray();
    }
}
