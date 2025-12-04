package com.boot.controller;

import com.boot.dto.LoginRequestDTO;
import com.boot.dto.PasswordResetConfirmDTO;
import com.boot.dto.PasswordResetRequestDTO;
import com.boot.dto.RefreshRequestDTO;
import com.boot.dto.RegisterRequestDTO;
import com.boot.service.AuthService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 로그인 요청 처리
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req) {

        // 모든 로그인 로직은 서비스로 위임
        return authService.login(req);
    }
    // 이메일 인증 확인
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        return authService.checkEmail(email);
    }
    
    //회원 가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO req) {
        return authService.register(req);
    }
    
    // 이메일 인증
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }
    
    // 비밀번호 재설정
    @PostMapping("/reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequestDTO req) {
        return authService.requestPasswordReset(req.getEmail());
    }

    @GetMapping("/reset/verify")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        return authService.verifyResetToken(token);
    }

    @PostMapping("/reset/confirm")
    public ResponseEntity<?> confirmReset(@RequestBody PasswordResetConfirmDTO req) {
        return authService.resetPassword(req);
    }
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequestDTO req) {
        return authService.refresh(req.getRefreshToken());
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        return authService.logout(email);
    }
}
