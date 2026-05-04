# MAIN-PRD: `스택 전환`

# `스택 전환` (`stack-pivot`) - MAIN PRD

## 프로젝트 정보

- **프로젝트명**: `스택 전환` `stack-pivot`
- **카테고리**: 인프라 마이그레이션 / v1 → v2 아키텍처 전환
- **상태**: Draft
- **시작일**: 2026-05-04
- **완료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **기반 문서**: [`detail-stack-pivot.md`](./detail-stack-pivot.md)

## 개발 목적

Dopamine Planner 의 v1 구조 — **웹 우선 + 모바일 WebView 래핑 + Next.js API Routes 백엔드** — 가 가진 한계 3가지를 v2(노션 스타일: SPA + RN 네이티브 + Supabase BaaS + Postgres RPC) 로 해소한다. (detail §1)

**v1 의 한계**

1. 자체 서버(Next.js API Routes)가 비즈니스 로직(carry-over, progress) 을 담당 → `SUPABASE_SERVICE_ROLE_KEY` 가 Vercel 환경에 상주
2. 모바일은 웹의 WebView 래퍼 — 네이티브 UX 한계
3. 도메인이 사실상 필수 (Vercel 함수 호출 경로)

**v2 목표 상태 (MVP 범위)**

- 비즈니스 로직 = 클라이언트 + Postgres RPC. **자체 서버 0**
- MVP 는 웹 SPA(`apps/web`) + 모바일 네이티브(`apps/mobile`) 두 갈래
- 모바일은 RN 네이티브(WebView 아님) — 비즈니스 로직만 공유
- `SERVICE_ROLE_KEY` 가 클라이언트 환경 어디에도 노출되지 않음
- **데스크탑(Electron) 래핑은 후속 마일스톤** — MVP 범위 밖 (detail §7 후속, §2.2)

## 핵심 기능 요구사항 (= 구조 변경 요구사항)

detail §9.1 에서 확정한 MVP 결정 7개와 1:1 대응한다.

### 1. 자체 서버 0 — Postgres RPC 로 이전 (결정 #1)

- Vercel API Routes 제거. 비즈니스 로직(`carry_over_todos`, `recalc_epic_progress`) 을 Postgres RPC 함수로 이전
- `SUPABASE_SERVICE_ROLE_KEY` 환경 변수를 **모든 앱에서 제거**. RPC 함수가 `SECURITY DEFINER` 로 권한 우회를 함수 본문에서 한정
- 웹 프레임워크는 Next.js 15 + `output: 'export'` 유지 — `auth/callback` Route Handler 만 서버에서 동작, 나머지는 정적 SPA

### 2. 모바일 네이티브 전환 (결정 #2, #7)

- `react-native-webview` 의존성 제거 → expo-router 기반 RN 화면으로 재작성
- OAuth 는 `expo-auth-session` + custom URI scheme `dopamine-planner://auth/callback`
- `packages/ui-mobile` 는 **MVP 미신설** — RN 컴포넌트는 `apps/mobile/src/components/` 에 직접 둠 (재사용 누적 시 추출)

### 3. 공통 클라이언트 패키지 신설 — `packages/core`

플랫폼 독립 TS 모듈로 web/mobile(+ 후속 desktop) 가 공유한다.

```
packages/core/src/
├── supabase/createClient.ts       # env 주입형 팩토리 (storage adapter 분기)
├── supabase/types.ts               # SupabaseClient<Database> 타입 alias
├── domain/{todo,epic,category}.ts  # DB Row ↔ View 매퍼
├── services/carryOver.ts           # supabase.rpc('carry_over_todos', ...)
├── services/epicProgress.ts        # supabase.rpc('recalc_epic_progress', ...)
├── hooks/{useTodos, useCreateTodo, ...}.ts  # TanStack Query 훅
└── realtime/subscribeTodos.ts      # 채널 구독 헬퍼
```

플랫폼 차이(storage adapter 등) 는 팩토리 인자로 주입한다 (`window.localStorage` ↔ `AsyncStorage`).

