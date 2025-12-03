package com.boot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.StockInfoDAO;
import com.boot.dao.StockMapper;
import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;

@Service
public class StockServiceImpl implements StockService {

    @Autowired
    private StockMapper mapper;

    @Autowired
    private StockInfoDAO stockDAO;

    @Override
    public void insertStockInfo(StockInfoDTO dto) {
        mapper.insertStockInfo(dto);
    }

    @Override
    public void insertStockNews(StockNewsDTO dto) {
        mapper.insertStockNews(dto);
    }

    @Override
    public List<StockInfoDTO> selectTop100MarketCap() {
        return stockDAO.selectTop100MarketCap();
    }
}
