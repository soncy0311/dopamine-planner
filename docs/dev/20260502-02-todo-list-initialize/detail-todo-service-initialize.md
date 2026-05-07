# Dopamine Planner 서비스 기획서

> 작성일: 2026-05-01
> 최종 수정일: 2026-05-05 (v2 stack-pivot 머지 후 SoT 정합 — RPC 반환 타입을 003 마이그레이션 본문과 일치하도록 갱신)
> 상태: Draft
> 마이그레이션 계획: [`../20260502-01-stack-pivot/detail-stack-pivot.md`](../20260502-01-stack-pivot/detail-stack-pivot.md)

---

## 1. 서비스 개요

일상(Life)과 업무(Work)를 구분하여 관리할 수 있는 플래너 서비스.
**MVP: 웹과 모바일** 두 환경에서 동일한 사용 경험을 제공한다. 데스크탑(Electron) 은 동일 웹 SPA 를 wrapping 하는 형태로 **후속 마일스톤** 에서 도입한다.

**Supabase BaaS** 기반 아키텍처로 자체 백엔드 운영 없이 인증, 데이터베이스, 실시간 동기화를 처리한다.
복합 비즈니스 로직(트랜잭션, 일괄 처리)은 **Postgres RPC 함수** 로 DB 안에서 직접 처리하며, 클라이언트는 `supabase.rpc()` 한 줄로 호출한다.

```
┌──────────────┐                       ┌──────────────┐
│  Web (브라우저) │                       │  Mobile       │
│  apps/web     │   🔮 후속:              │  apps/mobile  │
│  Next.js SPA  │   apps/desktop         │  Expo (RN)    │
│  (정적 export) │   (Electron 으로 SPA   │  (네이티브)    │
│               │    동일 wrapping)      │               │
└───────┬──────┘                       └───────┬──────┘
        │                                     │
        │  packages/core (TS 비즈니스 로직 공유) │
        │  · Supabase 클라이언트 팩토리          │
        │  · 도메인 매퍼·서비스·Query 훅          │
        └────────────────┬────────────────────┘
                         ▼
              ┌────────────────────────┐
              │  Supabase (무료 티어)    │
              │  ├── PostgreSQL (DB+RLS)│
              │  ├── Auth (OAuth)       │
              │  ├── Realtime (동기화)   │
              │  └── RPC 함수 (비즈로직) │
              └────────────────────────┘
```

- **자체 서버 0**: Vercel 은 정적 SPA + OAuth 콜백 라우트만 호스팅. 비즈니스 로직은 클라이언트 또는 Postgres RPC.
- **MVP 범위**: 웹 SPA + 모바일 RN 네이티브. 데스크탑은 같은 SPA 를 Electron 으로 wrapping 하므로 후속에 가볍게 추가 가능.
- **모바일**: WebView 가 아닌 RN 네이티브. 비즈니스 로직만 `packages/core` 로 공유.
- **`SUPABASE_SERVICE_ROLE_KEY` 가 클라이언트 환경 어디에도 노출되지 않음** — RPC 함수가 `SECURITY DEFINER` 로 권한 우회를 함수 본문 내에서 한정.

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

| 제공자 | 설명 | MVP |
|---|---|---|
| **Google** | Supabase Auth — Google OAuth 2.0 | ✅ |
| **Kakao** | Supabase Auth — Kakao OAuth 2.0 (사업자 등록 검토 필요) | 🔮 후속 |

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
 ├── user_id (FK → auth.users.id)        -- RLS 성능을 위한 비정규화 (JOIN 회피)
 ├── category_id (FK → category.id)
 ├── title
 ├── description
 ├── status (active | completed | archived)
 ├── registered_date
 ├── completed_date
 ├── progress (numeric, default 0)        -- recalc_epic_progress RPC 가 갱신
 ├── created_at
 └── updated_at

