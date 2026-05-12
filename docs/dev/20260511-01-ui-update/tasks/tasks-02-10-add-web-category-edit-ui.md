# Task 02-10: web 분류명/색상 수정 UI 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-10 |
| 상태 | 대기중 |
| 의존성 | 02-07 완료 필요 |

## 작업 목표

web 설정의 분류 관리 화면에서 분류명과 색상을 수정할 수 있는 UI 를 추가한다. 기존 디자인 시스템과 설정 화면 패턴을 유지하면서 category update hook 을 연결한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/app/(main)/settings/page.tsx` | 수정 - category edit controls 추가 |
| `apps/web/src/components/ui/CategoryComboboxCreate.tsx` | 확인/필요 시 수정 - category name/color 입력 패턴 재사용 |
| `docs/base/design-system/components/settings-page.md` | 확인 - 설정 화면 분류 관리 패턴 참조 |
| `docs/base/design-system/components/category-combobox-create.md` | 확인 - category 입력/색상 선택 패턴 참조 |

### 구현 세부사항

1. **편집 진입 UI**
   - category row 별로 수정 액션을 제공한다.
   - 이름과 색상 edit 상태, 취소, 저장 상태를 명확히 분리한다.
   - 아이콘 버튼과 tooltip 등 기존 web UI 패턴을 따른다.

2. **입력 검증**
   - category name required, 길이, 중복 등 기존 create 검증과 동일한 기준을 적용한다.
   - 색상 선택은 기존 swatch/token 패턴을 재사용한다.

3. **mutation 연결**
   - `useUpdateCategory` 를 사용해 저장한다.
   - 저장 중 disabled/loading 상태와 오류 표시를 기존 설정 화면 패턴에 맞춘다.
   - 저장 성공 후 row 가 최신 name/color 로 표시된다.

### 참조 코드

- `apps/web/src/app/(main)/settings/page.tsx`: web 설정 화면
- `apps/web/src/components/ui/CategoryComboboxCreate.tsx`: category 생성 입력 패턴
- `packages/core/src/hooks/useUpdateCategory.ts`: category update hook

## 검증 과정

- [ ] web 설정 화면에서 category name 을 수정할 수 있다.
- [ ] web 설정 화면에서 category color 를 수정할 수 있다.
- [ ] invalid 입력 시 저장되지 않고 사용자에게 오류가 표시된다.
- [ ] 수정 후 연결 Epic/Sub 표시가 최신 category name/color 를 사용할 수 있도록 invalidate 된다.

## 주의사항

- 분류 수정은 category row 만 변경하며 Epic/Sub row 일괄 업데이트를 하지 않는다.
- 디자인 토큰 외 임의 색상 체계를 새로 만들지 않는다.
- 삭제 confirmation 은 02-11 에서 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../../../base/design-system/components/settings-page.md`](../../../base/design-system/components/settings-page.md)
- [`../../../base/design-system/components/category-combobox-create.md`](../../../base/design-system/components/category-combobox-create.md)
