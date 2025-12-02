package com.boot.service;

import java.util.List;
import com.boot.dto.StockNewsDTO;
import com.boot.dto.SentimentSummaryDTO;

public interface StockNewsService {

    List<StockNewsDTO> getNewsByStock(String stockCode);

    SentimentSummaryDTO getSentimentSummary(String stockCode);
}
