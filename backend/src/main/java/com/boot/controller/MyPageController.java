package com.boot.controller;

import com.boot.dto.FavoriteDTO;
import com.boot.dto.UserInfoDTO;
import com.boot.service.AuthService; // 기존 서비스 활용
import com.boot.dao.UserDAO;         // DAO 직접 호출 (간단한 예시)
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    // 1. 마이페이지 진입 시 모든 정보(내정보 + 찜목록) 가져오기
    @GetMapping("/info")
    public ResponseEntity<?> getMyPageInfo(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).body("로그인 필요");
        String email = user.getUsername();

        UserInfoDTO userInfo = userDAO.findByEmail(email);
        List<FavoriteDTO> stocks = userDAO.getFavoriteStocks(email); // DAO 메서드 필요
        List<FavoriteDTO> news = userDAO.getFavoriteNews(email);     // DAO 메서드 필요

        // 민감 정보 제거
        userInfo.setPassword(null);

        Map<String, Object> response = new HashMap<>();
        response.put("user", userInfo);
        response.put("stocks", stocks);
        response.put("news", news);

        return ResponseEntity.ok(response);
    }

    // 2. 정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> updateInfo(@RequestBody Map<String, String> req, 
                                      @AuthenticationPrincipal UserDetails user) {
        String fullName = req.get("fullName");
        String password = req.get("password");
        
        String encodedPw = null;
        if (password != null && !password.isEmpty()) {
            encodedPw = passwordEncoder.encode(password);
        }

        // DAO에 updateUserInfo 호출 (매개변수 DTO 혹은 Map으로 전달)
        // userDAO.updateUserInfo(user.getUsername(), fullName, encodedPw);
        
        return ResponseEntity.ok("정보가 수정되었습니다.");
    }

    // 3. 탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdraw(@AuthenticationPrincipal UserDetails user) {
        userDAO.deleteUser(user.getUsername());
        return ResponseEntity.ok("탈퇴 완료");
    }
    
    

    // --- 관심 종목 관리 ---
    
    @PostMapping("/favorites/stock")
    public ResponseEntity<?> addStock(@RequestBody Map<String, String> req, 
                                      @AuthenticationPrincipal UserDetails user) {
        userDAO.addFavoriteStock(user.getUsername(), req.get("stockCode"));
        return ResponseEntity.ok("관심 종목에 추가되었습니다.");
    }

    @DeleteMapping("/favorites/stock/{stockCode}")
    public ResponseEntity<?> removeStock(@PathVariable String stockCode, 
                                         @AuthenticationPrincipal UserDetails user) {
        userDAO.removeFavoriteStock(user.getUsername(), stockCode);
        return ResponseEntity.ok("관심 종목에서 삭제되었습니다.");
    }

    // --- 뉴스 스크랩 관리 ---

    @PostMapping("/favorites/news")
    public ResponseEntity<?> addNews(@RequestBody Map<String, Long> req, 
                                     @AuthenticationPrincipal UserDetails user) {
        userDAO.addFavoriteNews(user.getUsername(), req.get("newsId"));
        return ResponseEntity.ok("뉴스를 스크랩했습니다.");
    }

    @DeleteMapping("/favorites/news/{newsId}")
    public ResponseEntity<?> removeNews(@PathVariable Long newsId, 
                                        @AuthenticationPrincipal UserDetails user) {
        userDAO.removeFavoriteNews(user.getUsername(), newsId);
        return ResponseEntity.ok("스크랩을 취소했습니다.");
    }
}