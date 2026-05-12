# SUB-PRD: `Epic 진행률 UI 단일화`

## 작업 정보

- **작업명**: `Epic 진행률 UI 단일화`
- **작업 유형**: `refactor` (코드 구조 변경)
- **시작일**: 2026-05-12
- **종료일**: TBD
- **최신 업데이트**: 2026-05-12 21:49
- **상태**: 완료 (lint 환경 이슈)
- **Main PRD**: [`main-prd-ui-update.md`](./main-prd-ui-update.md)
- **선행 Sub-PRD**: 없음

## 배경 및 목적

현재 Epic 진행률 UI 는 Sub 개수에 따라 분절된 segment 로 표시되는 정책을 포함한다. 이번 UI 업데이트에서는 Epic 카드와 Epic 상세/편집 화면의 진행률을 단일 linear progress bar 로 통일해 web/mobile 에서 같은 시각 언어를 사용한다.

진행률 산출식은 기존 정책인 `completedSubCount / totalSubCount` 를 유지한다. 본 Sub-PRD 의 목적은 계산 로직을 바꾸는 것이 아니라, 표시 정책과 디자인 시스템 SoT 를 `linear` 중심으로 정리하는 것이다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| Web UI | Next.js 15, React 19, Tailwind v4 |
| Mobile UI | Expo 52, React Native, Nativewind v4 |
| 공유 UI | `packages/ui`, `apps/mobile/src/components` |
| 공통 로직 | `packages/core` 의 Epic/Sub 집계 결과 |
| 문서 SoT | `docs/base/design-system/components/progress-bar.md` |

## 핵심 요구 사항

### 1. Epic 진행률 표시 variant 통일

- Epic 카드, Epic 상세, Epic 편집에서 진행률은 기본적으로 단일 `linear` progress bar 를 사용한다.
- `segmented` variant 는 Epic 기본 표시 정책에서 제외한다.
- Sub 개수가 많거나 적어도 동일한 막대 형태를 유지한다.
- 기존 progress 계산 값은 그대로 사용한다: `completedSubCount / totalSubCount`.

### 2. Sub 0개 Epic 표시 정책 확정

- Sub 가 0개인 Epic 은 web/mobile 에서 동일하게 처리한다.
- 기본 정책은 진행률 막대를 숨기고, 보조 텍스트 또는 상태 표시가 필요하면 Epic 자체 완료 상태를 별도로 표시한다.
- 0% progress bar 를 렌더링하는 대안은 사용하지 않는다. Sub 기반 진행률이 없다는 의미를 명확히 하기 위함이다.

### 3. 디자인 시스템 문서 갱신

- [`docs/base/design-system/components/progress-bar.md`](../../base/design-system/components/progress-bar.md) 의 `variant` 정책을 갱신한다.
- EpicCard 기본 variant 를 `segmented` 에서 `linear` 로 변경한다.
- segmented 는 후속 실험 또는 특수 사용처로 남길 수 있지만, Epic 기본값으로 문서화하지 않는다.
- web/mobile 접근성 매핑을 `linear` 기준으로 다시 정리한다.

### 4. 접근성 유지

- web 은 `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` 를 유지한다.
- mobile 은 `accessibilityRole="progressbar"` 와 `accessibilityValue` 를 유지한다.
- 시각적 막대가 바뀌어도 보조기기 의미는 "전체 N개 중 M개 완료" 로 동일해야 한다.

## 핵심 구현 로직

### ProgressBar 정책

| 입력 | 표시 |
|---|---|
| `totalSubCount = 0` | progress bar 미표기 |
| `totalSubCount > 0` | `completedSubCount / totalSubCount` 를 단일 fill width 로 표시 |
| `completedSubCount = totalSubCount` | 100% linear bar |

### 적용 범위

