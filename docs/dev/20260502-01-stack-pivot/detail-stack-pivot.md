# Dopamine Planner 스택 전환 마이그레이션 플랜

> 작성일: 2026-05-02
> 결정 확정일: 2026-05-03 (§9.1 MVP 결정 7개 확정)
> 상태: Draft
> 기반 문서: [`detail-todo-service-initialize.md`](../20260502-02-todo-list-initialize/detail-todo-service-initialize.md) (v1 → v2 갱신 대상)

---

## 1. Context — 왜 전환하나

기존 v1 구조는 **웹 우선 + 모바일 WebView 래핑 + Next.js API Routes 백엔드** 였다.

- 자체 서버(Next.js API Routes)가 비즈니스 로직(carry-over, progress) 을 담당 → `SUPABASE_SERVICE_ROLE_KEY` 가 Vercel 환경에 상주
- 모바일은 웹의 WebView 래퍼 — 네이티브 UX 한계
- 도메인이 사실상 필수 (Vercel 함수 호출 경로)

**목표 상태 (v2)**: **노션 스타일** — React SPA 1개 + Expo(모바일 네이티브) + Supabase BaaS + Postgres RPC. 데스크탑 Electron 래핑은 **후속 마일스톤** (§7 후속 섹션).

- 비즈니스 로직 = 클라이언트 + Postgres RPC. 자체 서버 0
- MVP: 웹 SPA + 모바일 네이티브 두 갈래. 데스크탑 사용자가 늘어나면 후속에 Electron 으로 동일 SPA wrapping
- 모바일은 RN 네이티브 (WebView 아님) — 비즈니스 로직만 공유
- `SERVICE_ROLE_KEY` 가 클라이언트 환경 어디에도 노출되지 않음

---

## 2. 목표 아키텍처

