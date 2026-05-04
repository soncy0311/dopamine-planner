# Tokens

> 토큰 3계층의 네이밍 규칙과 모든 토큰의 존재 목록을 정의한다. **본 문서는 명세이며 구현체가 아니다.** Tailwind config / CSS Custom Properties / RN StyleSheet 어떤 형태로 구현할지는 코드 레포에서 결정한다.

---

## 1. 토큰 계층 원칙

| 계층 | 정의 | 직접 사용 가능 여부 |
|---|---|---|
| **Primitive** | 값(HEX, rem, ms 등) 기반. 팔레트 / 스케일 원본 | ❌ 금지 (Semantic 에서만 참조) |
| **Semantic** | UI 역할·의미 기반. 모든 값은 Primitive 참조 | ✅ 화면/컴포넌트에서 사용 가능 |
| **Component** | 특정 컴포넌트 한정. Semantic 만 참조 | ✅ 해당 컴포넌트 내부에서만 |

**위반 금지 규칙**:
- Semantic 토큰의 참조 컬럼은 반드시 Primitive 토큰
- Component 토큰의 참조 컬럼은 반드시 Semantic 토큰 (Primitive 직접 참조 ❌)

---

## 2. 네이밍 컨벤션

| 카테고리 | 패턴 | 예시 |
|---|---|---|
| Primitive 컬러 | `color-{hue}-{scale}` | `color-purple-500` |
| Semantic 컬러 | `color-{category}-{role}-{state?}` | `color-text-primary`, `color-interactive-primary-hover` |
| Component 컬러 | `{component}-{part}-{state?}` | `button-primary-bg-hover` |
| Typography | `font-{property}-{scale}` | `font-size-md`, `font-weight-bold`, `line-height-lg` |
| Spacing | `spacing-{n}` (4px base) | `spacing-1` ~ `spacing-8` |
| Radius | `radius-{size}` | `radius-sm`, `radius-full` |
| Motion (duration) | `duration-{speed}` | `duration-fast`, `duration-normal` |
| Motion (easing) | `easing-{role}` | `easing-default`, `easing-enter` |
| Layout | `breakpoint-{device}`, `layout-{property}` | `breakpoint-tablet`, `layout-max-width` |

> Semantic 카테고리: `text`, `bg`, `interactive-{primary|secondary}`, `border`, `status`.

---

## 3. Primitive 컬러 토큰

| 토큰 이름 | 값 (HEX) | 비고 |
|---|---|---|
| `color-purple-100` | `#D7AEF2` | 가장 밝은 Purple — 비활성/배경 하이라이트 |
| `color-purple-200` | `#C599F2` | 호버 surface |
| `color-purple-300` | `#B87EF2` | hover 상태 |
| `color-purple-500` | `#9755D9` | **Primary 브랜드색** |
| `color-purple-700` | `#8A63BF` | active / pressed |
| `color-periwinkle-100` | `#D2D3FF` | 연한 배경, 뱃지 배경 |
| `color-periwinkle-200` | `#BFCEFF` | 호버 surface |
| `color-periwinkle-300` | `#BAC3FF` | secondary hover |
| `color-periwinkle-400` | `#9DABE8` | secondary active |
| `color-periwinkle-500` | `#9DA3E8` | **Secondary 색상** |
| `color-indigo-600` | `#7578BF` | 보조 텍스트/아이콘 (UI 한정) |
| `color-lavender-gray-300` | `#B8BAD9` | 보더, 디바이더 |
| `color-gray-50` | `#F2F2F2` | Surface 배경 |
| `color-white` | `#FFFFFF` | 기본 배경 |
| `color-black-900` | `#000000` | Grounding (본문 텍스트) |
| `color-red-500` | `#EF4444` | Status — error |
| `color-green-500` | `#22C55E` | Status — success |
| `color-yellow-500` | `#F59E0B` | Status — warning |
| `color-blue-500` | `#3B82F6` | Status — info |

---

## 4. Semantic 컬러 토큰

### Text

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-text-primary` | `color-black-900` | 본문 텍스트 |
| `color-text-secondary` | `color-indigo-600` | 보조 텍스트·아이콘 (UI 한정 — WCAG 본문 미달) |
| `color-text-tertiary` | `color-lavender-gray-300` | 비활성 텍스트 (큰 텍스트만) |
| `color-text-inverse` | `color-white` | Primary 배경 위 텍스트 |
| `color-text-brand` | `color-purple-500` | 브랜드 강조 텍스트 |

### Background

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-bg-base` | `color-white` | 페이지 배경 |
| `color-bg-surface` | `color-gray-50` | 카드/섹션 배경 |
| `color-bg-elevated` | `color-white` | 모달/시트 등 부유 surface |
| `color-bg-brand-subtle` | `color-purple-100` | Primary 배경 하이라이트 |
| `color-bg-secondary-subtle` | `color-periwinkle-100` | Secondary 배경 (뱃지) |

### Interactive (Primary)

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-interactive-primary` | `color-purple-500` | 주요 CTA |
| `color-interactive-primary-hover` | `color-purple-300` | CTA hover |
| `color-interactive-primary-active` | `color-purple-700` | CTA pressed |
| `color-interactive-primary-disabled` | `color-purple-100` | CTA 비활성 |

### Interactive (Secondary)

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-interactive-secondary` | `color-periwinkle-500` | 보조 인터랙션 |
| `color-interactive-secondary-hover` | `color-periwinkle-300` | 보조 hover |
| `color-interactive-secondary-active` | `color-periwinkle-400` | 보조 pressed |

