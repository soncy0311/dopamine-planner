# Spacing & Layout

> 4px base 의 스페이싱 스케일 + 4단계 radius + 모바일 우선 브레이크포인트.

---

## 1. Spacing Scale

4px 기반 8단계 (5, 7 미정의 — 의도적 누락으로 시각적 위계 단순화).

| 토큰 | 값 | px | 사용처 |
|---|---|---|---|
| `spacing-1` | `0.25rem` | 4px | 아이콘과 텍스트 사이, 인라인 간격 |
| `spacing-2` | `0.5rem` | 8px | 요소 내부 여백, 버튼 padding-y (sm) |
| `spacing-3` | `0.75rem` | 12px | 리스트 아이템 간격 |
| `spacing-4` | `1rem` | 16px | 카드 내부 패딩, 버튼 padding-y (md) |
| `spacing-5` | `1.25rem` | 20px | 섹션 간 간격 (소) |
| `spacing-6` | `1.5rem` | 24px | 화면 좌우 패딩, 섹션 간 간격 (중) |
| `spacing-8` | `2rem` | 32px | 큰 섹션 간격, 페이지 상단 여백 |

### 사용 가이드

| 영역 | 권장 토큰 |
|---|---|
| 컴포넌트 내부 padding | `spacing-2` ~ `spacing-4` |
| 컴포넌트 간 gap (리스트) | `spacing-3` |
| 섹션 내 요소 간 gap | `spacing-4` ~ `spacing-5` |
| 섹션 간 gap | `spacing-6` ~ `spacing-8` |
| 화면 좌우 패딩 (모바일) | `spacing-6` (24px) |
| 화면 상단/하단 패딩 | `spacing-6` ~ `spacing-8` |

**금지 사항**:
- 토큰 외 임의 값 (`13px`, `0.4rem` 등) 사용 금지
- 음수 마진은 본 시스템에서 미정의 — 사용 시 컴포넌트 내부에 한정하고 주석 명시

---

## 2. Border Radius

| 토큰 | 값 | px | 사용처 |
|---|---|---|---|
| `radius-sm` | `0.25rem` | 4px | 태그, 뱃지, 작은 인디케이터 |
| `radius-md` | `0.5rem` | 8px | 카드, 입력 필드, 기본 버튼 |
| `radius-lg` | `0.75rem` | 12px | 모달, 바텀 시트 (상단 모서리), 큰 카드 |
| `radius-full` | `9999px` | — | 원형 (FAB, 아바타, pill 버튼) |

**원칙**:
- 한 화면에서 사용하는 radius 단계는 최대 2종으로 제한 (시각적 일관성)
- 카드 안의 카드(중첩)에서는 외곽보다 1단계 작은 radius 사용

---

## 3. Breakpoints (Web)

| 토큰 | 값 | 레이아웃 정책 |
|---|---|---|
| (default mobile) | `~430px` | 단일 컬럼, 하단 탭 바, 좌우 `spacing-6` |
| `breakpoint-tablet` | `431px` | 단일 컬럼, 좌우 패딩 확대 (`spacing-8`) |
| `breakpoint-desktop` | `769px` | 최대 너비 `layout-max-width` (480px) 중앙 정렬 |

| 토큰 | 값 | 비고 |
|---|---|---|
| `layout-max-width` | `480px` | 데스크탑 콘텐츠 영역 상한 (모바일 SPA 의 시각적 정체성 유지) |

> Mobile-first 정책: 기본 스타일이 모바일이고, `breakpoint-tablet` / `breakpoint-desktop` 에서 점진적 확장.

### Mobile (RN) 대응

- RN 은 CSS media query 미지원 — Nativewind 의 responsive prefix (`sm:`, `md:` 등) 또는 `Dimensions.get('window').width` 분기 사용
- 본 시스템의 breakpoint 토큰은 web 기준이며, RN 측에서는 동일 px 값을 코드로 분기

---

## 4. Layout 원칙

1. **콘텐츠는 480px 중앙 정렬** — 데스크탑에서도 모바일 UX 일관성 유지
2. **Safe Area 대응** — 하단 탭 바, FAB 는 iOS Safe Area inset 반영 (Expo: `react-native-safe-area-context`)
3. **세로 스크롤 우선** — 가로 스크롤 금지 (DateNavigator 의 슬라이드 전환 제외)
4. **터치 타겟 44×44px 이상** — 시각적 크기가 작아도 패딩으로 확보 (자세한 규칙은 [`accessibility.md`](./accessibility.md))
