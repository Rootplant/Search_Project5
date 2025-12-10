package com.boot.dto;

import lombok.Data;

/*
 * 권한 변경
 * */
@Data
public class ChangeRoleDTO {
    private String email;     // 권한 변경 대상 사용자
    private String newRole;   // USER / ADMIN
    private String reason;    // (선택) 변경 사유 - 관리자 로그용
}
