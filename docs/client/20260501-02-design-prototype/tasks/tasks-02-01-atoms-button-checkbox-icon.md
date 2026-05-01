# Task 02-01: 섹션 구조 + Atoms Part 1 (Button, Checkbox, Icon)

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-component-library.md`
- **의존성**: Sub-PRD 01 완료 (HTML 구조, 토큰, SVG 심볼)
- **대상 파일**: `docs/client/prototype/index.html`
- **참조 파일**:
  - `sub-prd-02-feat-component-library.md` §2.1~2.3
  - `docs/client/design-system/components.md` — Atoms (Button, Checkbox, Icon)
  - `docs/client/design-system/accessibility.md` — ARIA/접근성

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #1: 앵커 네비게이션에 섹션 3 링크 활성화
- [x] #2: `<section id="components">` 추가
- [x] #3: Atoms — Button: 4 변형 × 4 상태 그리드
- [x] #4: Atoms — Checkbox: 3 상태
- [x] #5: Atoms — Icon: 3 크기 변형
- [x] #19(일부): Button, Checkbox, Icon에 해당하는 ARIA 접근성 속성

## 구현 세부사항

### 1. 앵커 네비게이션 섹션 3 활성화

기존 비활성 상태의 섹션 3 링크를 활성화한다.

**변경 전:**
```html
<a class="proto-nav-disabled">3. 컴포넌트 라이브러리</a>
```

**변경 후:**
```html
<a href="#components">3. 컴포넌트 라이브러리</a>
```

- `proto-nav-disabled` 클래스를 제거하고 `href="#components"`를 추가한다
- 섹션 4 링크는 비활성 상태를 유지한다

### 2. 섹션 구조 추가

기존 섹션 2(`<section id="icons">`) 뒤에 `<section id="components">`를 추가한다.

```html
<section id="components" class="proto-section">
  <h2 class="proto-section-title">3. 컴포넌트 라이브러리</h2>

  <div id="atoms">
    <h3>3.1 Atoms</h3>
    <!-- Button, Checkbox, Icon (이 task에서 구현) -->
    <!-- Badge, Divider, Avatar (tasks-02-02에서 추가) -->
  </div>

  <div id="molecules">
    <h3>3.2 Molecules</h3>
    <!-- tasks-02-03에서 추가 -->
  </div>

  <div id="organisms">
    <h3>3.3 Organisms</h3>
    <!-- tasks-02-04에서 추가 -->
  </div>
</section>
```

### 3. Atoms — Button

4개 변형 × 4개 상태 = 16개 조합을 그리드로 표시한다. `.proto-component-card`로 격리한다.

#### 3.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Button</h4>
  <p>4개 변형(primary, secondary, ghost, destructive) × 4개 상태(default, hover, active, disabled)</p>
  <div class="proto-button-grid">
    <!-- 행: 변형 / 열: 상태 -->
  </div>
</div>
```

#### 3.2 그리드 레이아웃

헤더 행 + 4개 변형 행으로 구성한다. 각 행에 4개 상태 열을 배치한다.

```
         | Default  | Hover    | Active   | Disabled |
---------|----------|----------|----------|----------|
Primary  | [버튼]   | [버튼]   | [버튼]   | [버튼]   |
Secondary| [버튼]   | [버튼]   | [버튼]   | [버튼]   |
Ghost    | [버튼]   | [버튼]   | [버튼]   | [버튼]   |
Destructive| [버튼] | [버튼]   | [버튼]   | [버튼]   |
```

#### 3.3 각 변형의 스타일

**Primary:**
```css
background: var(--button-primary-bg);
color: var(--button-primary-text);
/* hover */ background: var(--button-primary-bg-hover);
/* active */ background: var(--button-primary-bg-active);
/* disabled */ background: var(--button-primary-bg-disabled); opacity: 0.5; cursor: not-allowed;
```

**Secondary:**
```css
background: var(--color-interactive-secondary);
color: var(--color-text-inverse);
/* hover */ background: var(--color-interactive-secondary-hover);
/* active */ background: var(--color-interactive-secondary-active);
/* disabled */ opacity: 0.5; cursor: not-allowed;
```