### 4. 디자인 토큰 자동 매핑 — Tailwind + Nativewind v4 (결정 #5)

- `packages/config/tailwind.config.js` 를 **단일 source of truth** 로 두고 `theme.extend` 에 디자인 토큰(color, spacing, radius 등) 정의
- `apps/web/tailwind.config.js` 와 `apps/mobile/tailwind.config.js` 는 위 공유 config 를 import 해서 확장
- 모바일은 Nativewind v4 를 통해 동일한 `className` 을 그대로 RN 스타일로 변환 (`<View className="bg-purple-500 p-4">`)
- 토큰 변경 1회로 web/mobile 양쪽 자동 반영 — 수동 매핑(`packages/shared/src/tokens.ts`) 불필요
- 트레이드오프: 셋업 비용 ↑ (Nativewind babel plugin / metro 설정), 학습 곡선 ↑. 다만 토큰 동기화 비용 ↓

### 5. Realtime MVP 포함 (결정 #4)

- `005_realtime_publication.sql` 마이그레이션을 Phase 3 에 포함
- `packages/core/src/realtime/subscribeTodos.ts` 를 web/mobile 양쪽 메인 일자 뷰에 연결
- 검증 시 다중 디바이스 sync 동작 확인 (§10 Phase 5 검증)

### 6. OAuth Provider — Google MVP, Kakao 후속 (결정 #3)

- Supabase Dashboard → Authentication → Providers 에서 **Google 만 활성화**
- Kakao 는 후속 (사업자 등록 검토 필요)

### 7. 데스크탑(Electron) 후속 분리

- MVP 범위 밖. `apps/desktop/` 은 본 단계에서 신설하지 않음
- 후속 도입 시 detail §2.1 / §2.2 / §6 / §7 후속 절차 재참조

## 사용자 플로우 (= 에이전트/개발자 작업 플로우)

본 PRD 는 마이그레이션 PRD 이므로 "사용자 플로우" 자리에 detail §7 의 Phase 0~6 + 🔮 후속 단계를 둔다. 각 Phase 종료 시 사용자 검토 후 다음 단계로 진행한다.

```
[Phase 0] 결정 사항 확정  ✅ 2026-05-03 완료 (detail §9.1)
   │
   ▼
[Phase 1] 문서 정비 (코드 변경 없음)
   · 루트 CLAUDE.md, docs/CLAUDE.md, apps/web/CLAUDE.md, apps/mobile/CLAUDE.md
   · API_CONTRACT.md (Next.js API Routes 섹션 제거 → RPC 함수 시그니처 추가)
   · detail-todo-service-initialize.md v2 갱신
   │
   ▼
[Phase 2] 패키지 골격 정비
   · packages/core 신설 (package.json, tsconfig.json, src/index.ts)
   · packages/shared 의 도메인 매퍼/뷰모델 → packages/core/src/domain/ 이전
   · packages/config/tailwind.config.js 공유 토큰 정의
   · 모든 앱 package.json 에 @todo-list/core 의존 추가
   │
   ▼
[Phase 3] Supabase 인프라
   · supabase init (필요 시)
   · migrations 5개 작성 (스키마 + RLS + RPC×2 + realtime publication)
   · 로컬 supabase db reset 검증 → 사용자가 직접 supabase db push
   · supabase gen types typescript → packages/shared/src/database.ts
   │
   ▼
[Phase 4] 웹 SPA 구현 (apps/web)
   · next.config.ts 에 output: 'export'
   · packages/core 팩토리 사용으로 supabase 클라이언트 단순화
   · (auth)/login + Google OAuth 버튼만 노출
   · auth/callback Route Handler 유지 (code 교환)
   · Realtime 구독 훅을 메인 일자 뷰에 연결
   · Vercel git 자동 배포 (dev → preview, main → production)
   │
   ▼
[Phase 5] 모바일 재구성 (apps/mobile)
   · react-native-webview 제거
   · Nativewind v4 설치 + tailwind.config.js 공유
   · expo-router RN 화면 작성 (Life/Work, 메인 일자 뷰)
   · expo-auth-session + dopamine-planner://auth/callback
   · @todo-list/core 훅 재사용 (storage = AsyncStorage)
   · Realtime 구독 — 다중 디바이스 sync 검증
   · EAS Build 설정
   │
   ▼
[🔮 후속] 데스크탑 도입 (MVP 범위 밖)
   · apps/desktop 신설, Electron loadURL → 사용자 증가 시 번들로 전환
   · GitHub Releases 수동 다운로드 → electron-updater + 코드 사인
```

