# Task 02-03: Molecules (TodoItem, SectionHeader, DateNavigator, TabBarItem, FormField)

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-component-library.md`
- **의존성**:
  - `tasks-02-01` (Checkbox, Icon)
  - `tasks-02-02` (Badge)
- **대상 파일**: `docs/base/prototype/index.html` — `<div id="molecules">` 내부에 추가
- **참조 파일**:
  - `sub-prd-02-feat-component-library.md` §3.1~3.5
  - `docs/base/design-system/components.md` — Molecules 전체
  - `docs/base/design-system/accessibility.md` — ARIA/접근성

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #9: Molecules — TodoItem: 4 변형 (미완료, 완료, 우선순위, 이월)
- [x] #10: Molecules — SectionHeader: 2 변형 (완료, 진행 중)
- [x] #11: Molecules — DateNavigator: 날짜 표시 바
- [x] #12: Molecules — TabBarItem: 2 상태 (활성, 비활성)
- [x] #13: Molecules — FormField: 3 상태 (기본, 에러, 비활성)
- [x] #19(일부): Molecules에 해당하는 ARIA 접근성 속성

## 구현 세부사항

### 1. Molecules — TodoItem

4개 변형을 세로로 나열한다. Atoms(Checkbox, Badge)를 조합한다.

#### 1.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>TodoItem</h4>
  <p>4개 변형: 미완료(기본), 완료, 우선순위 표시, 이월 표시</p>
  <div class="proto-todo-item-demo">
    <!-- 4개 변형 세로 나열 -->
  </div>
</div>
```

#### 1.2 각 변형의 HTML 구조

**① 미완료 (기본):**
```html
<div class="proto-todo-item" role="listitem">
  <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
    <span class="proto-checkbox-box"></span>
  </div>
  <span class="proto-todo-item-title">아침 운동하기</span>
  <span class="proto-badge proto-badge-category">건강</span>
</div>
```

**② 완료:**
```html
<div class="proto-todo-item proto-todo-item-completed" role="listitem">
  <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
    <span class="proto-checkbox-box">
      <svg width="14" height="14"><use href="#icon-check"></use></svg>
    </span>
  </div>
  <span class="proto-todo-item-title">영어 단어 복습</span>
  <span class="proto-badge proto-badge-category">자기개발</span>
</div>
```

**③ 우선순위 표시:**
```html
<div class="proto-todo-item" role="listitem">
  <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
    <span class="proto-checkbox-box"></span>
  </div>
  <span class="proto-todo-item-title">프로젝트 보고서 제출</span>
  <span class="proto-badge proto-badge-priority-high">
    <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
    High
  </span>
  <span class="proto-badge proto-badge-category">프로젝트A</span>
</div>
```

**④ 이월 표시:**
```html
<div class="proto-todo-item" role="listitem">
  <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
    <span class="proto-checkbox-box"></span>
  </div>
  <span class="proto-todo-item-title">독서 30분</span>
  <span class="proto-badge proto-badge-carry-over">🔄 2</span>
  <span class="proto-badge proto-badge-category">자기개발</span>
</div>
```

#### 1.3 스타일

```css
.proto-todo-item {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--todo-item-bg);
  border-bottom: 1px solid var(--todo-item-border);
  gap: var(--spacing-3);
}

.proto-todo-item-title {
  flex: 1;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
}

/* 완료 상태 */
.proto-todo-item-completed .proto-todo-item-title {
  text-decoration: line-through;
  color: var(--todo-item-completed-text);
}

/* Badge 간격 */
.proto-todo-item .proto-badge + .proto-badge {
  margin-left: var(--spacing-2);
}
```

- Checkbox와 제목 간격: `gap: var(--spacing-3)` (부모 flex에서 처리)
- 제목과 Badge 간격: Badge 사이 `--spacing-2`

### 2. Molecules — SectionHeader

2개 변형(완료, 진행 중)을 세로로 나열한다.

#### 2.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>SectionHeader</h4>
  <p>2개 변형: 완료 섹션, 진행 중 섹션</p>
  <div class="proto-section-header-demo">
    <!-- 2개 변형 세로 나열 -->
  </div>
</div>
```

#### 2.2 각 변형의 HTML 구조

**① 완료 섹션:**
```html
<div class="proto-section-header proto-section-header-done">
  <svg width="20" height="20" aria-hidden="true" style="color: var(--section-done-text)">
    <use href="#icon-circle-check"></use>
  </svg>
  <span class="proto-section-header-title">완료</span>
  <span class="proto-section-header-count">2</span>
</div>
```

**② 진행 중 섹션:**
```html
<div class="proto-section-header proto-section-header-progress">
  <svg width="20" height="20" aria-hidden="true" style="color: var(--section-progress-text)">
    <use href="#icon-list-todo"></use>
  </svg>
  <span class="proto-section-header-title">진행 중</span>
  <span class="proto-section-header-count">3</span>
