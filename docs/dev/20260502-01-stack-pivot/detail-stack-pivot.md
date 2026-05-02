# Dopamine Planner 스택 전환 마이그레이션 플랜

> 작성일: 2026-05-02
> 상태: Draft
> 기반 문서: [`detail-todo-service-initialize.md`](../20260502-02-todo-list-initialize/detail-todo-service-initialize.md) (v1 → v2 갱신 대상)

---

## 1. Context — 왜 전환하나

기존 v1 구조는 **웹 우선 + 모바일 WebView 래핑 + Next.js API Routes 백엔드** 였다.

- 자체 서버(Next.js API Routes)가 비즈니스 로직(carry-over, progress) 을 담당 → `SUPABASE_SERVICE_ROLE_KEY` 가 Vercel 환경에 상주
- 모바일은 웹의 WebView 래퍼 — 네이티브 UX 한계
- 도메인이 사실상 필수 (Vercel 함수 호출 경로)

**목표 상태 (v2)**: **노션 스타일** — React SPA 1개 + Electron(데스크탑) + Expo(모바일 네이티브) + Supabase BaaS + Postgres RPC.

- 비즈니스 로직 = 클라이언트 + Postgres RPC. 자체 서버 0
- 데스크탑은 Electron 으로 SPA wrapping (Vercel 기본 도메인 사용 — 커스텀 도메인 불필요)
- 모바일은 RN 네이티브 (WebView 아님) — 비즈니스 로직만 공유
- `SERVICE_ROLE_KEY` 가 클라이언트 환경 어디에도 노출되지 않음

---

## 2. 목표 아키텍처

```
┌────────────────────────────────────────────────────────────┐
│  React SPA  (apps/web)                                      │
│  └─ Next.js 15 (output: 'export') → 정적 SPA                │
│     └─ /auth/callback Route Handler (OAuth code 교환만)      │
└────────────────────────────────────────────────────────────┘
       │                       │                       │
       │ deploy                │ wrap                  │
       ▼                       ▼                       │
  [Vercel 기본 도메인]    [Electron]                    │
  <slug>.vercel.app      apps/desktop/                  │
  · 누구나 접속           · loadURL 또는 번들             │
  · OAuth 콜백 호스트       · OAuth 는 외부 브라우저       │
                              + custom URI scheme        │
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  Expo (RN 네이티브)│
                                              │  apps/mobile/    │
                                              │  · 자체 RN 화면    │
                                              │  · expo-auth-session
                                              └────────┬─────────┘
                                                       │
                       packages/core (TS 비즈니스 로직 공유)
                       ─────────────────────────────────
                       · Supabase 클라이언트 팩토리
                       · 도메인 모델 + 매퍼
                       · 서비스 함수 (carry-over, progress 호출)
                       · TanStack Query 훅
                                                       │
                                                       ▼
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
| 웹 SPA | Vercel (기본 `<slug>.vercel.app`) | 커스텀 도메인 X |
| 데스크탑 (.dmg / .exe) | **MVP**: GitHub Releases (수동 다운로드, 코드 사인 X) <br>**후속**: GitHub Releases 를 백엔드로 한 `electron-updater` 자동 업데이트 + 코드 사인 | §2.2 참조 |
| 모바일 (.ipa / .apk) | EAS Build → 스토어 | Expo SDK 52 |
| DB / Auth / Realtime | Supabase | RPC 함수 포함 |

### 2.2 데스크탑 배포 — 단계별 전략

데스크탑 배포는 **2단계** 로 진행한다. GitHub Releases 와 auto-update 는 배타적이지 않으며, auto-update 를 켜도 GitHub Releases 가 그대로 업데이트 백엔드 역할을 한다.

| 단계 | 모드 | 방식 | 코드 사인 | 사용자 경험 | 연 비용 |
|---|---|---|---|---|---|
| **MVP (본인 + 초기 베타 테스터)** | **수동** | GitHub Releases 에 `.dmg`/`.exe` 업로드. 사용자가 직접 받아서 설치. 새 버전 알림 X | ❌ (안 하면 macOS Gatekeeper / Windows SmartScreen 경고 — "우클릭 → 열기" 안내) | 매번 사이트 가서 재다운로드 | $0 |
| **후속 (수십 명 +)** | **자동 업데이트** | `electron-updater` (또는 Tauri updater) 가 GitHub Releases API 폴링 → 자동 다운로드 → 재시작 시 적용 | ✅ 사실상 필수 (사인 안 된 앱은 OS 가 자동 설치 차단) | 클릭 1번 (또는 백그라운드) | $99 (Apple Developer) + $300+ (Windows EV cert) |

**전환 시점 기준**: 사용자가 "수동으로 새 버전 받기" 가 마찰로 느껴지기 시작할 때 (보통 수십 명 + 또는 정기 업데이트 시작 시점). MVP 단계에서는 수동으로 충분.

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
│   ├── web/            Next.js 15 (App Router) — output: 'export' SPA
│   │   ├── src/app/    (auth)/, (main)/, auth/callback/route.ts
│   │   └── ⚠️ src/app/api/ ❌ 없음 (RPC 로 이전)
│   ├── desktop/        🆕 Electron (TS) — loadURL or bundle
│   │   ├── src/main/   main process (OAuth deep link 핸들러)
│   │   ├── src/preload/
│   │   └── package.json
│   └── mobile/         Expo (네이티브, WebView 제거)
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
│   ├── ui/             웹·데스크탑 공유 React 컴포넌트 (shadcn/ui)
│   ├── ui-mobile/      🆕 RN 컴포넌트 (모바일 전용) — 선택
│   └── config/         eslint / tsconfig / prettier 공유
├── supabase/
│   ├── migrations/     🆕 DB 스키마 + RPC 함수 SQL
│   └── config.toml
└── env/
    ├── .env.web.example       NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/AUTH_REDIRECT_URL
    ├── .env.desktop.example   🆕 (동일 + DESKTOP_PROTOCOL_SCHEME)
    └── .env.mobile.example    EXPO_PUBLIC_SUPABASE_URL/ANON_KEY
```

