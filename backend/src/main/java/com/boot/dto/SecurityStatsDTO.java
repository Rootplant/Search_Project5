package com.boot.dto;

import lombok.Data;

@Data
public class SecurityStatsDTO {
    private int lockedUsers;       // 잠금된 사용자 수
    private int rapidFailAttempts; // 짧은 시간 내 연속 실패
    private int riskyIpCount;      // 위험 IP 수
}

