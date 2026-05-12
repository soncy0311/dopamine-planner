# Task 03-05: 월 단위 calendar completed count service/hook 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-05 |
| 상태 | 대기중 |
| 의존성 | 03-01, 03-02 완료 필요 |

## 작업 목표

월 단위로 `completed_date` 별 완료 Epic 개수를 batch 조회하는 service 와 hook 을 추가한다. 달력 날짜 셀마다 Supabase 를 호출하지 않고 한 달 범위의 count map 을 받아 web/mobile calendar indicator 가 공유하도록 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/services/epic.ts` | 수정 - 월 단위 completed count 조회 service 추가 |
| `packages/core/src/hooks/**` | 수정/신규 - completed count query hook 추가 |
| `packages/core/src/queryKeys.ts` | 확인 - 03-02 count key 사용 |

### 구현 세부사항

1. **batch count 조회**
   - 입력은 workspace 와 대상 월로 제한한다.
   - 월 시작일/종료일 기준으로 `completed_date` 범위를 만든다.
   - `status = 'completed'` 이고 `completed_date` 가 있는 row 만 날짜별 count 로 집계한다.

2. **반환 형태**
   - `Record<YYYY-MM-DD, number>` 또는 equivalent count map 으로 반환한다.
   - count 가 없는 날짜는 0으로 해석할 수 있게 한다.

3. **hook 구현**
   - TanStack Query key 는 03-02 의 calendar count key 를 사용한다.
   - stale/invalidation 정책은 기존 daily/monthly 조회 hook 패턴을 따른다.

### 참조 코드

- `packages/core/src/services/epic.ts`: Supabase 조회 service 패턴
- `packages/core/src/hooks/**`: 기존 Epic/category hook 패턴
- `packages/core/src/queryKeys.ts`: calendar completed count key

## 검증 과정

- [ ] 한 달 범위의 완료 Epic count 가 단일 batch 조회로 반환된다.
- [ ] `status = 'completed'` 이고 `completed_date` 가 있는 row 만 count 된다.
- [ ] active 복귀로 `completed_date = null` 인 row 가 count 에 포함되지 않는다.
- [ ] 날짜 셀 렌더링이 개별 Supabase 호출을 유발하지 않는다.

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