**중요**: `SUPABASE_SERVICE_ROLE_KEY` 환경 변수는 **모든 앱에서 제거**. RPC 함수가 `SECURITY DEFINER` 로 권한 우회를 함수 본문에서 한정해 처리.

---

## 4. 패키지 책임 재정립

| 패키지 | 책임 | 의존자 |
|---|---|---|
| `@todo-list/shared` | API I/O 타입, enum (`Workspace`, `Priority`, `Status` 등). DB Row 타입 자동생성 결과 | core, ui, ui-mobile, web, desktop, mobile |
| `@todo-list/core` 🆕 | 비즈니스 로직 — Supabase 클라이언트 팩토리, 매퍼, 서비스 함수, Query 훅, Realtime 헬퍼. **플랫폼 독립 TS 만** | web, desktop, mobile |
| `@todo-list/ui` | React + shadcn/ui 컴포넌트. 웹/데스크탑 공유 | web, desktop |
| `@todo-list/ui-mobile` 🆕 | RN 컴포넌트. 디자인 토큰을 RN StyleSheet 로 매핑 | mobile |
| `@todo-list/config` | tsconfig.base.json, eslint preset, prettier config | 모든 앱·패키지 |

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

---

## 5. Supabase 측 변경

### 5.1 추가할 마이그레이션 (`supabase/migrations/`)

| 파일 | 내용 |
|---|---|
| `001_initial_schema.sql` | `profile`, `category`, `epic_issue`, `sub_issue` 테이블 + RLS 활성화 |
| `002_rls_policies.sql` | 테이블별 RLS 정책 (`auth.uid() = user_id` 등) |
| `003_carry_over_todos.sql` | RPC 함수: 미완료 todo 일괄 이월 (트랜잭션) |
| `004_recalc_epic_progress.sql` | RPC 함수: epic 진행률 재계산 (또는 view 로 대체) |
| `005_realtime_publication.sql` | `supabase_realtime` 발행에 테이블 추가 |

