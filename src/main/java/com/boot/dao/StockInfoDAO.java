package com.boot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import com.boot.dto.StockInfoDTO;

@Mapper
public interface StockInfoDAO {

    List<StockInfoDTO> searchStocks(String keyword);

    StockInfoDTO getStockDetail(String stockCode);
}
