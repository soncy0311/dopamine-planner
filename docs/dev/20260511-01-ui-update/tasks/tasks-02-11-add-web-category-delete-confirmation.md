# Task 02-11: web category 삭제 confirmation 및 detach 안내 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-11 |
| 상태 | 완료 |
| 의존성 | 02-07, 02-09, 02-10 완료 필요 |

## 작업 목표

web 설정의 분류 관리 화면에서 category 삭제 전 confirmation 을 제공하고, 삭제가 Epic/Sub 삭제가 아니라 분류 해제임을 명확히 안내한다. 확인 후 delete detach mutation 을 호출한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/app/(main)/settings/page.tsx` | 수정 - category delete action 및 confirmation 연결 |
| `apps/web/src/components/modals/ConfirmDeleteDialog.tsx` | 확인/필요 시 수정 - detach 안내 문구를 담을 수 있는지 확인 |
| `packages/core/src/hooks/useDeleteCategory.ts` | 확인 - delete detach hook 사용 |

### 구현 세부사항

1. **삭제 액션 추가**
   - category row 별 delete 버튼을 제공한다.
   - 수정 중 상태와 삭제 액션이 충돌하지 않도록 disabled 조건을 둔다.

2. **confirmation 문구**
   - 삭제 대상 분류명을 표시한다.
   - "연결된 Epic/Sub 는 삭제되지 않고 분류 없음으로 이동한다"는 정책을 명확히 안내한다.
   - "분류 없음" row 를 새로 만드는 작업이 아님을 UI 동작으로 보장한다.

3. **mutation 및 상태 처리**
   - 확인 시 `useDeleteCategory` 를 호출한다.
   - 삭제 중 loading/disabled 상태와 실패 error 표시를 제공한다.
   - 성공 후 category 목록과 Epic/Todo 목록 갱신이 일어난다.

### 참조 코드

- `apps/web/src/app/(main)/settings/page.tsx`: category list UI
- `apps/web/src/components/modals/ConfirmDeleteDialog.tsx`: confirmation dialog 패턴
- `packages/core/src/hooks/useDeleteCategory.ts`: delete detach mutation

## 검증 과정

- [x] category 삭제 전 confirmation 이 표시된다.
- [x] confirmation 에 Epic/Sub 유지 및 "분류 없음" 전환 정책이 표시된다.
- [x] 삭제 성공 후 category row 는 목록에서 사라진다.
- [x] 연결 Epic/Sub 는 삭제되지 않고 "분류 없음"으로 표시될 수 있다.

## 주의사항

- destructive UI 이지만 실제 데이터 정책은 Epic/Sub 보존이다.
- category delete 를 일반 row delete 로 직접 호출하지 않고 core hook 을 사용한다.
- confirmation 문구가 "Epic 삭제"로 오해되지 않게 작성한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