**Ghost:**
```css
background: transparent;
color: var(--color-interactive-primary);
border: 1px solid var(--color-interactive-primary);
/* hover */ background: var(--color-bg-brand-subtle);
/* active */ background: var(--color-interactive-primary); color: var(--color-text-inverse);
/* disabled */ opacity: 0.5; cursor: not-allowed;
```

**Destructive:**
```css
background: var(--color-status-error);
color: var(--color-text-inverse);
/* hover */ opacity: 0.9;
/* active */ opacity: 0.8;
/* disabled */ opacity: 0.5; cursor: not-allowed;
```

#### 3.4 공통 스타일

```css
.proto-button {
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-sans);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
}
```

- Hover/Active 상태는 별도 요소로 항상 표시 (클래스로 강제 적용: `proto-state-hover`, `proto-state-active`, `proto-state-disabled`)
- 실제 CSS `:hover`, `:active` 의사 클래스도 함께 적용하여 마우스 인터랙션으로도 확인 가능하게 한다

#### 3.5 접근성 (ARIA)

- disabled 버튼에 `aria-disabled="true"` 속성 추가
- 모든 버튼에 의미 있는 텍스트 라벨 포함 (예: "Primary", "Secondary")

### 4. Atoms — Checkbox

3개 상태(unchecked, checked, disabled)를 나란히 표시한다.

#### 4.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Checkbox</h4>
  <p>3개 상태: unchecked, checked, disabled</p>
  <div class="proto-checkbox-demo">
    <!-- 3개 상태 나란히 -->
  </div>
</div>
```

#### 4.2 각 상태 구현

```html
<!-- Unchecked -->
<div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
  <span class="proto-checkbox-box"></span>
  <span class="proto-checkbox-label">Unchecked</span>
</div>

<!-- Checked -->
<div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
  <span class="proto-checkbox-box">
    <svg width="14" height="14"><use href="#icon-check"></use></svg>
  </span>
  <span class="proto-checkbox-label">Checked</span>
</div>

<!-- Disabled -->
<div class="proto-checkbox proto-checkbox-disabled" role="checkbox" aria-checked="false" aria-disabled="true">
  <span class="proto-checkbox-box"></span>
  <span class="proto-checkbox-label">Disabled</span>
</div>
```

#### 4.3 스타일 규칙

```css
.proto-checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid var(--todo-item-checkbox-unchecked);
  border-radius: var(--radius-sm);
  /* 터치 영역은 44×44px */
  padding: 12px; /* (44 - 20) / 2 */
  transition: all var(--duration-fast) var(--easing-default);
}

.proto-checkbox-checked .proto-checkbox-box {
  background: var(--todo-item-checkbox-checked);
  border-color: var(--todo-item-checkbox-checked);
  color: var(--color-text-inverse);
}

.proto-checkbox-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### 4.4 바닐라 JS 토글

Unchecked/Checked 체크박스에 클릭 이벤트를 바인딩하여 토글 동작을 구현한다.

```javascript
document.querySelectorAll('.proto-checkbox:not(.proto-checkbox-disabled)').forEach(cb => {
  cb.addEventListener('click', () => {
    const isChecked = cb.getAttribute('aria-checked') === 'true';
    cb.setAttribute('aria-checked', !isChecked);
    cb.classList.toggle('proto-checkbox-checked');
  });
});
```

- `aria-checked` 값도 함께 토글한다
- disabled 상태의 체크박스는 이벤트를 바인딩하지 않는다

#### 4.5 접근성 (ARIA)

- `role="checkbox"` 속성
- `aria-checked="true"` / `aria-checked="false"` 상태 관리
- disabled에 `aria-disabled="true"` 속성
- `tabindex="0"`으로 키보드 접근 가능 (disabled 제외)
- `Space` 키로 토글 가능하도록 keydown 이벤트 추가

### 5. Atoms — Icon

3크기 변형(16px, 20px, 24px)을 컴포넌트 카드로 표시한다.

