package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentimentSummaryDTO {

    private int positiveCount; //긍정 단어 카운트 
    private int negativeCount; //부정 단어 카운트
    private int neutralCount; //중립 단어 카운트

    private double positiveRate; //긍정 비율
    private double negativeRate; //부정 비율
    private double neutralRate; //중립 비율
}
