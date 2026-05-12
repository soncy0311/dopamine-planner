# Task 03-09: web 달력 완료 indicator 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-09 |
| 상태 | 대기중 |
| 의존성 | 03-05, 03-06 완료 필요 |

## 작업 목표

web 메인 달력 날짜 셀에 해당 날짜의 완료 Epic 개수 indicator 를 추가한다. indicator 는 03-05의 월 단위 count hook 을 사용하며, 날짜 셀별 Supabase 호출 없이 count map 에서 값을 읽어 렌더링한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 수정 - 달력 count hook 연결 및 날짜 셀 전달 |
| `apps/web/src/components/**` | 수정/신규 - calendar date cell indicator 렌더링 |
| `packages/ui/src/DateNavigator.tsx` | 확인/필요 시 수정 - 날짜 셀 확장 가능 여부 확인 |

### 구현 세부사항

1. **count 데이터 연결**
   - 현재 표시 중인 월을 기준으로 completed count hook 을 호출한다.
   - 날짜 셀 렌더링 시 `YYYY-MM-DD` key 로 count 를 조회한다.

2. **indicator 렌더링**
   - count 0개는 indicator 를 표시하지 않는다.
   - count 1~5개는 작은 점 1개를 표시한다.
   - count 6개 이상은 `floor(count / 5)` 개의 별표를 표시한다.

3. **시각 스타일**
   - 날짜 숫자와 indicator 가 겹치지 않도록 셀 내부의 안정적인 높이/정렬을 정의한다.
   - indicator 는 장식 요소로만 렌더링하고 focus 대상이 되지 않게 한다.

### 참조 코드

- `apps/web/src/components/MainDailyView.tsx`: web 달력/일자 뷰 구성
- `packages/ui/src/DateNavigator.tsx`: date navigator/date cell 구조
- `packages/core/src/hooks/**`: monthly completed count hook

## 검증 과정

- [ ] 완료 Epic 0개 날짜에는 indicator 가 표시되지 않는다.
- [ ] 완료 Epic 1~5개 날짜에는 작은 점 1개가 표시된다.
- [ ] 완료 Epic 6개 이상 날짜에는 `floor(count / 5)` 별표가 표시된다.
- [ ] 날짜 셀별 Supabase 호출이 발생하지 않는다.

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
