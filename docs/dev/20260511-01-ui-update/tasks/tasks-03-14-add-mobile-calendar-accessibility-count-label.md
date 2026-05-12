# Task 03-14: mobile accessibility label 에 완료 개수 반영

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-14 |
| 상태 | 대기중 |
| 의존성 | 03-13 완료 필요 |

## 작업 목표

mobile 달력 날짜 Pressable 또는 접근성 대상의 accessibility label 에 완료 Epic 개수를 반영한다. indicator 자체는 장식으로 유지하고, VoiceOver/TalkBack 에서는 날짜 label 을 통해 `"완료 Epic N개"` 정보를 전달한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/DateHeaderMobile.tsx` | 수정 - 날짜 접근성 label 에 completed count 병합 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정/확인 - count 전달 경로 확인 |
| `apps/mobile/src/**/__tests__/*` | 가능 시 수정/신규 - accessibility label 테스트 추가 |

### 구현 세부사항

1. **accessibility label 생성**
   - 기존 날짜, 선택 상태, 오늘 여부 label 을 유지한다.
   - count 가 1 이상일 때만 `"완료 Epic N개"` 문구를 추가한다.
   - count 0 날짜에는 완료 개수 문구를 추가하지 않는다.

2. **중복 읽기 방지**
   - indicator view/text 는 접근성 트리에서 제외하거나 날짜 pressable label 과 중복되지 않게 한다.
   - indicator 가 별도 focus 대상이 되지 않게 한다.

3. **테스트/수동 검증**
   - count 0, 1, 6 이상 케이스의 accessibility label 을 확인한다.
   - iOS/Android 접근성 속성 차이를 기존 프로젝트 패턴에 맞춰 처리한다.

### 참조 코드

- `apps/mobile/src/components/DateHeaderMobile.tsx`: 날짜 Pressable/accessibility label 구현 위치
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: count 전달 source
- `docs/base/design-system/`: 접근성 관련 기준

## 검증 과정

- [ ] 완료 Epic 이 있는 날짜의 accessibility label 에 `"완료 Epic N개"`가 포함된다.
- [ ] 완료 Epic 0개 날짜에는 완료 개수 문구가 추가되지 않는다.
- [ ] indicator 요소가 별도 focus 대상이 아니다.
- [ ] VoiceOver/TalkBack 에서 indicator 정보가 중복으로 읽히지 않는다.

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
