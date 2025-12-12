package com.boot.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDashboardDTO {

    private DashboardSummaryDTO summary;                // 상단 카드용
    private List<DailyUserJoinDTO> dailyJoins;          // 가입자 추이
    private List<LoginStatusStatDTO> loginStats;        // 로그인 통계
    private List<StockNewsTopDTO> topNewsStocks;        // 뉴스 많은 종목 TOP N
    private SecurityStatsDTO securityStats;				// 위험 사용자 조회
}