```
┌────────────────────────────────────────────────────────────┐
│  React SPA  (apps/web) ─ MVP                                │
│  └─ Next.js 15 (output: 'export') → 정적 SPA                │
│     └─ /auth/callback Route Handler (OAuth code 교환만)      │
└────────────────────────────────────────────────────────────┘
        │ deploy                                              │
        ▼                                                     │
  [Vercel 기본 도메인]                                          │
   <slug>.vercel.app                                           │
        │                                                     │
        │  · · · · · · · · · · · · · 🔮 후속 · · · · · · · · │
        │  ┌──────────────────────┐                           │
        │  │ Electron (apps/desktop)                          │
        │  │ · 동일 SPA wrapping (loadURL 또는 번들)           │
        │  │ · OAuth 외부 브라우저 + custom URI scheme         │
        │  └──────────────────────┘                           │
        │  · · · · · · · · · · · · · · · · · · · · · · · · · │
        │                                                     │
        │                                                     ▼
        │                                          ┌──────────────────┐
        │                                          │  Expo (RN 네이티브) ─ MVP
        │                                          │  apps/mobile/    │
        │                                          │  · 자체 RN 화면    │
        │                                          │  · expo-auth-session
        │                                          └────────┬─────────┘
        │                                                   │
        │           packages/core (TS 비즈니스 로직 공유)       │
        │           ─────────────────────────────────         │
        │           · Supabase 클라이언트 팩토리                │
        │           · 도메인 모델 + 매퍼                       │
        │           · 서비스 함수 (carry-over, progress 호출)   │
        │           · TanStack Query 훅                       │
        │                                                   │
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

### 2.1 무엇이 어디에 배포되는가

| 산출물 | 배포 위치 | 비고 |
|---|---|---|
| 웹 SPA (MVP) | Vercel (기본 `<slug>.vercel.app`) | 커스텀 도메인 X |
| 모바일 (.ipa / .apk) (MVP) | EAS Build → 스토어 | Expo SDK 52 |
| DB / Auth / Realtime (MVP) | Supabase | RPC 함수 포함 |
| 데스크탑 (.dmg / .exe) 🔮 후속 | 1단계: GitHub Releases 수동 다운로드 → 2단계: `electron-updater` 자동 업데이트 + 코드 사인 | §2.2 참조 |

### 2.2 데스크탑 배포 — 단계별 전략 (🔮 후속 마일스톤 시점에 적용)

> 본 절은 **MVP 범위 밖** 이다. 데스크탑 도입(후속) 시점에 다시 참조한다.

데스크탑 배포는 **2단계** 로 진행한다. GitHub Releases 와 auto-update 는 배타적이지 않으며, auto-update 를 켜도 GitHub Releases 가 그대로 업데이트 백엔드 역할을 한다.

| 단계 | 모드 | 방식 | 코드 사인 | 사용자 경험 | 연 비용 |
|---|---|---|---|---|---|
| **데스크탑 도입 초기** | **수동** | GitHub Releases 에 `.dmg`/`.exe` 업로드. 사용자가 직접 받아서 설치. 새 버전 알림 X | ❌ (안 하면 macOS Gatekeeper / Windows SmartScreen 경고 — "우클릭 → 열기" 안내) | 매번 사이트 가서 재다운로드 | $0 |
| **데스크탑 사용자 수십 명 +** | **자동 업데이트** | `electron-updater` (또는 Tauri updater) 가 GitHub Releases API 폴링 → 자동 다운로드 → 재시작 시 적용 | ✅ 사실상 필수 (사인 안 된 앱은 OS 가 자동 설치 차단) | 클릭 1번 (또는 백그라운드) | $99 (Apple Developer) + $300+ (Windows EV cert) |

**전환 시점 기준**: 사용자가 "수동으로 새 버전 받기" 가 마찰로 느껴지기 시작할 때.

---

## 3. 레포지토리 구조 — Before / After

### Before (현재, 4b852ef 기준)

```
todo-list/
├── apps/
│   ├── web/            Next.js 15 (App Router)
│   │   └── src/app/    layout.tsx, page.tsx (stub)
│   └── mobile/         Expo + react-native-webview (WebView 래퍼)
├── packages/
│   ├── ui/             Button 1개
│   ├── shared/         types/ + index.ts (비어 있음)
│   └── config/         (비어 있음)
└── supabase/           (비어 있음)
```

### After (목표)

```
todo-list/
├── apps/
│   ├── web/            Next.js 15 (App Router) — output: 'export' SPA  ─ MVP
│   │   ├── src/app/    (auth)/, (main)/, auth/callback/route.ts
│   │   └── ⚠️ src/app/api/ ❌ 없음 (RPC 로 이전)
│   ├── desktop/ 🔮     후속 마일스톤 — Electron wrapping (loadURL or bundle)
│   │   └── (MVP 범위 밖, 본 단계에서는 신설하지 않는다)
│   └── mobile/         Expo (네이티브, WebView 제거)  ─ MVP
│       ├── src/app/    expo-router 화면 (RN 컴포넌트)
│       └── ⚠️ react-native-webview ❌ 의존성 제거
├── packages/
│   ├── core/           🆕 TS 비즈니스 로직 (모든 앱 공유)
│   │   ├── src/supabase/   클라이언트 팩토리 (env 주입형)
│   │   ├── src/domain/     매퍼 + 도메인 모델
│   │   ├── src/services/   carry_over, progress (RPC 호출 wrapper)
│   │   ├── src/hooks/      TanStack Query 훅
│   │   └── src/realtime/   채널 구독 헬퍼
│   ├── shared/         타입 + enum (현 위치 유지)
│   ├── ui/             웹 React 컴포넌트 (shadcn/ui) — 후속 데스크탑 도입 시 함께 사용
│   │                   ⚠️ `packages/ui-mobile` 는 MVP 미신설 — RN 컴포넌트는
│   │                   `apps/mobile/src/components/` 에 직접 둔다 (재사용 발생 시 추출)
│   └── config/         eslint / tsconfig / prettier 공유
├── supabase/
│   ├── migrations/     🆕 DB 스키마 + RPC 함수 SQL
│   └── config.toml
└── env/
    ├── .env.web.example       NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/AUTH_REDIRECT_URL
    ├── .env.mobile.example    EXPO_PUBLIC_SUPABASE_URL/ANON_KEY
    └── (.env.desktop.example  🔮 후속 — 데스크탑 도입 시 추가)
