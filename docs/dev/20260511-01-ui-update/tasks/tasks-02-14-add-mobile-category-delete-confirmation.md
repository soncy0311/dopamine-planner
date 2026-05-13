# Task 02-14: mobile category 삭제 confirmation 및 detach 안내 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-14 |
| 상태 | 완료 |
| 의존성 | 02-07, 02-09, 02-13 완료 필요 |

## 작업 목표

mobile 설정 화면에서 category 삭제 전 confirmation 을 제공하고, 삭제 시 연결 Epic/Sub 가 삭제되지 않고 "분류 없음"으로 전환된다는 정책을 안내한다. 확인 후 delete detach mutation 을 호출한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/app/(main)/settings/index.tsx` | 수정 - category delete action 및 confirmation 추가 |
| `apps/mobile/src/components/Button.tsx` | 확인 - destructive/secondary 버튼 패턴 참조 |
| `packages/core/src/hooks/useDeleteCategory.ts` | 확인 - delete detach hook 사용 |

### 구현 세부사항

1. **삭제 액션 추가**
   - category row 별 delete 액션을 제공한다.
   - 편집 저장 중에는 삭제 액션이 중복 실행되지 않도록 막는다.

2. **confirmation 제공**
   - React Native 환경에 맞는 Alert 또는 기존 modal 패턴을 사용한다.
   - category 이름과 Epic/Sub 유지 정책을 명확히 표시한다.
   - 취소와 삭제 확정 액션을 분리한다.

3. **mutation 및 상태 처리**
   - 확인 시 `useDeleteCategory` 를 호출한다.
   - 삭제 중 loading/disabled 상태와 실패 error 표시를 제공한다.
   - 성공 후 category 목록과 Epic/Todo 목록 갱신이 일어난다.

### 참조 코드

- `apps/mobile/src/app/(main)/settings/index.tsx`: mobile category management UI
- `packages/core/src/hooks/useDeleteCategory.ts`: delete detach mutation
- `packages/core/src/queryKeys.ts`: invalidate 정책

## 검증 과정

- [x] mobile 에서 category 삭제 전 confirmation 이 표시된다.
- [x] confirmation 이 Epic/Sub 유지 및 "분류 없음" 전환 정책을 안내한다.
- [x] 삭제 성공 후 category row 는 목록에서 사라진다.
- [x] 연결 Epic/Sub 는 삭제되지 않고 "분류 없음"으로 표시될 수 있다.

## 주의사항

- 삭제 문구가 Epic/Sub 삭제로 오해되지 않도록 작성한다.
- category delete 를 화면에서 직접 Supabase 호출하지 않고 core hook 을 사용한다.
- "분류 없음" row 를 생성하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
