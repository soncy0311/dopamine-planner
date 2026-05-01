# Todo List 서비스 기획서

> 작성일: 2026-05-01
> 상태: Draft

---

## 1. 서비스 개요

일상(Life)과 업무(Work)를 구분하여 관리할 수 있는 투두 리스트 서비스.
웹과 모바일(WebView) 환경에서 동일한 사용 경험을 제공한다.

---

## 2. 핵심 기능

### 2.1 워크스페이스 분리

투두 항목을 **두 가지 워크스페이스**로 구분하여 관리한다.

| 워크스페이스 | 설명 |
|---|---|
| **Life** | 개인 일상 투두 (운동, 장보기, 독서 등) |
| **Work** | 업무 투두 (프로젝트, 회의, 리뷰 등) |

- 사용자는 하단 탭 바를 통해 워크스페이스를 전환한다.
- 각 워크스페이스는 독립적인 분류 체계를 갖는다.

### 2.2 섹션 레이아웃

하나의 일자 뷰는 **두 개의 섹션**으로 구성된다.

```
┌─────────────────────────────┐
│  ✅ 완료된 작업 (상단)        │
│  ─────────────────────────  │
│  📋 진행 중 작업 (하단)       │
└─────────────────────────────┘
```

- **상단 섹션 — 완료(Done)**: 해당 일자에 완료 처리된 투두를 표시한다.
- **하단 섹션 — 진행 중(In Progress)**: 아직 완료되지 않은 투두를 표시한다.
- 투두를 완료하면 하단에서 상단으로 이동한다.
- 완료 취소 시 상단에서 하단으로 복귀한다.

### 2.3 일자별 관리 및 이월

투두는 **날짜 단위**로 관리된다.

- 기본 뷰는 **오늘 날짜**의 투두를 표시한다.
- 날짜를 좌우로 탐색하여 과거/미래 일자의 투두를 확인할 수 있다.
- **자동 이월**: 하루가 끝나는 시점(00:00)에 완료되지 않은 투두는 다음 날짜로 자동 이월된다.
  - 이월된 투두에는 원래 생성 일자가 표시된다.
  - 이월 횟수를 카운트하여 표시할 수 있다.

### 2.4 계층형 이슈 관리

투두는 **3단계 계층 구조**로 관리된다.

```
분류 (Category)
 └── Epic Issue
      └── Sub Issue (실제 투두 항목)
```

#### 2.4.1 분류 (Category)

- 워크스페이스 내에서 투두를 그룹핑하는 최상위 단위이다.
- 예시
  - Life: `건강`, `자기개발`, `생활`
  - Work: `프로젝트A`, `운영`, `미팅`

#### 2.4.2 Epic Issue

- 분류 아래에 속하는 큰 단위의 목표 또는 작업 묶음이다.
- 하위 Sub Issue의 진행률을 집계하여 표시한다.
- 예시: `3월 운동 루틴`, `로그인 기능 개발`

#### 2.4.3 Sub Issue

- 실제로 체크 가능한 **투두 항목**이다.
- 일자별 뷰에서 표시되는 최소 단위이다.
- 속성:
  - 제목 (필수)
  - 설명 (선택)
  - 우선순위: `High` / `Medium` / `Low`
  - 상태: `Todo` / `In Progress` / `Done`
  - 예상 날짜 (투두가 배치되는 날짜)
  - 완료 날짜
  - 이월 횟수

### 2.5 인증

소셜 로그인을 기본 인증 수단으로 제공한다.

| 제공자 | 설명 |
|---|---|
| **Google** | Google OAuth 2.0 |
| **Kakao** | Kakao OAuth 2.0 |

- 최초 로그인 시 계정이 자동 생성된다.
- 동일 이메일의 다른 소셜 계정은 연동 가능하다.
- 로그인 후 JWT 기반으로 세션을 유지한다.
- 토큰 갱신은 Refresh Token 방식을 사용한다.

---

## 3. 데이터 모델

### 3.1 ERD 개요

```
User
 ├── id (PK)
 ├── email
 ├── name
 ├── provider (google | kakao)
 ├── providerId
 ├── createdAt
 └── updatedAt

Workspace (enum: life | work)

Category
 ├── id (PK)
 ├── userId (FK → User)
 ├── workspace (life | work)
 ├── name
 ├── color
 ├── sortOrder
 ├── createdAt
 └── updatedAt

EpicIssue
 ├── id (PK)
 ├── categoryId (FK → Category)
 ├── title
 ├── description
 ├── status (active | completed | archived)
 ├── createdAt
 └── updatedAt

SubIssue
 ├── id (PK)
 ├── epicIssueId (FK → EpicIssue)
 ├── title
 ├── description
 ├── priority (high | medium | low)
 ├── status (todo | in_progress | done)
 ├── scheduledDate
 ├── completedDate
 ├── carryOverCount
 ├── createdAt
 └── updatedAt
```

