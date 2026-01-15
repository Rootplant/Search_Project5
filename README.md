필요시 README 코드 사용가능합니다.
<div align="center">

# 📊 코스피 검색엔진
### Spring Boot · React · Oracle 기반 주식·뉴스 분석 플랫폼

<br>

<img src="https://img.shields.io/badge/Java-17-007396?logo=java">
<img src="https://img.shields.io/badge/SpringBoot-2.7-6DB33F?logo=springboot">
<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react">
<img src="https://img.shields.io/badge/Oracle-F80000?logo=oracle">
<img src="https://img.shields.io/badge/MyBatis-000000">

<br>

<img src="https://img.shields.io/badge/JWT-000000">
<img src="https://img.shields.io/badge/OAuth2-Google%20%7C%20Kakao%20%7C%20Naver-4285F4">
<img src="https://img.shields.io/badge/AWS%20EC2-Ubuntu-FF9900">
<img src="https://img.shields.io/badge/Gradle-02303A?logo=gradle&logoColor=white">
<img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white">

<br><br>
</div>

---

## 📖 프로젝트 개요

**코스피 검색엔진**은 
주식 종목 정보와 뉴스 데이터를 수집·분석하여  
**시장 흐름, 종목 이슈, 뉴스 감성 및 키워드 트렌드를 종합적으로 제공하는**  
웹 기반 주식·뉴스 분석 플랫폼입니다.

뉴스 크롤링을 통한 데이터 수집부터  
감성 분석, 키워드 트렌드 분석, 검색 엔진, 관리자 운영 기능까지  
**데이터 수집 → 분석 → 시각화 → 운영 관리** 흐름을 중심으로 설계되었습니다.

- 개발 기간 : 1차: `2025.12.02 ~ 2025.12.09`, 2차: `2025.12.09 ~ 2025.12.16`
- 개발 인원 : `5명` 
- 개발 환경 : Spring Boot + React 분리 구조
- 배포 URL : http://3.236.44.225/
---

### 👨‍💻 담당 역할

| 역할/영역 | 담당 내용 |
|---|---|
| 🎨 프론트엔드 개발 | **React 기반 전체 UI 구조 설계**, 페이지 라우팅, 공용 컴포넌트 설계 |
| 📊 지수 그래프 시각화 | **코스피/종목 지수 그래프 구현**, 시계열 데이터 시각화 |
| ⚡ 실시간 차트 | **상세 페이지 실시간 주가 차트 구현** (WebSocket 기반) |
| 📡 실시간 데이터 처리 | **종목 주가 실시간 수신·반영 로직 구현** (WebSocket 구독/해제 관리) |
| 🚀 성능 최적화 | **Redis 캐싱 적용**, 빈번한 지수·종목 데이터 조회 성능 개선 |
| 🔄 상태 관리 | 실시간 데이터와 UI 상태 동기화, 재렌더링 최소화 |
| 🧩 API 연동 | REST API + WebSocket 병행 구조 설계 및 프론트 연동 |

  
---

