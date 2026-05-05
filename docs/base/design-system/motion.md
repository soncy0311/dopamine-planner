# Motion

> 짧은 트랜지션 + 의도가 분명한 곡선. 도파민 자극은 색으로 충분 — 모션은 차분하게.

---

## 1. Duration

| 토큰 | 값 | 사용처 |
|---|---|---|
| `duration-fast` | `100ms` | 체크박스 토글, hover 색 변경, 즉각 반응 인터랙션 |
| `duration-normal` | `200ms` | 버튼 상태 전환, 페이드, 탭 전환 |
| `duration-slow` | `300ms` | 바텀 시트 진입/퇴장, 페이지 전환, 리스트 리오더 |

> 100ms 미만: 사용자가 변화를 인지하지 못함 — 사용 금지.
> 300ms 초과: 인터랙션 응답성이 떨어짐 — 본 시스템에서 미정의.

---

## 2. Easing

| 토큰 | 값 | 사용처 |
|---|---|---|
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 양방향 트랜지션 범용 (Material Standard) |
| `easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 요소 진입 (시작은 빠르게, 끝은 부드럽게) |
| `easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 요소 퇴장 (시작은 부드럽게, 끝은 빠르게) |

> linear / ease-in-out 등 CSS 키워드 직접 사용 금지 — 토큰을 통해서만 적용.

---

## 3. 사용 가이드 매트릭스

| 인터랙션 | Duration | Easing |
|---|---|---|
| 체크박스 toggle | `duration-fast` | `easing-default` |
| Button hover (배경색) | `duration-fast` | `easing-default` |
| Button pressed (active) | `duration-fast` | `easing-default` |
| 탭 전환 (BottomTabBar) | `duration-normal` | `easing-default` |
| 모달 / 바텀 시트 진입 | `duration-slow` | `easing-enter` |
| 모달 / 바텀 시트 퇴장 | `duration-normal` | `easing-exit` |
| 페이지 전환 (DateNavigator 슬라이드) | `duration-slow` | `easing-default` |
| 리스트 리오더 (완료 → 완료 섹션 이동) | `duration-normal` | `easing-default` |
| 토스트 / 스낵바 진입 | `duration-normal` | `easing-enter` |
| 토스트 / 스낵바 퇴장 | `duration-fast` | `easing-exit` |

---

## 4. 접근성 — `prefers-reduced-motion`

OS / 브라우저 설정으로 모션 감소를 요청한 사용자에게는 다음 정책을 적용한다.

| 모션 유형 | reduced-motion 일 때 |
|---|---|
| 페이드 (opacity) | 유지 (시각적 부담 적음) |
| 슬라이드 / 트랜스폼 | 즉시 전환 (`duration: 0ms`) |
| 회전 / 스케일 | 즉시 전환 |
| 자동 재생 애니메이션 | **금지** (토큰 사용 자체 차단) |

구현 측면 권장:
- web: `@media (prefers-reduced-motion: reduce)` 에서 `transition-duration: 0ms !important`
- mobile (RN): `AccessibilityInfo.isReduceMotionEnabled()` 분기 후 `Animated.timing` 의 `duration` 을 0 으로

---

## 5. 모션 원칙

1. **목적 없는 모션 금지** — 모든 트랜지션은 "사용자가 무엇이 변했는지 인지" 또는 "공간 위계 표현" 의 목적이 있어야 함
2. **토큰 외 값 금지** — `150ms`, `400ms` 등 임의 duration 사용 금지
3. **연쇄 모션은 stagger 50ms 이내** — 리스트 아이템이 순차 등장하는 경우 인접 아이템 간 50ms 이하 지연
4. **Spring 애니메이션은 모바일 한정** — RN `react-native-reanimated` 의 spring 사용 시 본 시스템의 duration/easing 과 별도로 컴포넌트 내 명시
5. **Reduced motion 디폴트 존중** — 사용자 설정을 무시하는 강제 애니메이션 금지
