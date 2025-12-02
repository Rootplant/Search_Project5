package com.boot.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.boot.dto.StockDetailResponseDTO;
import com.boot.dto.StockInfoDTO;
import com.boot.service.StockInfoService;
import com.boot.service.StockNewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
/*
 * 검색 + 상세
 * */
public class StockController {

    private final StockInfoService stockInfoService;
    private final StockNewsService stockNewsService;

    // 자동완성 + 검색
    @GetMapping("/search")
    public List<StockInfoDTO> search(@RequestParam String keyword) {
        return stockInfoService.searchStocks(keyword);
    }

    // 상세보기
    @GetMapping("/{stockCode}")
    public StockDetailResponseDTO getDetail(@PathVariable String stockCode) {

        StockDetailResponseDTO dto = new StockDetailResponseDTO();

        dto.setStockInfo(stockInfoService.getStockDetail(stockCode));
        dto.setNewsList(stockNewsService.getNewsByStock(stockCode));
        dto.setSentiment(stockNewsService.getSentimentSummary(stockCode));

        return dto;
    }
}
