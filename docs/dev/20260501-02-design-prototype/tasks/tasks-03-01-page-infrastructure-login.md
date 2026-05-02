# Task 03-01: 페이지 인프라 + 로그인

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-page-prototypes.md`
- **의존성**: Sub-PRD 02 완료 (컴포넌트 라이브러리 CSS 클래스)
- **대상 파일**: `docs/base/prototype/index.html`
- **참조 파일**:
  - `sub-prd-03-feat-page-prototypes.md` §1, §2.1
  - `docs/base/design-system/components.md` — AuthLayout 템플릿
  - `docs/base/design-system/accessibility.md` — ARIA/접근성

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #1: 앵커 네비게이션에 섹션 4 링크 활성화
- [x] #2: `<section id="pages">` 추가
- [x] #3: 페이지 프레임 공통 CSS (`.proto-page-frame`) 작성
- [x] #4: 페이지 내부 레이아웃 공통 CSS (`.page-content`, `.page-tab-bar`) 작성
- [x] #5: 페이지 4.1 — 로그인 (AuthLayout + 소셜 버튼 2종)

## 구현 세부사항

### 1. 앵커 네비게이션 섹션 4 활성화

기존 비활성 상태의 섹션 4 링크를 활성화한다.

**변경 전:**
```html
<a class="proto-nav-disabled">4. 페이지 프로토타입</a>
```

**변경 후:**
```html
<a href="#pages">4. 페이지 프로토타입</a>
```

- `proto-nav-disabled` 클래스를 제거하고 `href="#pages"`를 추가한다

### 2. 섹션 구조 추가

기존 섹션 3(`<section id="components">`) 뒤에 `<section id="pages">`를 추가한다. 7개 페이지 프레임을 스텁으로 미리 생성하여 후속 task(03-02, 03-03)에서 내용만 채우도록 한다.

```html
<section id="pages" class="proto-section">
  <h2 class="proto-section-title">4. 페이지 프로토타입</h2>

  <!-- 4.1 로그인 (이 task에서 구현) -->
  <div class="proto-page-frame" id="page-login">
    <div class="proto-page-label">4.1 로그인</div>
    <!-- 로그인 콘텐츠 -->
  </div>

  <!-- 4.2 메인 Life (tasks-03-02에서 구현) -->
  <div class="proto-page-frame" id="page-main-life">
    <div class="proto-page-label">4.2 메인 — Life</div>
  </div>

  <!-- 4.3 메인 Work (tasks-03-02에서 구현) -->
  <div class="proto-page-frame" id="page-main-work">
    <div class="proto-page-label">4.3 메인 — Work</div>
  </div>

  <!-- 4.4 투두 생성 (tasks-03-02에서 구현) -->
  <div class="proto-page-frame" id="page-todo-create">
    <div class="proto-page-label">4.4 투두 생성</div>
  </div>

  <!-- 4.5 분류 관리 (tasks-03-03에서 구현) -->
  <div class="proto-page-frame" id="page-category">
    <div class="proto-page-label">4.5 분류 관리</div>
  </div>

  <!-- 4.6 Epic 관리 (tasks-03-03에서 구현) -->
  <div class="proto-page-frame" id="page-epic">
    <div class="proto-page-label">4.6 Epic 관리</div>
  </div>

  <!-- 4.7 설정 (tasks-03-03에서 구현) -->
  <div class="proto-page-frame" id="page-settings">
    <div class="proto-page-label">4.7 설정</div>
  </div>

  <!-- 4.8 인터랙티브 데모 (tasks-03-04에서 구현) -->
  <div class="proto-page-frame" id="page-main-interactive">
    <div class="proto-page-label">4.8 인터랙티브 데모 (탭 전환 + 체크박스)</div>
  </div>
</section>
```

### 3. 페이지 프레임 공통 CSS

`<style>` 블록에 추가할 페이지 프레임 CSS:

```css
/* === 페이지 프로토타입 — 프레임 === */
.proto-page-frame {
  width: 430px;
  min-height: 932px;
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-base);
  overflow: hidden;
  position: relative;
  margin: var(--spacing-8) auto;
}

.proto-page-label {
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-align: center;
}
```

### 4. 페이지 내부 레이아웃 공통 CSS

BottomTabBar가 있는 페이지(메인, 분류, Epic, 설정)에서 사용하는 공통 레이아웃:

```css
/* === 페이지 프로토타입 — 내부 레이아웃 === */
.page-content {
  padding-bottom: 76px; /* 56px TabBar + 20px Safe Area */
  overflow-y: auto;
  height: 100%;
}

.page-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.page-fab {
  position: absolute;
  right: var(--spacing-4);
  bottom: calc(76px + var(--spacing-4)); /* TabBar 높이 + 간격 */
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--fab-bg);
  color: var(--fab-text);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--fab-shadow);
  z-index: 1;
}
```

### 5. 로그인 페이지 (AuthLayout)

`#page-login` 프레임 내부에 AuthLayout을 구현한다.

#### 5.1 HTML 구조

