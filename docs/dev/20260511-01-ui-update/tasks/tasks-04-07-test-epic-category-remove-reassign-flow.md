# Task 04-07: Epic 분류 제거 및 재지정 흐름 테스트

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-07 |
| 상태 | 완료 |
| 의존성 | 04-02, 04-05, 04-06 완료 필요 |

## 작업 목표

Epic 편집에서 분류를 제거한 뒤 다른 필드 편집이 계속 가능하고, 이후 분류를 다시 지정할 수 있는 흐름을 테스트한다. 분류 제거가 Epic/Sub 삭제 또는 편집 불능 상태로 이어지지 않는지 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정/확인 - null category update 결과 검증 |
| `packages/core/src/services/epic.ts` | 확인 - category 제거/재지정 payload 허용 |
| `apps/web/src/components/**/__tests__/*` | 수정/신규 - web Epic 편집 분류 제거/재지정 테스트 |
| `apps/mobile/src/**/__tests__/*` | 수정/신규 - mobile Epic 편집 분류 제거/재지정 테스트 |

### 구현 세부사항

1. **core update 검증**
   - Epic update payload 에서 `category_id = null` 저장이 허용되는지 검증한다.
   - null category 상태에서도 title/description/priority/status 편집이 가능한지 확인한다.

2. **web 편집 흐름 검증**
   - 기존 분류가 있는 Epic 에서 분류 제거 후 저장하는 테스트를 추가한다.
   - 저장 후 `"분류 없음"`으로 표시되고 다시 일반 분류를 지정할 수 있는지 확인한다.

3. **mobile 편집 흐름 검증**
   - mobile 편집 UI 에서 같은 흐름을 자동 테스트 또는 수동 QA 로 검증한다.
   - web 과 다른 문구나 저장 정책이 생기지 않도록 기대값을 맞춘다.

### 참조 코드

- `packages/core/src/services/epic.ts`: Epic update service
- `apps/web/src/components/**`: web Epic edit UI
- `apps/mobile/src/components/**`: mobile Epic edit UI
- `docs/dev/20260511-01-ui-update/tasks/tasks-02-12-make-web-epic-category-optional.md`: web category optional 선행 task
- `docs/dev/20260511-01-ui-update/tasks/tasks-02-15-make-mobile-epic-category-optional.md`: mobile category optional 선행 task

## 검증 과정

- [x] Epic 편집에서 분류 제거 저장이 가능하다.
- [x] 분류 제거 후 Epic/Sub 데이터가 유지된다.
- [x] null category 상태에서도 다른 필드 편집이 가능하다.
- [x] 분류 제거 후 다시 일반 분류를 지정할 수 있다.
- [x] web/mobile 이 같은 흐름과 같은 정책으로 검증된다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시하고 점을 추가하지 않는다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
