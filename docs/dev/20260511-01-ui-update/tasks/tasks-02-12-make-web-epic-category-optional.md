# Task 02-12: web Epic 생성/편집 category 선택 optional 전환

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-12 |
| 상태 | 완료 |
| 의존성 | 02-08, 02-10 완료 필요 |

## 작업 목표

web Epic 생성/편집 폼에서 category 선택을 optional 로 전환하고, 선택된 category 를 제거해 `category_id = null` 로 저장할 수 있는 UI 를 추가한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/modals/EpicFormModal.tsx` | 수정 - category optional, clear action, validation 변경 |
| `apps/web/src/components/modals/EpicDetailModal.tsx` | 수정/확인 - 편집 진입 및 category 표시 null 대응 |
| `apps/web/src/components/ui/CategoryComboboxCreate.tsx` | 수정/확인 - optional 선택과 clear UI 지원 |
| `apps/web/src/components/CategoryFilterChips.tsx` | 확인 - "분류 없음" 필터와 form option 혼동 방지 |

### 구현 세부사항

1. **form schema 변경**
   - category field required 검증을 제거한다.
   - 빈 선택은 submit payload 에서 `categoryId: null` 로 변환한다.
   - undefined 는 변경 없음, null 은 분류 제거라는 의미가 유지되게 한다.

2. **분류 제거 UI**
   - 기존 선택된 category 를 clear 할 수 있는 버튼/액션을 제공한다.
   - clear 후 저장하면 Epic 이 "분류 없음" 상태가 된다.
   - 신규 생성에서 category 를 고르지 않아도 저장 가능해야 한다.

3. **표시 정합**
   - 편집 모달과 상세 모달에서 null category 를 오류 없이 렌더링한다.
   - category 생성 combobox 와 optional 선택 상태가 충돌하지 않도록 한다.

### 참조 코드

- `apps/web/src/components/modals/EpicFormModal.tsx`: Epic create/edit form
- `apps/web/src/components/modals/EpicDetailModal.tsx`: Epic detail/edit flow
- `apps/web/src/components/ui/CategoryComboboxCreate.tsx`: category select/create UI
- `packages/core/src/hooks/useCreateEpic.ts`: create payload 계약
- `packages/core/src/hooks/useUpdateEpic.ts`: update payload 계약

## 검증 과정

- [x] web 에서 신규 Epic 을 category 없이 생성할 수 있다.
- [x] web Epic 편집에서 category 를 제거하고 저장할 수 있다.
- [x] 저장 후 해당 Epic 이 "분류 없음" 상태로 표시될 수 있다.
- [x] category 선택을 비워도 form validation 이 막지 않는다.

## 주의사항

- 신규 Epic 생성 시 category 선택은 optional 이다.
- category 제거를 빈 문자열로 저장하지 않고 `null` 로 저장한다.
- "전체" 필터와 "분류 없음" 필터의 의미를 form 선택지와 혼동하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
