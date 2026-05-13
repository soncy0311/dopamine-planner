# Task 01-01: Progress Bar Epic 기본 variant 갱신

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-01 |
| 상태 | 완료 |
| 의존성 | 없음 |

## 작업 목표

디자인 시스템의 Progress Bar 문서에서 Epic 기본 표시 정책을 `segmented` 에서 `linear` 로 변경한다. 진행률 산출식은 `completedSubCount / totalSubCount` 로 유지하고, Sub 개수와 관계없이 Epic 기본 progress 는 단일 linear bar 로 표시하도록 문서 SoT 를 갱신한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `docs/base/design-system/components/progress-bar.md` | 수정 - EpicCard 기본 variant 및 전환 기준을 `linear` 중심으로 갱신 |
| `docs/base/design-system/components.md` | 확인/필요 시 수정 - EpicCard 또는 ProgressBar 기본 정책에 `segmented` 기본값 언급이 남아 있는지 점검 |

### 구현 세부사항

1. **variant 정책 변경**
   - `segmented (기본)` 표현을 제거하고 `linear` 를 Epic 기본 variant 로 명시한다.
   - `segmented` 는 후속 실험 또는 특수 사용처로 남길 수 있지만 Epic 기본값으로 문서화하지 않는다.
   - Sub 개수가 1개, 3개, 10개 이상이어도 기본 형태가 `linear` 임을 명시한다.

2. **전환 기준 정리**
   - 기존 `totalSubCount <= 10` 일 때 `segmented`, `> 10` 일 때 `linear` 전환 기준은 Epic 기본 정책에서 제거한다.
   - `segmented` 사용이 필요할 경우 Epic 기본 정책이 아닌 별도 실험/특수 컴포넌트 정책으로 분리한다.

3. **사용 예 갱신**
   - 예시 코드에서 `variant={totalSubCount > 10 ? 'linear' : 'segmented'}` 형태를 제거한다.
   - Epic host 는 `totalSubCount > 0` 일 때 `linear` progress 를 렌더링하는 예시로 갱신한다.

### 참조 코드

- `docs/dev/20260511-01-ui-update/sub-prd-01-refactor-progress-ui-unification.md`: `linear` 기본화 결정사항
- `docs/base/design-system/components/progress-bar.md`: 현재 `segmented` 기본 정책
- `packages/ui/src/EpicProgressBar.tsx`: web 구현의 현재 `segments = true` 기본값

## 검증 과정

- [x] `docs/base/design-system/components/progress-bar.md` 에서 EpicCard 기본 variant 가 `linear` 로 설명된다.
- [x] Epic 기본 정책 설명에 `segmented (기본)` 또는 Sub 개수 기반 자동 전환 기준이 남아 있지 않다.
- [x] 진행률 산출식이 `completedSubCount / totalSubCount` 로 유지되어 있다.
- [x] `docs/base/design-system/components.md` 에 상충하는 Epic progress 기본 정책이 없는지 확인한다.

## 주의사항

- 계산 로직을 바꾸는 작업이 아니다. 문서의 산출식은 기존 정책을 유지한다.
- 색상, 토큰, 모션 값을 임의로 새로 정의하지 않는다.
- 구현 변경은 후속 task 에서 처리한다. 이 task 는 디자인 시스템 정책 정리에 집중한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
