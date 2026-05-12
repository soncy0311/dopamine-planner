# Task 03-15: 완료 Epic archive/calendar 회귀 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-15 |
| 상태 | 완료 |
| 의존성 | 03-01부터 03-14까지 완료 필요 |

## 작업 목표

완료 Epic archive 조회, category grouping, calendar completed count, web/mobile indicator 및 accessibility label 의 핵심 회귀 테스트를 추가한다. 특히 완료 Epic 을 active 로 되돌려 `completed_date = null` 이 되었을 때 archive/count 에서 제외되는 동작을 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정 - 완료 Epic grouping 및 "분류 없음" group 테스트 추가 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정 - archive/count query key 테스트 추가 |
| `packages/core/src/__tests__/cascadeToggleEpic.test.ts` | 수정/확인 - active 복귀 시 `completed_date = null` 제외 검증 |
| `packages/core/src/__tests__/*` | 수정/신규 - completed archive/count service 또는 hook 테스트 추가 |
| `apps/web/src/components/**/__tests__/*` | 가능 시 수정/신규 - web indicator/accessibility 테스트 |
| `apps/mobile/src/**/__tests__/*` | 가능 시 수정/신규 - mobile indicator/accessibility 테스트 |

### 구현 세부사항

1. **core 테스트**
   - 완료 archive service 가 `status = completed` 및 `completed_date` 존재 row 만 반환하는지 검증한다.
   - active 복귀로 `completed_date = null` 이 된 Epic 이 archive/count 에서 제외되는지 검증한다.
   - null category Epic 이 `"분류 없음"` group 에 포함되는지 검증한다.

2. **query/realtime 테스트**
   - archive 목록 key 와 calendar count key 가 기간/category 조건별로 분리되는지 검증한다.
   - 가능한 범위에서 realtime invalidate 대상에 archive/count key 가 포함되는지 검증한다.

3. **UI 테스트**
   - web/mobile 에서 0개, 1~4개 점, 5개당 별만 indicator 규칙을 검증한다.
   - 날짜 button/accessibility label 에 완료 Epic count 가 병합되고 indicator 자체는 장식으로 남는지 검증한다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: domain mapper/helper 테스트 패턴
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 테스트 패턴
- `packages/core/src/__tests__/cascadeToggleEpic.test.ts`: Epic 완료/active 전환 테스트
- `apps/web/src/components/MainDailyView.tsx`: web calendar indicator 대상
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile calendar indicator 대상

## 검증 과정

- [x] 완료 Epic active 복귀 시 archive 목록에서 제외되는 테스트가 있다.
- [x] 완료 Epic active 복귀 시 calendar count 에서 제외되는 테스트가 있다.
- [x] `"분류 없음"` group 이 실제 category row 없이 생성되는 테스트가 있다.
- [x] indicator 0개/1~4개 점/5개당 별만 규칙 테스트가 있다.
- [x] web 접근성 label 에 완료 Epic 개수가 반영되는 테스트가 있다.
- [x] mobile 접근성 label 반영은 `DateHeaderMobile` 타입 검증으로 확인했다.
- [ ] `make lint` 가 통과한다.
- [x] `make test` 가 통과한다.

## 실행 기록

- **일시**: 2026-05-12 23:58 KST
- **결과**: `make typecheck`, `make test` 통과. `make lint` 는 기존 환경 문제인 `apps/mobile`의 `eslint: command not found`로 실패하여 체크하지 않음.

## 변경 기록

- **일시**: 2026-05-13 00:44 KST
- **결과**: indicator 정책 변경에 맞춰 `1~4개 점`, `5개 이상은 5개당 별만`, `선택 날짜에서도 색상 유지` 테스트로 갱신. `make typecheck`, `make test` 통과. `make lint` 는 동일하게 `apps/mobile`의 `eslint: command not found`로 실패.

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
