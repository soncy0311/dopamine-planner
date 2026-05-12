# Task 04-13: mobile 수동 QA 실행 및 기록

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-13 |
| 상태 | 대기중 |
| 의존성 | 04-02부터 04-12까지 완료 필요 |

## 작업 목표

mobile 클라이언트에서 Sub-04 수동 QA 시나리오를 실행하고 결과를 문서 또는 이슈에 기록한다. web 과 같은 fixture, 같은 정책으로 progress, category, archive, calendar, 접근성, realtime 동작을 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 확인 - mobile 일자 뷰, 달력, Epic 카드 QA |
| `apps/mobile/src/components/**` | 확인 - category edit/delete, Epic edit, archive QA |
| `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md` | 필요 시 수정 - QA 결과 기록 위치 연결 |
| GitHub Issue 또는 QA 문서 | 신규/수정 - mobile 수동 QA 결과 기록 |

### 구현 세부사항

1. **progress/category 시나리오 실행**
   - mobile Epic 카드와 상세/편집 화면의 progress 가 web 과 같은 linear 정책인지 확인한다.
   - category 수정, 삭제, Epic 분류 제거/재지정 흐름이 web 과 같은 정책인지 확인한다.
   - 분류 삭제 후 Epic/Sub 가 유지되고 `"분류 없음"`으로 표시되는지 확인한다.

2. **archive/calendar 시나리오 실행**
   - mobile archive 에서 일반 분류와 `"분류 없음"` group 이 모두 표시되는지 확인한다.
   - 달력 indicator 0/1/5/6/10개 규칙이 web 과 같은지 확인한다.
   - 완료 Epic active 복귀 후 archive/count 에서 제외되는지 확인한다.

3. **접근성/realtime 기록**
   - RN accessibility label/value, focus 이동, delete confirmation 흐름을 확인한다.
   - 다른 세션 변경이 mobile 화면에 반영되는지 확인하고 결과를 기록한다.

### 참조 코드

- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 메인 수동 QA 대상
- `apps/mobile/src/components/**`: mobile category/archive/edit 수동 QA 대상
- `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md`: 수동 QA 시나리오 SoT

## 검증 과정

- [ ] mobile progress linear 표시와 Sub 0개 정책이 확인되어 있다.
- [ ] mobile category 수정/삭제/분류 제거/재지정 흐름이 확인되어 있다.
- [ ] mobile archive group 과 calendar indicator 규칙이 확인되어 있다.
- [ ] mobile 접근성 focus/label 흐름이 확인되어 있다.
- [ ] mobile realtime 변경 반영이 확인되어 있다.
- [ ] 수동 QA 결과가 문서 또는 이슈에 기록되어 있다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~5개 점 1개, 6개 이상 `floor(count / 5)` 별표다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
