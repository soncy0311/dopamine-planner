# Task 03-11: mobile 완료 Epic 모아보기 화면/섹션 구현

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-11 |
| 상태 | 대기중 |
| 의존성 | 03-01부터 03-06까지 완료 필요 |

## 작업 목표

mobile 에 완료 Epic archive 화면 또는 섹션을 구현한다. web 과 동일한 `packages/core` service/hook 을 사용해 완료 Epic 목록을 표시하고, 모바일 화면 밀도에 맞춰 제목, 분류, 우선순위, 완료일, 100% progress 상태를 제공한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/app/(main)/work/index.tsx` | 수정/확인 - archive 진입 위치 또는 섹션 연결 |
| `apps/mobile/src/app/(main)/life/index.tsx` | 수정/확인 - 필요 시 life 영역에도 동일 패턴 적용 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정/확인 - 기존 메인 구성과 archive 진입 정합 |
| `apps/mobile/src/components/**` | 신규/수정 - 완료 Epic archive view component 추가 |

### 구현 세부사항

1. **진입 구조 결정**
   - Expo Router 구조에 맞춰 별도 screen, stack 진입, 또는 메인 섹션 중 하나를 선택한다.
   - web 과 정보 구조는 맞추되 모바일 내비게이션 패턴을 따른다.

2. **목록 UI 구성**
   - SectionList 또는 기존 list 패턴으로 category group 을 표시할 수 있게 준비한다.
   - 완료 Epic row 는 모바일 카드/accordion 밀도에 맞춰 구성한다.

3. **데이터 연결**
   - 완료 archive service/hook 을 재사용한다.
   - `category_id = null` Epic 이 `"분류 없음"`으로 표시되게 한다.

### 참조 코드

- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 메인 일자 뷰 구성
- `apps/mobile/src/components/DateHeaderMobile.tsx`: 날짜 탐색 패턴
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile Epic row/card 표현 패턴
- `packages/core/src/hooks/**`: 완료 archive hook

## 검증 과정

- [ ] mobile 에서 완료 Epic archive 화면 또는 섹션에 진입할 수 있다.
- [ ] `status = completed` 이고 `completed_date` 가 있는 Epic 만 표시된다.
- [ ] 완료 Epic row 에 제목, 분류, 우선순위, 완료일, 100% progress 가 표시된다.
- [ ] `category_id = null` Epic 이 `"분류 없음"`으로 표시된다.

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
