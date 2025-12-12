// StockNewsController.java
package com.boot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.boot.dto.StockNewsDTO;
import com.boot.dto.SentimentSummaryDTO;
import com.boot.service.StockNewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StockNewsController {

    private final StockNewsService stockNewsService;

    // 종목별 뉴스 리스트
    @GetMapping("/{stockCode}")
    public List<StockNewsDTO> getNews(@PathVariable String stockCode) {
        return stockNewsService.getNewsByStock(stockCode);
    }

    // 종목별 감성 요약 (기본)
    @GetMapping("/{stockCode}/sentiment")
    public SentimentSummaryDTO getSentimentSummary(@PathVariable String stockCode) {
        return stockNewsService.getSentimentSummary(stockCode);
    }

    // 종목별 감성 통계 (상세)
    @GetMapping("/{stockCode}/sentiment/detail")
    public SentimentSummaryDTO getSentimentSummaryByStock(@PathVariable String stockCode) {
        return stockNewsService.getSentimentSummaryByStock(stockCode);
    }

    // 종목별 감성 통계 (기간 필터링)
    @GetMapping("/{stockCode}/sentiment/period")
    public SentimentSummaryDTO getSentimentSummaryWithPeriod(
            @PathVariable String stockCode,
            @RequestParam(defaultValue = "30") int days) {
        return stockNewsService.getSentimentSummaryByStockWithPeriod(stockCode, days);
    }

    // 전체 종목별 감성 통계 (대시보드용)
    @GetMapping("/sentiment/all")
    public List<Map<String, Object>> getAllStockSentimentSummary() {
        return stockNewsService.getAllStockSentimentSummary();
    }

    // 전체 종목별 감성 통계 (기간 필터링)
    @GetMapping("/sentiment/all/period")
    public List<Map<String, Object>> getAllStockSentimentSummaryWithPeriod(
            @RequestParam(defaultValue = "30") int days) {
        return stockNewsService.getAllStockSentimentSummaryWithPeriod(days);
    }

    @GetMapping("/sentiment/dashboard")
    public List<Map<String, Object>> getDashboardSentimentSummary(
            @RequestParam(defaultValue = "30") int days) {

        return stockNewsService.getAllStockSentimentSummaryWithPeriod(days);
    }

    // 종목별 날짜별 감성 통계 (트렌드)
    @GetMapping("/{stockCode}/sentiment/trend")
    public List<Map<String, Object>> getSentimentTrend(
            @PathVariable String stockCode,
            @RequestParam(defaultValue = "30") int days) {
        return stockNewsService.getSentimentTrendByStock(stockCode, days);
    }

    // 키워드 TOP 10 (특정 종목)
    @GetMapping("/{stockCode}/keywords")
    public List<Map<String, Object>> getTopKeywordsByStock(@PathVariable String stockCode) {
        return stockNewsService.getTopKeywordsByStock(stockCode);
    }

    // 전체 키워드 TOP 20 (트렌드)
    @GetMapping("/keywords/top")
    public List<Map<String, Object>> getTopKeywordsAll(
            @RequestParam(defaultValue = "30") int days) {
        return stockNewsService.getTopKeywordsAll(days);
    }

    // 전체 감성 통계
    @GetMapping("/sentiment/overall")
    public Map<String, Object> getOverallSentimentSummary() {
        return stockNewsService.getOverallSentimentSummary();
    }
    
    // ✅ 산업 목록 (중복 제거)
    @GetMapping("/industries")
    public List<String> getIndustries() {
        return stockNewsService.getIndustries();
    }

    // ✅ 산업별 뉴스 조회
    @GetMapping("/by-industry")
    public List<StockNewsDTO> getNewsByIndustry(@RequestParam String industry) {
        return stockNewsService.getNewsByIndustry(industry);
    }

    // ✅ 키워드별 뉴스 조회
    @GetMapping("/by-keyword")
    public List<StockNewsDTO> getNewsByKeyword(@RequestParam String keyword) {
        return stockNewsService.getNewsByKeyword(keyword);
    }

    // ✅ 키워드별 종목 조회
    @GetMapping("/stocks-by-keyword")
    public List<Map<String, Object>> getStocksByKeyword(@RequestParam String keyword) {
        return stockNewsService.getStocksByKeyword(keyword);
    }

    // ================================
    // 🔥 인기 종목 Top 10 (기사 수 기준)
    // ================================
    @GetMapping("/top10")
    public List<Map<String, Object>> getTop10PopularStocks() {
        return stockNewsService.getTop10PopularStocks();
    }



    // =====================================================================
    // 11) 🔥🔥 AI 인사이트 생성 API (대시보드용 자동 분석)
    //     예: /api/news/insights?days=30
    // =====================================================================
    @GetMapping("/insights")
    public List<String> getAiInsights(@RequestParam(defaultValue = "30") int days) {

        // 기간 필터링된 감성 요약 목록 가져오기
        List<Map<String, Object>> list =
                stockNewsService.getAllStockSentimentSummaryWithPeriod(days);

        if (list == null || list.isEmpty()) {
            return List.of("데이터 없음");
        }

        String bestPositiveName = "";
        double bestPositiveValue = -1;

        String bestNegativeName = "";
        double bestNegativeValue = -1;

        for (Map<String, Object> row : list) {

            // 🔥 실제 SQL alias 그대로 사용해야 함!
            String name = String.valueOf(row.get("STOCK_NAME"));

            double positive = 0;
            if (row.get("POSITIVERATIO") != null) {
                positive = Double.parseDouble(row.get("POSITIVERATIO").toString());
            }

            double negative = 0;
            if (row.get("NEGATIVERATIO") != null) {
                negative = Double.parseDouble(row.get("NEGATIVERATIO").toString());
            }

            if (positive > bestPositiveValue) {
                bestPositiveValue = positive;
                bestPositiveName = name;
            }

            if (negative > bestNegativeValue) {
                bestNegativeValue = negative;
                bestNegativeName = name;
            }
        }

        return List.of(
                "이번 기간 가장 긍정적인 종목은 " + bestPositiveName + "입니다.",
                "부정 증가 종목은 " + bestNegativeName + "입니다."
        );
    }
    
}
