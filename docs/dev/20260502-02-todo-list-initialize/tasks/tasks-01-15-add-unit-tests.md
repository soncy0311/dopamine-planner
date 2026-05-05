# TASK-01-15: __tests__ 단위 테스트 작성

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 15
- **상태**: 완료
- **의존성**: 01 ~ 13 (모든 구현 task 완료)

## 작업 목표

`packages/core/src/__tests__/` 하위에 단위 테스트 4종(매퍼 / queryKeys / RPC 배열 추출 / debounce) 을 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 신설 | 매퍼 round-trip 검증 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 신설 | queryKeys 헬퍼 + `invalidateByTable` 분기 검증 |
| `packages/core/src/__tests__/rpc.test.ts` | 신설 | `carryOverTodos` / `recalcEpicProgress` 의 단일 row 배열 추출 검증 |
| `packages/core/src/__tests__/useToggleTodo.test.ts` | 신설 | 200ms epic 단위 debounce 검증 |

### 구현 세부사항

#### 1) domain.test.ts (매퍼)

- 고정 DB Row fixture 입력 → 기대 View 객체 출력 검증
- 3종 매퍼 (`mapCategoryRow`, `mapEpicRow`, `mapSubIssueRow`) 각각 happy path
- `mapTodoDailyView` 의 done/todo 분리 — `status === 'done'` 만 done 배열로 가는지

#### 2) queryKeys.test.ts

- `queryKeys.todos / epics / epicsByCategory / categories / profile` 각 헬퍼의 반환값 형태 (튜플 + record) 일치
- `invalidateByTable(qc, 'sub_issue')` 호출 시 mock qc 의 `invalidateQueries` 가 `['todos']` 로 호출되는지 (각 테이블 4종 검증)

#### 3) rpc.test.ts

- supabase client mock — `client.rpc` 가 `[{ moved_count: 7 }]` 반환 → `carryOverTodos` 가 `7` 반환
- 빈 배열 / `null` → `0` 반환 (fallback 동작)
- 동일 패턴으로 `recalcEpicProgress` 검증

#### 4) useToggleTodo.test.ts (debounce)

- `@testing-library/react` 의 `renderHook` 활용 (또는 fake timer 단독)
- `vi.useFakeTimers()` (또는 jest 환경) 로 시간 제어
- 동일 `epicId` 의 `useToggleTodo` mutate 5회 연속 호출 (200ms 미만 간격) → `recalcEpicProgress` 가 1회만 호출되는지
- 서로 다른 `epicId` 2개 토글 → 각각 1회 = 총 2회 호출되는지 (독립 타이머 검증)

### 참조 코드

- sub-prd-01 §검증 기준 마지막 항목 (debounce 검증)
- sub-prd-01 §주의사항 6 (debounce 키 = epicId)

## 검증 과정

- [x] 4개 테스트 파일 모두 존재
- [x] `pnpm --filter @todo-list/core test` 전부 통과 (24 tests passed)
- [x] 각 테스트가 sub-prd 의 검증 기준 항목과 1:1 대응 (매퍼 / queryKeys / RPC 배열 추출 / debounce)
- [x] `useToggleTodo` debounce 테스트가 RPC 호출 횟수 단언 (debounceByEpic 5회→1회)

## 주의사항

1. **외부 의존성 추가 최소화** — 테스트 러너는 기존 (vitest 또는 jest) 그대로. 신규 의존성 도입 시 `packages/core/package.json` devDependencies 에만 추가.
2. **fake timers** — `useToggleTodo` 테스트는 fake timers 필수. 실제 200ms 대기 금지.
3. **mock client** — supabase client 는 최소 인터페이스 mock — 실제 supabase 인스턴스 사용 금지 (단위 테스트 범위).
4. **react-query peerDependency** — 테스트 시 react-query 가 필요하면 devDependencies 로만 추가.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §검증 기준, §주의사항 6
