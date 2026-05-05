# TASK-02-13: build / typecheck / lint + 동작 검증

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 13
- **상태**: 대기중
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

### 자동

- [ ] `pnpm --filter @todo-list/ui typecheck` 0 exit
- [ ] `pnpm --filter @todo-list/web typecheck` 0 exit
- [ ] `pnpm --filter @todo-list/web lint` 0 exit
- [ ] `pnpm --filter @todo-list/web build` 0 exit (`output: 'export'` 정합)
- [ ] `grep -RIn "import.*Modal" apps/web/src/app/\(main\)/` → 0건

### 수동 (브라우저)

- [ ] OAuth 로그인 → `/life` redirect 성공
- [ ] `/life` 진입 시 두 섹션 + 카운트 정확
- [ ] Studio 에서 status 변경 → 1~2초 내 UI 반영 (Realtime)
- [ ] `←` / `→` 키 → 일자 이동 + URL `?date=` 갱신
- [ ] `/life` ↔ `/work` 전환 → 데이터 분리
- [ ] 자동 이월 — 어제 todo 가 오늘 뷰에 자동 이동, 토스트 없음
- [ ] 미로그인 상태 `/life` 접근 → `/login` redirect

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