### Border

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-border-default` | `color-lavender-gray-300` | 카드/입력 기본 보더 |
| `color-border-focus` | `color-purple-500` | 포커스 링 |
| `color-border-subtle` | `color-gray-50` | 가벼운 디바이더 |

### Status

| 토큰 이름 | 참조 Primitive | 사용 영역 |
|---|---|---|
| `color-status-success` | `color-green-500` | 성공 |
| `color-status-error` | `color-red-500` | 에러 |
| `color-status-warning` | `color-yellow-500` | 경고 |
| `color-status-info` | `color-blue-500` | 정보 |

---

## 5. Component 컬러 토큰

> Component 토큰은 Semantic 토큰만 참조한다 (Primitive 직접 참조 금지).

### Button

| 토큰 이름 | 참조 Semantic |
|---|---|
| `button-primary-bg` | `color-interactive-primary` |
| `button-primary-text` | `color-text-inverse` |
| `button-primary-bg-hover` | `color-interactive-primary-hover` |
| `button-primary-bg-active` | `color-interactive-primary-active` |
| `button-primary-bg-disabled` | `color-interactive-primary-disabled` |

### Tab Bar

| 토큰 이름 | 참조 Semantic |
|---|---|
| `tab-bar-bg` | `color-bg-elevated` |
| `tab-bar-active` | `color-interactive-primary` |
| `tab-bar-inactive` | `color-text-tertiary` (시각적 비활성 표시 — 색만으로는 의존 금지, 아이콘/굵기 병행) |

### Todo Item

| 토큰 이름 | 참조 Semantic |
|---|---|
| `todo-item-bg` | `color-bg-elevated` |
| `todo-item-border` | `color-border-default` |
| `todo-item-completed-text` | `color-text-tertiary` |
| `todo-item-checkbox-checked` | `color-interactive-primary` |
| `todo-item-checkbox-unchecked` | `color-border-default` |

### Category Badge

| 토큰 이름 | 참조 Semantic |
|---|---|
| `badge-bg` | `color-bg-secondary-subtle` |
| `badge-text` | `color-interactive-secondary` |

### FAB (Floating Action Button)

| 토큰 이름 | 참조 Semantic / 값 |
|---|---|
| `fab-bg` | `color-interactive-primary` |
| `fab-text` | `color-text-inverse` |
| `fab-shadow` | `rgba(151, 85, 217, 0.3)` (Primary 의 30% alpha — 그림자 전용) |

### Section Header

| 토큰 이름 | 참조 Semantic |
|---|---|
| `section-done-text` | `color-text-secondary` |
| `section-progress-text` | `color-text-primary` |

---

## 6. Typography 토큰 (요약)

> 자세한 사용 가이드는 [`typography.md`](./typography.md) 참조.

| 카테고리 | 토큰 | 값 |
|---|---|---|
| Family | `font-family-sans` | Pretendard Variable + system fallback |
| Family | `font-family-mono` | JetBrains Mono + monospace fallback |
| Size | `font-size-{xs,sm,md,lg,xl,2xl}` | `0.6875rem` ~ `1.5rem` |
| Line Height | `line-height-{xs,sm,md,lg,xl,2xl}` | `1rem` ~ `2rem` |
| Weight | `font-weight-{regular,medium,semibold,bold}` | `400 / 500 / 600 / 700` |

---

## 7. Spacing / Radius / Layout 토큰 (요약)

> 자세한 사용 가이드는 [`spacing.md`](./spacing.md) 참조.

| 카테고리 | 토큰 | 값 |
|---|---|---|
| Spacing | `spacing-{1,2,3,4,5,6,8}` | `0.25rem` ~ `2rem` (4px base) |
| Radius | `radius-{sm,md,lg,full}` | `0.25rem`, `0.5rem`, `0.75rem`, `9999px` |
| Breakpoint | `breakpoint-{tablet,desktop}` | `431px`, `769px` |
| Layout | `layout-max-width` | `480px` |

---

## 8. Motion 토큰 (요약)

> 자세한 사용 가이드는 [`motion.md`](./motion.md) 참조.

| 카테고리 | 토큰 | 값 |
|---|---|---|
| Duration | `duration-{fast,normal,slow}` | `100ms`, `200ms`, `300ms` |
| Easing | `easing-{default,enter,exit}` | `cubic-bezier(0.4, 0, 0.2, 1)` 등 |

---

## 9. 다크 모드 매핑 (Future / P3)

다크 모드 도입 시 **Semantic 레이어만 재매핑**. Primitive 와 Component 는 변경하지 않는다.

| Semantic 토큰 | Light 참조 | Dark 참조 (예정) |
|---|---|---|
| `color-bg-base` | `color-white` | `color-black-900` 또는 신규 `color-gray-900` |
| `color-bg-surface` | `color-gray-50` | 신규 `color-gray-800` |
| `color-text-primary` | `color-black-900` | `color-white` |
| `color-text-secondary` | `color-indigo-600` | (재검토 — Dark 위 대비 검증 필요) |
| `color-interactive-primary` | `color-purple-500` | `color-purple-300` (어두운 배경 시인성) |

> Dark Mode 활성 시 추가 Primitive (`color-gray-{800,900}` 등) 가 필요할 수 있다 — 그 시점에 본 문서를 갱신.
