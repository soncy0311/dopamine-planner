# Task 02-07: category update/delete detach service 구현

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-07 |
| 상태 | 완료 |
| 의존성 | 02-04, 02-05 완료 필요 |

## 작업 목표

`packages/core` category service 와 hook 에 분류명/색상 수정 및 delete detach 흐름을 구현한다. category 삭제 서비스는 Epic/Sub 삭제가 아니라 연결 Epic 의 `category_id = null` 전환과 category row 삭제를 수행해야 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/services/category.ts` | 수정 - update category, delete detach RPC 호출 구현 |
| `packages/core/src/hooks/useUpdateCategory.ts` | 수정/확인 - 분류 수정 mutation 노출 |
| `packages/core/src/hooks/useDeleteCategory.ts` | 수정 - delete detach mutation 으로 전환 |
| `packages/core/src/hooks/useCategories.ts` | 확인 - 수정/삭제 후 category 목록 갱신 정합 |

### 구현 세부사항

1. **분류 수정 서비스**
   - category name/color update payload 를 명시한다.
   - 사용자 본인 category 만 수정되도록 Supabase RLS와 service 조건을 함께 확인한다.
   - 수정 결과를 호출자가 즉시 UI 갱신에 사용할 수 있게 반환 타입을 정리한다.

2. **분류 삭제 detach 서비스**
   - 02-04 RPC 가 있으면 `delete_category_detach_epics` 를 호출한다.
   - RPC 가 없는 fallback 을 둔다면 epic update 와 category delete 의 실패 처리를 명확히 분리한다.
   - 삭제 성공 후 연결 Epic 은 null category 상태로 남는다는 계약을 service 주석 또는 타입으로 드러낸다.

3. **hook 정합**
   - update/delete hook 의 mutation key, error 반환, optimistic update 여부를 기존 패턴에 맞춘다.
   - query invalidation 상세는 02-09 에서 다루되 hook 에 필요한 확장 지점을 마련한다.

### 참조 코드

- `packages/core/src/services/category.ts`: category CRUD service
- `packages/core/src/hooks/useUpdateCategory.ts`: update mutation 패턴
- `packages/core/src/hooks/useDeleteCategory.ts`: delete mutation 패턴
- `packages/core/src/services/epic.ts`: category null update 와의 계약 확인

## 검증 과정

- [x] category name/color 를 수정하는 service/hook 이 제공된다.
- [x] category 삭제 service 가 Epic/Sub 를 삭제하지 않는다.
- [x] delete detach 가 RPC 또는 명확한 transaction 정책을 통해 호출된다.
- [x] 서비스 타입이 `packages/shared/src/database.ts` 의 nullable/RPC 타입과 일치한다.

## 주의사항

- category delete 를 단순 `.delete()` 로만 구현해 FK 정책에 의존하지 않는다.
- "분류 없음" category row 를 생성하거나 조회하지 않는다.
- 실패 시 사용자에게 재시도 가능한 오류를 반환할 수 있도록 기존 error 처리 패턴을 따른다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