### ✨ 주요 특징 
  - 🧩 **Spring Boot · React 분리형 아키텍처**  
    → 백엔드(Spring Boot)와 프론트엔드(React)를 분리한 구조  
    → REST API + WebSocket 기반 통신으로 독립적인 개발·배포 및 확장성 확보

  - 🔐 **JWT 기반 인증 시스템**  
    → Access / Refresh Token 분리, 재발급 및 만료 정책 적용으로 안정적인 인증 흐름 제공
  
  - 🔗 **소셜 로그인 통합 (Kakao · Naver · Google)**  
    → OAuth2 로그인 지원 및 사용자 계정 관리 정책(신규 가입/연동) 적용
  
  - 🛡 **계정 보안 통제 기능**  
    → 로그인 실패 누적, 계정 잠금/정지, 권한(ADMIN/USER) 기반 접근 제어
  
  - 🛠 **관리자 페이지 구축**  
    → 회원 상태/권한 관리, 토큰 관리, 운영 기능 등 서비스 관리 기능 제공
  
  - 📊 **로그 & 보안 이벤트 모니터링**  
    → 로그인 로그/관리자 작업 로그(Admin Log) 기록 및 조회  
    → 필터/상세(IP·로그인 방식 등)/CSV 다운로드로 운영 추적 가능
    
  - 📈 **주식 데이터 검색 및 상세 정보 제공**  
    → 종목 검색, 상세 페이지, 관련 정보 조회 등 핵심 서비스 기능 제공
    
  - 📡 **WebSocket 기반 실시간 주가 시세 제공**  
    → WebSocket을 통해 실제 주가 시세를 실시간으로 수신  
    → 종목 상세 페이지에서 가격 변동을 즉시 차트에 반영

  - 📊 **실시간 차트 및 시계열 데이터 시각화**  
    → 지수 및 종목 데이터를 기반으로 한 차트 시각화  
    → 실시간 데이터와 UI의 자연스러운 동기화
    
  - 📰 **주식 관련 뉴스 제공 및 분석 기능**  
    → 종목별 뉴스 수집/노출, 감성 분석(긍정/부정/중립) 및 요약 정보 제공
    
  - ⚡ **Redis + 스케줄러 기반 성능 최적화**  
    → Redis 캐싱, 스케줄링 기반 데이터 갱신으로 반복 조회 및 DB 부하 감소
  
  - 📡 **Python 기반 데이터 수집 파이프라인 연계**  
    → 뉴스/데이터 크롤링 → DB 적재 → Spring Boot 서비스 조회 흐름 구성
    
  - 🚀 **AWS EC2 기반 서버 배포**  
    → Ubuntu 서버 환경에서 서비스 배포 및 운영 구성

---

## 🛠 기술 스택

| 분야 | 기술 |
|------|------|
| **Frontend** | <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"> |
| **Backend** | <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/Java-007396?style=flat-square&logo=java&logoColor=white"> <img src="https://img.shields.io/badge/Lombok-ED1C24?style=flat-square"> <img src="https://img.shields.io/badge/MyBatis-000000?style=flat-square"> |
| **Database** | <img src="https://img.shields.io/badge/Oracle%20Database-F80000?style=flat-square&logo=oracle&logoColor=white"> |
| **Security** | <img src="https://img.shields.io/badge/JWT%20(Access%20%2F%20Refresh%20Token)-000000?style=flat-square"> <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white"> |
| **Data / Crawling** | <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"> <img src="https://img.shields.io/badge/Requests-000000?style=flat-square"> <img src="https://img.shields.io/badge/BeautifulSoup-4B8BBE?style=flat-square"> |
| **Cache / Scheduler** | <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Scheduler-6DB33F?style=flat-square&logo=spring&logoColor=white"> |
| **Infra / Server** | <img src="https://img.shields.io/badge/AWS%20EC2%20(Ubuntu)-FF9900?style=flat-square&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/Apache%20Tomcat-F8DC75?style=flat-square&logo=apachetomcat&logoColor=black"> |
| **Build Tool** | <img src="https://img.shields.io/badge/Gradle-02303A?style=flat-square&logo=gradle&logoColor=white"> |
| **Tools** | <img src="https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white"> <img src="https://img.shields.io/badge/STS-6DB33F?style=flat-square&logo=spring&logoColor=white"> <img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white"> <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/SourceTree-0052CC?style=flat-square&logo=sourcetree&logoColor=white"> |


---
---

## 🔍 기술적 고민 & 해결

### ⚡ 실시간 주가 데이터 처리 구조 설계

- 종목 기본 정보(종목명, 코드, 전날 종가 등)는 **DB 기반 REST API**로 초기 로딩
- 이후 가격 변동 데이터는 **WebSocket을 통해 실시간 수신**하도록 역할 분리
- 실시간 시세는 초 단위로 변동되므로  
  **차트 갱신 과정에서는 DB 조회를 완전히 배제한 구조로 설계**
