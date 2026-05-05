# TASK-01-16: 빌드·타입체크·테스트 통과 검증 + grep 검증

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 16
- **상태**: 완료
- **의존성**: 14 (index export), 15 (단위 테스트)

## 작업 목표

본 sub-prd 의 모든 검증 기준을 일괄 실행하여 통과를 확인한다. 빌드·타입체크·테스트 3종 + grep 기반 정책 검증 5종이 모두 깨끗하게 통과해야 sub-prd-01 종료 자격이 생긴다.

## 상세 구현 내용

### 대상 파일

(없음 — 본 task 는 명령 실행 + 결과 확인 작업)

### 검증 명령

#### 1) 빌드·타입체크·테스트 3종

```bash
pnpm --filter @todo-list/core build
pnpm --filter @todo-list/core typecheck
pnpm --filter @todo-list/core test
```

3종 모두 exit code 0 이어야 함.

#### 2) grep 기반 정책 검증 5종 (sub-prd §검증 기준)

```bash
# (a) 플랫폼 의존 import 0건
grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/

# (b) queryKeys 헬퍼 통과 ≥ 7건
grep -RIn "queryKeys\." packages/core/src/

# (c) RPC 시그니처 언급 ≥ 2건
grep -RIn "carry_over_todos\|recalc_epic_progress" packages/core/src/

# (d) RPC 단일 row 배열 추출 패턴 ≥ 2건
grep -RIn "data?.\[0\]" packages/core/src/services/

# (e) RLS 이중 필터 금지 — 0건
grep -RIn "\.eq('user_id'" packages/core/src/
```

기대 결과:
- (a) 결과 0건
- (b) ≥ 7건
- (c) ≥ 2건
- (d) ≥ 2건
- (e) 0건

#### 3) 디바운스 단위 테스트 통과 확인

- task 15 의 `useToggleTodo.test.ts` — 동일 epic 5회 토글 → `recalc_epic_progress` 1회 호출 단언이 PASS

## 검증 과정

- [x] `pnpm --filter @todo-list/core build` 통과
- [x] `pnpm --filter @todo-list/core typecheck` 통과
- [x] `pnpm --filter @todo-list/core test` 통과 (24 tests, 4 files)
- [x] grep (a) 플랫폼 의존 — 0건
- [x] grep (b) queryKeys 헬퍼 — 13건 (≥ 7)
- [x] grep (c) RPC 시그니처 — 2건 (≥ 2)
- [x] grep (d) `data?.[0]` 패턴 — 2건 (≥ 2)
- [x] grep (e) RLS 이중 필터 — 0건
- [x] `useToggleTodo` debounce 테스트 PASS (5회→1회 합쳐짐)

## 주의사항

1. **검증 실패 시** — 본 task 는 task 파일 작성까지만 수행하는 plan 의 산출물. 검증 실패 시 sub-prd-01 본문 갱신 후 task 재분해는 후속 plan 의 책임 (본 plan §위험과 완화).
2. **grep 패턴 escape** — 위 명령의 `\.[0\]` / `\.eq('user_id'` 는 shell escape 주의. 직접 실행 시 quoting 확인.
3. **명령 단일 진입점** — sub-prd-01 §검증 기준 항목과 1:1 매핑. 본 task 가 본 sub-prd 의 종료 게이트.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §검증 기준