### 5.2 RPC 함수 작성 원칙

- `language plpgsql security definer set search_path = public`
- 함수 본문 첫 줄: `if auth.uid() is null then raise exception 'unauthorized'; end if;`
- WHERE 절에 `auth.uid()` 명시로 본인 데이터만 조작
- `grant execute … to authenticated` / `revoke … from anon, public`

### 5.3 Dashboard 에서 손볼 것

- **Authentication → URL Configuration**: Site URL = `https://<slug>.vercel.app`, Redirect URLs 화이트리스트에 다음 등록
  - `https://<slug>.vercel.app/auth/callback` (웹)
  - `https://<slug>.vercel.app/auth/callback?desktop=1` (데스크탑이 외부 브라우저로 콜백 수신 후 deep link 로 앱에 복귀하는 패턴 사용 시 별도 페이지 필요할 수 있음)
  - `dopamine-planner://auth/callback` (모바일 + 데스크탑 deep link)
- **Authentication → Providers**: Google / Kakao 활성화
- **Database**: 마이그레이션은 코드로 관리 (`supabase db push`) — Dashboard 직접 수정 금지

---

## 6. OAuth 흐름 — 플랫폼별

| 플랫폼 | 흐름 |
|---|---|
| **웹 (브라우저)** | `signInWithOAuth({ redirectTo: 'https://<slug>.vercel.app/auth/callback' })` → 콜백 Route Handler 가 `exchangeCodeForSession` → `/life` redirect |
| **데스크탑 (Electron)** | "Google 로그인" 클릭 → `shell.openExternal(supabase OAuth URL)` (Google 의 webview 차단 우회) → 사용자 기본 브라우저에서 동의 → 콜백이 `dopamine-planner://auth/callback?code=...` 로 앱에 복귀 → main process 가 deep link 수신 → renderer 의 `exchangeCodeForSession(code)` 호출 |
| **모바일 (Expo)** | `expo-auth-session` + `dopamine-planner://auth/callback` → `exchangeCodeForSession` |

→ **공통**: Supabase Dashboard 의 redirect 화이트리스트에 위 3가지 URL 모두 등록.

---

## 7. 마이그레이션 단계 (실행 순서)

### Phase 0: 결정 사항 확정 (사용자 입력 필요)

본 플랜의 **§9 미결정 사항** 답변. 특히 (a) 웹 프레임워크 (Next.js export vs Vite), (b) Electron loadURL vs 번들, (c) `packages/ui-mobile` 신설 여부.

### Phase 1: 문서 정비 (코드 변경 없음)

- 본 마이그레이션 플랜 문서 (이 파일) 작성 — **본 step 으로 작성 중**
- `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` v2 갱신 (스택·아키텍처·API 접근 섹션)
- `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` 갱신 — Next.js API Routes 섹션 제거, RPC 함수 시그니처 추가
- 루트 `CLAUDE.md` — 기술 스택 표 + 프로젝트 구조 갱신
- `docs/CLAUDE.md` — 서버·클라이언트 책임 경계 규칙을 "**클라이언트 (web/desktop/mobile) vs DB/RPC**" 로 재서술
- `apps/web/CLAUDE.md` — SPA 전제로 다시 씀
- `apps/mobile/CLAUDE.md` — WebView 제거, 네이티브 RN 전제
- `apps/desktop/CLAUDE.md` — 신규

### Phase 2: 패키지 골격 정비

