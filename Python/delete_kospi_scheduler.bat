@echo off
chcp 65001 >nul

echo ============================================
echo   KOSPI 크롤러 스케줄러 삭제 시작
echo ============================================

schtasks /Delete /TN "KStockInfoCrawler" /F

if %ERRORLEVEL% EQU 0 (
    echo ✓ 스케줄러 삭제 완료!
) else (
    echo ✗ 스케줄러 삭제 실패 또는 존재하지 않음.
)

echo.
echo 작업 스케줄러 목록에서 확인 가능합니다.
echo.
pause
