# Task 01-01: HTML 기본 구조 + 토큰 정의 + 네비게이션

## 작업 정보

- **Sub-PRD**: `sub-prd-01-feat-tokens-icons.md`
- **의존성**: 없음 (기반 작업)
- **대상 파일**: `docs/client/prototype/index.html`
- **참조 파일**: `docs/client/design-system/tokens/*.css` (모든 토큰 값)

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `docs/client/prototype/` 디렉토리 생성
- [x] `index.html` 기본 구조 작성 (DOCTYPE, head, body, nav)
- [x] Pretendard Variable, JetBrains Mono CDN 링크 추가
- [x] `:root`에 Primitive Color Tokens 정의
- [x] `:root`에 Semantic Color Tokens 정의 (var 참조)
- [x] `:root`에 Component Color Tokens 정의 (var 참조)
- [x] `:root`에 Typography Tokens 정의
- [x] `:root`에 Spacing Tokens 정의
- [x] `:root`에 Motion Tokens 정의
- [x] 상단 앵커 네비게이션 구현 (섹션 1~4 목차)

## 구현 세부사항

### 1. 디렉토리 및 파일 생성

- `docs/client/prototype/` 디렉토리를 생성한다
- `index.html` 파일을 아래 골격으로 생성한다

### 2. HTML 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dopamine Planner — Design System Prototype</title>
  <!-- Pretendard Variable CDN -->
  <!-- JetBrains Mono CDN -->
  <style>
    /* === Primitive Tokens === */
    /* === Semantic Tokens === */
    /* === Component Tokens === */
    /* === Typography Tokens === */
    /* === Spacing Tokens === */
    /* === Motion Tokens === */
    /* === 프로토타입 레이아웃 스타일 === */
  </style>
</head>
<body>
  <nav><!-- 앵커 네비게이션 --></nav>
  <main>
    <section id="tokens"><!-- 섹션 1: 디자인 토큰 --></section>
    <section id="icons"><!-- 섹션 2: 아이콘 시스템 --></section>
    <!-- 섹션 3, 4는 Sub-02, Sub-03에서 추가 -->
  </main>
  <svg style="display:none">
    <defs><!-- 아이콘 심볼 정의 --></defs>
  </svg>
</body>
</html>
```

### 3. CDN 폰트 로드

Pretendard Variable과 JetBrains Mono를 CDN으로 로드한다. 폴백 폰트를 반드시 지정한다.

- Pretendard: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`
- JetBrains Mono: `"JetBrains Mono", "Fira Code", Consolas, monospace`

### 4. 토큰 정의 (:root)

`<style>` 내 `:root`에 아래 6개 토큰 그룹을 정의한다. 값은 `docs/client/design-system/tokens/*.css`에서 **정확히** 복사한다.

#### 4.1 Primitive Color Tokens (`colors.css`)

```css
:root {
  /* ── Main - Purple ── */
  --color-purple-100: #D7AEF2;
  --color-purple-200: #C599F2;
  --color-purple-300: #B87EF2;
  --color-purple-500: #9755D9;
  --color-purple-700: #8A63BF;

  /* ── Sub 01 - Periwinkle ── */
  --color-periwinkle-100: #D2D3FF;
  --color-periwinkle-200: #BFCEFF;
  --color-periwinkle-300: #BAC3FF;
  --color-periwinkle-400: #9DABE8;
  --color-periwinkle-500: #9DA3E8;

  /* ── Sub 02 - Neutral ── */
  --color-indigo-600: #7578BF;
  --color-lavender-gray-300: #B8BAD9;
  --color-gray-50: #F2F2F2;
  --color-white: #FFFFFF;
  --color-black-900: #000000;

  /* ── Status ── */
  --color-red-500: #EF4444;
  --color-green-500: #22C55E;
  --color-yellow-500: #F59E0B;
  --color-blue-500: #3B82F6;
}
```

#### 4.2 Semantic Color Tokens (`semantic.css`)

