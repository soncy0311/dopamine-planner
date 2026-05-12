# Task 03-08: web archive 월 이동/날짜 필터/분류 그룹 구현

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-08 |
| 상태 | 대기중 |
| 의존성 | 03-07 완료 필요 |

## 작업 목표

web 완료 Epic archive 에 월 이동, 날짜 필터, 분류별 그룹 목록을 구현한다. 사용자는 특정 월 또는 날짜 범위의 완료 Epic 을 category group 단위로 탐색할 수 있어야 하며, `"분류 없음"` group 도 일반 category 와 함께 표시되어야 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/**` | 수정/신규 - archive filter/group UI 추가 |
| `apps/web/src/components/CategoryFilterChips.tsx` | 확인/필요 시 수정 - "전체"/특정 category/"분류 없음" filter 패턴 재사용 |
| `packages/ui/src/DateNavigator.tsx` | 확인/재사용 - 월 이동 UI 패턴 |

### 구현 세부사항

1. **기간 탐색**
   - 월 이동 UI 를 제공하고 선택 월에 맞는 archive query 를 호출한다.
   - 날짜 필터가 필요한 경우 월 범위 안에서 `from`/`to` 또는 단일 날짜 선택으로 service 입력을 변환한다.

2. **분류별 그룹 표시**
   - 03-03, 03-04 grouping helper 결과를 사용한다.
   - 일반 category group 은 기존 sort/order 정책을 따르고 `"분류 없음"`은 마지막에 표시한다.

3. **상태 처리**
   - loading, error, empty 상태를 기존 web UI 패턴으로 처리한다.
   - 필터 변경 시 stale 목록이 사용자에게 혼동되지 않도록 query 상태를 명확히 표시한다.

### 참조 코드

- `packages/ui/src/DateNavigator.tsx`: 날짜/월 이동 UI
- `apps/web/src/components/CategoryFilterChips.tsx`: category filter chips 패턴
- `packages/core/src/domain/epic.ts`: completed archive grouping helper

## 검증 과정

- [ ] 월 이동 시 해당 월의 완료 Epic 만 표시된다.
- [ ] 날짜 필터 변경 시 해당 기간의 완료 Epic 만 표시된다.
- [ ] 일반 category group 과 `"분류 없음"` group 이 모두 표시된다.
- [ ] `"전체"` filter 와 `"분류 없음"` filter 가 다른 결과를 보여준다.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 batch 조회하며 날짜 셀별 Supabase 호출 금지다.
- indicator 규칙은 0개 없음, 1~5개 점 1개, 6개 이상 `floor(count / 5)` 별표다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