1. `packages/core` 신설 (`package.json`, `tsconfig.json`, `src/index.ts`)
2. `packages/shared` 의 도메인 매퍼/뷰모델 → `packages/core/src/domain/` 으로 이전 (지금은 거의 비어 있어 영향 작음)
3. `packages/ui-mobile` 신설 여부는 Phase 0 결과에 따라 결정
4. 모든 앱의 `package.json` 에 `@todo-list/core` 추가

### Phase 3: Supabase 인프라

1. `supabase init` (이미 있으면 skip)
2. 마이그레이션 작성 (§5.1) — 스키마 + RLS + RPC + realtime publication
3. 로컬: `supabase db reset` 으로 검증
4. 원격 적용은 사용자가 직접 (`supabase link` + `supabase db push`)
5. `supabase gen types typescript` 로 `packages/shared/src/database.ts` 생성

### Phase 4: 웹 SPA 구현 (`apps/web`)

1. `next.config.ts` 에 `output: 'export'` 추가 (Phase 0 의 (a) 가 Next 인 경우)
2. `apps/web/src/lib/supabase/{browser,server}.ts` — `packages/core` 의 팩토리 사용으로 단순화
3. `(auth)/login/page.tsx` + `OAuthButton.tsx` (이전 작업 재활용)
4. `(main)/layout.tsx` — RSC 가드 (export 모드에서는 client-side 가드로 전환 필요)
5. `auth/callback/route.ts` — code 교환 (서버에서만 가능한 Route Handler 그대로 유지)
6. `apps/web/src/app/api/**` 가 만약 존재하면 **삭제** (현재는 없음)

### Phase 5: 데스크탑 (`apps/desktop`) 신설

1. Electron 프로젝트 boilerplate (electron-vite 또는 electron-forge)
2. main process: `BrowserWindow` 가 `https://<slug>.vercel.app` loadURL
3. main process: custom protocol `dopamine-planner://` 등록 + deep link 핸들러
4. preload: renderer 에 deep link 이벤트 노출 (`contextBridge`)
5. renderer (UI) 는 SPA 그대로 사용 — Electron 환경 감지 시 OAuth 만 외부 브라우저로 분기
6. 빌드 산출물: `dmg` (mac), `exe` (windows) — MVP 는 GitHub Releases 수동 업로드

### Phase 6: 모바일 재구성 (`apps/mobile`)

1. `react-native-webview` 의존성 제거
2. expo-router 기반 화면 작성 (Life/Work 워크스페이스, 메인 일자 뷰)
3. `expo-auth-session` 으로 OAuth 처리
4. `@todo-list/core` 의 훅 재사용 (storage 는 `AsyncStorage` 주입)
5. EAS Build 설정 (`eas.json`)

### Phase 7: 새 PRD 문서 작성

이전에 잘라낸 Sub-PRD 들 (인증 등) 은 v2 구조에 맞게 재작성. v2 폴더 구조 (`docs/base/` 디자인 자산 + `docs/dev/` 개발 PRD) 가 정착되었으므로 신규 PRD 는 `docs/dev/<yyyymmdd-nn-project-name>/` 형태로 추가한다 (`docs/CLAUDE.md` §문서 유형 / 작업 순서 참조).

---

## 8. 책임 경계 규칙 (v2 — `docs/CLAUDE.md` 갱신 예정 내용)

| 영역 | 책임 PRD 유형 |
|---|---|
| `supabase/migrations/**`, `supabase/**` | **DB PRD** (이전 "서버 PRD" 의 후신) |
| `packages/shared/**` (타입·enum) | DB PRD (스키마 변경의 결과물) |
| `packages/core/**` (비즈니스 로직) | **공통 클라이언트 PRD** |
| `packages/ui/**`, `packages/ui-mobile/**` | UI PRD (또는 공통 클라이언트 PRD) |
| `apps/web/**` | 웹 PRD |
| `apps/desktop/**` | 데스크탑 PRD |
| `apps/mobile/**` | 모바일 PRD |

