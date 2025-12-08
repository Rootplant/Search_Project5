package com.boot.controller;

import com.boot.dto.IndexDataDTO;
import com.boot.service.IndexReadService;
import com.boot.service.IndexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chart")
@CrossOrigin(origins = "http://localhost:5173")
public class IndexController {

    @Autowired
    private IndexReadService IndexReadService;
    
    @Autowired
    private IndexService indexService;

    @GetMapping("/kospi-history")
    public ResponseEntity<List<IndexDataDTO>> getKospiHistory() {
        return ResponseEntity.ok(IndexReadService.getKospiTimeSeriesData());
    }

    @GetMapping("/kosdaq-history")
    public ResponseEntity<List<IndexDataDTO>> getKosdaqHistory() {
        return ResponseEntity.ok(IndexReadService.getKosdaqTimeSeriesData());
    }
    

    @GetMapping("/latest")
    public Map<String, Object> getLatestIndex() {
        return indexService.getLatestIndexData();
    }
}
