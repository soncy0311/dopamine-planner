# Task 01-02: Sub 0개 Epic progress 미표기 정책 문서화

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-02 |
| 상태 | 완료 |
| 의존성 | tasks-01-01 완료 필요 |

## 작업 목표

Sub 가 0개인 Epic 에서는 progress bar 를 렌더링하지 않는 정책을 디자인 시스템 문서에 명시한다. 0% bar 로 표시하는 대안은 사용하지 않고, Epic 자체 완료 상태는 checkbox/status 같은 별도 UI 로 표현하도록 web/mobile 공통 기준을 고정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `docs/base/design-system/components/progress-bar.md` | 수정 - `totalSubCount = 0` 일 때 progress bar 미표기 정책 명시 |
| `docs/base/design-system/components.md` | 확인/필요 시 수정 - EpicCard 정책과 progress 문서 간 충돌 제거 |

### 구현 세부사항

1. **상태 표 갱신**
   - `Sub 0 개 (Epic 단독)` 행을 `진행률 미표기` 로 확정한다.
   - `or 0%` 같은 선택 표현을 제거한다.

2. **호스트 책임 명시**
   - Epic host 는 `totalSubCount === 0` 일 때 ProgressBar 와 percent 텍스트를 함께 숨긴다.
   - Epic 자체 완료 여부는 main checkbox/status 로 표현하며 Sub 기반 progress 와 혼합하지 않는다.

3. **접근성 정책 정리**
   - progress bar 를 렌더링하지 않는 경우 `progressbar` role 도 노출하지 않는다.
   - 별도 상태 텍스트가 필요하면 progressbar 가 아닌 Epic 상태 의미로 제공한다.

### 참조 코드

- `packages/ui/src/IssueCardAccordion.tsx`: 현재 Sub 0개여도 progress 영역이 렌더링될 수 있는 web 카드 host
- `apps/mobile/src/components/IssueCardAccordion.tsx`: 현재 `segments.length === 0` 일 때 빈 bar 를 렌더링하는 mobile 카드 host
- `apps/web/src/components/MainDailyView.tsx`: Sub 0개일 때 `epic.progress` 기반 percent fallback 계산
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: Sub 0개일 때 `epic.progress` 기반 percent fallback 계산

## 검증 과정

- [x] progress 문서에 `totalSubCount = 0` 은 progress bar 미표기로 명시되어 있다.
- [x] `0% bar`, `숨김 vs 0%` 처럼 정책을 열어두는 표현이 남아 있지 않다.
- [x] web/mobile 모두 같은 정책을 적용해야 한다는 문장이 포함되어 있다.
- [x] Epic 자체 완료 상태와 Sub 기반 진행률이 별도 의미라는 설명이 포함되어 있다.

## 주의사항

- Sub 0개 Epic 의 완료 토글 정책 자체는 변경하지 않는다.
- `epic.progress` 값을 삭제하거나 계산 로직을 바꾸는 요구사항으로 확장하지 않는다.
- 이 문서 정책은 후속 web/mobile 구현 task 의 기준이 된다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
