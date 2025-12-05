package com.boot.controller;

import com.boot.dto.LoginUserInfoDTO;
import com.boot.dto.SocialUserInfoDTO;
import com.boot.service.AuthService;
import com.boot.service.QrSessionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/auth/qr")
@RequiredArgsConstructor
public class QrLoginController {

    private final QrSessionService qrService;
    private final AuthService authService;

    /**
     * 1) QR 생성 (PC 화면이 호출)
     */
    @GetMapping("/create")
    public ResponseEntity<?> createQr() {

        String sessionId = qrService.createSession();

        // QR로 인코딩할 URL
        String qrUrl = "http://localhost:8484/auth/qr/check?sessionId=" + sessionId;

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "qrUrl", qrUrl
        ));
    }


    /**
     * 2) QR 이미지 생성 API (PNG 출력)
     * PC 프론트는 이 API를 img src에 그대로 넣으면 됨.
     *
     * 예: <img src="http://localhost:8484/auth/qr/image?sessionId=xxxx">
     */
    @GetMapping(value = "/image", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrImage(@RequestParam String sessionId) throws Exception {

        String qrUrl = "http://localhost:8484/auth/qr/check?sessionId=" + sessionId;

        byte[] qrImage = qrService.generateQr(qrUrl);

        return ResponseEntity.ok(qrImage);
    }


    /**
     * 3) 모바일에서 QR 승인
     * 모바일은 반드시 JWT 인증된 상태여야 함.
     */
    @PostMapping("/approve")
    public ResponseEntity<?> approveQr(
            @RequestBody Map<String, String> req,
            @AuthenticationPrincipal LoginUserInfoDTO user // 모바일 로그인 정보
    ) {

        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요한 기능입니다.");
        }

        String sessionId = req.get("sessionId");

        qrService.approveSession(sessionId, user.getEmail(), user.getProvider());

        return ResponseEntity.ok("QR 로그인 승인 완료");
    }


    /**
     * 4) PC에서 QR 상태 조회 (폴링)
     */
    @GetMapping("/status")
    public ResponseEntity<?> qrStatus(@RequestParam String sessionId) {

        var session = qrService.getSession(sessionId);

        if (session == null) {
            return ResponseEntity.status(404).body("QR 세션이 만료되었습니다.");
        }

        return ResponseEntity.ok(session);
    }


    /**
     * 5) QR 로그인 최종 완료 (PC에서 호출)
     * 모바일이 승인했다면 JWT 발급
     */
    @PostMapping("/login")
    public ResponseEntity<?> qrLogin(@RequestBody Map<String, String> req) {

        String sessionId = req.get("sessionId");
        var session = qrService.getSession(sessionId);

        if (session == null) {
            return ResponseEntity.status(404).body("세션 만료");
        }
        if (!"APPROVED".equals(session.getStatus())) {
            return ResponseEntity.status(400).body("아직 승인되지 않았습니다.");
        }

        // QR 로그인은 소셜/로컬 상관없이 모바일 로그인한 계정 그대로 로그인됨
        return authService.socialLogin(
                new SocialUserInfoDTO(
                        session.getEmail(),
                        null,               // fullName 필요하면 조회해서 넣어도 됨
                        session.getProvider()
                )
        );
    }
}