Primitive 토큰의 `var()` 참조를 사용한다. 직접 HEX 값을 쓰지 않는다.

```css
:root {
  /* ── Text ── */
  --color-text-primary: var(--color-black-900);
  --color-text-secondary: var(--color-indigo-600);
  --color-text-tertiary: var(--color-lavender-gray-300);
  --color-text-inverse: var(--color-white);
  --color-text-brand: var(--color-purple-500);

  /* ── Background ── */
  --color-bg-base: var(--color-white);
  --color-bg-surface: var(--color-gray-50);
  --color-bg-elevated: var(--color-white);
  --color-bg-brand-subtle: var(--color-purple-100);
  --color-bg-secondary-subtle: var(--color-periwinkle-100);

  /* ── Interactive (Primary) ── */
  --color-interactive-primary: var(--color-purple-500);
  --color-interactive-primary-hover: var(--color-purple-300);
  --color-interactive-primary-active: var(--color-purple-700);
  --color-interactive-primary-disabled: var(--color-purple-100);

  /* ── Interactive (Secondary) ── */
  --color-interactive-secondary: var(--color-periwinkle-500);
  --color-interactive-secondary-hover: var(--color-periwinkle-300);
  --color-interactive-secondary-active: var(--color-periwinkle-400);

  /* ── Border ── */
  --color-border-default: var(--color-lavender-gray-300);
  --color-border-focus: var(--color-purple-500);
  --color-border-subtle: var(--color-gray-50);

  /* ── Status ── */
  --color-status-success: var(--color-green-500);
  --color-status-error: var(--color-red-500);
  --color-status-warning: var(--color-yellow-500);
  --color-status-info: var(--color-blue-500);
}
```

#### 4.3 Component Color Tokens (`components.css`)

Semantic 토큰의 `var()` 참조를 사용한다.

```css
:root {
  /* ── Button ── */
  --button-primary-bg: var(--color-interactive-primary);
  --button-primary-text: var(--color-text-inverse);
  --button-primary-bg-hover: var(--color-interactive-primary-hover);
  --button-primary-bg-active: var(--color-interactive-primary-active);
  --button-primary-bg-disabled: var(--color-interactive-primary-disabled);

  /* ── Tab Bar ── */
  --tab-bar-bg: var(--color-bg-elevated);
  --tab-bar-active: var(--color-interactive-primary);
  --tab-bar-inactive: var(--color-lavender-gray-300);

  /* ── Todo Item ── */
  --todo-item-bg: var(--color-bg-elevated);
  --todo-item-border: var(--color-border-default);
  --todo-item-completed-text: var(--color-text-tertiary);
  --todo-item-checkbox-checked: var(--color-interactive-primary);
  --todo-item-checkbox-unchecked: var(--color-border-default);

  /* ── Category Badge ── */
  --badge-bg: var(--color-bg-secondary-subtle);
  --badge-text: var(--color-interactive-secondary);

  /* ── FAB ── */
  --fab-bg: var(--color-interactive-primary);
  --fab-text: var(--color-text-inverse);
  --fab-shadow: rgba(151, 85, 217, 0.3);

  /* ── Section Header ── */
  --section-done-text: var(--color-text-secondary);
  --section-progress-text: var(--color-text-primary);
}
```

#### 4.4 Typography Tokens (`typography.css`)