### 3.2 관계 요약

- `User` 1 : N `Category`
- `Category` 1 : N `EpicIssue`
- `EpicIssue` 1 : N `SubIssue`

---

## 4. API 엔드포인트 (초안)

### 4.1 인증

| Method | Path | 설명 |
|---|---|---|
| GET | `/auth/google` | Google 로그인 리다이렉트 |
| GET | `/auth/google/callback` | Google 콜백 처리 |
| GET | `/auth/kakao` | Kakao 로그인 리다이렉트 |
| GET | `/auth/kakao/callback` | Kakao 콜백 처리 |
| POST | `/auth/refresh` | 토큰 갱신 |
| POST | `/auth/logout` | 로그아웃 |

### 4.2 Category

| Method | Path | 설명 |
|---|---|---|
| GET | `/categories?workspace=` | 분류 목록 조회 |
| POST | `/categories` | 분류 생성 |
| PATCH | `/categories/:id` | 분류 수정 |
| DELETE | `/categories/:id` | 분류 삭제 |

### 4.3 Epic Issue

| Method | Path | 설명 |
|---|---|---|
| GET | `/categories/:categoryId/epics` | Epic 목록 조회 |
| POST | `/epics` | Epic 생성 |
| PATCH | `/epics/:id` | Epic 수정 |
| DELETE | `/epics/:id` | Epic 삭제 |

### 4.4 Sub Issue (투두)

| Method | Path | 설명 |
|---|---|---|
| GET | `/todos?date=&workspace=` | 일자별 투두 조회 |
| POST | `/todos` | 투두 생성 |
| PATCH | `/todos/:id` | 투두 수정 |
| PATCH | `/todos/:id/status` | 상태 변경 (완료/미완료) |
| DELETE | `/todos/:id` | 투두 삭제 |
| POST | `/todos/carry-over` | 미완료 투두 일괄 이월 |

---

## 5. 화면 구성

### 5.1 화면 목록

| 화면 | 설명 |
|---|---|
| 로그인 | 소셜 로그인 버튼 (Google, Kakao) |
| 메인 (오늘의 투두) | 하단 탭 바 + 완료/진행 중 섹션 |
| 날짜 탐색 | 좌우 스와이프로 다른 날짜 투두 확인 |
| 투두 생성/수정 | 제목, 설명, 우선순위, 분류/Epic 선택 |
| 분류 관리 | 분류 CRUD |
| Epic 관리 | Epic CRUD + 진행률 표시 |
| 설정 | 계정 정보, 로그아웃 |

### 5.2 메인 화면 와이어프레임

```
┌──────────────────────────────┐
│  ◀  2026년 5월 1일 (목)  ▶   │  ← 날짜 네비게이션
├──────────────────────────────┤
│                              │
│  ── 완료 (2) ──────────────  │
│  ☑ 아침 운동          건강   │
│  ☑ 코드 리뷰     프로젝트A   │
│                              │
│  ── 진행 중 (3) ───────────  │
│  ☐ API 설계       프로젝트A  │
│  ☐ 장보기             생활   │
│  ☐ 책 읽기         자기개발  │
│                              │
│                        [＋]  │  ← 우측 하단 플로팅 버튼
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │  ← 하단 탭 바
└──────────────────────────────┘
```

---

## 6. 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend (Web) | Next.js 15, React 19, TypeScript |
| Mobile | Expo (React Native) + WebView |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | OAuth 2.0 (Google, Kakao) + JWT |
| Monorepo | pnpm workspaces + Turborepo |
| Infra | 추후 결정 |

---

## 7. 마일스톤

| 단계 | 목표 | 주요 작업 |
|---|---|---|
| **M1 — 기반 구축** | 프로젝트 뼈대 완성 | 모노레포 설정, DB 스키마, 인증 구현 |
| **M2 — 핵심 기능** | 투두 CRUD + 일자별 관리 | 투두 생성/수정/삭제/완료, 이월 로직 |
| **M3 — 계층 관리** | 분류/Epic/Sub Issue 구조 | 카테고리·Epic CRUD, 계층 필터링 |
| **M4 — UI 완성** | 웹 UI 완성 | 메인 화면, 날짜 탐색, 반응형 |
| **M5 — 모바일 배포** | 앱스토어 출시 | WebView 래핑, 네이티브 조정, 배포 |
