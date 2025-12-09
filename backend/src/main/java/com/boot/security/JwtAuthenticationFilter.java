package com.boot.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    // SecurityConfig와 맞춘 화이트리스트 URL
    private static final List<String> WHITE_LIST = List.of(
            "/auth/login",
            "/auth/register",
            "/auth/verify",
            "/auth/check-email",
            "/auth/reset/request",
            "/auth/reset/verify",
            "/auth/reset/confirm",
            "/auth/kakao",
            "/auth/kakao/callback",
            "/auth/naver/callback",
            "/auth/google/callback",
            "/auth/qr/create",  // QR 생성은 인증 불필요
            "/auth/qr/status",
            "/error"
    );

    // 화이트리스트 경로는 JWT 필터 동작 제외
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return WHITE_LIST.contains(path);  // 완전 일치만 허용
    }
    
    // 요청이 들어올 때마다 JWT를 검사하는 필터
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
        	// Authorization 헤더에서 JWT 추출
            String authHeader = request.getHeader("Authorization");

            // JWT 존재 여부 확인
            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7); // "Bearer " 제거

                // 토큰 유효성 검사
                if (jwtProvider.validateToken(token)) {
                	
                	// 토큰에서 email 꺼내기
                    String email = jwtProvider.getEmailFromToken(token);
                    //role 추가 추출 
                    String role = jwtProvider.getRoleFromToken(token);

                    // 이미 인증된 경우 재인증 방지
                    if (email != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {
                    	
                    	// DB에서 유저정보 로드
                        UserDetails userDetails =
                                userDetailsService.loadUserByUsername(email);
                        
                        // ⭐ JWT에서 읽은 role을 Spring Security 권한으로 변환
                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority("ROLE_" + role);
                        
                        // 스프링 시큐리티가 인증된 사용자로 인식하도록 설정
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, List.of(authority)
                                );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

        } catch (Exception e) {
            System.out.println("JWT Filter Error: " + e.getMessage());
        }
        
        // 다음 필터로 넘김
        filterChain.doFilter(request, response);
    }
}