</div>
```

> **참고**: `icon-circle-check`과 `icon-list-todo` 심볼이 SVG defs에 없다면, 이 task 구현 시 `<svg><defs>`에 추가해야 한다. Lucide 아이콘 소스 참조:
> - `circle-check`: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`
> - `list-todo`: `<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><line x1="13" x2="21" y1="6" y2="6"/><line x1="13" x2="21" y1="12" y2="12"/><line x1="13" x2="21" y1="18" y2="18"/>`

#### 2.3 스타일

```css
.proto-section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.proto-section-header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.proto-section-header-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
}

.proto-section-header-done .proto-section-header-title,
.proto-section-header-done .proto-section-header-count {
  color: var(--section-done-text);
}

.proto-section-header-progress .proto-section-header-title,
.proto-section-header-progress .proto-section-header-count {
  color: var(--section-progress-text);
}
```

### 3. Molecules — DateNavigator

오늘 날짜를 표시하는 네비게이션 바를 구현한다.

#### 3.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>DateNavigator</h4>
  <p>날짜 네비게이션: 이전/다음 화살표 + 날짜 텍스트</p>
  <div class="proto-date-navigator">
    <button class="proto-date-nav-btn" aria-label="이전 날짜">
      <svg width="24" height="24" style="color: var(--color-text-secondary)">
        <use href="#icon-chevron-left"></use>
      </svg>
    </button>
    <span class="proto-date-text">2026년 5월 1일 (목)</span>
    <button class="proto-date-nav-btn" aria-label="다음 날짜">
      <svg width="24" height="24" style="color: var(--color-text-secondary)">
        <use href="#icon-chevron-right"></use>
      </svg>
    </button>
  </div>
</div>
```

#### 3.2 스타일

```css
.proto-date-navigator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--spacing-6);
}