- 이를 통해 실시간 트래픽 환경에서도  
  DB 부하 없이 안정적인 실시간 주가 반영 구현

---

### 📊 실시간 차트 렌더링 성능 최적화

- 실시간 시세 수신으로 인한 **잦은 재렌더링 문제 발생**
- 차트 상태와 기타 UI 상태를 분리하여 관리
- WebSocket 수신 데이터 중 **차트 갱신에 필요한 값만 선별적으로 상태 업데이트**
- 불필요한 전체 렌더링을 제거하여  
  **렌더링 횟수 감소 및 사용자 체감 성능 개선**

---

### 🔗 다중 종목 WebSocket 연결 관리

- 여러 종목 상세 페이지 이동 시  
  WebSocket 연결이 중복 유지되는 문제 발생
- **종목 코드 기준 구독 / 해제 로직 명확화**
- 페이지 진입 시 구독, 이탈 시 즉시 해제 처리
- 불필요한 연결 유지 방지로  
  **실시간 데이터 수신 안정성 및 리소스 효율성 확보**

---

### 📈 지수 데이터 조회 구조 및 DB 부하 최소화

- 지수 데이터는 외부 API 제공 데이터로  
  **초기 실행 시에만 DB에 저장**
- 이후 API에서 신규 데이터가 제공되지 않는 경우  
  **Redis 캐싱 데이터를 활용하여 빠른 차트 렌더링 구현**
- 신규 데이터 발생 시  
  예: 기존 100건 → 101건으로 증가한 경우  
  **전체 재적재가 아닌 신규 데이터(101번째)만 DB에 삽입**
- 이를 통해 불필요한 DB I/O를 제거하고  
  **지수 데이터 조회 시 과부하 최소화**

---

### 🧩 데이터 성격에 따른 처리 전략 분리

- **종목 기본 정보** : DB 조회 (정합성 중심)
- **실시간 주가 시세** : WebSocket 기반 처리 (초 단위 실시간성)
- **지수 데이터** :
  - 초기 DB 저장 후 Redis 캐싱 중심 조회
  - 신규 데이터 발생 시에만 DB 연동

👉 데이터 특성에 따라  
**DB / Redis / WebSocket의 역할을 명확히 분리한 구조로 설계**


## 🧩 기능 구성 (클릭해서 보기)

<details>
<summary><strong>📈 사용자 기능</strong></summary>

- 종목 검색 및 상세 조회  
- 종목 현재가, 등락률, 시가총액 정보 제공  
- 종목별 뉴스 조회  
- 뉴스 감성 분석 결과 확인  
- 키워드 기반 뉴스 요약 및 트렌드 분석  
- 시장 및 종목 차트 시각화  

</details>

<details>
<summary><strong>📰 데이터 수집 및 분석 기능</strong></summary>

- 주식 관련 뉴스 자동 수집(크롤링)  
- 뉴스 중복 제거 및 원문(CLOB) 저장  
- 뉴스–종목 자동 매칭  
- 배치/스케줄 기반 데이터 수집 구조  

</details>

<details>
<summary><strong>🧠 분석 및 인사이트 제공</strong></summary>

- 뉴스 본문 기반 감성 분석 (긍정 / 보통 / 부정)  
- 종목별 감성 비율 집계  
- 시장 전체 감성 흐름 요약  
- 키워드 빈도 기반 트렌드 분석  

</details>

<details>
<summary><strong>🔍 검색 엔진</strong></summary>

- 종목명 / 종목코드 검색  
- 뉴스 제목·키워드 검색  
- 종목·뉴스 통합 검색 결과 제공  

</details>

<details>
<summary><strong>🔐 회원 / 인증 기능</strong></summary>

