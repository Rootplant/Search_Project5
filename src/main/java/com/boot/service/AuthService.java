package com.boot.service;

import com.boot.dao.UserDAO;
import com.boot.dto.LoginRequestDTO;
import com.boot.dto.RegisterRequest;
import com.boot.dto.UserInfoDTO;
import com.boot.security.JwtProvider;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // 최대 실패 횟수 및 잠금 시간(초)
    private final int MAX_FAIL = 5;
    private final int LOCK_TIME = 30;

    public ResponseEntity<?> login(LoginRequestDTO req) {

        UserInfoDTO user = userDAO.findByEmail(req.getEmail());

        // 1) 이메일 존재 확인
        if (user == null) {
            return ResponseEntity.status(401).body("❌ 존재하지 않는 이메일입니다.");
        }

        // 2) 계정 잠금 상태인지 확인
        if (user.getLockUntil() != null) {

            LocalDateTime lockUntil = LocalDateTime.parse(user.getLockUntil());

            if (lockUntil.isAfter(LocalDateTime.now())) {

                long remainSec = Duration.between(LocalDateTime.now(), lockUntil).getSeconds();

                return ResponseEntity.status(403)
                        .body("🚫 계정이 잠겨있습니다. " + remainSec + "초 후 다시 시도 가능합니다.");
            }
        }

        // 3) 비밀번호 검증
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {

            // 실패 횟수 증가
            int newFailCount = user.getLoginFailCount() + 1;
            userDAO.updateFailCount(user.getEmail(), newFailCount);

            // 실패 5번 → 계정 잠금
            if (newFailCount >= MAX_FAIL) {
                LocalDateTime lockTime = LocalDateTime.now().plusSeconds(LOCK_TIME);
                userDAO.lockUser(user.getEmail(), lockTime.toString());

                return ResponseEntity.status(403)
                        .body("❌ 비밀번호 5회 이상 오류. 계정이 30초동안 잠겼습니다.");
            }

            int remain = MAX_FAIL - newFailCount;
            return ResponseEntity.status(401)
                    .body("❌ 비밀번호 오류. 남은 시도: " + remain + "회");
        }

        // 4) 로그인 성공 → 실패횟수 초기화
        userDAO.resetFailCount(user.getEmail());

        // 5) JWT 발급
        String token = jwtProvider.createToken(user.getEmail());

        return ResponseEntity.ok(token);
    }
    
    //이메일 중복 확인
    public ResponseEntity<?> checkEmail(String email) {

        UserInfoDTO exist = userDAO.findByEmail(email);

        if (exist != null) {
            return ResponseEntity.ok(false); // 사용 불가
        }

        return ResponseEntity.ok(true); // 사용 가능
    }
    
    //회원가입
    public ResponseEntity<?> register(RegisterRequest req) {

        // 1) 중복 체크
        if (userDAO.findByEmail(req.getEmail()) != null) {
            return ResponseEntity.status(400).body("이미 존재하는 이메일입니다.");
        }

        // 2) 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(req.getPassword());

        // 3) fullName 생성
        String fullName = req.getLastName() + req.getFirstName();

        // 4) 이메일 인증 토큰 생성 (UUID 사용)
        String token = UUID.randomUUID().toString();
        LocalDateTime expireAt = LocalDateTime.now().plusMinutes(30);

        // 5) DB 저장
        userDAO.insertUser(
                req.getEmail(),
                req.getFirstName(),
                req.getLastName(),
                fullName,
                encodedPw,
                "LOCAL",
                "USER",
                token,
                expireAt.toString()
        );

        // 6) 응답
        return ResponseEntity.ok("회원가입 완료! 이메일 인증을 진행해주세요.");
    }
}
