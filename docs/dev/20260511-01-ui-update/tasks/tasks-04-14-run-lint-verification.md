# Task 04-14: lint 검증 실행

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-14 |
| 상태 | 완료 |
| 의존성 | 04-03부터 04-13까지 완료 필요 |

## 작업 목표

Sub-04 자동 테스트와 수동 QA 보완 변경이 끝난 뒤 `make lint` 를 실행해 web/mobile/core 변경 범위의 정적 검증을 완료한다. 실패가 있으면 해당 구현 또는 테스트 task 로 되돌려 원인을 수정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `Makefile` | 확인 - lint 단일 진입점 확인 |
| `packages/core/src/**` | 확인 - core lint 대상 |
| `apps/web/src/**` | 확인 - web lint 대상 |
| `apps/mobile/src/**` | 확인 - mobile lint 대상 |
| `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md` | 필요 시 수정 - lint 결과 기록 위치 연결 |

### 구현 세부사항

1. **lint 실행**
   - 루트에서 `make lint` 를 실행한다.
   - 직접 `pnpm`/`turbo` 를 호출하지 않고 Makefile 을 단일 진입점으로 사용한다.

2. **실패 원인 분류**
   - 문법, 타입, import 정렬, unused code 등 실패 원인을 분류한다.
   - Sub-04 범위를 벗어난 실패는 별도 이슈 또는 선행 task 로 분리한다.

3. **결과 기록**
   - 실행 일시, 명령, 결과, 실패 시 수정 링크를 문서 또는 이슈에 기록한다.
   - lint 통과 여부를 Sub-04 검증 기준에 연결한다.

### 참조 코드

- `Makefile`: 검증 명령 단일 진입점
- `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md`: lint 검증 기준
- `docs/dev/20260511-01-ui-update/main-prd-ui-update.md`: 전체 QA 완료 기준

## 검증 과정

- [x] 루트에서 `make lint` 를 실행했다.
- [x] lint 결과가 통과 또는 실패 원인과 함께 기록되어 있다.
- [x] 실패가 있으면 관련 task 로 되돌려 수정 계획이 연결되어 있다.
- [x] web/mobile/core 변경 범위가 lint 검증 대상에 포함되어 있다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시하고 점을 추가하지 않는다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.
- 이 task 문서 생성 단계에서는 `make lint` 를 실행하지 않고, Sub-04 구현 검증 단계에서 실행한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)

## 실행 기록

- **일시**: 2026-05-13 13:23 KST
- **명령**: `make lint`
- **결과**: 통과
- **조치**: `@todo-list/mobile` 의 `lint` script 를 web 과 같은 `tsc --noEmit` 기반으로 변경해 mobile lint 도 단일 entry point 에서 동작하도록 정합했다.
- **범위**: turbo lint 7 tasks successful.
