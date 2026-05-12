# Task 02-13: mobile 분류명/색상 수정 UI 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-13 |
| 상태 | 완료 |
| 의존성 | 02-07 완료 필요 |

## 작업 목표

mobile 설정 화면에서 분류명과 색상을 수정할 수 있는 UI 를 추가한다. web 과 동일한 검증 기준과 core update hook 을 사용하되, Expo/React Native 화면 패턴에 맞는 입력 흐름을 제공한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/app/(main)/settings/index.tsx` | 수정 - category edit controls 추가 |
| `apps/mobile/src/components/Button.tsx` | 확인 - 저장/취소/delete 액션 버튼 패턴 참조 |
| `apps/mobile/src/components/forms/EpicForm.tsx` | 확인 - category 선택 UI 패턴 참조 |

### 구현 세부사항

1. **편집 UI 구성**
   - category row 또는 detail 영역에서 이름과 색상을 수정할 수 있게 한다.
   - mobile 화면 폭에서 입력, 색상 선택, 저장/취소 버튼이 겹치지 않게 배치한다.
   - 기존 Nativewind 스타일과 버튼 패턴을 따른다.

2. **입력 검증**
   - web 과 같은 category name required, 길이, 중복 기준을 적용한다.
   - 색상 선택은 기존 category 생성/선택 UI의 color set 을 재사용한다.

3. **mutation 연결**
   - `useUpdateCategory` 를 사용해 저장한다.
   - 저장 중 disabled/loading 상태와 error 표시를 제공한다.
   - 성공 후 category row 가 최신 name/color 로 표시된다.

### 참조 코드

- `apps/mobile/src/app/(main)/settings/index.tsx`: mobile 설정 화면
- `apps/mobile/src/components/forms/EpicForm.tsx`: mobile form 패턴
- `packages/core/src/hooks/useUpdateCategory.ts`: category update hook

## 검증 과정

- [x] mobile 설정 화면에서 category name 을 수정할 수 있다.
- [x] mobile 설정 화면에서 category color 를 수정할 수 있다.
- [x] invalid 입력 시 저장되지 않고 오류가 표시된다.
- [x] 수정 후 연결 Epic/Sub 표시가 최신 category name/color 를 사용할 수 있도록 invalidate 된다.

## 주의사항

- web 과 validation 정책이 달라지지 않게 한다.
- 화면 폭이 좁아도 버튼과 텍스트가 겹치지 않도록 한다.
- 삭제 confirmation 은 02-14 에서 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../../../base/design-system/components/settings-page.md`](../../../base/design-system/components/settings-page.md)
