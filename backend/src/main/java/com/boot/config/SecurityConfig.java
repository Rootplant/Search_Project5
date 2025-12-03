package com.boot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 핵심 보안 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf().disable()   // REST API라 CSRF 불필요
            .cors().and()
            .authorizeRequests()
            .antMatchers("/auth/**").permitAll()  // 로그인/회원가입은 인증 필요 없음
            .anyRequest().authenticated()         // 나머지는 JWT 필요
            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS); // 세션 대신 JWT 사용

        return http.build();
    }

    // 비밀번호 암호화 (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    
            http
                .csrf().disable()    // Python에서 오는 POST를 막지 않기
                .authorizeRequests()
                    .antMatchers("/api/**").permitAll()   // 🔥 크롤러용 API 전부 허용
                    .anyRequest().permitAll()             // 다른 요청도 허용(지금은 보안 필요 없음)
                .and()
                .formLogin().disable()
                .httpBasic().disable();
    
            return http.build();
        }
    
}
