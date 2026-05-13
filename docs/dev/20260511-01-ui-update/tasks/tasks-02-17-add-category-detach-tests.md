# Task 02-17: category detach 및 null category 회귀 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-17 |
| 상태 | 완료 |
| 의존성 | 02-02부터 02-16까지 완료 필요 |

## 작업 목표

분류 삭제 후 Epic/Sub 유지, category null 저장, "분류 없음" 필터/표시 정책을 검증하는 테스트를 추가한다. DB, core domain/service, query key, 가능한 UI 테스트 범위를 연결해 회귀를 막는다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정 - null category mapper 테스트 추가 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정 - "전체"과 "분류 없음" key 분리 테스트 추가 |
| `packages/core/src/__tests__/rpc.test.ts` | 수정/확인 - delete category detach RPC 테스트 추가 |
| `packages/core/src/__tests__/cascadeToggleEpic.test.ts` | 확인 - Epic/Sub 유지 정책과 충돌 여부 점검 |
| `apps/web/src/components/**/__tests__/*` | 가능 시 수정/신규 - web null category 표시/필터 테스트 |
| `apps/mobile/src/**/__tests__/*` | 가능 시 수정/신규 - mobile null category 표시 테스트 |

### 구현 세부사항

1. **DB/RPC 테스트**
   - category 삭제 후 연결 Epic row 가 삭제되지 않고 `category_id = null` 이 되는지 검증한다.
   - 연결 Sub row 가 삭제되지 않는지 검증한다.
   - 타 사용자 category 삭제가 차단되는지 검증한다.

2. **core 테스트**
   - null category DB row 가 domain Epic 으로 변환되는지 검증한다.
   - create/update service payload 에서 `category_id = null` 이 허용되는지 검증한다.
   - query key 에서 "전체"과 "분류 없음"이 구분되는지 검증한다.

3. **UI 테스트**
   - 가능한 테스트 환경에서 web/mobile 카드와 필터의 "분류 없음" 표시를 검증한다.
   - Epic form 에서 category 미선택 생성과 category 제거 저장이 막히지 않는지 검증한다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: domain mapper 테스트 패턴
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 테스트 패턴
- `packages/core/src/__tests__/rpc.test.ts`: RPC 테스트 패턴
- `packages/core/src/services/category.ts`: delete detach service
- `packages/core/src/services/epic.ts`: null category create/update service

## 검증 과정

- [x] category 삭제 후 연결 Epic row 가 삭제되지 않고 `category_id = null` 이 된다.
- [x] category 삭제 후 연결 Sub row 가 삭제되지 않는다.
- [x] 신규 Epic 을 분류 없이 생성하는 테스트가 통과한다.
- [x] "전체" 필터와 "분류 없음" 필터가 서로 다른 결과를 반환한다.
- [x] web/mobile 모두 null category Epic 렌더링 오류가 없다.
- [ ] `make lint` 가 통과한다.
- [x] `make test` 가 통과한다.

## 검증 기록
- **일시**: 2026-05-12 23:02
- **결과**: `make lint`는 mobile 패키지에서 `eslint: command not found`로 실패했다. 나머지 `make sb-reset`, `make sb-gen-types`, `make typecheck`, `make test`는 통과했다.

## 주의사항

- 이 task 는 구현 완료 후 검증 task 이므로 앞선 DB/core/web/mobile 변경이 선행되어야 한다.
- 테스트 fixture 에 "분류 없음" category row 를 추가하지 않는다.
- 실패하는 테스트를 skip 으로 남기지 않고 원인 수정까지 포함한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
