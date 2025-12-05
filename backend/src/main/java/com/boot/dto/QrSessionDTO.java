package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QrSessionDTO {

    private String status;       // WAITING / APPROVED
    private String email;        // 모바일 승인 시 저장
    private String provider;     // LOCAL / KAKAO / NAVER / GOOGLE
    private String createdAt;
    private String expiresAt;
}

