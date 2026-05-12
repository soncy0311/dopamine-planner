# Task 03-12: mobile archive 월 이동/날짜 필터/분류 그룹 구현

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-12 |
| 상태 | 대기중 |
| 의존성 | 03-11 완료 필요 |

## 작업 목표

mobile 완료 Epic archive 에 월 이동, 날짜 필터, 분류별 그룹 목록을 구현한다. 작은 화면에서도 사용자가 기간을 바꾸고 category group 별 완료 Epic 을 탐색할 수 있어야 하며, `"분류 없음"` group 은 실제 category row 없이 마지막 그룹으로 표시한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/**` | 수정/신규 - archive filter/group UI 추가 |
| `apps/mobile/src/components/DateHeaderMobile.tsx` | 확인/재사용 - 월/날짜 이동 UI 패턴 |
| `apps/mobile/src/app/(main)/work/index.tsx` | 수정/확인 - archive filter 상태 연결 |
| `apps/mobile/src/app/(main)/life/index.tsx` | 수정/확인 - 필요 시 동일 패턴 적용 |

### 구현 세부사항

1. **기간 탐색**
   - 모바일 조작에 맞는 월 이동 및 날짜 필터 UI 를 제공한다.
   - 선택 월/기간을 완료 archive query 입력으로 변환한다.

2. **분류별 목록**
   - category group 단위로 header 와 Epic list 를 표시한다.
   - 일반 category 정렬 뒤 `"분류 없음"` group 을 마지막에 배치한다.

3. **모바일 상태 처리**
   - loading, error, empty 상태를 모바일 컴포넌트 패턴으로 처리한다.
   - touch target 과 스크롤 동작이 archive 목록과 충돌하지 않게 한다.

### 참조 코드

- `apps/mobile/src/components/DateHeaderMobile.tsx`: 모바일 날짜 이동 패턴
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile Epic row/card 패턴
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