| 영역 | 대상 |
|---|---|
| 디자인 문서 | `docs/base/design-system/components/progress-bar.md` |
| Web 공유 UI | `packages/ui/src/**` 의 `EpicProgressBar` 또는 `ProgressBar` 구현 |
| Web 화면 | `apps/web/src/components/**`, `apps/web/src/app/(main)/**` 의 Epic 카드/상세/편집 host |
| Mobile 화면 | `apps/mobile/src/components/**`, `apps/mobile/src/app/**` 의 Epic 카드/상세/편집 host |
| 테스트 | progress 렌더링 단위 테스트, 접근성 속성 테스트 |

## 구현 시 주의사항

1. **계산 로직 변경 금지**: 진행률 산출식은 기존 `completedSubCount / totalSubCount` 를 유지한다.
2. **문서와 구현 동시 갱신**: 디자인 시스템 문서가 `segmented` 기본값을 유지하면 후속 작업자가 잘못 구현할 수 있으므로 구현과 같은 PR 에 포함한다.
3. **Sub 0개 정책 일관성**: web 은 숨기고 mobile 은 0% 로 보이는 식의 분기 금지.
4. **접근성 회귀 금지**: 시각 요소가 단일 막대로 바뀌어도 progressbar role/value 는 유지한다.
5. **레이아웃 흔들림 방지**: progress bar 높이와 percent 텍스트 영역은 고정 크기 또는 안정적인 flex 규칙을 사용한다.
6. **색상 임의 추가 금지**: 기존 design-system 토큰을 사용하고 인라인 색상 또는 플랫폼별 임의 색상은 추가하지 않는다.

## 완료된 작업

- [x] Sub 0개, 일부 완료, 전체 완료 케이스를 web/mobile fixture 로 검증한다. ✅ (2026-05-12 21:49)
- [x] progressbar 접근성 속성의 현재 값, 최대 값, 보조 텍스트가 기존 의미를 유지하는지 테스트를 추가 또는 갱신한다. ✅ (2026-05-12 21:49)
- [x] mobile Epic 상세/편집 화면의 progress 표시가 카드와 동일한 정책을 쓰는지 확인하고 보정한다. ✅ (2026-05-12 21:41)
- [x] mobile Epic 카드에서 linear progress 를 적용한다. ✅ (2026-05-12 21:41)
- [x] web Epic 상세/편집 화면의 progress 표시가 카드와 동일한 정책을 쓰는지 확인하고 보정한다. ✅ (2026-05-12 21:41)
- [x] web Epic 카드에서 segmented progress 렌더링을 제거하고 linear progress 를 적용한다. ✅ (2026-05-12 21:41)
- [x] `packages/ui` 의 Epic 진행률 컴포넌트 기본 표시를 단일 linear bar 로 변경한다. ✅ (2026-05-12 21:41)
- [x] Sub 0개 Epic 의 진행률 미표기 정책을 디자인 시스템 문서에 명시한다. ✅ (2026-05-12 21:41)
- [x] `docs/base/design-system/components/progress-bar.md` 의 Epic 기본 variant 를 `linear` 로 갱신한다. ✅ (2026-05-12 21:41)

## 남은 작업

- 없음.

## 검증 기준

- [x] Epic 카드의 진행률이 web/mobile 모두 단일 linear progress bar 로 표시된다.
- [x] Sub 개수가 1개, 3개, 10개 이상이어도 segmented UI 가 나타나지 않는다.
- [x] Sub 0개 Epic 에서는 progress bar 가 표시되지 않고 레이아웃이 깨지지 않는다.
- [x] `completedSubCount / totalSubCount` 기준의 % 표시가 기존과 동일하다.
- [x] web 의 progressbar ARIA 속성이 유지된다.
- [x] mobile 의 accessibilityRole/accessibilityValue 가 유지된다.
- [x] `docs/base/design-system/components/progress-bar.md` 와 구현 기본 정책이 서로 일치한다.
- [ ] `make lint` 통과.
- [x] `make test` 통과.

---

*이 문서는 `UI 업데이트` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-ui-update.md`](./main-prd-ui-update.md) 를 참조하세요.*
