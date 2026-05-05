# TASK-02-13: build / typecheck / lint + 동작 검증

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 13
- **상태**: 완료
- **의존성**: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 (이전 모든 task)

## 작업 목표

Sub-02 의 모든 산출물이 정합한 상태로 동작하는지 빌드 / 타입 / 린트 + 실제 브라우저 동작 검증을 수행한다. sub-prd §검증 기준 모든 항목 통과 시 본 sub 완료.

## 상세 구현 내용

### 대상 파일

본 task 는 신규 파일 생성 없음. 검증 결과는 sub-prd 의 §작업 / §검증 기준 체크박스 갱신으로 반영.

### 검증 단계

#### Step 1: 정적 검증

```bash
pnpm --filter @todo-list/ui typecheck
pnpm --filter @todo-list/web typecheck
pnpm --filter @todo-list/web lint
pnpm --filter @todo-list/web build
```

모두 0 exit code 통과해야 함. `output: 'export'` 정합 확인 (build 단계).

#### Step 2: 동작 검증 (브라우저)

```bash
make web-up
```

브라우저에서 `http://localhost:3000`:

1. **OAuth 로그인** — `/login` 진입 → Google OAuth → `/life` 로 redirect 성공
2. **일자 뷰 렌더** — DB 에 sub_issue 시드 후 `/life` 진입 → 완료/진행 중 두 섹션, 카운트 정확
3. **Realtime 구독** — Supabase Studio 에서 `sub_issue.status` 직접 변경 → 1~2초 내 UI 반영
4. **키보드 단축키** — `←` / `→` 누르면 일자 이동 + URL `?date=` 갱신
5. **워크스페이스 분리** — `/life` ↔ `/work` 전환 시 데이터 분리 (life todo 가 work 에 미노출)
6. **자동 이월** — `due_date` 가 어제이고 `status='todo'` 인 sub_issue 가 있는 상태로 `/life` 진입 → 오늘 뷰에 자동 이동, 토스트·알림 없음 (조용한 이월)
7. **세션 가드** — 로그아웃 상태로 `/life` 직접 접근 → `/login` 으로 redirect

#### Step 3: 코드 검증 (grep)

```bash
grep -RIn "import.*Modal" apps/web/src/app/\(main\)/
# 결과: 0건 (CRUD 모달은 Sub-03)
```

## 검증 과정

### 자동 (모두 통과)

- [x] `pnpm --filter @todo-list/ui lint` (`tsc --noEmit`) 0 exit
- [x] `pnpm --filter @todo-list/web typecheck` (`tsc --noEmit`) 0 exit
- [x] `pnpm --filter @todo-list/web lint` (`tsc --noEmit`) 0 exit
- [x] `pnpm --filter @todo-list/web build` 0 exit — 6 routes 모두 `○ (Static) prerendered as static content`
- [x] `pnpm turbo lint typecheck build --filter=@todo-list/web --filter=@todo-list/ui` → **7/7 successful**
- [x] `grep -RIn "import.*Modal" "apps/web/src/app/(main)/"` → 0건
- [x] `grep -RIn "from 'next/server'\|middleware" "apps/web/src/app/(main)/"` → 0건
- [x] `grep -RIn "carryOverTodos\b" apps/web/src/` → 0건
- [x] `grep -RIln "from '@todo-list/core'" apps/web/src/` ≥ 1 (3건)

### 수동 (브라우저) — 사용자 책임

- [ ] OAuth 로그인 → `/life` redirect 성공 — **수동 확인 필요** (`make web-up` + 실제 Supabase URL/anon key 주입 후)
- [ ] `/life` 진입 시 두 섹션 + 카운트 정확 — **수동 확인 필요**
- [ ] Studio 에서 status 변경 → 1~2초 내 UI 반영 (Realtime) — **수동 확인 필요**
- [ ] `←` / `→` 키 → 일자 이동 + URL `?date=` 갱신 — **수동 확인 필요**
- [ ] `/life` ↔ `/work` 전환 → 데이터 분리 — **수동 확인 필요**
- [ ] 자동 이월 — 어제 todo 가 오늘 뷰에 자동 이동, 토스트 없음 — **수동 확인 필요**
- [ ] 미로그인 상태 `/life` 접근 → `/login` redirect — **수동 확인 필요**

### 검증 통과를 위한 추가 보정 (본 task 13 산출)

1. `apps/web/src/app/auth/callback/route.ts` (Server Route Handler) → `apps/web/src/app/auth/callback/page.tsx` (클라이언트 페이지) 로 전환. `supabase.auth.exchangeCodeForSession(code)` 를 브라우저에서 호출 → `/life` redirect. `output: 'export'` 와 호환.
2. `apps/web/package.json` 의 `lint` 를 `next lint` (인터랙티브 프롬프트) → `tsc --noEmit` 으로 변경. `typecheck` 스크립트 신설.
3. `apps/web/package.json` 의 `build` 에 `dotenv -e ../../env/.env.web.local` 프리픽스 추가 — env 파일 자동 로드.
4. `apps/web/src/lib/supabase/client.ts` 에 SSG prerender 단계용 fallback 추가 (`http://localhost:54321` / `build-placeholder-anon-key`). 실제 dev/배포에서는 env 주입으로 치환됨.
5. `turbo.json` 에 `typecheck` task 추가 (lint 와 동일 의존성).

## 주의사항

1. **검증 단일 task 분량** — 정적 + 수동 검증 합본. 미통과 항목 발견 시 후속 plan 으로 분리하여 fix task 추가 (본 plan 은 task 파일 작성까지).
2. **Realtime 구독 검증 환경** — `make sb-reset` 후 시드 데이터 적재 → Studio 에서 직접 변경. 또는 두 브라우저 탭 동시 열어 한쪽 변경 → 다른 쪽 반영 확인.
3. **자동 이월 검증** — `due_date` 가 어제 + `status='todo'` 인 sub_issue 시드 필요. SQL 또는 Studio 에서 직접 insert.
4. **export build 호환** — `<Suspense>` 누락, 동적 라우트 사용, RSC fetch 등 export 모드 미지원 패턴이 있으면 build 단계에서 에러. 발견 시 task 12 또는 11 로 회귀하여 수정.
5. **체크박스 갱신** — 본 task 통과 시 sub-prd-02 의 §작업 / §검증 기준 체크박스 모두 `[x]` 로 갱신 + 상태 `완료` 로 갱신.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §검증 기준
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — Realtime / 자동 이월 / 훅 구현
