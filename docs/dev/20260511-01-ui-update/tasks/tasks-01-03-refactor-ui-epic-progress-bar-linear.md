# Task 01-03: packages/ui EpicProgressBar linear 기본화

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-03 |
| 상태 | 대기중 |
| 의존성 | tasks-01-01, tasks-01-02 완료 필요 |

## 작업 목표

`packages/ui` 의 web 공유 `EpicProgressBar` 를 단일 linear bar 기본 표시로 변경한다. 기존 segmented 기본 의존을 제거하고, 접근성 의미는 "전체 N개 중 M개 완료" 기준으로 유지한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/src/EpicProgressBar.tsx` | 수정 - `segments` 기본 의존 제거 및 linear bar 기본화 |
| `packages/ui/src/index.ts` | 확인/필요 시 수정 - export 타입 변경 시 반영 |

### 구현 세부사항

1. **props 정리**
   - 현재 `segments?: boolean` 과 `segments = true` 기본값을 제거하거나 Epic 기본 경로에서 사용하지 않도록 변경한다.
   - 유지가 필요하면 기본값은 `linear` 의미가 되도록 하고, segmented 는 명시적 opt-in 으로만 동작하게 한다.

2. **linear 렌더링 고정**
   - `safeTotal > 0` 일 때 `safeDone / safeTotal` 비율을 fill width 로 표시한다.
   - `safeDone` 은 `0..safeTotal` 범위로 clamp 한다.
   - `safeTotal <= 0` 인 경우 컴포넌트가 `null` 을 반환하거나 host 가 렌더링하지 않는 정책 중 하나로 일관되게 처리한다. Sub-PRD 기준은 host 에서 미표기하는 방향이다.

3. **접근성 속성 보강**
   - `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` 를 유지한다.
   - 가능하면 `aria-valuetext` 를 추가해 `전체 N개 중 M개 완료 (NN%)` 의미를 제공한다.
   - percent 텍스트가 별도 렌더링될 경우 중복 전달을 피하기 위해 시각 텍스트의 aria 처리도 후속 host task 와 맞춘다.

### 참조 코드

- `packages/ui/src/EpicProgressBar.tsx`: 현재 segmented 우선 분기
- `packages/ui/src/IssueCardAccordion.tsx`: 현재 `<EpicProgressBar total={total} done={doneCount} segments />` 호출부
- `docs/base/design-system/components/progress-bar.md`: task 01-01, 01-02 에서 갱신된 SoT

## 검증 과정

- [ ] `EpicProgressBar` 기본 렌더링이 segmented segment 배열을 만들지 않는다.
- [ ] `safeTotal > 0` 케이스에서 fill width 가 `safeDone / safeTotal` 로 계산된다.
- [ ] `safeTotal <= 0` 케이스가 Sub 0개 미표기 정책과 충돌하지 않는다.
- [ ] progressbar role/value 속성이 유지되고 보조 텍스트 의미가 기존과 동일하다.

## 주의사항

- 진행률 산출식은 `completedSubCount / totalSubCount` 이며 `epic.progress` fallback 을 기본 정책으로 삼지 않는다.
- 색상은 기존 토큰 또는 className 을 사용하고 임의 HEX 를 추가하지 않는다.
- 이 변경 이후 web 카드 host task 에서 `segments` 강제 전달을 제거해야 한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