## 기술 아키텍처

### 시스템 구성

detail §2 의 다이어그램 그대로 인용한다.

```
┌────────────────────────────────────────────────────────────┐
│  React SPA (apps/web) ─ MVP                                 │
│  └─ Next.js 15 (output: 'export') → 정적 SPA                │
│     └─ /auth/callback Route Handler (OAuth code 교환만)      │
└────────────────────────────────────────────────────────────┘
        │ deploy
        ▼
  [Vercel 기본 도메인]
   <slug>.vercel.app
        │
        │  · · · · · · · · 🔮 후속 · · · · · · · · ·
        │  ┌──────────────────────┐
        │  │ Electron (apps/desktop)
        │  │ · 동일 SPA wrapping (loadURL 또는 번들)
        │  │ · OAuth 외부 브라우저 + custom URI scheme
        │  └──────────────────────┘
        │  · · · · · · · · · · · · · · · · · · · · ·
        │
        │                                          ┌──────────────────┐
        │                                          │ Expo (RN 네이티브) ─ MVP
        │                                          │ apps/mobile/    │
        │                                          │ · 자체 RN 화면  │
        │                                          │ · expo-auth-session
        │                                          └────────┬─────────┘
        │                                                   │
        │           packages/core (TS 비즈니스 로직 공유)       │
        │           ─────────────────────────────────         │
        │           · Supabase 클라이언트 팩토리                │
        │           · 도메인 모델 + 매퍼                       │
        │           · 서비스 함수 (carry-over, progress 호출)   │
        │           · TanStack Query 훅                       │
        │
        ▼                                                   ▼
        ┌────────────────────────────────────┐
        │  Supabase (Free)                    │
        │  ├─ Postgres + RLS                  │
        │  ├─ Auth (Google/Kakao)             │
        │  ├─ Realtime                        │
        │  └─ RPC 함수 (carry_over_todos,     │
        │              recalc_epic_progress)  │
        └────────────────────────────────────┘
```

### 패키지 책임 (v2)

| 패키지 | 책임 | 의존자 (MVP) |
|---|---|---|
| `@todo-list/shared` | API I/O 타입, enum (`Workspace`, `Priority`, `Status` 등). DB Row 타입 자동생성 결과 | core, ui, web, mobile (+ 후속 desktop) |
| `@todo-list/core` 🆕 | 비즈니스 로직 — Supabase 클라이언트 팩토리, 매퍼, 서비스 함수, Query 훅, Realtime 헬퍼. 플랫폼 독립 TS 만 | web, mobile (+ 후속 desktop) |
| `@todo-list/ui` | React + shadcn/ui 컴포넌트. Tailwind className 을 단일 source of truth 로 사용 → Nativewind 가 모바일에서도 동일 className 을 RN 스타일로 매핑 | web (+ 후속 desktop) |
| `@todo-list/config` | tsconfig.base.json, eslint preset, prettier config, **`tailwind.config.js`** (web/mobile 공유 — 디자인 토큰 자동 매핑 source) | 모든 앱·패키지 |

> ⚠️ `@todo-list/ui-mobile` 는 MVP 미신설. 모바일 RN 컴포넌트는 `apps/mobile/src/components/` 에 직접 둔다.

### 핵심 서비스 구현