- 회원가입 / 로그인 / 로그아웃  
- JWT 기반 인증 (Access / Refresh Token 분리)  
- 소셜 로그인 (Google / Kakao / Naver)  
- 비밀번호 찾기 및 재설정(이메일 인증)  
- 로그인 실패 횟수 제한 및 계정 잠금 처리  

</details>

<details>
<summary><strong>🛠 관리자 기능</strong></summary>

- **관리자 대시보드**
  - 사용자 수, 로그인 현황, 뉴스 수집 상태 모니터링
- **회원 관리**
  - 계정 정지 / 해제
  - 권한 변경(USER / ADMIN)
- **토큰 관리**
  - Refresh Token 강제 만료
- **로그 관리**
  - 로그인 로그
  - 관리자 작업 로그(Admin Log)

</details>

<details>
<summary><strong>🔍 로그 & 보안</strong></summary>

- 로그인 성공 / 실패 / 잠금 로그 기록  
- 관리자 모든 행위 로그 기록  
- IP / User-Agent 기반 접속 정보 저장  
- 운영·보안 감사 목적 로그 구조 설계  

</details>

---

## 🧭 메뉴 구조도 (PDF)

📄 메뉴 구조도 다운로드  
👉 [menu structure.pdf](https://github.com/user-attachments/files/24228651/menu.structure.pdf)

---

## 🖥 화면 설계서 (PDF)

📄 화면 설계서 보기  
👉 [ui-design.pdf](https://github.com/user-attachments/files/24228667/ui-design.pdf)

---

## 🗂 ERD 및 테이블 명세서

📄 ERD  
<details> <summary><strong>ERD 다이어그램</strong></summary>

<img width="1322" height="988" alt="image" src="https://github.com/user-attachments/assets/e0c61011-41fa-411f-88bb-625aa8cf5cdd" />

</details>

📄 테이블 명세서  
👉 [table-definition.xls](https://github.com/user-attachments/files/24228696/table-definition.xls)

---

## 🔍 담당 기능

🎨 프론트엔드 (React)
<details>
<summary><strong>메인 화면 및 UI 구성</strong></summary>

📌 설명  

React 기반으로 전체 서비스 UI를 구현했습니다.  
메인 페이지, 검색 결과, 종목 상세 페이지 등  
사용자 흐름에 맞춘 화면 구조를 설계했습니다.

- 공용 컴포넌트(Header, Layout, Chart 영역 등) 분리
- React Router 기반 페이지 라우팅 구성
- API 연동 결과에 따른 동적 UI 렌더링
- 사용자 인터랙션 중심의 화면 설계

</details>



📊 지수 그래프 시각화
<details>
<summary><strong>코스피 및 시장 지수 시각화</strong></summary>

📌 설명  

코스피 및 주요 시장 지수 데이터를 기반으로  
시간 흐름에 따른 **지수 변화 그래프**를 시각화했습니다.

- 일/분 단위 시계열 데이터 처리
- 차트 데이터 가공 및 렌더링 로직 구현
- 사용자 관점에서 직관적인 지수 흐름 확인 가능

</details>



⚡ 종목 상세 페이지 실시간 차트
<details>
<summary><strong>상세 페이지 실시간 주가 차트</strong></summary>

📌 설명  

종목 상세 페이지에서  
**실시간 주가 변동을 차트로 즉시 반영**하도록 구현했습니다.

- WebSocket을 통한 실시간 주가 데이터 수신
- 기존 차트 데이터에 실시간 데이터 누적
- 페이지 이동 시 WebSocket 구독/해제 처리
- 불필요한 연결 유지 방지 및 안정성 확보

</details>



📡 종목 주가 실시간 데이터 처리 (WebSocket)
<details>
<summary><strong>WebSocket 기반 실시간 시세 처리</strong></summary>

📌 설명  

서버와 WebSocket 연결을 통해  
종목별 실시간 주가 데이터를 수신하고 UI에 반영했습니다.

- 종목 코드 기준 실시간 구독 관리
- 다중 종목 처리 시 성능 고려
- 연결 종료 및 재연결 상황 대응
- REST API + WebSocket 병행 구조 설계

</details>



⚡ Redis 캐싱 처리
<details>
<summary><strong>Redis 기반 지수·종목 데이터 캐싱</strong></summary>

📌 설명  

빈번하게 조회되는 지수 및 종목 데이터를  
Redis에 캐싱하여 성능을 최적화했습니다.

- 실시간성이 상대적으로 낮은 데이터 캐싱
- DB 조회 횟수 감소
- 초기 페이지 로딩 속도 개선
- 스케줄러 기반 데이터 갱신 구조와 연계

이를 통해 다수 사용자가 동시에 접근하더라도  
안정적인 조회 성능을 유지할 수 있도록 했습니다.

</details>



📈 차트 상태 관리 및 성능 최적화
<details>
<summary><strong>실시간 데이터 상태 관리</strong></summary>

📌 설명  

실시간 데이터와 React 상태를 효율적으로 관리하여  
불필요한 재렌더링을 최소화했습니다.

- 차트 데이터 상태 분리 관리
- 실시간 데이터 수신 시 필요한 부분만 업데이트
- 사용자 경험을 해치지 않는 실시간 UI 반영

</details>


---

## 📬 프로젝트 구조

```plaintext
📦 k-stock-insight
├─ FRONTEND/                              # Vite + React
│  ├─ node_modules/
│  ├─ public/
│  │  └─ vite.svg
│  ├─ src/
│  │  ├─ admin/                           # 관리자 화면/컴포넌트
│  │  ├─ api/                             # API 호출 모듈(axios 등)
│  │  ├─ assets/                          # 이미지/아이콘 등 정적 리소스
│  │  ├─ components/                      # 공용 컴포넌트
│  │  ├─ context/                         # 전역 상태/인증 컨텍스트
│  │  ├─ layouts/                         # 레이아웃(헤더/사이드바 등)
│  │  ├─ pages/                           # 페이지 단위 컴포넌트
│  │  ├─ routes/                          # 라우팅 설정
│  │  ├─ styles/                          # 스타일(CSS)
│  │  ├─ AboutPage.jsx
│  │  ├─ App.jsx
│  │  ├─ App.css
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ .env
│  ├─ .gitignore
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ README.md
│  └─ vite.config.js
│
├─ BACKEND/                               # Spring Boot + Gradle
│  ├─ src/
│  │  ├─ main/
│  │  │  ├─ java/
│  │  │  │  ├─ com.boot/                  # (루트 패키지)
│  │  │  │  ├─ com.boot.cache/
│  │  │  │  ├─ com.boot.config/
│  │  │  │  ├─ com.boot.controller/
│  │  │  │  ├─ com.boot.dao/
│  │  │  │  ├─ com.boot.dto/
│  │  │  │  ├─ com.boot.scheduler/
│  │  │  │  ├─ com.boot.security/
│  │  │  │  └─ com.boot.service/
│  │  │  └─ resources/                    # application.properties, mybatis mapper 등
│  │  └─ test/
│  │     └─ java/
│  ├─ bin/
│  ├─ gradle/
│  ├─ build.gradle
│  ├─ settings.gradle
│  ├─ gradlew
│  └─ gradlew.bat

```

---

## 🚀 시연 영상 & 데모

아래 영상은 코스피 검색엔진의 주요 기능을 실제 화면과 함께 보여줍니다. 
각 기능별 동작 방식과 흐름을 직관적으로 확인할 수 있습니다.

### 📌 전체 시연 영상
🔗 YouTube 링크: https://youtu.be/5spm6NijYE4 (사용자)<br>
🔗 YouTube 링크: https://youtu.be/cdFkztkbYDM (관리자)


---