```

**중요**: `SUPABASE_SERVICE_ROLE_KEY` 환경 변수는 **모든 앱에서 제거**. RPC 함수가 `SECURITY DEFINER` 로 권한 우회를 함수 본문에서 한정해 처리.

---

## 4. 패키지 책임 재정립

| 패키지 | 책임 | 의존자 (MVP) |
|---|---|---|
| `@todo-list/shared` | API I/O 타입, enum (`Workspace`, `Priority`, `Status` 등). DB Row 타입 자동생성 결과 | core, ui, web, mobile (+ 후속 desktop) |
| `@todo-list/core` 🆕 | 비즈니스 로직 — Supabase 클라이언트 팩토리, 매퍼, 서비스 함수, Query 훅, Realtime 헬퍼. **플랫폼 독립 TS 만** | web, mobile (+ 후속 desktop) |
| `@todo-list/ui` | React + shadcn/ui 컴포넌트. **Tailwind className 을 단일 source of truth** 로 사용 → Nativewind 가 모바일에서도 동일 className 을 RN 스타일로 매핑 (§4.2) | web (+ 후속 desktop) |
| `@todo-list/config` | tsconfig.base.json, eslint preset, prettier config, **`tailwind.config.js` (web/mobile 공유 — 디자인 토큰 자동 매핑 source)** | 모든 앱·패키지 |

> ⚠️ `@todo-list/ui-mobile` 는 **MVP 미신설**. 모바일 전용 RN 컴포넌트가 적은 동안은 `apps/mobile/src/components/` 에 직접 둔다. 재사용 사례가 누적되면 추후 추출.

### 4.1 `packages/core` 가 담는 것 — 구체 예시

```
packages/core/src/
├── supabase/
│   ├── createClient.ts       # env 주입형: createClient({ url, anonKey, storage })
│   └── types.ts               # SupabaseClient<Database> 타입 alias
├── domain/
│   ├── todo.ts                # SubIssue ↔ TodoView 매퍼
│   ├── epic.ts                # EpicIssue + 진행률 계산
│   └── category.ts
├── services/
│   ├── carryOver.ts           # supabase.rpc('carry_over_todos', ...)
│   └── epicProgress.ts        # supabase.rpc('recalc_epic_progress', ...)
├── hooks/
│   ├── useTodos.ts            # useQuery wrapper
│   ├── useCreateTodo.ts       # useMutation wrapper
│   └── ...
└── realtime/
    └── subscribeTodos.ts
```

플랫폼 차이 (storage adapter 등) 는 **팩토리 인자로 주입** 한다. 예:

```ts
// 웹/데스크탑
createSupabaseClient({ url, anonKey, storage: window.localStorage })

// 모바일
createSupabaseClient({ url, anonKey, storage: AsyncStorage })
```

### 4.2 디자인 토큰 RN 매핑 — Nativewind 자동 변환

MVP 결정 #5 에 따라 **Nativewind v4** 를 채택한다. 디자인 토큰을 web/mobile 양쪽에 자동 반영하기 위함.

- `packages/config/tailwind.config.js` 를 단일 source of truth 로 두고 `theme.extend` 에 디자인 토큰 (color, spacing, radius 등) 정의
- `apps/web/tailwind.config.js` 와 `apps/mobile/tailwind.config.js` 는 위 공유 config 를 import 해서 확장
- 모바일은 Nativewind 를 통해 동일한 `className` 을 그대로 RN 스타일로 변환 (`<View className="bg-purple-500 p-4">`)
- 토큰 변경 1회로 web/mobile 양쪽 자동 반영 — 수동 매핑 (`packages/shared/src/tokens.ts`) 불필요

> 트레이드오프 (수동 매핑 대비): 셋업 비용 ↑ (Nativewind babel plugin / metro 설정), 학습 곡선 ↑. 다만 토큰 추가/변경 시 양쪽 동기화 부담이 사라지므로 유지보수 비용 ↓.

---

## 5. Supabase 측 변경

### 5.1 추가할 마이그레이션 (`supabase/migrations/`)

| 파일 | 내용 |
|---|---|
| `001_initial_schema.sql` | `profile`, `category`, `epic_issue`, `sub_issue` 테이블 + RLS 활성화 |
| `002_rls_policies.sql` | 테이블별 RLS 정책 (`auth.uid() = user_id` 등) |
| `003_carry_over_todos.sql` | RPC 함수: 미완료 todo 일괄 이월 (트랜잭션) |
| `004_recalc_epic_progress.sql` | RPC 함수: epic 진행률 재계산 (또는 view 로 대체) |
| `005_realtime_publication.sql` | `supabase_realtime` 발행에 테이블 추가 — **MVP 범위 (결정 #4 확정)** |

### 5.2 RPC 함수 작성 원칙

- `language plpgsql security definer set search_path = public`
- 함수 본문 첫 줄: `if auth.uid() is null then raise exception 'unauthorized'; end if;`
- WHERE 절에 `auth.uid()` 명시로 본인 데이터만 조작
- `grant execute … to authenticated` / `revoke … from anon, public`

### 5.3 Dashboard 에서 손볼 것

- **Authentication → URL Configuration**: Site URL = `https://<slug>.vercel.app`, Redirect URLs 화이트리스트에 다음 등록
  - `https://<slug>.vercel.app/auth/callback` (웹 — MVP)
  - `dopamine-planner://auth/callback` (모바일 deep link — MVP. 후속 데스크탑도 동일 스킴 사용 가능)
