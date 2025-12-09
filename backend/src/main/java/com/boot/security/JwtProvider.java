package com.boot.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    // ★ 추후 환경변수로 빼는 게 좋음
    private final String SECRET = "a89f48a6d90791b187c7f5e1e508a48d";

    // Access Token 만료시간: 1시간
    private final Long ACCESS_EXPIRATION = 1000L * 60 * 60;

    // Refresh Token 만료시간: 7일
    private final Long REFRESH_EXPIRATION = 1000L * 60 * 60 * 24 * 7;

    // Access Token 생성
    public String createAccessToken(String email, String role) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(email) // 토큰에 저장할 값 (여기서는 email)
                .claim("role", role)
                .setIssuedAt(now) // 발급 시간
                .setExpiration(new Date(now.getTime() + ACCESS_EXPIRATION)) // 만료 시간
                .signWith(SignatureAlgorithm.HS256, SECRET) // 암호화 방식
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(String email, String role) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + REFRESH_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    // JWT → email 추출
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token) // 토큰 검증 후 Claims 추출
                .getBody()
                .getSubject();
    }
    
    // JWT → role 추출
    public String getRoleFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
    // JWT 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
