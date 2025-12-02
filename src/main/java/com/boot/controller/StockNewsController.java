package com.boot.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.boot.dto.StockNewsDTO;
import com.boot.service.StockNewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
/*
 * 전체 뉴스 API 필요할 때
 * */
public class StockNewsController {

    private final StockNewsService stockNewsService;

    @GetMapping("/{stockCode}")
    public List<StockNewsDTO> getNews(@PathVariable String stockCode) {
        return stockNewsService.getNewsByStock(stockCode);
    }
}