→ "Vercel Serverless 백엔드" 가 사라지므로 기존 "서버 vs 클라이언트" 경계가 무의미. **DB / 공통 클라이언트 / 플랫폼별 클라이언트** 3계층으로 재정립.

---

## 9. 미결정 사항 (Phase 0 에서 답 필요)

| # | 결정 항목 | 선택지 | 추천 |
|---|---|---|---|
| 1 | 웹 프레임워크 | (a) Next.js 15 + `output: 'export'` (현 코드 재활용) (b) Vite + React Router (가장 가벼운 SPA) | **(a)** — auth/callback Route Handler 만 서버에서 동작, 나머지 정적. 마이그레이션 비용 최소 |
| 2 | Electron 전략 | (a) `loadURL(<vercel>)` — 항상 최신, 인터넷 필수 (b) Next.js export 결과를 앱에 번들 — 오프라인 동작 | **(a) MVP, (b) 후속** — MVP 는 단순함 우선, 후속에서 오프라인 지원 |
| 3 | `packages/ui-mobile` | (a) 신설 — RN 컴포넌트 분리 (b) 미신설 — `apps/mobile/src/components/` 에 직접 | **(b) MVP** — 모바일 컴포넌트 수가 적은 동안 분리 비용 ↑. 나중에 재사용 발생하면 추출 |
| 4 | 디자인 토큰 RN 매핑 | (a) 자동 (Tailwind → StyleSheet) (b) 수동 매핑 (`packages/shared/src/tokens.ts`) | **(b)** — 단순. 자동화는 후속 |
| 5 | `apps/web` deploy 방식 | (a) Vercel git 연동 자동 (b) 수동 `vercel deploy` | **(a)** — 표준 |
| 6 | `dopamine-planner://` 스킴 명 | (a) 그대로 (b) 다른 이름 (`dp-planner` 등) | 사용자 선택 |
| 7 | OAuth Provider 우선순위 | Google + Kakao 동시 vs 단계적 | **MVP Google 만, Kakao 후속** 권장 (Kakao 는 사업자 등록 필요할 수 있음) |
| 8 | Realtime Phase 1 포함? | (a) 마이그레이션과 같이 (b) MVP 후 추가 | **(b)** — 단일 디바이스 검증 후 |
| 9 | 데스크탑 자동 업데이트 시점 | (a) MVP 부터 `electron-updater` + 코드 사인 (Apple Developer + Windows EV cert) (b) MVP 는 GitHub Releases 수동 다운로드, 후속에서 자동 업데이트 도입 | **(b)** — §2.2 의 단계별 전략 채택. 사용자 수가 늘어날 때 (a) 로 승격 |

---

## 10. 검증 계획

각 Phase 종료 시점:

| Phase | 검증 |
|---|---|
| 1 | 모든 변경 문서 로컬 git diff 검토. 외부 링크 깨짐 없음 |
| 2 | `pnpm -r build` 통과 (`packages/core` 빈 export 라도 빌드 성공) |
| 3 | `supabase db reset` (로컬) 후 RPC 직접 호출 테스트: `supabase functions invoke` 또는 SQL Studio 에서 `select carry_over_todos('2026-05-02')` |
| 4 | `pnpm --filter @todo-list/web build` + `dev` 로 `/login` 렌더 + OAuth 외부 브라우저 → `/life` 진입 |
| 5 | `pnpm --filter @todo-list/desktop dev` 로 Electron 창 기동 + Vercel 배포 SPA 로드 + deep link 콜백 수신 |
| 6 | `pnpm --filter @todo-list/mobile dev` (`expo start`) iOS 시뮬레이터 부팅 + OAuth → 홈 화면 진입 |
| 7 | 새 PRD 문서들이 v2 책임 경계 (§8) 를 침해하지 않음 |

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

1. **사용자**: §9 결정 항목 8개 답변
2. **에이전트**: 답변 받은 후 Phase 1 (문서 정비) 부터 순차 실행. 각 Phase 종료 시 사용자 검토 후 다음 진행
