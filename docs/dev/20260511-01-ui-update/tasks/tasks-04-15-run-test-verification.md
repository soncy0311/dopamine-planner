# Task 04-15: test 검증 실행

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-15 |
| 상태 | 완료 |
| 의존성 | 04-03부터 04-14까지 완료 필요 |

## 작업 목표

Sub-04 의 자동 테스트 추가와 수동 QA 보완이 끝난 뒤 `make test` 를 실행해 progress, category, archive, calendar, realtime 회귀 검증을 완료한다. 테스트 실패는 skip 으로 남기지 않고 원인 task 로 되돌려 수정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `Makefile` | 확인 - test 단일 진입점 확인 |
| `packages/core/src/__tests__/*` | 확인 - core regression test 대상 |
| `packages/ui/__tests__/*` | 확인 - web/shared UI test 대상 |
| `apps/web/src/**/__tests__/*` | 확인 - web component test 대상 |
| `apps/mobile/src/**/__tests__/*` | 확인 - mobile test 대상 |
| `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md` | 필요 시 수정 - test 결과 기록 위치 연결 |

### 구현 세부사항

1. **test 실행**
   - 루트에서 `make test` 를 실행한다.
   - 직접 `pnpm`/`turbo` 를 호출하지 않고 Makefile 을 단일 진입점으로 사용한다.

2. **검증 범위 확인**
   - progress linear/accessibility 테스트가 실행 범위에 포함되는지 확인한다.
   - category delete detach/null category 테스트가 실행 범위에 포함되는지 확인한다.
   - archive/calendar/realtime 테스트가 실행 범위에 포함되는지 확인한다.

3. **결과 기록**
   - 실행 일시, 명령, 결과, 실패 시 수정 링크를 문서 또는 이슈에 기록한다.
   - 수동 QA 결과와 자동 테스트 결과를 함께 Sub-04 완료 판단에 연결한다.

### 참조 코드

- `Makefile`: 검증 명령 단일 진입점
- `packages/core/src/__tests__/domain.test.ts`: domain/archive/category test
- `packages/core/src/__tests__/queryKeys.test.ts`: query key test
- `packages/core/src/__tests__/cascadeToggleEpic.test.ts`: status 전환 회귀 test
- `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md`: test 검증 기준

## 검증 과정

- [x] 루트에서 `make test` 를 실행했다.
- [x] progress 관련 자동 테스트가 실행 범위에 포함되어 있다.
- [x] category/null category 관련 자동 테스트가 실행 범위에 포함되어 있다.
- [x] archive/calendar/realtime 관련 자동 테스트가 실행 범위에 포함되어 있다.
- [x] test 결과가 통과 또는 실패 원인과 함께 기록되어 있다.
- [x] 실패가 있으면 skip 처리하지 않고 관련 task 로 되돌려 수정한다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시하고 점을 추가하지 않는다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.
- 이 task 문서 생성 단계에서는 `make test` 를 실행하지 않고, Sub-04 구현 검증 단계에서 실행한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)

## 실행 기록

- **일시**: 2026-05-13 05:37 KST
- **명령**: `make test`
- **결과**: 통과
- **범위**: core 7 files / 56 tests, ui 5 files / 40 tests, web 3 files / 15 tests
