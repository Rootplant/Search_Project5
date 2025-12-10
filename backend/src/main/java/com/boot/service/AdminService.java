package com.boot.service;

import com.boot.dao.AdminDAO;
import com.boot.dto.ChangeRoleDTO;
import com.boot.dto.SuspendRequestDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminDAO adminDAO;
    private final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    //계정 조회
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminDAO.getUsers());
    }

 // 1) 계정 정지
    public ResponseEntity<?> suspendUser(SuspendRequestDTO req) {

        LocalDateTime until = LocalDateTime.now().plusDays(req.getDays());

        adminDAO.suspendUser(
                req.getEmail(),
                until.format(formatter),
                req.getReason()
        );

        adminDAO.insertAdminLog(
                "ADMIN",
                req.getEmail(),
                "SUSPEND",
                "정지 " + req.getDays() + "일, 사유: " + req.getReason()
        );

        return ResponseEntity.ok(
                "계정 정지 완료\n정지 해제: " + until.format(formatter)
                + "\n사유: " + req.getReason()
        );
    }

    // 2) 계정 정지 해제
    public ResponseEntity<?> unsuspendUser(String email) {

        adminDAO.unsuspendUser(email);

        adminDAO.insertAdminLog(
                "ADMIN",
                email,
                "UNSUSPEND",
                "정지 해제"
        );

        return ResponseEntity.ok("정지 해제 완료");
    }

    public ResponseEntity<?> changeUserRole(ChangeRoleDTO dto) {
    	
    	String email = dto.getEmail();
        String newRole = dto.getNewRole();
        
        // 1) 권한 유효성 체크
        if (!"USER".equals(newRole) && !"ADMIN".equals(newRole)) {
            return ResponseEntity.status(400)
                    .body("role 값은 USER 또는 ADMIN만 가능합니다.");
        }

        // 2) 대상 유저 조회
        var user = adminDAO.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body("해당 사용자를 찾을 수 없습니다.");
        }

        // 🚫 3) 정지된 계정이면 권한 변경 금지
        if ("Y".equals(user.getIsSuspended())) {
            return ResponseEntity.status(403)
                    .body("🚫 정지된 계정의 권한은 변경할 수 없습니다.");
        }

        // 🚫 4) 이메일 인증 되지 않은 계정의 권한 변경 금지
        if (!"ACTIVE".equals(user.getAccountStatus())) {
            return ResponseEntity.status(403)
                    .body("🚫 이메일 인증이 완료되지 않은 계정은 권한을 변경할 수 없습니다.");
        }

        // ✔ 이미 같은 권한이면 변경 불필요
        if (newRole.equals(user.getRole())) {
            return ResponseEntity.ok("이미 '" + newRole + "' 권한입니다.");
        }

        String oldRole = user.getRole();

        // 5) DB 업데이트
        adminDAO.updateUserRole(email, newRole);

        // 6) 관리자 로그 기록
        adminDAO.insertAdminLog(
                "ADMIN",
                email,
                "ROLE_CHANGE",
                "권한 변경: " + oldRole + " → " + newRole
        );

        return ResponseEntity.ok("권한이 성공적으로 " + newRole + "로 변경되었습니다.");
    }

//
//    public ResponseEntity<?> resetFail(String email) {
//        adminDAO.resetFail(email);
//        adminDAO.insertAdminLog("RESET_FAIL", email, "로그인 실패 횟수 초기화");
//        return ResponseEntity.ok("초기화 완료");
//    }
//
//    public ResponseEntity<?> forceLogout(String email) {
//        adminDAO.forceLogout(email);
//        adminDAO.insertAdminLog("FORCE_LOGOUT", email, "강제 로그아웃");
//        return ResponseEntity.ok("로그아웃 완료");
//    }
//
//    public ResponseEntity<?> getTokens() {
//        return ResponseEntity.ok(adminDAO.getTokens());
//    }
//
//    public ResponseEntity<?> deleteToken(String email) {
//        adminDAO.forceLogout(email);
//        adminDAO.insertAdminLog("DELETE_TOKEN", email, "토큰 삭제");
//        return ResponseEntity.ok("토큰 삭제 완료");
//    }
//
//    public ResponseEntity<?> clearTokens() {
//        adminDAO.clearTokens();
//        adminDAO.insertAdminLog("CLEAR_TOKEN_ALL", null, "전체 토큰 초기화");
//        return ResponseEntity.ok("전체 초기화 완료");
//    }
//
//    public ResponseEntity<?> getLoginLog() {
//        return ResponseEntity.ok(adminDAO.getLoginLog());
//    }
//
//    public ResponseEntity<?> getAdminLog() {
//        return ResponseEntity.ok(adminDAO.getAdminLog());
//    }
//
//    public ResponseEntity<?> dashboard() {
//        return ResponseEntity.ok(adminDAO.getDashboard());
//    }
}
