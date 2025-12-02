package com.boot.service;

import java.util.List;
import com.boot.dto.StockInfoDTO;

public interface StockInfoService {

    List<StockInfoDTO> searchStocks(String keyword);

    StockInfoDTO getStockDetail(String stockCode);
}