- **Authentication → Providers**: **Google 만 활성화 (MVP — 결정 #3 확정)**. Kakao 는 후속 (사업자 등록 검토 필요)
- **Database**: 마이그레이션은 코드로 관리 (`supabase db push`) — Dashboard 직접 수정 금지

---

## 6. OAuth 흐름 — 플랫폼별

| 플랫폼 | 흐름 |
|---|---|
| **웹 (브라우저)** ─ MVP | `signInWithOAuth({ redirectTo: 'https://<slug>.vercel.app/auth/callback' })` → 콜백 Route Handler 가 `exchangeCodeForSession` → `/life` redirect |
| **모바일 (Expo)** ─ MVP | `expo-auth-session` + `dopamine-planner://auth/callback` → `exchangeCodeForSession` |
| **데스크탑 (Electron)** 🔮 후속 | "Google 로그인" 클릭 → `shell.openExternal(supabase OAuth URL)` (Google 의 webview 차단 우회) → 사용자 기본 브라우저에서 동의 → 콜백이 `dopamine-planner://auth/callback?code=...` 로 앱에 복귀 → main process 가 deep link 수신 → renderer 의 `exchangeCodeForSession(code)` 호출 |

→ **공통**: Supabase Dashboard 의 redirect 화이트리스트에 웹·모바일 2가지 URL 등록 (데스크탑은 후속 도입 시 모바일과 동일 스킴 사용).

---

## 7. 마이그레이션 단계 (실행 순서)

### Phase 0: 결정 사항 확정 ✅ (2026-05-03 완료)

§9.1 MVP 결정 7개 모두 확정. 결정 결과는 §9.1 표 참조. 본 Phase 는 종료.

### Phase 1: 문서 정비 (코드 변경 없음)

- 본 마이그레이션 플랜 문서 (이 파일) 작성 — **본 step 으로 작성 중**
- `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` v2 갱신 (스택·아키텍처·API 접근 섹션)
- `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` 갱신 — Next.js API Routes 섹션 제거, RPC 함수 시그니처 추가
- 루트 `CLAUDE.md` — 기술 스택 표 + 프로젝트 구조 갱신
- `docs/CLAUDE.md` — 폴더 구조·문서 운영 규칙 갱신
- `apps/web/CLAUDE.md` — SPA 전제로 다시 씀
- `apps/mobile/CLAUDE.md` — WebView 제거, 네이티브 RN 전제

### Phase 2: 패키지 골격 정비

1. `packages/core` 신설 (`package.json`, `tsconfig.json`, `src/index.ts`)
2. `packages/shared` 의 도메인 매퍼/뷰모델 → `packages/core/src/domain/` 으로 이전 (지금은 거의 비어 있어 영향 작음)
3. **`packages/ui-mobile` 미신설 (결정 #2 확정)** — RN 컴포넌트는 `apps/mobile/src/components/` 에 직접 둔다
4. **`packages/config/tailwind.config.js` 공유 토큰 정의 (결정 #5 — Nativewind 자동 매핑 source of truth)**
5. 모든 앱의 `package.json` 에 `@todo-list/core` 추가

### Phase 3: Supabase 인프라

1. `supabase init` (이미 있으면 skip)
2. 마이그레이션 작성 (§5.1) — 스키마 + RLS + RPC + **realtime publication (결정 #4 — MVP 포함)**
3. 로컬: `supabase db reset` 으로 검증
4. 원격 적용은 사용자가 직접 (`supabase link` + `supabase db push`)
5. `supabase gen types typescript` 로 `packages/shared/src/database.ts` 생성

### Phase 4: 웹 SPA 구현 (`apps/web`)

1. `next.config.ts` 에 `output: 'export'` 추가 (결정 #1 — Next.js 15 export 확정)
2. `apps/web/src/lib/supabase/{browser,server}.ts` — `packages/core` 의 팩토리 사용으로 단순화
3. `(auth)/login/page.tsx` + `OAuthButton.tsx` (이전 작업 재활용) — **Google 만 노출 (결정 #3)**
4. `(main)/layout.tsx` — RSC 가드 (export 모드에서는 client-side 가드로 전환 필요)
5. `auth/callback/route.ts` — code 교환 (서버에서만 가능한 Route Handler 그대로 유지)
6. **Realtime 구독 훅 사용 (결정 #4)** — `packages/core/src/realtime/subscribeTodos.ts` 를 메인 일자 뷰에 연결
7. **Vercel git 연동 자동 배포 셋업 (결정 #6)** — `dev` push → preview, `main` push → production
8. `apps/web/src/app/api/**` 가 만약 존재하면 **삭제** (현재는 없음)

### Phase 5: 모바일 재구성 (`apps/mobile`)

1. `react-native-webview` 의존성 제거
2. **Nativewind v4 설치 + `tailwind.config.js` 공유 (결정 #5)** — `packages/config` 의 토큰 import + babel/metro 설정
3. expo-router 기반 화면 작성 (Life/Work 워크스페이스, 메인 일자 뷰) — RN 컴포넌트는 `apps/mobile/src/components/` 직배치
4. `expo-auth-session` 으로 OAuth 처리 — **`dopamine-planner://auth/callback` 스킴 등록 (결정 #7)**
5. `@todo-list/core` 의 훅 재사용 (storage 는 `AsyncStorage` 주입)
6. **Realtime 구독 사용 (결정 #4)** — 다중 디바이스 sync 동작 확인
7. EAS Build 설정 (`eas.json`)

### Phase 6: 새 PRD 문서 작성

이전에 잘라낸 Sub-PRD 들 (인증 등) 은 v2 구조에 맞게 재작성. v2 폴더 구조 (`docs/base/` 디자인 자산 + `docs/dev/` 개발 PRD) 가 정착되었으므로 신규 PRD 는 `docs/dev/<yyyymmdd-nn-project-name>/` 형태로 추가한다 (`docs/CLAUDE.md` §문서 유형 / 작업 순서 참조).

### 🔮 후속 마일스톤 — 데스크탑 도입 (MVP 범위 밖)

웹 SPA + 모바일 MVP 가 안정화된 뒤, 데스크탑 사용자가 늘어나거나 시스템 통합(트레이/단축키/오프라인) 가치가 커지면 별도 마일스톤으로 진행한다. 이미 §2.1 / §2.2 / §6 에 적용 절차가 기록되어 있다.

1. `apps/desktop/` 신설 — Electron 프로젝트 boilerplate (electron-vite 또는 electron-forge)
2. main process: `BrowserWindow` 가 `https://<slug>.vercel.app` loadURL
3. main process: custom protocol `dopamine-planner://` 등록 + deep link 핸들러
4. preload: renderer 에 deep link 이벤트 노출 (`contextBridge`)
5. renderer 는 SPA 그대로 사용 — Electron 환경 감지 시 OAuth 만 외부 브라우저로 분기
6. 빌드 산출물: `dmg`/`exe` — 1단계 GitHub Releases 수동 업로드, 사용자 수 증가 시 `electron-updater` + 코드 사인 도입 (§2.2)
7. `apps/desktop/CLAUDE.md`, `env/.env.desktop.example` 동시 신설
8. `@todo-list/ui` 가 데스크탑에서도 사용되므로 패키지 의존자에 `desktop` 추가

---

## 8. 책임 경계 규칙 (v2 — `docs/CLAUDE.md` 갱신 예정 내용)

| 영역 | 책임 PRD 유형 |
|---|---|
| `supabase/migrations/**`, `supabase/**` | **DB PRD** (이전 "서버 PRD" 의 후신) |
| `packages/shared/**` (타입·enum) | DB PRD (스키마 변경의 결과물) |
| `packages/core/**` (비즈니스 로직) | **공통 클라이언트 PRD** |
| `packages/ui/**` (`packages/ui-mobile/**` 는 MVP 미신설 — 모바일 RN 컴포넌트는 `apps/mobile/src/components/**`) | UI PRD (또는 공통 클라이언트 PRD) |
| `apps/web/**` | 웹 PRD |
| `apps/mobile/**` | 모바일 PRD |
| `apps/desktop/**` 🔮 후속 | 데스크탑 PRD (MVP 범위 밖) |

→ "Vercel Serverless 백엔드" 가 사라지므로 기존 "서버 vs 클라이언트" 경계가 무의미. **DB / 공통 클라이언트 / 플랫폼별 클라이언트** 3계층으로 재정립.

---

## 9. 결정 사항

### 9.1 MVP 결정 항목 — ✅ 2026-05-03 확정

| # | 결정 항목 | 선택지 | 추천 | **사용자 답변 (확정)** |
|---|---|---|---|---|
| 1 | 웹 프레임워크 | (a) Next.js 15 + `output: 'export'` (현 코드 재활용) (b) Vite + React Router (가장 가벼운 SPA) | **(a)** — auth/callback Route Handler 만 서버에서 동작, 나머지 정적. 마이그레이션 비용 최소 | **(a) 확정** — 추천 일치 |
| 2 | `packages/ui-mobile` | (a) 신설 — RN 컴포넌트 분리 (b) 미신설 — `apps/mobile/src/components/` 에 직접 | **(b) MVP** — 모바일 컴포넌트 수가 적은 동안 분리 비용 ↑. 나중에 재사용 발생하면 추출 | **(b) 확정** — 추천 일치 |
| 3 | OAuth Provider 우선순위 | Google + Kakao 동시 vs 단계적 | **MVP Google 만, Kakao 후속** 권장 (Kakao 는 사업자 등록 필요할 수 있음) | **Google 만 확정 (Kakao 후속)** — 추천 일치 |
| 4 | Realtime MVP 포함? | (a) 마이그레이션과 같이 (Phase 3 Supabase 인프라에 포함) (b) MVP 후 추가 | (b) — 단일 디바이스 검증 후 | **(a) 확정** — ⚠️ 추천 비일치. **MVP 스코프 확장** (Phase 4·5 에 Realtime 구독 작업 추가, §10 검증에 다중 디바이스 sync 추가) |
| 5 | 디자인 토큰 RN 매핑 | (a) 자동 (Tailwind → StyleSheet, Nativewind) (b) 수동 매핑 (`packages/shared/src/tokens.ts`) | (b) — 단순. 자동화는 후속 | **(a) 확정** — ⚠️ 추천 비일치. **Nativewind v4 도입** (§4.2 절 신설, Phase 5 에 셋업 단계 추가). 도구 셋업 비용 ↑ 대신 토큰 동기화 비용 ↓ |
| 6 | `apps/web` deploy 방식 | (a) Vercel git 연동 자동 (b) 수동 `vercel deploy` | **(a)** — 표준 | **(a) 확정** — 추천 일치 |
| 7 | `dopamine-planner://` 모바일 스킴 명 | (a) 그대로 (b) 다른 이름 (`dp-planner` 등) | 사용자 선택 | **`dopamine-planner://` 확정** (기본값 유지) |

> **추천 비일치 항목 영향 요약**: #4 (Realtime MVP 포함) 와 #5 (Nativewind 자동 매핑) 채택으로 MVP 스코프가 확장됐다. 이로 인한 추가 작업은 Phase 3·4·5 와 §10 검증 계획에 반영됨.

### 9.2 🔮 후속 마일스톤 결정 항목 (데스크탑 도입 시점에 답)

| # | 결정 항목 | 선택지 | 추천 |
|---|---|---|---|
| D-1 | Electron 전략 | (a) `loadURL(<vercel>)` — 항상 최신, 인터넷 필수 (b) Next.js export 결과를 앱에 번들 — 오프라인 동작 | **(a)** 도입 초기, **(b)** 오프라인 요구가 생긴 시점에 전환 |
| D-2 | 데스크탑 자동 업데이트 시점 | (a) 도입 초기부터 `electron-updater` + 코드 사인 (Apple Developer + Windows EV cert) (b) 초기 GitHub Releases 수동 다운로드, 사용자 늘면 자동 업데이트 도입 | **(b)** — §2.2 의 단계별 전략 채택 |

---

## 10. 검증 계획

각 Phase 종료 시점:

| Phase | 검증 |
|---|---|
| 1 | 모든 변경 문서 로컬 git diff 검토. 외부 링크 깨짐 없음 |
| 2 | `pnpm -r build` 통과 (`packages/core` 빈 export 라도 빌드 성공) |
| 3 | `supabase db reset` (로컬) 후 RPC 직접 호출 테스트: `supabase functions invoke` 또는 SQL Studio 에서 `select carry_over_todos('2026-05-02')` |
| 4 | `pnpm --filter @todo-list/web build` + `dev` 로 `/login` 렌더 + Google OAuth → `/life` 진입 + **Realtime 구독 훅 동작 (DB 직접 조작 시 UI 즉시 반영)** |
| 5 | `pnpm --filter @todo-list/mobile dev` (`expo start`) iOS 시뮬레이터 부팅 + OAuth → 홈 화면 진입 + **Nativewind className 정상 매핑 (디자인 토큰 색상/간격 일치)** + **다중 디바이스 Realtime sync 검증** (웹 + iOS 시뮬레이터 동시 접속, 한쪽에서 todo 추가 시 양쪽 즉시 반영) |
| 6 | 새 PRD 문서들이 v2 책임 경계 (§8) 를 침해하지 않음 |
| 🔮 후속 (데스크탑) | `pnpm --filter @todo-list/desktop dev` 로 Electron 창 기동 + Vercel 배포 SPA 로드 + deep link 콜백 수신 |

---

## 11. 보존된 작업

`legacy/initialize` 브랜치에 v1 마지막 작업 (서버 Sub-PRD 산출물 + 클라이언트 인증 작업) 이 보존됨. v2 구현 시 다음을 참고 가능:

- `apps/web/src/lib/supabase/{browser,server,middleware}.ts` — Supabase 클라이언트 패턴
- `apps/web/src/app/(auth)/login/` — 로그인 화면 + OAuth 버튼
- `apps/web/src/app/auth/callback/route.ts` — code 교환 라우트
- `apps/web/src/app/(main)/layout.tsx` — RSC 인증 가드 (단, export 모드 전환 시 client-side 로 변환 필요)

⚠️ `apps/web/src/app/api/**` (carry-over, progress) 은 v2 에서 **재사용하지 않음** — RPC 로 완전 이전.

---

## 12. 다음 액션

1. ~~**사용자**: §9 MVP 결정 항목 7개 답변~~ ✅ 2026-05-03 완료 (§9.1 참조)
2. **에이전트**: Phase 1 (문서 정비 — 루트 `CLAUDE.md`, `docs/CLAUDE.md`, `apps/web/CLAUDE.md`, `apps/mobile/CLAUDE.md`, `API_CONTRACT.md`) 실행. 각 Phase 종료 시 사용자 검토 후 다음 진행
3. 후속 데스크탑 결정 D-1/D-2 는 도입 시점에 답