```css
:root {
  /* ── Font Family ── */
  --font-family-sans: "Pretendard Variable", Pretendard, -apple-system,
    BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;

  /* ── Font Size ── */
  --font-size-xs: 0.6875rem;   /* 11px */
  --font-size-sm: 0.8125rem;   /* 13px */
  --font-size-md: 0.9375rem;   /* 15px */
  --font-size-lg: 1.0625rem;   /* 17px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */

  /* ── Line Height ── */
  --line-height-xs: 1rem;      /* 16px */
  --line-height-sm: 1.125rem;  /* 18px */
  --line-height-md: 1.375rem;  /* 22px */
  --line-height-lg: 1.5rem;    /* 24px */
  --line-height-xl: 1.75rem;   /* 28px */
  --line-height-2xl: 2rem;     /* 32px */

  /* ── Font Weight ── */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

#### 4.5 Spacing Tokens (`spacing.css`)

```css
:root {
  /* ── Spacing Scale ── */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */

  /* ── Border Radius ── */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-full: 9999px;

  /* ── Breakpoints ── */
  --breakpoint-tablet: 431px;
  --breakpoint-desktop: 769px;
  --layout-max-width: 480px;
}
```

#### 4.6 Motion Tokens (`motion.css`)

```css
:root {
  /* ── Duration ── */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  /* ── Easing ── */
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-enter: cubic-bezier(0, 0, 0.2, 1);
  --easing-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

### 5. 상단 앵커 네비게이션

전체 섹션(1~4) 목차를 구성한다. 섹션 3~4 링크는 비활성(`disabled`) 상태로 둔다.

```html
<nav class="proto-nav">
  <a href="#tokens">1. 디자인 토큰</a>
  <a href="#icons">2. 아이콘 시스템</a>
  <a class="proto-nav-disabled">3. 컴포넌트 라이브러리</a>
  <a class="proto-nav-disabled">4. 페이지 프로토타입</a>
</nav>
```

- 네비게이션 스타일에는 `proto-` 접두사 클래스를 사용한다
- 비활성 링크는 `pointer-events: none; opacity: 0.4`로 표시한다
- 상단 고정(`position: sticky; top: 0`)으로 구현한다

### 6. 프로토타입 레이아웃 스타일

토큰과 분리하여 `proto-` 접두사 클래스로 프로토타입 자체 레이아웃을 정의한다.

- `proto-nav`: 상단 네비게이션 바
- `proto-nav-disabled`: 비활성 네비게이션 링크
- `proto-section`: 섹션 컨테이너
- `proto-section-title`: 섹션 제목
- `body` 기본 스타일: `font-family: var(--font-family-sans); margin: 0;`

## 주의사항

1. **토큰 값 정확성**: `docs/client/design-system/tokens/*.css`에 정의된 값과 정확히 일치해야 한다
2. **계층 참조 유지**: Semantic → Primitive `var()` 참조, Component → Semantic `var()` 참조. 직접 HEX 값을 쓰지 않는다
3. **프로토타입 스타일 분리**: 프로토타입 레이아웃용 스타일은 `proto-` 접두사 클래스를 사용한다
4. **폰트 폴백**: CDN 로딩 실패를 대비하여 시스템 폰트 폴백을 지정한다

## 검증 체크리스트

- [x] `docs/client/prototype/index.html` 파일이 존재한다
- [x] 브라우저에서 더블 클릭하여 빈 페이지가 에러 없이 렌더링된다
- [x] Pretendard Variable CDN이 로드된다 (DevTools Network 탭 확인)
- [x] JetBrains Mono CDN이 로드된다 (DevTools Network 탭 확인)
- [x] `:root`에 Primitive 토큰 19개 컬러가 모두 정의되어 있다
- [x] `:root`에 Semantic 토큰이 `var()` 참조로 정의되어 있다
- [x] `:root`에 Component 토큰이 `var()` 참조로 정의되어 있다
- [x] `:root`에 Typography 토큰 (Font Family, Size, Line Height, Weight)이 정의되어 있다
- [x] `:root`에 Spacing 토큰 (7단계 + Border Radius 4단계)이 정의되어 있다
- [x] `:root`에 Motion 토큰 (Duration 3단계 + Easing 3종)이 정의되어 있다
- [x] 앵커 네비게이션에 4개 섹션 목차가 표시된다
- [x] 섹션 1~2 링크 클릭 시 해당 섹션으로 스크롤된다
- [x] 섹션 3~4 링크가 비활성 상태로 표시된다
