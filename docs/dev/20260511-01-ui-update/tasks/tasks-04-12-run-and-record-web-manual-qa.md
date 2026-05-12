# Task 04-12: web 수동 QA 실행 및 기록

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-12 |
| 상태 | 대기중 |
| 의존성 | 04-02부터 04-11까지 완료 필요 |

## 작업 목표

web 클라이언트에서 Sub-04 수동 QA 시나리오를 실행하고 결과를 문서 또는 이슈에 기록한다. 자동 테스트로 검증하기 어려운 시각 정합, focus 흐름, confirmation 동작, realtime 반영을 실제 화면에서 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 확인 - web 일자 뷰, 달력, Epic 카드 QA |
| `apps/web/src/components/**` | 확인 - category edit/delete, Epic edit, archive QA |
| `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md` | 필요 시 수정 - QA 결과 기록 위치 연결 |
| GitHub Issue 또는 QA 문서 | 신규/수정 - web 수동 QA 결과 기록 |

### 구현 세부사항

1. **progress/category 시나리오 실행**
   - Sub 개수가 다른 Epic 카드의 progress 가 모두 linear 로 보이는지 확인한다.
   - 분류 수정, 삭제, Epic 편집 내 분류 제거/재지정 흐름을 확인한다.
   - 분류 삭제 후 Epic/Sub 가 유지되고 `"분류 없음"`으로 이동하는지 확인한다.

2. **archive/calendar 시나리오 실행**
   - 완료 Epic archive 에서 일반 분류와 `"분류 없음"` 그룹이 모두 표시되는지 확인한다.
   - 달력에서 완료 Epic 0/1/5/6/10개 날짜 indicator 가 규칙과 일치하는지 확인한다.
   - 완료 Epic active 복귀 후 archive 와 calendar indicator 에서 제외되는지 확인한다.

3. **접근성/realtime 기록**
   - progressbar, 달력 날짜, category controls, delete confirmation 의 focus/label 흐름을 확인한다.
   - 다른 세션 변경이 web 화면에 반영되는지 확인하고 결과를 기록한다.

### 참조 코드

- `apps/web/src/components/MainDailyView.tsx`: web 메인 수동 QA 대상
- `apps/web/src/components/**`: web category/archive/edit 수동 QA 대상
- `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md`: 수동 QA 시나리오 SoT

## 검증 과정

- [ ] web progress linear 표시와 Sub 0개 정책이 확인되어 있다.
- [ ] web category 수정/삭제/분류 제거/재지정 흐름이 확인되어 있다.
- [ ] web archive group 과 calendar indicator 규칙이 확인되어 있다.
- [ ] web 접근성 focus/label 흐름이 확인되어 있다.
- [ ] web realtime 변경 반영이 확인되어 있다.
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
