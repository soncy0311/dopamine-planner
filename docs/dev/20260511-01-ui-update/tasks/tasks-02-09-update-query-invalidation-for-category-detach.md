# Task 02-09: category detach query invalidation 갱신

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-09 |
| 상태 | 대기중 |
| 의존성 | 02-07, 02-08 완료 필요 |

## 작업 목표

category 수정/삭제 detach 후 category 목록뿐 아니라 Epic/Todo 표시와 필터 결과가 갱신되도록 query key 와 invalidation 범위를 보정한다. category delete 이벤트와 epic update 이벤트 모두에 반응하는 캐시 정책을 만든다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/queryKeys.ts` | 수정 - category detach 관련 invalidate 범위 반영 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정 - query key/invalidation 테스트 추가 |
| `packages/core/src/hooks/useDeleteCategory.ts` | 수정 - delete detach 성공 후 category/epic/todo invalidate |
| `packages/core/src/hooks/useUpdateCategory.ts` | 수정/확인 - category 수정 후 표시 데이터 invalidate |

### 구현 세부사항

1. **query key 영향 범위 정의**
   - category list/detail 관련 key 를 갱신한다.
   - Epic 목록, Todo/Sub 목록, category filter 결과를 함께 갱신해야 하는지 정리한다.
   - 후속 완료 Epic archive 에서 "분류 없음" 그룹을 사용할 수 있도록 확장 여지를 둔다.

2. **mutation invalidation 적용**
   - category update 후 연결 Epic/Sub 표시명과 색상이 최신 category row 를 보게 한다.
   - category delete detach 후 category 목록과 Epic/Todo 목록이 모두 재조회되도록 한다.

3. **Realtime 이벤트 점검**
   - category delete 와 epic update 가 모두 발생할 수 있음을 반영한다.
   - 기존 realtime invalidate 경로가 있다면 category/epic_issue 변경 모두를 처리하는지 확인한다.

### 참조 코드

- `packages/core/src/queryKeys.ts`: query key 구조
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 테스트 패턴
- `packages/core/src/hooks/useDeleteCategory.ts`: delete mutation invalidation
- `packages/core/src/hooks/useTodos.ts`: Todo 목록 query 사용처
- `packages/core/src/hooks/useEpics.ts`: Epic 목록 query 사용처

## 검증 과정

- [ ] category delete detach 후 Epic 목록이 재조회되어 "분류 없음"으로 표시될 수 있다.
- [ ] category update 후 연결 Epic/Sub 표시 이름과 색상이 최신 값으로 갱신된다.
- [ ] "전체" 필터와 "분류 없음" 필터를 구분할 수 있는 query key 확장성이 있다.
- [ ] queryKeys 테스트가 새 key/invalidation 정책을 검증한다.

## 주의사항

- category 목록만 invalidate 하면 Epic 카드의 category 표시가 stale 상태로 남을 수 있다.
- "전체" 필터와 "분류 없음" 필터는 별도 의미이므로 같은 key 로 합치지 않는다.
- 불필요하게 모든 캐시를 무조건 제거하기보다 기존 query key 구조를 따른다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