public.sub_issue
 ├── id (PK, uuid, default gen_random_uuid())
 ├── user_id (FK → auth.users.id)        -- RLS 성능을 위한 비정규화 (JOIN 회피)
 ├── epic_id (FK → epic_issue.id)         -- 칼럼명 단축 (RPC SQL 정합)
 ├── title
 ├── description
 ├── priority (high | medium | low)
 ├── status (todo | done)
 ├── due_date                             -- 투두가 배치되는 일자 (carry_over 의 이동 대상)
 ├── completed_date
 ├── carry_over_count
 ├── created_at
 └── updated_at
```

### 3.2 관계 요약

- `auth.users` 1 : 1 `profile`
- `auth.users` 1 : N `category`
- `auth.users` 1 : N `epic_issue` (`user_id` 직접 보유 — RLS 단순화)
- `auth.users` 1 : N `sub_issue` (`user_id` 직접 보유 — RLS 단순화)
- `category` 1 : N `epic_issue`
- `epic_issue` 1 : N `sub_issue`

### 3.3 Row Level Security (RLS)

모든 `public` 테이블에 RLS를 활성화하여 사용자별 데이터를 격리한다.
`epic_issue`/`sub_issue` 는 `user_id` 칼럼을 비정규화 보유하여 JOIN 없이 직접 비교한다 (성능 + 정책 가독성).

| 테이블 | 정책 |
|---|---|
| `profile` | `auth.uid() = id` |
| `category` | `auth.uid() = user_id` |
| `epic_issue` | `auth.uid() = user_id` |
| `sub_issue` | `auth.uid() = user_id` |

---

## 4. API 접근 방식

### 4.1 Supabase 직접 호출 (단순 CRUD)

클라이언트(`packages/core` 의 훅) 에서 Supabase JS SDK 로 직접 호출한다. RLS 로 보안을 처리한다.

| 대상 | 작업 |
|---|---|
| Category | 목록 조회, 생성, 수정, 삭제 |
| Epic Issue | 목록 조회, 생성, 수정, 삭제 |
| Sub Issue | 조회, 생성, 수정, 상태 변경, 삭제 |

```typescript
// 예시: 카테고리 목록 조회 (packages/core 내부)
const { data } = await supabase
  .from('category')
  .select('*')
  .eq('workspace', 'life')
  .order('sort_order');
```

### 4.2 Postgres RPC 함수 (복합 비즈니스 로직)

트랜잭션이 필요하거나 복합 로직이 있는 작업은 **Postgres RPC 함수** 로 DB 안에서 처리한다. 클라이언트는 `supabase.rpc()` 한 줄로 호출하며, 함수는 `SECURITY DEFINER` + 본문 내 `auth.uid()` 검증으로 본인 데이터만 다룬다 — `SERVICE_ROLE_KEY` 클라이언트 노출 없음.

| RPC 함수 | 설명 |
|---|---|
| `carry_over_todos(target_date date)` | 미완료 투두 일괄 이월 (단일 트랜잭션) |
| `recalc_epic_progress(epic_id uuid)` | Epic 진행률 재계산 (또는 view 로 대체) |

```typescript
// 예시: 미완료 투두 이월
const { data, error } = await supabase.rpc('carry_over_todos', {
  target_date: '2026-05-02',
});
```

```sql
-- 발췌: supabase/migrations/003_carry_over_todos.sql
create or replace function public.carry_over_todos(target_date date)
returns table(moved_count integer)
language plpgsql security definer set search_path = public
as $$
declare
  cnt integer;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  with moved as (
    update sub_issue
       set due_date = target_date,
           carry_over_count = carry_over_count + 1
     where user_id = auth.uid()
       and status <> 'done'
       and due_date < target_date
    returning id
  )
  select count(*) into cnt from moved;

  return query select cnt;
end;
$$;

