package com.boot.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.boot.dto.StockNewsDTO;

@Mapper
public interface StockNewsDAO {

    List<StockNewsDTO> getNewsByStock(String stockCode);

    Map<String, Object> getSentimentSummary(String stockCode);
}