| 영역 | 구현 위치 | 핵심 |
|---|---|---|
| 비즈니스 로직 | `packages/core/src/` | services/carryOver, services/epicProgress, hooks/useTodos 등 |
| 클라이언트 팩토리 | `packages/core/src/supabase/createClient.ts` | env 주입형 (storage adapter 분기) |
| Realtime | `packages/core/src/realtime/subscribeTodos.ts` | 채널 구독 헬퍼 |
| 디자인 토큰 | `packages/config/tailwind.config.js` | Nativewind 가 모바일에서 동일 className 매핑 |
| 웹 OAuth 콜백 | `apps/web/src/app/auth/callback/route.ts` | Route Handler — code 교환 |
| 모바일 OAuth | `apps/mobile/` + `expo-auth-session` | `dopamine-planner://auth/callback` |

### 데이터베이스 스키마

`supabase/migrations/` 에 추가할 마이그레이션 5개. 실제 ERD 는 [`detail-todo-service-initialize.md`](../20260502-02-todo-list-initialize/detail-todo-service-initialize.md) §3 참조.

| 파일 | 내용 |
|---|---|
| `001_initial_schema.sql` | `profile`, `category`, `epic_issue`, `sub_issue` 테이블 + RLS 활성화 |
| `002_rls_policies.sql` | 테이블별 RLS 정책 (`auth.uid() = user_id` 등) |
| `003_carry_over_todos.sql` | RPC 함수: 미완료 todo 일괄 이월 (트랜잭션) |
| `004_recalc_epic_progress.sql` | RPC 함수: epic 진행률 재계산 (또는 view 로 대체) |
| `005_realtime_publication.sql` | `supabase_realtime` 발행에 테이블 추가 — **MVP 범위 (결정 #4)** |

**RPC 함수 작성 원칙**

- `language plpgsql security definer set search_path = public`
- 함수 본문 첫 줄: `if auth.uid() is null then raise exception 'unauthorized'; end if;`
- WHERE 절에 `auth.uid()` 명시로 본인 데이터만 조작
- `grant execute … to authenticated` / `revoke … from anon, public`

### API 엔드포인트

- 자체 REST 엔드포인트 없음. Supabase 직접 호출(단순 CRUD) + Postgres RPC 2종(`carry_over_todos`, `recalc_epic_progress`) 만 사용
- 상세 시그니처는 [`API_CONTRACT.md`](../20260502-02-todo-list-initialize/API_CONTRACT.md) 참조

### 책임 경계 규칙 (v2)

| 영역 | 책임 PRD 유형 |
|---|---|
| `supabase/migrations/**`, `supabase/**` | DB PRD (이전 "서버 PRD" 의 후신) |
| `packages/shared/**` (타입·enum) | DB PRD (스키마 변경의 결과물) |
| `packages/core/**` (비즈니스 로직) | 공통 클라이언트 PRD |
| `packages/ui/**` (`packages/ui-mobile/**` 미신설 — 모바일 RN 컴포넌트는 `apps/mobile/src/components/**`) | UI PRD 또는 공통 클라이언트 PRD |
| `apps/web/**` | 웹 PRD |
| `apps/mobile/**` | 모바일 PRD |
| `apps/desktop/**` 🔮 후속 | 데스크탑 PRD (MVP 범위 밖) |

→ "Vercel Serverless 백엔드" 가 사라지므로 기존 "서버 vs 클라이언트" 경계가 무의미. **DB / 공통 클라이언트 / 플랫폼별 클라이언트** 3계층으로 재정립.

### 기술적 고려사항

#### detail §9.1 확정 결정 7개 (요약)

| # | 항목 | 확정 |
|---|---|---|
| 1 | 웹 프레임워크 | Next.js 15 + `output: 'export'` |
| 2 | `packages/ui-mobile` | 미신설 (재사용 누적 시 추출) |
| 3 | OAuth Provider | Google MVP, Kakao 후속 |
| 4 | Realtime MVP 포함? | 포함 (Phase 3 인프라에서 publication 추가) ⚠️ 추천 비일치 |
| 5 | 디자인 토큰 RN 매핑 | Nativewind v4 자동 매핑 ⚠️ 추천 비일치 |
| 6 | `apps/web` deploy | Vercel git 연동 자동 |
| 7 | 모바일 스킴 | `dopamine-planner://` |

> 추천 비일치 항목 영향: #4·#5 채택으로 MVP 스코프가 확장됐다 (Phase 3·4·5 와 §검증 계획에 반영됨).

#### Nativewind 트레이드오프 (결정 #5)

- 셋업 비용 ↑ (babel plugin / metro 설정), 학습 곡선 ↑
- 토큰 추가/변경 시 web/mobile 양쪽 동기화 부담이 사라져 유지보수 비용 ↓

#### Supabase Dashboard 작업

- **Authentication → URL Configuration**: Site URL = `https://<slug>.vercel.app`, Redirect URLs 화이트리스트
  - `https://<slug>.vercel.app/auth/callback` (웹 — MVP)
  - `dopamine-planner://auth/callback` (모바일 deep link — MVP. 후속 데스크탑도 동일 스킴)
- **Authentication → Providers**: Google 만 활성화 (MVP)
- **Database**: 마이그레이션은 코드로 관리 (`supabase db push`) — Dashboard 직접 수정 금지

#### legacy 보존 작업 (detail §11)

`legacy/initialize` 브랜치에 v1 마지막 작업이 보존됨. v2 구현 시 다음을 참고 가능:

- `apps/web/src/lib/supabase/{browser,server,middleware}.ts` — Supabase 클라이언트 패턴
- `apps/web/src/app/(auth)/login/` — 로그인 화면 + OAuth 버튼
- `apps/web/src/app/auth/callback/route.ts` — code 교환 라우트
- `apps/web/src/app/(main)/layout.tsx` — RSC 인증 가드 (단, export 모드 전환 시 client-side 로 변환 필요)

⚠️ `apps/web/src/app/api/**` (carry-over, progress) 은 v2 에서 **재사용하지 않음** — RPC 로 완전 이전.

## Sub-PRD 구조 (Phase 단위 5개)

본 PRD 승인 후 `/generate-sub-prd` 로 Sub-01 부터 순차 생성한다.

| Sub-PRD | 범위 | 산출물 | Phase 매핑 |
|---|---|---|---|
| [Sub-01: 문서 정비](./sub-prd-01-docs-revamp.md) | CLAUDE.md(루트/docs/web/mobile) + API_CONTRACT.md + detail v2 갱신 | 문서 6~7개 | Phase 1 |
| [Sub-02: 패키지 골격](./sub-prd-02-feat-core-package.md) | `packages/core` 신설, `packages/config/tailwind` 공유, 의존성 추가 | 패키지 골격 + tailwind 공유 config | Phase 2 |
| [Sub-03: Supabase 인프라](./sub-prd-03-feat-supabase-infra.md) | supabase migrations 5개 + 타입 자동생성 | SQL 5개 + `packages/shared/database.ts` | Phase 3 |
| [Sub-04: 웹 SPA](./sub-prd-04-feat-web-spa.md) | Next.js export, Google OAuth, Realtime 구독, Vercel 자동 배포 | `apps/web` 핵심 | Phase 4 |
| [Sub-05: 모바일 재구성](./sub-prd-05-refactor-mobile-native.md) | WebView 제거, Nativewind, expo-auth-session, Realtime, EAS Build | `apps/mobile` 핵심 | Phase 5 |

> 🔮 **후속 데스크탑은 별도 마일스톤** — 본 PRD 의 Sub-PRD 에서 제외 (Future Scope 참조).

## 리스크 및 완화 방안

| 리스크 | 영향도 | 완화 방안 |
|---|---|---|
| Realtime MVP 포함(결정 #4 추천 비일치) → Phase 4·5 작업량 증가 | 중간 | Phase 3 publication 마이그레이션 + `packages/core/realtime/subscribeTodos.ts` 헬퍼 1개로 web/mobile 공유 — 중복 비용 최소화 |
| Nativewind v4(결정 #5 추천 비일치) → 셋업·학습 비용 ↑ | 중간 | `packages/config/tailwind.config.js` 단일 source of truth 로 토큰 동기화 비용 감소 효과로 상쇄. Phase 5 검증에 className 매핑 확인 항목 포함 |
| legacy `apps/web/src/app/api/**` 잔존 시 SERVICE_ROLE_KEY 노출 위험 | 높음 | Phase 4 종료 전 해당 디렉토리 존재 여부 확인. 존재 시 즉시 삭제 (detail §11) |
| Phase 5 모바일 검증 부담 (다중 디바이스 sync, OAuth deep link, Nativewind 매핑 동시 검증) | 높음 | iOS 시뮬레이터 + 웹 동시 접속 검증을 단일 시나리오로 묶어 Phase 5 종료 게이트로 설정 (§검증 계획 Phase 5) |
| 한 폴더에 detail 만 있고 PRD 라인이 끊겨 Sub-PRD 진입 불가 | 낮음 | 본 main PRD 작성으로 해소 |

## 검증 계획

각 Phase 종료 시점 (detail §10 인용):

| Phase | 검증 |
|---|---|
| 1 | 모든 변경 문서 로컬 git diff 검토. 외부 링크 깨짐 없음 |
| 2 | `pnpm -r build` 통과 (`packages/core` 빈 export 라도 빌드 성공) |
| 3 | `supabase db reset` (로컬) 후 RPC 직접 호출 테스트: SQL Studio 에서 `select carry_over_todos('2026-05-02')` |
| 4 | `pnpm --filter @todo-list/web build` + `dev` 로 `/login` 렌더 + Google OAuth → `/life` 진입 + Realtime 구독 훅 동작 (DB 직접 조작 시 UI 즉시 반영) |
| 5 | `pnpm --filter @todo-list/mobile dev` (`expo start`) iOS 시뮬레이터 부팅 + OAuth → 홈 화면 진입 + Nativewind className 정상 매핑 (디자인 토큰 색상/간격 일치) + 다중 디바이스 Realtime sync 검증 (웹 + iOS 시뮬레이터 동시 접속, 한쪽에서 todo 추가 시 양쪽 즉시 반영) |
| 🔮 후속 (데스크탑) | `pnpm --filter @todo-list/desktop dev` 로 Electron 창 기동 + Vercel 배포 SPA 로드 + deep link 콜백 수신 |

## 향후 개선 계획 (Future Scope)

| 항목 | 설명 | 우선순위 |
|---|---|---|
| 데스크탑(Electron) 도입 | `apps/desktop` 신설, detail §7 후속 절차 (loadURL → 번들, 수동 → 자동 업데이트). MVP 범위 밖 | P3 (사용자 증가 시) |
| Kakao OAuth | 사업자 등록 검토 후 Supabase Dashboard Provider 활성화 | P3 |
| 데스크탑 자동 업데이트 + 코드 사인 | detail §2.2 / §9.2 D-2 단계적 도입 (Apple Developer + Windows EV cert) | P3 (데스크탑 도입 후) |
| 데스크탑 오프라인 동작 | detail §9.2 D-1 (b) — Next.js export 결과 번들로 전환 | P3 |
| `packages/ui-mobile` 추출 | 모바일 RN 컴포넌트 재사용 누적 시 `apps/mobile/src/components/` 에서 추출 | P3 |

## 관련 문서

- 마이그레이션 플랜 (요구사항/세부 결정): [`detail-stack-pivot.md`](./detail-stack-pivot.md)
- 서비스 기획서 v2 (DB ERD 원본): [`../20260502-02-todo-list-initialize/detail-todo-service-initialize.md`](../20260502-02-todo-list-initialize/detail-todo-service-initialize.md)
- API 계약: [`../20260502-02-todo-list-initialize/API_CONTRACT.md`](../20260502-02-todo-list-initialize/API_CONTRACT.md)
- 디자인 시스템 명세: [`../20260501-01-design-system/detail-design-system.md`](../20260501-01-design-system/detail-design-system.md)
- 디자인 프로토타입: [`../20260501-02-design-prototype/main-prd-design-prototype.md`](../20260501-02-design-prototype/main-prd-design-prototype.md)

---

*이 문서는 `스택 전환` 프로젝트의 메인 PRD입니다. 상세 구현 사항은 본 PRD 승인 후 생성될 각 Sub-PRD를 참조하세요.*
