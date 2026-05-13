# Task 02-16: 카드/목록/필터의 "분류 없음" 표시 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-16 |
| 상태 | 완료 |
| 의존성 | 02-06, 02-12, 02-15 완료 필요 |

## 작업 목표

web/mobile 카드, 목록, 필터에서 null category Epic 을 "분류 없음"으로 표시하고 필터링할 수 있게 한다. "전체" 필터와 "분류 없음" 필터는 서로 다른 의미로 분리한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/CategoryFilterChips.tsx` | 수정 - "분류 없음" 필터 옵션 추가 |
| `apps/web/src/components/MainDailyView.tsx` | 수정/확인 - null category Epic 표시 정합 |
| `apps/web/src/components/TodoSection.tsx` | 수정/확인 - 목록 내 category 표시 null 대응 |
| `apps/web/src/components/modals/EpicDetailModal.tsx` | 수정/확인 - detail category null 표시 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정/확인 - mobile null category 표시 |
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 수정/확인 - 카드/아코디언 category null 표시 |

### 구현 세부사항

1. **표시 문구 정책**
   - `categoryId = null` 또는 category join null 인 Epic 은 "분류 없음"으로 표시한다.
   - "분류 없음"은 실제 category row 로 만들지 않는다.
   - badge/color 가 필요한 경우 디자인 시스템 토큰 기반의 neutral 표현을 사용한다.

2. **필터 의미 분리**
   - "전체"는 모든 category 와 null category 를 포함한다.
   - "분류 없음"은 `category_id = null` 인 Epic 만 포함한다.
   - query/filter state 에서 전체와 null category 필터가 같은 값으로 저장되지 않게 한다.

3. **web/mobile 정합**
   - web 카드, 목록, detail 에서 null category 접근 오류를 제거한다.
   - mobile 카드, 목록, form 진입 경로에서 null category 접근 오류를 제거한다.
   - 완료 Epic 모아보기(Sub-03)에서 "분류 없음" 그룹을 재사용할 수 있게 helper 를 분리할지 검토한다.

### 참조 코드

- `apps/web/src/components/CategoryFilterChips.tsx`: web category filter
- `apps/web/src/components/MainDailyView.tsx`: web 메인 카드/목록 표시
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 메인 표시
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile issue card 표시
- `packages/core/src/domain/epic.ts`: null category 도메인 계약

## 검증 과정

- [x] web 카드/목록/detail 이 null category Epic 을 "분류 없음"으로 표시한다.
- [x] mobile 카드/목록이 null category Epic 을 오류 없이 표시한다.
- [x] "전체" 필터는 null category Epic 을 포함한다.
- [x] "분류 없음" 필터는 null category Epic 만 보여준다.

## 주의사항

- "전체"와 "분류 없음"은 별도 필터 의미다.
- "분류 없음" category row 생성, seed, 자동 upsert 를 하지 않는다.
- neutral 표시 스타일은 기존 디자인 토큰과 접근성 대비 기준을 따른다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../../../base/design-system/components/category-combobox-create.md`](../../../base/design-system/components/category-combobox-create.md)
