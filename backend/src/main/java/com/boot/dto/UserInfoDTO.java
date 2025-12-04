package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDTO {

	private String email;             // 이메일(로그인 ID)
    private String firstName;         // 이름
    private String lastName;          // 성
    private String fullName;          // 전체 이름

    private String password;          // 비밀번호(LOCAL만 저장)
    private String provider;          // LOCAL / GOOGLE / NAVER ...
    private String role;              // USER / ADMIN
    private String createdAt;         // 가입일

    private Integer loginFailCount;   // 로그인 실패 횟수
    private String lockUntil;         // 계정 잠금 해제 시간

    private String resetToken;        // 비밀번호 재설정 토큰
    private String tokenExpireAt;     // 토큰 만료시간

    private String accountStatus;     // ACTIVE / SUSPENDED
    private String suspendUntil;      // 정지 해제 시간
    
    // JWT Refresh Token (DB 저장용)
    private String refreshToken; 
}
