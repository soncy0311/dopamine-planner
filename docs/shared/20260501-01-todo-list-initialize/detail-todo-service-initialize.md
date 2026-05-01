# Dopamine Planner 서비스 기획서

> 작성일: 2026-05-01
> 최종 수정일: 2026-05-02
> 상태: Draft

---

## 1. 서비스 개요

일상(Life)과 업무(Work)를 구분하여 관리할 수 있는 플래너 서비스.
웹과 모바일(WebView) 환경에서 동일한 사용 경험을 제공한다.

**Supabase BaaS** 기반 아키텍처로 서버 운영 없이 인증, 데이터베이스, 실시간 동기화를 처리한다.
비즈니스 로직이 필요한 작업은 **Next.js API Routes**(Vercel Serverless)로 처리한다.

```
┌──────────────┐     ┌──────────────────────────────┐
│  Web Client  │────>│  Next.js (Vercel)             │
│  (Next.js)   │     │  ├── App Router (프론트엔드)   │
│              │<────│  └── API Routes (비즈니스 로직) │
└──────────────┘     └──────────┬───────────────────┘
┌──────────────┐                │
│Mobile Client │────> (WebView) │
│(Expo WebView)│                │
└──────────────┘                ▼
                     ┌──────────────────────┐
                     │  Supabase (무료 티어)  │
                     │  ├── PostgreSQL (DB)  │
                     │  ├── Auth (OAuth)     │
                     │  └── Realtime (동기화) │
                     └──────────────────────┘
```

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
- 하위 Sub Issue의 진행률을 세그먼트 프로그레스바로 표시한다.
- 메인 체크박스 체크 시 하위 Sub Issue를 일괄 체크/해제한다.
- 예시: `3월 운동 루틴`, `로그인 기능 개발`
- 속성:
  - 제목 (필수)
  - 설명 (선택)
  - 상태: `Active` / `Completed` / `Archived`
  - 등록일
  - 완료일

#### 2.4.3 Sub Issue

- 실제로 체크 가능한 **투두 항목**이다.
- 일자별 뷰에서 표시되는 최소 단위이다.
- 속성:
  - 제목 (필수)
  - 설명 (선택)
  - 우선순위: `High` / `Medium` / `Low`
  - 상태: `Todo` / `Done`
  - 등록일 (투두가 배치되는 날짜)
  - 완료일
  - 이월 횟수

### 2.5 인증

Supabase Auth 기반 소셜 로그인을 제공한다.

| 제공자 | 설명 |
|---|---|
| **Google** | Supabase Auth — Google OAuth 2.0 |
| **Kakao** | Supabase Auth — Kakao OAuth 2.0 |

- Supabase `signInWithOAuth`로 소셜 로그인을 처리한다.
- 최초 로그인 시 Supabase Auth에 계정이 자동 생성된다.
- JWT 발급/갱신은 Supabase가 자동 처리한다 (Refresh Token 관리 불필요).
- 클라이언트는 `onAuthStateChange`로 인증 상태를 구독한다.
- `@supabase/ssr`을 사용하여 서버 사이드에서도 세션을 유지한다.

---

## 3. 데이터 모델

### 3.1 ERD 개요

Supabase PostgreSQL에 아래 스키마를 생성한다.
`auth.users`는 Supabase Auth가 자동 관리하는 테이블이다.

```
auth.users (Supabase Auth 관리)
 ├── id (PK, uuid)
 ├── email
 ├── raw_user_meta_data (name, avatar_url 등)
 └── ...

public.profile
 ├── id (PK, FK → auth.users.id)
 ├── display_name
 ├── created_at
 └── updated_at

Workspace (enum: life | work)

public.category
 ├── id (PK, uuid, default gen_random_uuid())
 ├── user_id (FK → auth.users.id)
 ├── workspace (life | work)
 ├── name
 ├── color
 ├── sort_order
 ├── created_at
 └── updated_at

public.epic_issue
 ├── id (PK, uuid, default gen_random_uuid())
 ├── category_id (FK → category.id)
 ├── title
 ├── description
 ├── status (active | completed | archived)
 ├── registered_date
 ├── completed_date
 ├── created_at
 └── updated_at

public.sub_issue
 ├── id (PK, uuid, default gen_random_uuid())
 ├── epic_issue_id (FK → epic_issue.id)
 ├── title
 ├── description
 ├── priority (high | medium | low)
 ├── status (todo | done)
 ├── registered_date
 ├── completed_date
 ├── carry_over_count
 ├── created_at
 └── updated_at
```

### 3.2 관계 요약

- `auth.users` 1 : 1 `profile`
- `auth.users` 1 : N `category`
- `category` 1 : N `epic_issue`
- `epic_issue` 1 : N `sub_issue`

### 3.3 Row Level Security (RLS)

모든 `public` 테이블에 RLS를 활성화하여 사용자별 데이터를 격리한다.

| 테이블 | 정책 |
|---|---|
| `profile` | `auth.uid() = id` |
| `category` | `auth.uid() = user_id` |
| `epic_issue` | `category.user_id = auth.uid()` (JOIN) |
| `sub_issue` | `epic_issue → category.user_id = auth.uid()` (JOIN) |