revoke all on function public.carry_over_todos(date) from public, anon;
grant execute on function public.carry_over_todos(date) to authenticated;
```

> 📌 **Vercel API Routes 미사용**: 자체 서버 코드 0. 비즈니스 로직 = 클라이언트 + Postgres RPC.

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
| 로그인 | Supabase Auth UI — 소셜 로그인 (MVP: Google. Kakao 후속) |
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

| 영역 | 기술 | MVP |
|---|---|---|
| Web (apps/web) | Next.js 15 (`output: 'export'` SPA), React 19, TypeScript | ✅ |
| Mobile (apps/mobile) | Expo SDK 52 (React Native, **네이티브** — WebView 미사용) | ✅ |
| Backend (BaaS) | Supabase (PostgreSQL + Auth + Realtime) | ✅ |
| 비즈니스 로직 | 클라이언트 (`packages/core`) + Postgres RPC 함수 | ✅ |
| SDK | @supabase/supabase-js, @supabase/ssr | ✅ |
| 공통 패키지 | `@todo-list/shared` (타입), `@todo-list/core` (비즈로직), `@todo-list/ui` (React) | ✅ |
| **디자인 토큰** | **Tailwind (`packages/config/tailwind.config.js`) + Nativewind v4** — web/mobile className 단일 source of truth (마이그레이션 §4.2) | ✅ |
| Monorepo | pnpm workspaces + Turborepo | ✅ |
| Infra | Vercel (웹 SPA 정적 호스팅, `<slug>.vercel.app` 자동 호스트, **git 연동 자동 배포**) + Supabase (DB·Auth·Realtime·RPC) | ✅ |
| Desktop (apps/desktop) 🔮 | Electron — 동일 웹 SPA wrapping (`<slug>.vercel.app` loadURL 또는 번들) | 후속 |

> 자체 서버(Node/Next.js API Routes)는 운영하지 않는다. Vercel 은 정적 SPA + OAuth 콜백 Route Handler 만 호스팅. 배포 호스트는 `<slug>.vercel.app` 형태의 Vercel 자동 생성 도메인을 사용한다 — **별도 도메인 구매·연동(커스텀 도메인)은 v2 MVP 범위에 포함하지 않는다**.

### 6.1 무료 티어 범위

| 서비스 | 무료 한도 | 비고 |
|---|---|---|
| Vercel (Hobby) | 100GB 대역폭/월, 100K function invocation/월 | 정적 SPA + 콜백만 사용 — 한도 여유 큼 |
| Supabase (Free) | 500MB DB, 50K MAU, Realtime 무제한 | 충분 |
| EAS Build (모바일) | Free tier 월 30 빌드 | 개인 검증 충분 |
| GitHub Releases (데스크탑) 🔮 | 무제한 | 후속 마일스톤에서 활용 |

---

## 7. 마일스톤

| 단계 | 목표 | 주요 작업 |
|---|---|---|
| **M0 — 스택 전환** | v2 아키텍처 전환 | 마이그레이션 플랜 수행 (`../20260502-01-stack-pivot/detail-stack-pivot.md`) |
| **M1 — 기반 구축** | Supabase + RPC 정의 완료 | DB 스키마 + RLS 마이그레이션, **Auth (Google — MVP. Kakao 후속)**, `carry_over_todos` / `recalc_epic_progress` RPC, **Realtime publication 활성화 (MVP 포함)** |
| **M2 — 공통 클라이언트** | `packages/core` 비즈니스 로직 완성 | Supabase 팩토리, 도메인 매퍼, 서비스, TanStack Query 훅, **Realtime 구독 헬퍼** |
| **M3 — 웹 SPA** | apps/web 핵심 기능 | 인증 + 메인 일자 뷰 + CRUD + **Realtime 구독 (DB 변경 시 UI 즉시 반영)** + Vercel git 연동 자동 배포 |
| **M4 — 모바일** | apps/mobile Expo 네이티브 | RN 화면 (`apps/mobile/src/components/` 직배치), **Nativewind v4 셋업 (디자인 토큰 자동 매핑)**, expo-auth-session (`dopamine-planner://auth/callback`), **Realtime 구독 + 웹과의 다중 디바이스 sync 검증**, EAS Build 로 스토어 배포 |
| **🔮 후속 — 데스크탑** | apps/desktop Electron 도입 (MVP 범위 밖) | SPA loadURL, custom URI scheme deep link OAuth, 패키징 (.dmg/.exe) |
