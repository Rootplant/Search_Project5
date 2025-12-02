package com.boot.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.boot.dao.StockInfoDAO;
import com.boot.dto.StockInfoDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockInfoServiceImpl implements StockInfoService {

    private final StockInfoDAO stockInfoDAO;

    @Override
    public List<StockInfoDTO> searchStocks(String keyword) {
        return stockInfoDAO.searchStocks(keyword);
    }

    @Override
    public StockInfoDTO getStockDetail(String stockCode) {
        return stockInfoDAO.getStockDetail(stockCode);
    }
}
