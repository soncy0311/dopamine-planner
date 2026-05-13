# Task 04-03: web progress linear 렌더링 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-03 |
| 상태 | 완료 |
| 의존성 | 04-01, 04-02 완료 필요 |

## 작업 목표

web Epic 카드와 상세/편집 화면에서 progress 가 segmented 가 아닌 단일 linear bar 로 렌더링되는지 자동 테스트를 추가 또는 갱신한다. Sub 0개, 일부 완료, 전체 완료 케이스가 같은 표시 정책을 따르는지 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/__tests__/IssueCardAccordion.test.tsx` | 수정 - web Epic 카드 progress linear 렌더링 테스트 추가 |
| `packages/ui/src/EpicProgressBar.tsx` | 필요 시 확인/수정 - 테스트 가능한 role/속성 유지 |
| `apps/web/src/components/**/__tests__/*` | 수정/신규 - 상세/편집 화면 progress 렌더링 테스트 |
| `apps/web/src/components/MainDailyView.tsx` | 확인 - 카드 렌더링 연결 지점 점검 |

### 구현 세부사항

1. **linear 렌더링 검증**
   - Sub 일부 완료 fixture 에서 progressbar 가 단일 요소로 렌더링되는지 확인한다.
   - Sub 개수만큼 segment element 를 렌더링하는 이전 구조가 남지 않았는지 검증한다.

2. **Sub 0개 정책 검증**
   - `totalSubCount = 0` Epic 에서 progressbar 가 표시되지 않는지 확인한다.
   - 0% linear bar 로 대체 표시하지 않는다는 정책을 테스트에 반영한다.

3. **화면별 일관성 검증**
   - 카드, 상세, 편집 화면이 같은 progress component 또는 같은 표시 정책을 사용하는지 확인한다.
   - className 중심의 취약한 테스트보다 role/value/DOM 구조의 사용자 관찰 가능 결과를 우선한다.

### 참조 코드

- `packages/ui/__tests__/IssueCardAccordion.test.tsx`: 기존 web 카드 테스트 패턴
- `packages/ui/src/EpicProgressBar.tsx`: linear progress 구현 대상
- `docs/base/design-system/components/progress-bar.md`: progress 표시 정책 SoT

## 검증 과정

- [x] web Epic 카드에서 linear progress 렌더링 테스트가 있다.
- [x] Sub 0개 Epic 에서 progressbar 미표기 테스트가 있다.
- [x] 일부 완료와 전체 완료 fixture 가 progress 표시를 검증한다.
- [x] segmented 구조 회귀를 잡을 수 있는 테스트가 있다.
- [x] `make test` 실행 시 관련 web 테스트가 통과한다.

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
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
