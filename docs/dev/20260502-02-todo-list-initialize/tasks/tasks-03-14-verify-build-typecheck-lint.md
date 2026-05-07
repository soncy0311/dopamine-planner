# TASK-03-14: build / typecheck / lint + 5단계 시나리오 + 검증 항목 합본

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 14
- **상태**: 완료 (자동 검증 통과 / 수동 시나리오는 사용자 확인 대기)
- **의존성**: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13 (이전 모든 task)

## 작업 목표

Sub-03 의 모든 산출물이 정합 + 정상 동작 상태인지 정적 검증과 사용자 시나리오 검증을 수행한다. sub-prd §검증 기준 모든 항목 통과 시 본 sub 완료 + 체크박스 갱신.

## 상세 구현 내용

### 대상 파일

본 task 는 신규 파일 생성 없음. 검증 결과는 sub-prd 의 §작업 / §검증 기준 체크박스 갱신으로 반영.

### Step 1: 정적 검증

```bash
pnpm --filter @todo-list/ui typecheck
pnpm --filter @todo-list/web typecheck
pnpm --filter @todo-list/web lint
pnpm --filter @todo-list/web build
```

모두 0 exit. `output: 'export'` 정합 확인 (build 단계에서 신설 5 페이지 — `/life/categories`, `/work/categories`, `/life/epics`, `/work/epics`, `/settings` — 모두 export 가능해야 함).

### Step 2: 5단계 시나리오 (sub-prd §검증 기준 1)

`make web-up` → 신규 사용자로 OAuth 로그인 → `/login` redirect → `/life`:

1. **분류 생성** — `/life/categories` 진입 → "분류 추가" → 모달에서 이름·색상 입력 → 저장 → 리스트 노출
2. **Epic 생성** — `/life/epics` 진입 → "Epic 추가" → 모달에서 분류 선택 (cascading) + 제목 → 저장 → 리스트 노출 (진행률 0%)
3. **Sub 생성** — `/life` 진입 → FAB → 모달에서 분류 → Epic cascading → 제목 + dueDate 기본값 = 오늘 → 저장 → 진행 중 섹션에 노출
4. **토글** — 체크박스 클릭 → 완료 섹션으로 이동 + 진행률 100%
5. **재진입 검증** — 새로고침 → 동일 상태 유지 (Realtime 영향 없이 정합)

### Step 3: 추가 검증 항목 (sub-prd §검증 기준 2~8)

- 분류 삭제 시 하위 Epic 존재하면 친화 토스트 (`이 분류에 Epic 이 있어 삭제할 수 없어요`)
- Epic 삭제 시 하위 Sub 존재하면 친화 토스트 (`Epic 에 하위 할 일이 있어 삭제할 수 없어요`)
- Epic 메인 체크박스 토글 → 하위 Sub 일괄 토글 + 진행률 0% / 100% 즉시 반영
- 설정 화면 로그아웃 → `/login` redirect → 이후 `/life` 직접 진입 시 다시 `/login` 으로 redirect
- 다른 계정으로 재로그인 시 이전 계정 데이터 미잔존 (`qc.clear()` 검증)
- 모달 ESC / overlay 클릭으로 닫기 동작
- 데스크톱 뷰포트(>=640px) → 모달 카드 / 모바일 뷰포트(<640px) → 풀스크린
- cascading select — `<CreateTodoModal>` 에서 분류 변경 시 Epic 선택값 null 로 reset

### Step 4: 코드 검증 (grep)

```bash
grep -RIn "error\.message" apps/web/src/components/CategoriesView.tsx apps/web/src/components/EpicsView.tsx
# → 0건 또는 모두 showFkOrDefaultError 경유여야 함

grep -RIn "supabase.auth.signOut" apps/web/src/
# → 1건 (lib/auth/logout.ts) 만. settings/page.tsx 에서 직접 호출 0건

grep -RIn "qc.clear\(\)" apps/web/src/
# → 1건 (lib/auth/logout.ts) 만
```

## 검증 과정

### 자동

- [x] `pnpm --filter @todo-list/ui typecheck` 0 exit (lint 명령이 tsc --noEmit 으로 동일)
- [x] `pnpm --filter @todo-list/web typecheck` 0 exit
- [x] `pnpm --filter @todo-list/web lint` 0 exit
- [x] `pnpm --filter @todo-list/web build` 0 exit (`output: 'export'` 정합 — 신설 5 페이지 export: `/life/categories`, `/work/categories`, `/life/epics`, `/work/epics`, `/settings`)
- [x] `grep -RIn "supabase.auth.signOut" apps/web/src/` → 1건 (logout.ts)
- [x] `grep -RIn "qc.clear\(\)" apps/web/src/` → 1건 (logout.ts)
- [x] `grep -RIn "23503" apps/web/src/lib/errors/fkErrorToast.ts` → 1건

### 수동 (브라우저) — **수동 확인 필요** (사용자 책임, agent 직접 수행 불가)

- [ ] 5단계 시나리오 통과 (분류 → Epic → Sub → 토글 → 재진입)
- [ ] 분류 삭제 FK 23503 → 친화 토스트
- [ ] Epic 삭제 FK 23503 → 친화 토스트
- [ ] Epic 메인 체크박스 → 하위 Sub 일괄 토글 + 진행률 즉시 반영
- [ ] 로그아웃 → `/login` redirect + 이후 보호 페이지 접근 시 재 redirect
- [ ] 다른 계정 재로그인 시 이전 계정 데이터 미잔존
- [ ] 모달 ESC / overlay 클릭 닫기
- [ ] 모바일 뷰포트(<640px) 풀스크린 모달 / 데스크톱 카드
- [ ] cascading 분류 변경 시 Epic 선택값 reset

## 주의사항

1. **검증 단일 task 분량** — 정적 + 시나리오 + 추가 항목 합본. 미통과 항목 발견 시 후속 plan 으로 분리하여 fix task 추가 (본 plan 은 task 파일 작성까지).
2. **`output: 'export'` 호환** — 신설 5 페이지 모두 동적 라우트 미사용 + RSC fetch 미사용. 빌드 단계에서 export 실패 시 task 09 / 10 / 12 로 회귀.
3. **FK 23503 시나리오** — 분류 1 + Epic 1 + Sub 1 시드 후 분류·Epic 삭제 시도. 자식 정리 → 부모 삭제 순서 검증.
4. **qc.clear 검증** — 두 계정 토큰을 번갈아 로그인 (`A → B → A`). A 의 분류·Epic 이 B 화면에 남는지 확인. `qc.clear` 정상 시 안 남음.
5. **Realtime 충돌 가능성** — Sub-02 의 `subscribeTodos` 가 활성. 모달 mutation → invalidate + Realtime invalidate 중복 가능. MVP 허용 (sub-prd-02 §주의사항 5).
6. **체크박스 갱신** — 본 task 통과 시 sub-prd-03 의 §작업 / §검증 기준 체크박스 모두 `[x]` 로 갱신 + 상태 `완료`.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §검증 기준
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — Realtime / 자동 이월
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — service / hook 계약
