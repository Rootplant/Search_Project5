package com.boot.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.boot.dao.StockNewsDAO;
import com.boot.dto.StockNewsDTO;
import com.boot.dto.SentimentSummaryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockNewsServiceImpl implements StockNewsService {

    private final StockNewsDAO stockNewsDAO;

    @Override
    public List<StockNewsDTO> getNewsByStock(String stockCode) {
        return stockNewsDAO.getNewsByStock(stockCode);
    }

    @Override
    public SentimentSummaryDTO getSentimentSummary(String stockCode) {

        Map<String, Object> result = stockNewsDAO.getSentimentSummary(stockCode);

        SentimentSummaryDTO dto = new SentimentSummaryDTO();
        dto.setPositiveCount(((Number) result.get("POSITIVE")).intValue());
        dto.setNegativeCount(((Number) result.get("NEGATIVE")).intValue());
        dto.setNeutralCount(((Number) result.get("NEUTRAL")).intValue());

        int total = dto.getPositiveCount() + dto.getNegativeCount() + dto.getNeutralCount();

        if (total > 0) {
            dto.setPositiveRate(dto.getPositiveCount() * 100.0 / total);
            dto.setNegativeRate(dto.getNegativeCount() * 100.0 / total);
        }

        return dto;
    }
}
