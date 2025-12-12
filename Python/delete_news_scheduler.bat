@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 뉴스 크롤러 스케줄러 강제 삭제 스크립트

REM ============================================================
REM 뉴스 크롤러 스케줄러 강제 삭제 스크립트 (최강 버전)
REM ============================================================

echo.
echo ============================================================
echo 뉴스 크롤러 스케줄러 강제 삭제 스크립트
echo ============================================================
echo.

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

echo [확인] 관리자 권한 확인됨
echo.

REM 작업 이름
set TASK1=KStockNewsCrawler
set TASK2=KStockSentimentAnalyzer

REM ============================================================
REM 모든 Python 프로세스 강제 종료 (1단계)
REM ============================================================
echo [0] 모든 Python 프로세스 강제 종료 중...
echo.

REM news_crawler 관련 프로세스 종료
taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_crawler*" >nul 2>&1
taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_sentiment*" >nul 2>&1

REM 모든 Python 프로세스 종료 (더 강력하게)
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr /V "INFO:"') do (
    set PID=%%a
    set PID=!PID:"=!
    if not "!PID!"=="" (
        echo   - Python 프로세스 종료: PID !PID!
        taskkill /F /PID !PID! >nul 2>&1
    )
)

timeout /t 3 /nobreak >nul
echo.

REM ============================================================
REM 첫 번째 스케줄러 강제 삭제 (KStockNewsCrawler)
REM ============================================================
echo [1] %TASK1% 강제 삭제 중...
echo.

schtasks /Query /TN "%TASK1%" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo   - 스케줄러 발견됨
    
    REM 작업 비활성화 (실행 방지)
    echo   - 작업 비활성화 중...
    schtasks /Change /TN "%TASK1%" /DISABLE >nul 2>&1
    
    REM 작업 상태 확인 및 중지
    echo   - 실행 중인 작업 강제 중지 중...
    schtasks /End /TN "%TASK1%" /F >nul 2>&1
    
    REM PowerShell을 사용한 강제 삭제 시도
    echo   - PowerShell로 강제 삭제 시도 중...
    powershell -Command "Unregister-ScheduledTask -TaskName '%TASK1%' -Confirm:$false -ErrorAction SilentlyContinue" >nul 2>&1
    
    timeout /t 2 /nobreak >nul
    
    REM Python 프로세스 다시 종료
    taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_crawler*" >nul 2>&1
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr /V "INFO:"') do (
        set PID=%%a
        set PID=!PID:"=!
        if not "!PID!"=="" taskkill /F /PID !PID! >nul 2>&1
    )
    
    timeout /t 5 /nobreak >nul
    
    REM 삭제 시도 (최대 10번)
    echo   - 스케줄러 삭제 시도 중...
    set DEL_SUCCESS=0
    for /L %%i in (1,1,10) do (
        if !DEL_SUCCESS! equ 0 (
            schtasks /Delete /TN "%TASK1%" /F >nul 2>&1
            if !errorLevel! equ 0 (
                set DEL_SUCCESS=1
                echo   - 삭제 성공! (시도 횟수: %%i/10)
            ) else (
                echo   - 삭제 시도 %%i/10 실패, 재시도 중...
                
                REM PowerShell 재시도
                powershell -Command "Unregister-ScheduledTask -TaskName '%TASK1%' -Confirm:$false -ErrorAction SilentlyContinue" >nul 2>&1
                
                REM 프로세스 재종료
                taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_crawler*" >nul 2>&1
                
                timeout /t 5 /nobreak >nul
            )
        )
    )
    
    if !DEL_SUCCESS! equ 0 (
        echo   [경고] 삭제 실패 (10번 시도 후 실패)
        echo   - 수동 삭제 필요:
        echo     1. 작업 스케줄러 열기 (Win+R → taskschd.msc)
        echo     2. "%TASK1%" 찾기
        echo     3. 마우스 오른쪽 버튼 → 삭제
        echo   - 또는 PowerShell에서:
        echo     Unregister-ScheduledTask -TaskName "%TASK1%" -Confirm:$false
    )
) else (
    echo   - 스케줄러 없음 (이미 삭제됨)
)

echo.

REM ============================================================
REM 두 번째 스케줄러 강제 삭제 (KStockSentimentAnalyzer)
REM ============================================================
echo [2] %TASK2% 강제 삭제 중...
echo.

