# Task 03-13: mobile 달력 완료 indicator 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-13 |
| 상태 | 완료 |
| 의존성 | 03-05, 03-06 완료 필요 |

## 작업 목표

mobile 메인 달력 날짜 셀에 완료 Epic 개수 indicator 를 추가한다. web 과 같은 count hook 및 indicator 규칙을 사용하되, React Native 레이아웃과 터치 영역을 해치지 않도록 날짜 셀 내부에 안정적으로 배치한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정 - monthly completed count hook 연결 |
| `apps/mobile/src/components/DateHeaderMobile.tsx` | 수정/확인 - 날짜 셀 indicator 렌더링 |
| `apps/mobile/src/components/**` | 수정/신규 - 필요 시 indicator subcomponent 추가 |

### 구현 세부사항

1. **count 데이터 연결**
   - 현재 표시 중인 월 기준으로 monthly completed count hook 을 호출한다.
   - 날짜 셀은 count map 에서 해당 날짜의 값을 읽는다.

2. **indicator 렌더링**
   - count 0개는 indicator 를 표시하지 않는다.
   - count 1~4개는 완료 Epic 1개당 작은 점 1개를 표시한다.
   - count 5개 이상은 5개당 작은 별 1개만을 표시한다.

3. **모바일 레이아웃**
   - 날짜 숫자, 선택 상태, indicator 가 겹치지 않게 고정된 셀 높이와 정렬을 사용한다.
   - indicator 가 터치 대상이 되지 않도록 날짜 버튼/pressable 내부 장식으로 둔다.

### 참조 코드

- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 달력/일자 뷰 구성
- `apps/mobile/src/components/DateHeaderMobile.tsx`: 날짜 셀 구현 위치
- `packages/core/src/hooks/**`: monthly completed count hook

## 검증 과정

- [x] 완료 Epic 0개 날짜에는 indicator 가 표시되지 않는다.
- [x] 완료 Epic 1~4개 날짜에는 완료 Epic 개수만큼 작은 점이 표시된다.
- [x] 완료 Epic 5개 이상 날짜에는 5개당 작은 별만이 표시된다.

## 변경 기록

- **일시**: 2026-05-13 00:39 KST
- **결과**: indicator 정책을 `1~4개 = 개수만큼 점`, `5개 이상 = 5개당 별만`으로 수정.
- [x] 날짜 셀별 Supabase 호출이 발생하지 않는다.

## 실행 기록

- **일시**: 2026-05-12 23:58 KST
- **결과**: `DateHeaderMobile` completed count props 및 indicator 추가, `make typecheck` 통과.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 batch 조회하며 날짜 셀별 Supabase 호출 금지다.
- indicator 규칙은 0개 없음, 1~4개는 완료 Epic 1개당 점 1개, 5개 이상은 5개당 별 1개만 표시하며 점은 추가하지 않는다. 주간 UI에서는 선택된 날짜에서도 indicator 색상은 변하지 않고, 월간 UI에서는 선택된 날짜 indicator 색상을 흰색으로 바꾼다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
