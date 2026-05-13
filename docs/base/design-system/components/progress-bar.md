# Progress Bar

> Epic 카드의 **하위 Sub 이슈 완료율** 을 시각화하는 진행률 표시 컴포넌트.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 모션 토큰: [`../motion.md`](../motion.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Atoms (`ProgressBar`), §Molecules (`SegmentedProgressBar`)
- 정책 기반: [`./issue-creation.md`](./issue-creation.md) — Epic ↔ Sub 부모-자식 관계
- 프로토타입 참조: `docs/base/prototype/css/organisms.css` `.proto-epic-progress-*`
- 구현체 (web): `packages/ui/src/ProgressBar.tsx` (예정)
- 구현체 (mobile RN): `apps/mobile/src/components/ProgressBar.tsx` (예정)

---

## 1. 의미와 사용 맥락

Epic 의 진행률은 **하위 Sub 이슈의 완료 개수 / 전체 개수** 로 산출한다.

| 상태 | 산출식 | 비고 |
|---|---|---|
| Sub 0 개 (Epic 단독) | 진행률 미표기 | Epic 자체 완료 여부는 Checkbox/status 로 표현하며 Sub 기반 progress 와 혼합하지 않음 |
| Sub N 개 | `completedSubCount / totalSubCount` | 0% ~ 100% |
| 모든 Sub 완료 | 100% (자동 or cascade 후) | EpicCard 헤더 Checkbox 와 정합 |

> 진행률 산출 책임은 호스트(EpicCard) 가 가진다. 본 컴포넌트는 **표시만** 담당한다 (`value`, `total` 또는 `percent` props 입력).
> Epic host 는 web/mobile 모두 `totalSubCount === 0` 일 때 ProgressBar 와 ProgressPercent 를 함께 렌더링하지 않는다. 이 경우 `progressbar` role 도 노출하지 않으며, 별도 상태 안내가 필요하면 Epic 자체 상태 의미로 제공한다.

---

## 2. 변형 (variant)

| variant | 분류 | 설명 |
|---|---|---|
| `linear` (Epic 기본) | Atom | 단일 fill 막대. Sub 개수 무관 / 산출된 % 만 시각화 |
| `segmented` | Molecule | 특수 실험/별도 컴포넌트에서만 사용하는 분절형 표시. **Epic 기본 progress 로 사용하지 않음** |

> EpicCard 의 기본은 **`linear`**. Sub 개수가 1개, 3개, 10개 이상이어도 Epic 기본 progress 는 동일한 단일 막대로 표시한다.

### segmented 사용 기준

| 조건 | 정책 |
|---|---|
| EpicCard 기본 progress | `linear` 고정 |
| `segmented` 필요 | Epic 기본 정책이 아닌 별도 실험/특수 컴포넌트 정책으로 문서화 후 사용 |

---

## 3. 구성 (anatomy)

### linear

```
┌────────────────────────────┐  ← track (color-bg-surface, radius-full, h 8px)
│■■■■■■■■■■■                 │  ← fill (color-interactive-primary, width: percent%)
└────────────────────────────┘
                                       50%   ← ProgressPercent (옆 또는 아래)
```

### segmented

```
┌──┐ ┌──┐ ┌──┐ ┌──┐          ← gap 2px 로 분절된 segment[]
│■■│ │■■│ │  │ │  │          ← segment-filled / segment-empty
└──┘ └──┘ └──┘ └──┘          ← 각 segment: flex 1, h 8px, radius-full
                          50% ← ProgressPercent
```

| 요소 | 역할 |
|---|---|
| Track (linear) / Segment 컨테이너 (segmented) | 배경 |
| Fill (linear) / Segment[].filled (segmented) | 진행 표시 |
| ProgressPercent | `"NN%"` 텍스트. 산출값 `Math.round(percent)` |

---

## 4. 사이즈

| size | 막대 높이 | 사용 |
|---|---|---|
| `sm` | 4px | 컨텍스트가 압축된 리스트 (모바일 dense view 등) |
| `md` (기본) | 8px | EpicCard 헤더 — 프로토타입 기본값 |
| `lg` | 12px | 모달/상세 화면의 강조 표시 |

> radius 는 항상 `radius-full`. 막대 양 끝은 둥글게 처리한다.

---

## 5. 색 / 토큰

진행률 표시 전용 Component 토큰을 신설한다 ([`../tokens.md`](../tokens.md) §5 Component 컬러 토큰 참조).

| 토큰 이름 | 참조 Semantic | 용도 |
|---|---|---|
| `progress-bar-track-bg` | `color-bg-surface` | linear 의 track / segmented 의 빈 segment 배경 |
| `progress-bar-fill` | `color-interactive-primary` | linear 의 fill |
| `progress-bar-segment-bg` | `color-bg-surface` | segmented 의 빈 segment (track-bg 와 동일하지만 의미상 분리) |
| `progress-bar-segment-filled` | `color-interactive-primary` | segmented 의 채워진 segment |
| `progress-bar-text` | `color-text-secondary` | ProgressPercent 텍스트 |

> 색만으로 의미 전달 금지 — `aria-valuenow` / `aria-valuetext` 가 단일 SoT (§7 참조).

---

## 6. 레이아웃 / 모션

| 항목 | linear | segmented |
|---|---|---|
| 막대 높이 | size 토큰 (기본 8px) | size 토큰 (기본 8px) |
| 반경 | `radius-full` | `radius-full` (각 segment) |
| segment 간 gap | — | 2px 고정 |
| 컨테이너 padding | EpicCard 헤더 영역에서 좌우 `spacing-4` | 동일 |
| ProgressPercent 위치 | 막대 우측 (gap `spacing-2`) | 막대 우측 (gap `spacing-2`) |

### 모션

| 트리거 | 변화 | 토큰 |
|---|---|---|
| Sub 완료 → 진행률 증가 (linear) | `width` transition | `duration-normal` (200ms) + `easing-default` |
| Sub 완료 → segment 채움 (segmented) | `background` transition | `duration-fast` (100ms) + `easing-default` |
| 100% 달성 | (선택) 살짝 pulse 또는 부모 EpicCard 의 cascade 모션에 흡수 | 별도 모션 추가 시 `prefers-reduced-motion` 폴백 필수 |

`prefers-reduced-motion: reduce` 시 transition 제거 — 즉시 변경.

---

## 7. 접근성 (a11y)

WAI-ARIA `progressbar` role 표준을 따른다.

| 속성 | 값 |
|---|---|
| `role` | `progressbar` |
| `aria-valuemin` | `0` |
| `aria-valuemax` | `100` (또는 `totalSubCount`) |
| `aria-valuenow` | 산출 % (또는 `completedSubCount`) |
| `aria-valuetext` | `"전체 N개 중 M개 완료 (NN%)"` 한국어 |
| `aria-label` | `"<Epic 제목> 진행률"` (호스트 주입) |

추가 규칙:

- ProgressPercent 텍스트는 `aria-hidden="true"` — `aria-valuetext` 가 보조기기용 단일 진실. 시각적 % 숫자와 의미 중복 회피.
- segmented 의 각 segment 는 **장식용** — `aria-hidden="true"` 또는 시각적 div. 보조기기는 컨테이너의 `progressbar` role 만 인식.
- 색만으로 완료/미완료 구분 금지. progressbar role 의 value 가 의미 전달.

---

## 8. mobile RN 분기

| 항목 | web | mobile (Nativewind v4) |
|---|---|---|
| linear track / fill | `<div>` + Tailwind className | `<View>` + Nativewind className (동일 토큰) |
| segmented segment[] | `<div>[]` flex | `<View>[]` flex (RN flex 기본값 column → `flex-row` 명시) |
| transition | CSS `transition: width/background` | `react-native-reanimated` `withTiming` (`duration-normal` 매핑) |
| accessibility | `role="progressbar"` + `aria-*` | `accessibilityRole="progressbar"` + `accessibilityValue={{min, max, now, text}}` |
| reduced-motion | `prefers-reduced-motion` media query | `AccessibilityInfo.isReduceMotionEnabled()` 분기 |

---

## 9. 사용 예 (호스트 — EpicCard 기준)

```
// pseudo-code
<EpicCard.Header>
  <Checkbox ... />
  <CategoryBadge />
  <PriorityBadge />
  <Title />
  {totalSubCount > 0 ? (
    <ProgressPercent value={completedSubCount} total={totalSubCount} />
  ) : null}
</EpicCard.Header>

{totalSubCount > 0 ? (
  <ProgressBar
    variant="linear"
    value={completedSubCount}
    total={totalSubCount}
    size="md"
    ariaLabel={`${epicTitle} 진행률`}
  />
) : null}
```

호스트 책임:

- `value` / `total` 산출 (Epic 의 sub 집계는 `packages/core` 도메인 로직)
- Sub 가 0개일 때 ProgressBar / ProgressPercent 미표기
- `ariaLabel` 주입

ProgressBar 책임:

- 시각화 (variant, size, 색)
- ARIA value 속성 매핑
- transition 모션 + reduced-motion 폴백

---

## 10. 향후 갱신 항목

- 색 변형 (예: 100% 달성 시 success 색 강조) — 디자인 결정자 합류 후
- 다크 모드 매핑 (Semantic 레이어 재매핑으로 자동 정합되나 대비 검증 필요)
- segment 간 gap 의 4px / 1px 조정 검토 (Sub 개수별 시인성)
- 100% 달성 시 보상 모션 (도파민 강화) — 별도 motion 토큰 신설 검토