---

## 4. API 접근 방식

### 4.1 Supabase 직접 호출 (단순 CRUD)

클라이언트에서 Supabase JS SDK로 직접 호출한다. RLS로 보안을 처리한다.

| 대상 | 작업 |
|---|---|
| Category | 목록 조회, 생성, 수정, 삭제 |
| Epic Issue | 목록 조회, 생성, 수정, 삭제 |
| Sub Issue | 조회, 생성, 수정, 상태 변경, 삭제 |

```typescript
// 예시: 카테고리 목록 조회
const { data } = await supabase
  .from('category')
  .select('*')
  .eq('workspace', 'life')
  .order('sort_order');
```

### 4.2 Next.js API Routes (복합 비즈니스 로직)

트랜잭션이 필요하거나 복합 로직이 있는 작업은 Next.js API Routes로 처리한다.
API Routes에서는 Supabase Service Role Key를 사용하여 RLS를 우회한다.

| 엔드포인트 | 설명 |
|---|---|
| `POST /api/todos/carry-over` | 미완료 투두 일괄 이월 (트랜잭션) |
| `GET /api/epics/:id/progress` | Epic 진행률 집계 |

### 4.3 Realtime 구독

Supabase Realtime으로 실시간 데이터 동기화를 처리한다.

```typescript
// 예시: 투두 변경 실시간 구독
supabase
  .channel('sub_issue_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sub_issue',
  }, (payload) => {
    // UI 업데이트
  })
  .subscribe();
```

---

## 5. 화면 구성

### 5.1 화면 목록

| 화면 | 설명 |
|---|---|
| 로그인 | Supabase Auth UI — 소셜 로그인 (Google, Kakao) |
| 메인 (오늘의 투두) | 하단 탭 바 + 완료/진행 중 섹션 |
| 날짜 탐색 | 좌우 스와이프로 다른 날짜 투두 확인 |
| 투두 생성/수정 | 제목, 설명, 우선순위, 분류 선택, 등록일 |
| 분류 관리 | 분류 CRUD |
| Epic 관리 | Epic CRUD + 진행률 표시 |
| 설정 | 계정 정보, 로그아웃 |

### 5.2 메인 화면 와이어프레임

```
┌──────────────────────────────┐
│  ◀      2026년 5월      ▼ ▶  │  ← 월 타이틀 + 펼치기 토글
│  일  월  화  수  목  금  토   │
│  27  28  29  30  ①  2   3   │  ← 주간 뷰 (① = 선택일)
├──────────────────────────────┤
│                              │
│  ── 완료 (2) ──────────────  │
│  ☑ 아침 운동          건강   │
│    ██ ██  100%               │  ← 세그먼트 프로그레스바
│  ☑ 장보기             생활   │
│                              │
│  ── 진행 중 (3) ───────────  │
│  ☐ 저녁 운동          건강   │
│    ██ ░░  50%                │
│  ☐ 책 읽기         자기개발  │
│  ☐ 비타민 챙기        생활   │
│                              │
│                        [＋]  │  ← FAB (모바일)
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │  ← 하단 탭 바 (모바일)
└──────────────────────────────┘
```

> 데스크톱 레이아웃: 하단 탭 바 → 사이드 네비게이션(240px), FAB → "새 투두" 버튼

---

## 6. 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend (Web) | Next.js 15, React 19, TypeScript |
| Mobile | Expo 52 (React Native) + WebView |
| Backend (BaaS) | Supabase (PostgreSQL + Auth + Realtime) |
| API | Next.js API Routes (Vercel Serverless) |
| SDK | @supabase/supabase-js, @supabase/ssr |
| Monorepo | pnpm workspaces + Turborepo |
| Infra | Vercel (프론트엔드) + Supabase (백엔드) |

### 6.1 무료 티어 범위

| 서비스 | 무료 한도 | 비고 |
|---|---|---|
| Vercel (Hobby) | 100GB 대역폭/월, Serverless 10초 제한 | 충분 |
| Supabase (Free) | 500MB DB, 50K MAU, Realtime 무제한 | 충분 |

---

## 7. 마일스톤

| 단계 | 목표 | 주요 작업 |
|---|---|---|
| **M1 — 기반 구축** | Supabase 설정 완료 | Supabase 프로젝트 생성, DB 스키마, RLS 정책, Auth(Google/Kakao) 연동 |
| **M2 — 핵심 기능** | 투두 CRUD + 일자별 관리 | Supabase SDK로 투두 CRUD, 이월 로직(API Route), 일자별 조회 |
| **M3 — 계층 관리** | 분류/Epic/Sub Issue 구조 | 카테고리·Epic CRUD, 계층 필터링, 진행률 집계 |
| **M4 — UI 완성** | 웹 UI + Realtime 동기화 | 메인 화면, 날짜 탐색, 반응형, Realtime 구독 |
| **M5 — 모바일 배포** | 앱스토어 출시 | WebView 래핑, 네이티브 조정, 배포 |
