package com.boot.security;

import com.boot.config.SecurityConfig;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    private final SecurityConfig securityConfig;

    // JWT 암호화 키 (나중에 환경변수로 빼는 것이 좋음)
    private final String SECRET = "a89f48a6d90791b187c7f5e1e508a48d";

    // 토큰 만료시간: 1시간
    private final Long EXPIRATION = 1000L * 60 * 60;

    JwtProvider(SecurityConfig securityConfig) {
        this.securityConfig = securityConfig;
    }

    // 로그인 성공 시 실행 → JWT 문자열 생성
    public String createToken(String email) {

        Date now = new Date();

        return Jwts.builder()
                .setSubject(email)        // 토큰에 저장할 값 (여기서는 email)
                .setIssuedAt(now)         // 발급 시간
                .setExpiration(new Date(now.getTime() + EXPIRATION))  // 만료 시간
                .signWith(SignatureAlgorithm.HS256, SECRET)           // 암호화 방식
                .compact();
    }

    // JWT → email 추출
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)    // 토큰 검증 후 Claims 추출
                .getBody()
                .getSubject();
    }
}