```html
<div class="proto-page-frame" id="page-login">
  <div class="proto-page-label">4.1 로그인</div>
  <div class="page-auth-layout">
    <!-- 로고 영역 -->
    <div class="page-auth-logo">
      <div class="page-auth-logo-icon">
        <svg width="48" height="48" aria-hidden="true">
          <use href="#icon-circle-check"></use>
        </svg>
      </div>
      <h3 class="page-auth-title">Dopamine Planner</h3>
      <p class="page-auth-subtitle">일상과 업무를 한곳에서</p>
    </div>
    <!-- 소셜 로그인 버튼 -->
    <div class="page-auth-buttons">
      <button class="page-auth-button page-auth-button-google">
        <span class="page-auth-button-logo">G</span>
        <span>Google로 계속하기</span>
      </button>
      <button class="page-auth-button page-auth-button-kakao">
        <span class="page-auth-button-logo">K</span>
        <span>Kakao로 계속하기</span>
      </button>
    </div>
  </div>
</div>
```

#### 5.2 스타일

```css
/* === 페이지 4.1 — 로그인 (AuthLayout) === */
.page-auth-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(932px - 33px); /* 프레임 높이 - 라벨 높이 */
  padding: 0 var(--spacing-6);
}

.page-auth-logo {
  text-align: center;
  margin-bottom: var(--spacing-12);
}

.page-auth-logo-icon {
  color: var(--color-text-brand);
  margin-bottom: var(--spacing-2);
}

.page-auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-brand);
  margin: 0 0 var(--spacing-2) 0;
}

.page-auth-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.page-auth-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.page-auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  width: 100%;
  height: 48px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-sans);
  cursor: pointer;
  border: 2px solid transparent;
  transition: opacity var(--duration-fast) var(--easing-default);
}

.page-auth-button:hover {
  opacity: 0.9;
}

.page-auth-button-logo {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

/* Google 버튼 — 브랜드 색상 직접 사용 */
.page-auth-button-google {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  border-color: #4285F4;
}

.page-auth-button-google .page-auth-button-logo {
  color: #4285F4;
}

/* Kakao 버튼 — 브랜드 색상 직접 사용 */
.page-auth-button-kakao {
  background: #FEE500;
  color: #191919;
  border-color: #FEE500;
}
```

#### 5.3 접근성

- 버튼에 의미 있는 텍스트 라벨 포함 ("Google로 계속하기", "Kakao로 계속하기")
- 로고 아이콘: `aria-hidden="true"` (장식용)

## 주의사항

1. **토큰 참조 필수**: 모든 스타일은 `var()` 토큰을 사용한다. 단, Google(`#4285F4`), Kakao(`#FEE500`, `#191919`) 버튼은 브랜드 색상이므로 HEX 직접 사용 허용
2. **SVG 심볼 재사용**: 아이콘은 `<use href="#icon-name">`으로 참조한다
3. **proto- 접두사**: 프로토타입 프레임/라벨 클래스는 `proto-` 접두사 사용
4. **page- 접두사**: 페이지 전용 레이아웃 클래스는 `page-` 접두사 사용 (Sub-02 컴포넌트와 충돌 방지)
5. **후속 task 구조 보장**: 7개 `proto-page-frame` + 1개 인터랙티브 데모 프레임을 스텁으로 미리 생성하여 tasks-03-02~04에서 내용만 채우도록 한다
6. **인터랙티브 데모 프레임**: `#page-main-interactive`는 tasks-03-04에서 탭 전환 JS를 구현할 별도 프레임으로, 개별 페이지 프레임(#page-main-life 등)과 분리한다

## 검증 체크리스트

- [x] 앵커 네비게이션의 "4. 페이지 프로토타입" 링크가 활성 상태이다
- [x] 해당 링크 클릭 시 `<section id="pages">`로 스크롤된다
- [x] `<section id="pages">` 내에 8개 `proto-page-frame`이 존재한다 (7개 페이지 + 1개 인터랙티브 데모)
- [x] 각 `proto-page-frame`이 430px 너비, 932px 최소 높이로 표시된다
- [x] 각 프레임 상단에 페이지 이름 라벨이 표시된다
- [x] 프레임에 2px 보더, `--radius-lg` border-radius가 적용된다
- [x] `.page-content` CSS에 76px 하단 패딩이 설정된다
- [x] `.page-tab-bar` CSS가 `position: absolute; bottom: 0`으로 설정된다
- [x] `.page-fab` CSS가 56px 원형, 우측 하단 고정, TabBar 위 `--spacing-4` 간격이다
- [x] 로그인 페이지: 체크 아이콘(48px) + "Dopamine Planner" 텍스트가 중앙 정렬로 표시된다
- [x] 로그인 페이지: "일상과 업무를 한곳에서" 서브 카피가 `--color-text-secondary`로 표시된다
- [x] 로그인 페이지: Google 버튼이 흰 배경 + `#4285F4` 보더로 표시된다
- [x] 로그인 페이지: Kakao 버튼이 `#FEE500` 배경 + `#191919` 텍스트로 표시된다
- [x] 로그인 페이지: 두 버튼이 48px 높이, 전체 너비, `--spacing-3` 간격으로 표시된다
- [x] 로그인 페이지: "Dopamine Planner" 텍스트가 `--color-text-brand` 색상이다
- [x] 로그인 페이지: 로고 아이콘에 `aria-hidden="true"` 속성이 있다
- [x] 모든 스타일이 `var()` 토큰을 참조한다 (브랜드 색상 제외)
