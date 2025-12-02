package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
/*
 * 종목 상세 페이지
 * */
public class StockDetailResponseDTO {

    private StockInfoDTO stockInfo; // 종목 기본 정보 
    private List<StockNewsDTO> newsList; // 해당 종록 뉴스 목록 
    private SentimentSummaryDTO sentiment; // 뉴스 감성 분석 요약
}
