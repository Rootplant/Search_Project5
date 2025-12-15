@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM 뉴스 크롤러 스케줄러 등록 스크립트 (강화 버전)
REM ============================================================

set PYTHON_PATH=C:\Users\KH\AppData\Local\Programs\Python\Python313\python.exe
set WORK_DIR=C:\temp6\Search_Project-main\Python
set CRAWLER_SCRIPT=news_crawler.py
set SENTIMENT_SCRIPT=news_sentiment_main.py

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] 관리자 권한이 필요합니다!
    echo.
    echo 해결 방법:
    echo 1. 이 파일을 마우스 오른쪽 버튼으로 클릭
    echo 2. "관리자 권한으로 실행" 선택
    echo.
    pause
    exit /b 1
)

echo ============================================================
echo 뉴스 크롤러 스케줄러 등록 시작 (1시간마다 실행)
echo ============================================================
echo.

REM ============================================================
REM 기존 스케줄러 삭제 (강화 버전)
REM ============================================================
echo [0] 기존 스케줄러 삭제 중...
echo.

REM 첫 번째 스케줄러 삭제
echo   - KStockNewsCrawler 삭제 중...
schtasks /Query /TN "KStockNewsCrawler" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo     실행 중인 작업 중지 중...
    schtasks /End /TN "KStockNewsCrawler" /F >nul 2>&1
    taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_crawler.py*" >nul 2>&1
    timeout /t 3 /nobreak >nul
    schtasks /Delete /TN "KStockNewsCrawler" /F >nul 2>&1
    echo     삭제 완료
) else (
    echo     스케줄러 없음 (스킵)
)

REM 두 번째 스케줄러 삭제
echo   - KStockSentimentAnalyzer 삭제 중...
schtasks /Query /TN "KStockSentimentAnalyzer" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo     실행 중인 작업 중지 중...
    schtasks /End /TN "KStockSentimentAnalyzer" /F >nul 2>&1
    taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_sentiment_main.py*" >nul 2>&1
    timeout /t 3 /nobreak >nul
    schtasks /Delete /TN "KStockSentimentAnalyzer" /F >nul 2>&1
    echo     삭제 완료
) else (
    echo     스케줄러 없음 (스킵)
)

timeout /t 2 /nobreak >nul
echo.

REM ============================================================
REM 새 스케줄러 등록
REM ============================================================
echo [1] 뉴스 크롤링 스케줄러 등록 중... (스케줄러 모드: --scheduler)
echo     실행 주기: 매시 정각 (00:00, 01:00, 02:00, ...)
echo     작업 경로: %WORK_DIR%\%CRAWLER_SCRIPT%
schtasks /Create /TN "KStockNewsCrawler" /TR "\"%PYTHON_PATH%\" \"%WORK_DIR%\%CRAWLER_SCRIPT%\" --scheduler" /SC HOURLY /MO 1 /ST 00:00 /RL HIGHEST /F /IT

if %ERRORLEVEL% EQU 0 (
    echo     ✓ 뉴스 크롤링 스케줄러 등록 완료!
) else (
    echo     ✗ 뉴스 크롤링 스케줄러 등록 실패
    echo     관리자 권한으로 실행했는지 확인하세요.
)

echo.
echo [2] 감성 분석 스케줄러 등록 중...
echo     실행 주기: 매시 5분 (00:05, 01:05, 02:05, ...)
echo     작업 경로: %WORK_DIR%\%SENTIMENT_SCRIPT%
schtasks /Create /TN "KStockSentimentAnalyzer" /TR "\"%PYTHON_PATH%\" \"%WORK_DIR%\%SENTIMENT_SCRIPT%\"" /SC HOURLY /MO 1 /ST 00:05 /RL HIGHEST /F /IT

if %ERRORLEVEL% EQU 0 (
    echo     ✓ 감성 분석 스케줄러 등록 완료!
) else (
    echo     ✗ 감성 분석 스케줄러 등록 실패
    echo     관리자 권한으로 실행했는지 확인하세요.
)

echo.
echo ============================================================
echo 스케줄러 등록 완료!
echo ============================================================
echo.

REM 등록 확인
echo 등록된 작업 확인:
echo.
schtasks /Query /TN "KStockNewsCrawler" /FO LIST /V 2>nul
if %errorLevel% neq 0 (
    echo [경고] KStockNewsCrawler 등록 확인 실패
)
echo.
schtasks /Query /TN "KStockSentimentAnalyzer" /FO LIST /V 2>nul
if %errorLevel% neq 0 (
    echo [경고] KStockSentimentAnalyzer 등록 확인 실패
)

echo.
echo ============================================================
echo 스케줄러 실행 정보
echo ============================================================
echo.
echo 뉴스 크롤러: 매시 정각 실행 (00:00, 01:00, 02:00, ...)
echo 감성 분석기: 매시 5분 실행 (00:05, 01:05, 02:05, ...)
echo 실행 주기: 정확히 1시간마다 (실시간 실행 방지)
echo 스케줄러 모드: 새로운 뉴스만 추가 (100개 목표 없음)
echo 실행 계정: 현재 로그인 사용자 (네트워크 접근 가능)
echo 재부팅 후: 사용자가 로그인한 상태에서만 실행됩니다.
echo.
echo 주의: 수동으로 크롤러를 실행하면 스케줄러와 관계없이 실행됩니다.
echo    스케줄러만 사용하려면 수동 실행을 하지 마세요.
echo.
echo 스케줄러 삭제: delete_news_scheduler.bat 실행
echo.
pause
