# Task 04-02: 공통 QA fixture 정의

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-02 |
| 상태 | 완료 |
| 의존성 | 04-01 완료 필요 |

## 작업 목표

progress, category, completed archive, calendar count 검증에 사용할 공통 QA fixture 를 정의한다. web/mobile 수동 QA 와 자동 테스트가 같은 데이터 의미를 사용하도록 fixture 케이스, 날짜, category/null category 상태, 완료 count 를 고정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/*` | 수정/신규 - core 테스트 fixture 또는 builder 정의 |
| `apps/web/src/**/__tests__/*` | 수정/신규 - web 테스트에서 core와 같은 fixture 의미 사용 |
| `apps/mobile/src/**/__tests__/*` | 수정/신규 - mobile 테스트에서 core와 같은 fixture 의미 사용 |
| `docs/dev/20260511-01-ui-update/sub-prd-04-test-cross-client-qa.md` | 필요 시 수정 - 수동 QA fixture 기록 위치 연결 |

### 구현 세부사항

1. **fixture 케이스 정의**
   - Sub 0개 Epic, 일부 Sub 완료 Epic, 전체 완료 Epic 을 포함한다.
   - 일반 분류 Epic, `category_id = null` Epic, 분류 삭제 전/후 Epic 을 포함한다.
   - 같은 날짜 완료 Epic 0개, 1개, 4개, 5개, 6개, 10개 케이스를 포함한다.

2. **플랫폼 공통 의미 고정**
   - web/mobile 테스트가 같은 fixture 명칭과 같은 기대값을 사용하도록 정리한다.
   - 테스트 도구 차이 때문에 파일 구조가 달라도 입력 데이터의 도메인 의미는 유지한다.

3. **수동 QA 데이터 연결**
   - Supabase local seed 또는 테스트 계정 데이터로 재현할 수 있는 절차를 문서 또는 이슈에 기록한다.
   - 수동 QA 에서 사용할 날짜와 완료 count 를 자동 테스트와 맞춘다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: domain fixture 패턴
- `packages/core/src/__tests__/cascadeToggleEpic.test.ts`: Epic/Sub 상태 전환 fixture 패턴
- `apps/web/src/components/MainDailyView.tsx`: web 수동 QA fixture 확인 화면
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 수동 QA fixture 확인 화면

## 검증 과정

- [x] Sub 0개, 일부 완료, 전체 완료 Epic fixture 가 있다.
- [x] 일반 분류와 `category_id = null` Epic fixture 가 있다.
- [x] 분류 삭제 전/후 데이터 보존 검증용 fixture 가 있다.
- [x] 완료 Epic count 0/1/4/5/6/10 날짜 fixture 가 있다.
- [x] web/mobile 이 같은 fixture 의미로 검증된다는 기록이 있다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시하고 점을 추가하지 않는다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
