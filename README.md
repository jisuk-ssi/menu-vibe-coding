# Tableau Menu Studio

Spring Boot REST API와 React를 연결한 메뉴 관리 서비스입니다. 메뉴 목록을 검색하고 상세 정보를 확인하며, 메뉴 등록·수정·삭제까지 한 화면 흐름 안에서 처리할 수 있습니다.

## 주요 기능

- 메뉴 목록 조회 및 페이지 이동
- 메뉴 이름, 하위 카테고리, 기준 가격으로 검색
- 메뉴 상세 정보와 주문 가능 상태 확인
- 메뉴 등록, 수정, 삭제
- Light / Dark 테마 전환 및 브라우저 저장
- 로딩, 빈 결과, API 오류 상태 표시
- URL 쿼리스트링 기반 검색 조건 유지

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React 19, React Router 7, Axios, Vite 8 |
| Backend | Java 17, Spring Boot 4, Spring Data JPA, Gradle |
| Database | MySQL |
| API 문서 | OpenAPI, Swagger UI |
| Styling | CSS, JSON 기반 디자인 토큰 |

## 프로젝트 구조

```text
menu-test/
├─ menu-app/                         # React 프론트엔드
│  ├─ design/
│  │  └─ montage.tokens.json         # 색상, 타이포그래피, 간격 등의 원본 토큰
│  ├─ scripts/
│  │  └─ build-tokens.mjs            # 원본 토큰을 CSS 변수로 변환
│  ├─ src/
│  │  ├─ api/                        # Axios 인스턴스와 API 요청 함수
│  │  ├─ components/                 # 공통 레이아웃과 재사용 UI
│  │  ├─ pages/                      # URL에 대응하는 페이지 컴포넌트
│  │  ├─ App.jsx                     # 라우트 구성
│  │  ├─ main.jsx                    # 애플리케이션 진입점
│  │  └─ tokens.css                  # 스크립트로 생성되는 디자인 토큰 CSS
│  ├─ package.json
│  └─ vite.config.js
├─ chap06-spring-data-jpa/           # Spring Boot REST API 서버
│  ├─ sql/                           # DB 계정, 스키마, 초기 데이터 SQL
│  ├─ src/main/java/...              # Controller, Service, Repository, Entity
│  ├─ src/main/resources/
│  │  └─ application.yaml            # DB, JPA, 서버 설정
│  ├─ build.gradle
│  └─ gradlew / gradlew.bat
├─ mockup/
│  └─ index.html                     # 초기 UI 목업
├─ api-docs.json                     # REST API 명세
└─ AGENTS.md                         # 프로젝트 개발 규칙
```

## `menu-app` 구성

프론트엔드는 화면과 서버 통신의 책임을 분리합니다. 페이지와 컴포넌트는 Axios를 직접 사용하지 않고 `src/api`의 함수만 호출하며, API 모듈은 공통 응답의 `result`를 꺼내 화면에 전달합니다.

| 경로 | 역할 |
| --- | --- |
| `src/api/http.js` | `http://localhost:8080`을 사용하는 공통 Axios 인스턴스 |
| `src/api/menus.js` | 메뉴 조회, 검색, 등록, 수정, 삭제 요청 |
| `src/api/categories.js` | 카테고리 목록 요청 |
| `src/api/errors.js` | 서버 오류 응답을 화면용 Error 객체로 변환 |
| `src/components/AppLayout.jsx` | 헤더, 내비게이션, 푸터를 포함한 공통 레이아웃 |
| `src/components/MenuFilters.jsx` | 이름, 카테고리, 가격 검색 폼 |
| `src/components/MenuCard.jsx` | 메뉴 목록 카드 |
| `src/components/Pagination.jsx` | 페이지 이동 UI |
| `src/components/ThemeSwitch.jsx` | Light / Dark 테마 전환 |
| `src/pages/MenuListPage.jsx` | 메뉴 목록, 검색, 페이지네이션 |
| `src/pages/MenuDetailPage.jsx` | 메뉴 상세 조회와 삭제 확인 |
| `src/pages/MenuFormPage.jsx` | 메뉴 등록·수정 폼과 입력 검증 |

### 화면 경로

| 경로 | 화면 |
| --- | --- |
| `/` | `/menus?page=1`로 이동 |
| `/menus` | 메뉴 목록 |
| `/menus/new` | 메뉴 등록 |
| `/menus/:menuCode` | 메뉴 상세 |
| `/menus/:menuCode/edit` | 메뉴 수정 |

목록의 `keyword`, `category`, `price`, `page` 값은 URL 쿼리스트링에 저장됩니다. 따라서 새로고침하거나 상세 화면에서 목록으로 돌아와도 검색 조건을 이어갈 수 있습니다.

### 디자인 토큰

색상, 글자 스타일, 간격 등은 `menu-app/design/montage.tokens.json`에서 관리합니다. 토큰을 변경한 뒤 아래 명령으로 `src/tokens.css`를 다시 생성합니다.

```bash
cd menu-app
npm run tokens
```

`src/tokens.css`는 생성 파일이므로 직접 수정하지 않습니다.

## 실행 방법

### 1. 사전 준비

- Java 17
- MySQL
- Node.js와 npm

### 2. 데이터베이스 초기화

MySQL 관리자 계정으로 다음 SQL을 순서대로 실행합니다.

1. `chap06-spring-data-jpa/sql/00_01_CREATE_USER_DATABASE.sql`
2. `chap06-spring-data-jpa/sql/00_02_DB_SCRIPT.sql`

기본 연결 정보는 다음과 같습니다.

```text
Database: menudb
Username: ohgiraffers
Password: ohgiraffers
```

> `00_02_DB_SCRIPT.sql`은 기존 테이블을 삭제한 뒤 다시 생성하므로, 보존할 데이터가 있는 환경에서는 실행에 주의하세요.

### 3. API 서버 실행

Windows PowerShell:

```powershell
cd chap06-spring-data-jpa
.\gradlew.bat bootRun
```

macOS / Linux:

```bash
cd chap06-spring-data-jpa
./gradlew bootRun
```

서버는 `http://localhost:8080`에서 실행됩니다. 실행 후 Swagger UI는 `http://localhost:8080/swagger-ui.html`에서 확인할 수 있습니다.

### 4. 프론트엔드 실행

새 터미널에서 다음 명령을 실행합니다.

```bash
cd menu-app
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다. API 서버의 CORS 설정이 이 주소만 허용하므로 Vite가 다른 포트를 제안하면 기존 5173 포트 사용 프로세스를 종료한 뒤 다시 실행해야 합니다.

## 주요 API

프론트엔드가 사용하는 API의 기준 주소는 `http://localhost:8080`입니다.

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/menus/pages?page=1` | 페이지별 메뉴 목록 조회 |
| `GET` | `/api/menus` | 전체 메뉴 조회 |
| `GET` | `/api/menus/search?menuPrice=10000` | 기준 가격을 초과하는 메뉴 검색 |
| `GET` | `/api/menus/:menuCode` | 메뉴 상세 조회 |
| `POST` | `/api/menus` | 메뉴 등록 |
| `PUT` | `/api/menus/:menuCode` | 메뉴 수정 |
| `DELETE` | `/api/menus/:menuCode` | 메뉴 삭제 |
| `GET` | `/api/categories` | 카테고리 목록 조회 |

전체 명세는 루트의 [`api-docs.json`](./api-docs.json) 또는 실행 중인 Swagger UI에서 확인할 수 있습니다.

## 검사 및 빌드

```bash
cd menu-app
npm run lint
npm run build
```

프로덕션 빌드 결과는 `menu-app/dist`에 생성됩니다.
