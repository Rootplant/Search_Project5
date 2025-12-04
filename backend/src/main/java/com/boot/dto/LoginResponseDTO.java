package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 성공 시 내려줄 응답: JWT + 사용자 정보
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

	private String accessToken;   // 액세스 토큰
    private String refreshToken;  // 리프레시 토큰
    private LoginUserInfoDTO user; // 화면에서 쓸 사용자 정보
}
