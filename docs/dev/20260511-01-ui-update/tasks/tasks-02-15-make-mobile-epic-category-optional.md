# Task 02-15: mobile Epic 생성/편집 category 선택 optional 전환

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-15 |
| 상태 | 완료 |
| 의존성 | 02-08, 02-13 완료 필요 |

## 작업 목표

mobile Epic 생성/편집 폼에서 category 선택을 optional 로 전환하고, 선택된 category 를 제거해 `category_id = null` 로 저장할 수 있게 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/forms/EpicForm.tsx` | 수정 - category optional, clear action, validation 변경 |
| `apps/mobile/src/app/epic-form.tsx` | 수정/확인 - create/edit submit payload null category 반영 |
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 확인 - null category 표시 영향 점검 |

### 구현 세부사항

1. **form validation 변경**
   - category field required 검증을 제거한다.
   - category 미선택 submit 을 허용한다.
   - clear action 결과가 `categoryId: null` 로 service 에 전달되도록 한다.

2. **분류 제거 UI**
   - 선택된 category 를 제거할 수 있는 mobile 친화적 액션을 제공한다.
   - 신규 생성에서는 category 를 고르지 않아도 저장할 수 있어야 한다.
   - 편집에서는 기존 category 를 제거하고 저장할 수 있어야 한다.

3. **payload 정합**
   - `apps/mobile/src/app/epic-form.tsx` 가 create/update 모드 모두에서 null category 를 구분해 전달한다.
   - undefined 는 변경 없음, null 은 분류 제거라는 의미를 유지한다.

### 참조 코드

- `apps/mobile/src/components/forms/EpicForm.tsx`: mobile Epic form
- `apps/mobile/src/app/epic-form.tsx`: Epic form route submit 처리
- `packages/core/src/hooks/useCreateEpic.ts`: create hook 계약
- `packages/core/src/hooks/useUpdateEpic.ts`: update hook 계약

## 검증 과정

- [x] mobile 에서 신규 Epic 을 category 없이 생성할 수 있다.
- [x] mobile Epic 편집에서 category 를 제거하고 저장할 수 있다.
- [x] 저장 후 해당 Epic 이 "분류 없음" 상태로 표시될 수 있다.
- [x] category 선택을 비워도 form validation 이 막지 않는다.

## 주의사항

- 신규 Epic 생성 시 category 선택은 optional 이다.
- category 제거를 빈 문자열이나 임의 id 로 저장하지 않는다.
- web form 과 의미가 달라지지 않도록 한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
