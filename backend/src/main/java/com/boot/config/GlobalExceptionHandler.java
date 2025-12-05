package com.boot.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * @Valid, @Validated 검증 실패 시 발생하는 예외 처리
     * (주로 @RequestBody DTO에 대한 검증)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors()
          .forEach(error -> {
              String field = error.getField();              // 예: "email"
              String message = error.getDefaultMessage();  // 예: "이메일 형식이 유효하지 않습니다."
              errors.put(field, message);
          });

        // 400 Bad Request + { "email": "...", "password": "..." }
        return ResponseEntity.badRequest().body(errors);
    }
}