#### 5.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Icon</h4>
  <p>3가지 크기 변형: 16px, 20px, 24px (기본)</p>
  <div class="proto-icon-size-demo">
    <!-- 대표 아이콘 3개 정도를 크기별로 표시 -->
  </div>
</div>
```

#### 5.2 크기 변형 표시

대표 아이콘(Check, Plus, Settings)을 3가지 크기로 나란히 표시한다.

```html
<div class="proto-icon-variant-row">
  <span class="proto-icon-label">Check</span>
  <svg width="16" height="16" aria-hidden="true"><use href="#icon-check"></use></svg>
  <svg width="20" height="20" aria-hidden="true"><use href="#icon-check"></use></svg>
  <svg width="24" height="24" aria-hidden="true"><use href="#icon-check"></use></svg>
</div>
```

- 각 크기 아래에 라벨(16px / 20px / 24px) 표시
- 모든 아이콘에 `color: var(--color-text-primary)` 적용

#### 5.3 접근성 (ARIA)

- 장식용 아이콘: `aria-hidden="true"` 속성
- 이 카드의 아이콘은 크기 변형 데모 목적이므로 모두 `aria-hidden="true"`

### 6. 프로토타입 CSS 클래스 추가

`<style>` 블록에 추가할 프로토타입 전용 CSS:

```css
/* === 컴포넌트 카드 === */
.proto-component-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
}

.proto-component-card h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-1) 0;
}

.proto-component-card > p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-4) 0;
}

/* === Button 그리드 === */
.proto-button-grid {
  display: grid;
  grid-template-columns: auto repeat(4, 1fr);
  gap: var(--spacing-3);
  align-items: center;
}

/* === Checkbox 데모 === */
.proto-checkbox-demo {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

/* === Icon 크기 데모 === */
.proto-icon-size-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.proto-icon-variant-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}
```

## 주의사항

1. **토큰 참조 필수**: 모든 스타일은 `var()` 토큰을 사용한다. HEX 값을 직접 쓰지 않는다
2. **SVG 심볼 재사용**: 아이콘은 `<use href="#icon-name">`으로 참조한다
3. **proto- 접두사**: 프로토타입 레이아웃 클래스는 반드시 `proto-` 접두사를 사용한다
4. **컴포넌트 격리**: 각 컴포넌트 데모는 `.proto-component-card` 내에 격리한다
5. **상태 시각화 이중 방식**: 항상 표시(별도 요소) + 실제 CSS 의사 클래스 인터랙션 모두 적용
6. **후속 task 구조 보장**: `#atoms`, `#molecules`, `#organisms` div를 미리 생성하여 tasks-02-02~04에서 내용만 추가할 수 있게 한다

## 검증 체크리스트

- [x] 앵커 네비게이션의 "3. 컴포넌트 라이브러리" 링크가 활성 상태이다
- [x] 해당 링크 클릭 시 `<section id="components">`로 스크롤된다
- [x] `<section id="components">` 내에 `#atoms`, `#molecules`, `#organisms` div가 존재한다
- [x] Button 16개 조합(4변형 × 4상태)이 그리드로 모두 표시된다
- [x] Button의 각 변형(primary/secondary/ghost/destructive)이 시각적으로 구분된다
- [x] Button hover/active 상태가 항상 표시되며, 마우스 인터랙션으로도 변화한다
- [x] Button disabled 상태에 `opacity: 0.5`, `cursor: not-allowed`가 적용된다
- [x] Button 최소 터치 타겟이 44×44px이다
- [x] Button 트랜지션이 `--duration-fast`로 적용된다
- [x] Checkbox 3개 상태(unchecked/checked/disabled)가 나란히 표시된다
- [x] Checkbox unchecked 클릭 시 checked로 토글된다
- [x] Checkbox checked 클릭 시 unchecked로 토글된다
- [x] Checkbox disabled는 클릭해도 변화 없다
- [x] Checkbox에 `role="checkbox"`, `aria-checked` 속성이 있다
- [x] Icon 3크기(16px/20px/24px)가 나란히 표시된다
- [x] Icon에 `aria-hidden="true"` 속성이 있다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
- [x] `.proto-component-card`로 각 컴포넌트가 격리되어 있다
