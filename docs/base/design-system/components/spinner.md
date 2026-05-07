# Spinner

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·사이즈·모션 디테일은 합류 후 갱신될 수 있다.**

isLoading 상태의 표준 스피너. 데이터 페칭 / 라우트 전환 / 부트스트랩에서 일관된 시각 신호를 제공한다.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 모션 토큰: [`../motion.md`](../motion.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Molecules
- 구현체 (web): `packages/ui/src/Spinner.tsx`
- 구현체 (mobile RN): `apps/mobile/src/components/Spinner.tsx`

---

## 1. 변형 (variant)

| variant | 사용 위치 | 레이아웃 |
|---|---|---|
| `inline` (기본) | 섹션·리스트 로딩 위치에 그대로 삽입. TanStack Query `isLoading` 분기 | 부모 흐름 그대로 |
| `fullscreen` | 라우트 전환 / 초기 부트스트랩 | wrapper `min-h-[60vh]` + `flex items-center justify-center` 중앙 정렬 |

> 스켈레톤 UI 는 본 sub 범위 외. 추후 별도 컴포넌트로 도입 예정.

## 2. 사이즈 (size)

| size | px | Tailwind | 사용 |
|---|---|---|---|
| `sm` | 16px | `h-4 w-4` | 인라인 텍스트 옆 |
| `md` (기본) | 24px | `h-6 w-6` | 섹션·리스트 로딩 |
| `lg` | 40px | `h-10 w-10` | 풀스크린 / 부트스트랩 |

## 3. 색

| 요소 | 토큰 |
|---|---|
| 회전 호 (track) | `color-border-default` |
| 회전 호 (active) | `color-interactive-primary` |

> 하드코딩 hex 0건. Tailwind 토큰 className 만 사용.

## 4. 모션

- 기본 회전: `animate-spin` (Tailwind — 1회전 1초). 모션 토큰 `duration-slow` 와 별도. 회전 자체는 표준 keyframe.
- **`prefers-reduced-motion: reduce` 폴백 필수**: `motion-reduce:animate-none` 적용. 사용자가 모션 감소 설정 시 회전 중지, 정적 표시.
- 정적 표시 시에도 `role="status"` + `aria-label` 이 보조기기에 "로딩 중" 을 알림.

## 5. 접근성 (a11y)

- `role="status"` 필수 (라이브 리전).
- `aria-label` 기본값 `"로딩 중"`. 컨텍스트가 다르면 host 가 `label` props 로 주입 (예: `"데이터 불러오는 중"`).
- `prefers-reduced-motion` 폴백으로 회전 정지.
- 색만으로 의미 전달 금지 — `aria-label` 텍스트가 단일 SoT.

## 6. mobile RN 분기

- web: SVG circle + Tailwind `animate-spin`.
- mobile RN: `ActivityIndicator` 사용 (size 매핑: `sm`/`md` → `"small"`, `lg` → `"large"` + 큰 wrapper). OS 레벨에서 reduced-motion 자동 정합. `accessibilityRole="progressbar"` + `accessibilityLabel`.

## 7. 향후 갱신 항목

- 스켈레톤 UI 도입 (별도 컴포넌트)
- 풀스크린 시 브랜드 로고 결합 여부
- 다크 모드 색 매핑