.proto-date-text {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.proto-date-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px; /* 24px 아이콘 + 10px×2 패딩 = 44px 터치 타겟 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--easing-default);
}

.proto-date-nav-btn:hover {
  background: var(--color-bg-surface);
}
```

#### 3.3 접근성 (ARIA)

- 이전 버튼: `aria-label="이전 날짜"`
- 다음 버튼: `aria-label="다음 날짜"`
- 버튼 최소 터치 타겟 44×44px 확보

### 4. Molecules — TabBarItem

활성/비활성 2개 상태를 나란히 표시한다.

#### 4.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>TabBarItem</h4>
  <p>2개 상태: 활성(active), 비활성(inactive)</p>
  <div class="proto-tab-bar-item-demo">
    <!-- Active -->
    <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
      <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
      <span class="proto-tab-bar-item-label">Life</span>
    </div>
    <!-- Inactive -->
    <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
      <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
      <span class="proto-tab-bar-item-label">Work</span>
    </div>
  </div>
</div>
```

#### 4.2 스타일

```css
.proto-tab-bar-item-demo {
  display: flex;
  gap: var(--spacing-8);
  align-items: flex-end;
}

.proto-tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  cursor: pointer;
  padding: var(--spacing-2);
  min-width: 44px;
  min-height: 44px;
}

.proto-tab-bar-item-label {
  font-size: var(--font-size-xs);
}

/* Active */
.proto-tab-bar-item-active {
  color: var(--tab-bar-active);
}
.proto-tab-bar-item-active .proto-tab-bar-item-label {
  font-weight: var(--font-weight-semibold);
}

/* Inactive */
.proto-tab-bar-item-inactive {
  color: var(--tab-bar-inactive);
}
.proto-tab-bar-item-inactive .proto-tab-bar-item-label {
  font-weight: var(--font-weight-regular);
}
```

#### 4.3 접근성 (ARIA)

- `role="tab"` 속성
- 활성: `aria-selected="true"`
- 비활성: `aria-selected="false"`

### 5. Molecules — FormField

3개 상태(기본, 에러, 비활성)를 세로로 나열한다.

#### 5.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>FormField</h4>
  <p>3개 상태: 기본, 에러, 비활성</p>
  <div class="proto-form-field-demo">
    <!-- 3개 상태 세로 나열 -->
  </div>
</div>
```

#### 5.2 각 상태의 HTML 구조

**① 기본:**
```html
<div class="proto-form-field">
  <label class="proto-form-label" for="field-default">제목</label>
  <input class="proto-form-input" id="field-default" type="text" placeholder="할 일을 입력하세요">
  <span class="proto-form-helper">필수 입력 항목입니다</span>
</div>
```

**② 에러:**
```html
<div class="proto-form-field proto-form-field-error">
  <label class="proto-form-label" for="field-error">제목</label>
  <input class="proto-form-input" id="field-error" type="text" value="" aria-invalid="true" aria-describedby="field-error-msg">
  <span class="proto-form-helper proto-form-error-msg" id="field-error-msg">제목을 입력해주세요</span>
</div>
```

**③ 비활성:**
```html
<div class="proto-form-field proto-form-field-disabled">
  <label class="proto-form-label" for="field-disabled">제목</label>
  <input class="proto-form-input" id="field-disabled" type="text" placeholder="입력할 수 없습니다" disabled>
  <span class="proto-form-helper">비활성 상태입니다</span>
</div>
```

#### 5.3 스타일

```css
.proto-form-field-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: 360px;
}

.proto-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.proto-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.proto-form-input {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  font-size: var(--font-size-md);
  font-family: var(--font-family-sans);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  transition: border-color var(--duration-fast) var(--easing-default);
}

.proto-form-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  border-width: 2px;
}

.proto-form-helper {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 에러 상태 */
.proto-form-field-error .proto-form-input {
  border-color: var(--color-status-error);
}

.proto-form-field-error .proto-form-error-msg {
  color: var(--color-status-error);
}

/* 비활성 상태 */
.proto-form-field-disabled .proto-form-input {
  background: var(--color-bg-surface);
  opacity: 0.5;
  cursor: not-allowed;
}

.proto-form-field-disabled .proto-form-helper {
  opacity: 0.5;
}
```

#### 5.4 접근성 (ARIA)

- `<label>` + `for` 속성으로 입력 필드와 연결
- 에러 상태: `aria-invalid="true"`, `aria-describedby`로 에러 메시지 연결
- 비활성: `disabled` 속성 (네이티브 HTML)

### 6. 추가 SVG 심볼

이 task 구현 시 기존 SVG defs에 없는 아이콘이 필요하다. `<svg><defs>`에 추가한다:

| 심볼 ID | Lucide 이름 | 용도 | SVG 내부 요소 |
|---------|-------------|------|--------------|
| `icon-circle-check` | `circle-check` | 완료 섹션 헤더 | `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>` |
| `icon-list-todo` | `list-todo` | 진행 중 섹션 헤더 | `<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><line x1="13" x2="21" y1="6" y2="6"/><line x1="13" x2="21" y1="12" y2="12"/><line x1="13" x2="21" y1="18" y2="18"/>` |

> Lucide Icons 공식 소스에서 최신 path를 확인하여 사용한다.

## 주의사항

1. **Atoms 재사용**: TodoItem 내부의 Checkbox, Badge는 tasks-02-01, tasks-02-02에서 정의한 스타일 클래스를 재사용한다. 스타일을 중복 정의하지 않는다
2. **토큰 참조 필수**: 모든 스타일은 `var()` 토큰을 사용한다. HEX 값을 직접 쓰지 않는다
3. **SVG 심볼 재사용**: 아이콘은 `<use href="#icon-name">`으로 참조한다. 새 심볼이 필요하면 `<defs>`에 추가한다
4. **proto- 접두사**: 프로토타입 레이아웃 클래스는 반드시 `proto-` 접두사를 사용한다
5. **컴포넌트 격리**: 각 컴포넌트 데모는 `.proto-component-card` 내에 격리한다
6. **삽입 위치**: `<div id="molecules">` 내부에 추가한다

## 검증 체크리스트

- [x] TodoItem 4개 변형이 세로로 나열된다
- [x] TodoItem 미완료: Checkbox(unchecked) + 제목 + Category Badge
- [x] TodoItem 완료: Checkbox(checked) + 취소선 제목 + Category Badge, 텍스트 `--todo-item-completed-text`
- [x] TodoItem 우선순위: Priority Badge(High, AlertTriangle 아이콘 포함) + Category Badge
- [x] TodoItem 이월: Carry-over Badge("🔄 2") + Category Badge
- [x] TodoItem 최소 높이 48px, 패딩 `--spacing-3` `--spacing-4`
- [x] TodoItem에 `role="listitem"` 속성이 있다
- [x] SectionHeader 완료: Check 아이콘 + "완료" + 개수, 텍스트 `--section-done-text`
- [x] SectionHeader 진행 중: 목록 아이콘 + "진행 중" + 개수, 텍스트 `--section-progress-text`
- [x] SectionHeader 폰트가 `--font-size-lg`, `--font-weight-semibold`
- [x] DateNavigator에 "2026년 5월 1일 (목)" 형식으로 표시된다
- [x] DateNavigator 좌우 화살표가 24px 아이콘, `--color-text-secondary`이다
- [x] DateNavigator 전체 높이가 56px이다
- [x] DateNavigator 이전/다음 버튼에 `aria-label`이 있다
- [x] DateNavigator 버튼 터치 타겟이 44×44px이다
- [x] TabBarItem 활성: 색상 `--tab-bar-active`, `--font-weight-semibold`
- [x] TabBarItem 비활성: 색상 `--tab-bar-inactive`, `--font-weight-regular`
- [x] TabBarItem에 `role="tab"`, `aria-selected` 속성이 있다
- [x] FormField 기본: 라벨 + 입력 필드(기본 보더) + 도움말 텍스트
- [x] FormField 에러: 빨간 보더(`--color-status-error`) + 에러 메시지(빨간 텍스트)
- [x] FormField 비활성: 회색 배경 + 흐린 도움말 텍스트
- [x] FormField 에러에 `aria-invalid="true"`, `aria-describedby` 속성이 있다
- [x] FormField `<label>` + `for`로 입력 필드가 연결되어 있다
- [x] 필요한 SVG 심볼(`icon-circle-check`, `icon-list-todo`)이 `<defs>`에 추가되었다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
- [x] `.proto-component-card`로 각 컴포넌트가 격리되어 있다