schtasks /Query /TN "%TASK2%" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo   - 스케줄러 발견됨
    
    REM 작업 비활성화 (실행 방지)
    echo   - 작업 비활성화 중...
    schtasks /Change /TN "%TASK2%" /DISABLE >nul 2>&1
    
    REM 작업 상태 확인 및 중지
    echo   - 실행 중인 작업 강제 중지 중...
    schtasks /End /TN "%TASK2%" /F >nul 2>&1
    
    REM PowerShell을 사용한 강제 삭제 시도
    echo   - PowerShell로 강제 삭제 시도 중...
    powershell -Command "Unregister-ScheduledTask -TaskName '%TASK2%' -Confirm:$false -ErrorAction SilentlyContinue" >nul 2>&1
    
    timeout /t 2 /nobreak >nul
    
    REM Python 프로세스 다시 종료
    taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_sentiment*" >nul 2>&1
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr /V "INFO:"') do (
        set PID=%%a
        set PID=!PID:"=!
        if not "!PID!"=="" taskkill /F /PID !PID! >nul 2>&1
    )
    
    timeout /t 5 /nobreak >nul
    
    REM 삭제 시도 (최대 10번)
    echo   - 스케줄러 삭제 시도 중...
    set DEL_SUCCESS=0
    for /L %%i in (1,1,10) do (
        if !DEL_SUCCESS! equ 0 (
            schtasks /Delete /TN "%TASK2%" /F >nul 2>&1
            if !errorLevel! equ 0 (
                set DEL_SUCCESS=1
                echo   - 삭제 성공! (시도 횟수: %%i/10)
            ) else (
                echo   - 삭제 시도 %%i/10 실패, 재시도 중...
                
                REM PowerShell 재시도
                powershell -Command "Unregister-ScheduledTask -TaskName '%TASK2%' -Confirm:$false -ErrorAction SilentlyContinue" >nul 2>&1
                
                REM 프로세스 재종료
                taskkill /F /IM python.exe /FI "COMMANDLINE eq *news_sentiment*" >nul 2>&1
                
                timeout /t 5 /nobreak >nul
            )
        )
    )
    
    if !DEL_SUCCESS! equ 0 (
        echo   [경고] 삭제 실패 (10번 시도 후 실패)
        echo   - 수동 삭제 필요:
        echo     1. 작업 스케줄러 열기 (Win+R → taskschd.msc)
        echo     2. "%TASK2%" 찾기
        echo     3. 마우스 오른쪽 버튼 → 삭제
        echo   - 또는 PowerShell에서:
        echo     Unregister-ScheduledTask -TaskName "%TASK2%" -Confirm:$false
    )
) else (
    echo   - 스케줄러 없음 (이미 삭제됨)
)

echo.

REM ============================================================
REM 최종 확인 및 정리
REM ============================================================
echo ============================================================
echo 최종 확인
echo ============================================================
echo.

set ALL_DEL=1

schtasks /Query /TN "%TASK1%" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo   [경고] %TASK1%: 아직 존재함
    set ALL_DEL=0
) else (
    echo   [성공] %TASK1%: 삭제 완료
)

schtasks /Query /TN "%TASK2%" /FO LIST >nul 2>&1
if %errorLevel% equ 0 (
    echo   [경고] %TASK2%: 아직 존재함
    set ALL_DEL=0
) else (
    echo   [성공] %TASK2%: 삭제 완료
)

echo.
echo ============================================================
if !ALL_DEL! equ 1 (
    echo 스케줄러 삭제 완료!
    echo.
    echo 모든 스케줄러가 성공적으로 삭제되었습니다.
) else (
    echo 일부 스케줄러가 아직 존재합니다.
    echo.
    echo ============================================================
    echo 수동 삭제 방법 (GUI)
    echo ============================================================
    echo 1. Win+R 키 누르기
    echo 2. taskschd.msc 입력 후 Enter
    echo 3. 작업 스케줄러 라이브러리 열기
    echo 4. "%TASK1%" 또는 "%TASK2%" 찾기
    echo 5. 마우스 오른쪽 버튼 클릭 → 삭제
    echo.
    echo ============================================================
    echo 수동 삭제 방법 (PowerShell - 관리자 권한)
    echo ============================================================
    echo PowerShell을 관리자 권한으로 실행 후:
    echo.
    echo Unregister-ScheduledTask -TaskName "%TASK1%" -Confirm:$false
    echo Unregister-ScheduledTask -TaskName "%TASK2%" -Confirm:$false
    echo.
    echo ============================================================
    echo 수동 삭제 방법 (명령 프롬프트 - 관리자 권한)
    echo ============================================================
    echo 명령 프롬프트를 관리자 권한으로 실행 후:
    echo.
    echo schtasks /Delete /TN "%TASK1%" /F
    echo schtasks /Delete /TN "%TASK2%" /F
)
echo ============================================================
echo.
pause
