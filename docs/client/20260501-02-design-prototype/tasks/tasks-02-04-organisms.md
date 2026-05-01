# Task 02-04: Organisms (TodoSection, BottomTabBar, TodoCreateSheet, CategoryList, EpicCard)

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-component-library.md`
- **의존성**: `tasks-02-03` (TodoItem, SectionHeader, TabBarItem, FormField), `tasks-02-01` (Button)
- **대상 파일**: `docs/client/prototype/index.html` — `<div id="organisms">` 내부에 추가
- **참조 파일**:
  - `sub-prd-02-feat-component-library.md` §4.1~4.5
  - `docs/client/design-system/components.md` — Organisms 전체
  - `docs/client/design-system/accessibility.md` — ARIA/접근성

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #14: Organisms — TodoSection: 2 변형 (완료 섹션, 진행 중 섹션)
- [x] #15: Organisms — BottomTabBar: 3탭 하단 바
- [x] #16: Organisms — TodoCreateSheet: 바텀 시트 폼
- [x] #17: Organisms — CategoryList: 3개 항목 목록
- [x] #18: Organisms — EpicCard: 2개 카드 (진행률 포함)
- [x] #19(일부): Organisms에 해당하는 ARIA 접근성 속성

## 구현 세부사항

### 1. Organisms — TodoSection

SectionHeader + TodoItem[] 조합을 2개 변형으로 표시한다. 430px 프레임 내에 배치한다.

#### 1.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>TodoSection</h4>
  <p>SectionHeader + TodoItem[] 조합 — 2개 변형: 진행 중 섹션, 완료 섹션</p>
  <div class="proto-todo-section-demo">
    <!-- 진행 중 섹션 -->
    <div class="proto-todo-section-frame">
      <!-- 진행 중 -->
    </div>
    <!-- 완료 섹션 -->
    <div class="proto-todo-section-frame">
      <!-- 완료 -->
    </div>
  </div>
</div>
```

#### 1.2 진행 중 섹션

```html
<div class="proto-todo-section-frame">
  <div class="proto-section-header proto-section-header-progress">
    <svg width="20" height="20" aria-hidden="true" style="color: var(--section-progress-text)">
      <use href="#icon-list-todo"></use>
    </svg>
    <span class="proto-section-header-title">진행 중</span>
    <span class="proto-section-header-count">3</span>
  </div>
  <div role="list">
    <!-- TodoItem 미완료 -->
    <div class="proto-todo-item" role="listitem">
      <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
        <span class="proto-checkbox-box"></span>
      </div>
      <span class="proto-todo-item-title">아침 운동하기</span>
      <span class="proto-badge proto-badge-category">건강</span>
    </div>
    <!-- TodoItem 우선순위 -->
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
    <!-- TodoItem 이월 -->
    <div class="proto-todo-item" role="listitem">
      <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
        <span class="proto-checkbox-box"></span>
      </div>
      <span class="proto-todo-item-title">독서 30분</span>
      <span class="proto-badge proto-badge-carry-over">🔄 2</span>
      <span class="proto-badge proto-badge-category">자기개발</span>
    </div>
  </div>
</div>
```

#### 1.3 완료 섹션

```html
<div class="proto-todo-section-frame">
  <div class="proto-section-header proto-section-header-done">
    <svg width="20" height="20" aria-hidden="true" style="color: var(--section-done-text)">
      <use href="#icon-circle-check"></use>
    </svg>
    <span class="proto-section-header-title">완료</span>
    <span class="proto-section-header-count">2</span>
  </div>
  <div role="list">
    <!-- TodoItem 완료 1 -->
    <div class="proto-todo-item proto-todo-item-completed" role="listitem">
      <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
        <span class="proto-checkbox-box">
          <svg width="14" height="14"><use href="#icon-check"></use></svg>
        </span>
      </div>
      <span class="proto-todo-item-title">영어 단어 복습</span>
      <span class="proto-badge proto-badge-category">자기개발</span>
    </div>
    <!-- TodoItem 완료 2 -->
    <div class="proto-todo-item proto-todo-item-completed" role="listitem">
      <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
        <span class="proto-checkbox-box">
          <svg width="14" height="14"><use href="#icon-check"></use></svg>
        </span>
      </div>
      <span class="proto-todo-item-title">비타민 복용</span>
      <span class="proto-badge proto-badge-category">건강</span>
    </div>
  </div>
</div>
```

#### 1.4 프레임 스타일

```css
.proto-todo-section-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.proto-todo-section-frame {
  width: 430px;
  max-width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}
```

#### 1.5 접근성 (ARIA)

- TodoItem 목록 컨테이너: `role="list"`
- 각 TodoItem: `role="listitem"`

### 2. Organisms — BottomTabBar

3탭 하단 바를 구현한다. 430px 프레임 내에 배치한다.

#### 2.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>BottomTabBar</h4>
  <p>3탭 하단 바: Life(활성), Work, 설정 — 56px + Safe Area</p>
  <div class="proto-bottom-tab-bar-demo">
    <div class="proto-bottom-tab-bar" role="tablist">
      <!-- Life (Active) -->
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <!-- Work (Inactive) -->
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <!-- Settings (Inactive) -->
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 2.2 스타일

```css
.proto-bottom-tab-bar-demo {
  width: 430px;
  max-width: 100%;
}

.proto-bottom-tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  padding-bottom: 20px; /* Safe Area 시뮬레이션 */
  background: var(--tab-bar-bg);
  border-top: 1px solid var(--color-border-subtle);
}
```

#### 2.3 접근성 (ARIA)

- 컨테이너: `role="tablist"`
- 각 탭: `role="tab"`, `aria-selected`
- 활성 탭 1개, 비활성 탭 2개

### 3. Organisms — TodoCreateSheet

바텀 시트 형태의 투두 생성 폼을 구현한다. 430px 프레임 내 하단 고정으로 표시한다.

#### 3.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>TodoCreateSheet</h4>
  <p>바텀 시트 폼: 핸들 + 폼 필드 + 우선순위 + 저장 버튼</p>
  <div class="proto-create-sheet-demo">
    <div class="proto-create-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <!-- 핸들 바 -->
      <div class="proto-sheet-handle"></div>
      <!-- 헤더 -->
      <div class="proto-sheet-header">
        <h5 id="sheet-title" class="proto-sheet-title">새 투두</h5>
        <button class="proto-sheet-close" aria-label="닫기">✕</button>
      </div>
      <!-- 제목 필드 -->
      <div class="proto-form-field">
        <label class="proto-form-label" for="sheet-title-input">제목 *</label>
        <input class="proto-form-input" id="sheet-title-input" type="text" placeholder="할 일을 입력하세요">
      </div>
      <!-- 설명 필드 -->
      <div class="proto-form-field">
        <label class="proto-form-label" for="sheet-desc-input">설명</label>
        <textarea class="proto-form-input proto-form-textarea" id="sheet-desc-input" placeholder="설명을 입력하세요 (선택)" rows="3"></textarea>
      </div>
      <!-- 우선순위 선택 -->
      <div class="proto-sheet-priority">
        <span class="proto-form-label">우선순위</span>
        <div class="proto-sheet-priority-options">
          <span class="proto-badge proto-badge-priority-high">
            <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
            High
          </span>
          <span class="proto-badge proto-badge-priority-medium">Medium</span>
          <span class="proto-badge proto-badge-priority-low">Low</span>
        </div>
      </div>
      <!-- 분류 선택 -->
      <div class="proto-form-field">
        <label class="proto-form-label" for="sheet-category">분류</label>
        <select class="proto-form-input" id="sheet-category">
          <option value="" disabled selected>분류를 선택하세요</option>
          <option>건강</option>
          <option>자기개발</option>
          <option>생활</option>
        </select>
      </div>
      <!-- Epic 선택 -->
      <div class="proto-form-field">
        <label class="proto-form-label" for="sheet-epic">Epic</label>
        <select class="proto-form-input" id="sheet-epic">
          <option value="" disabled selected>Epic을 선택하세요</option>
          <option>3월 운동 루틴</option>
          <option>독서 챌린지</option>
        </select>
      </div>
      <!-- 날짜 선택 -->
      <div class="proto-form-field">
        <label class="proto-form-label" for="sheet-date">날짜</label>
        <input class="proto-form-input" id="sheet-date" type="date" value="2026-05-01">
      </div>
      <!-- 저장 버튼 -->
      <button class="proto-button proto-button-primary proto-sheet-save">저장</button>
    </div>
  </div>
</div>
```

#### 3.2 스타일

```css
.proto-create-sheet-demo {
  width: 430px;
  max-width: 100%;
  position: relative;
}

.proto-create-sheet {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  border: 1px solid var(--color-border-subtle);
}

.proto-sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border-default);
  border-radius: var(--radius-full);
  margin: 0 auto var(--spacing-2);
}

.proto-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proto-sheet-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.proto-sheet-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.proto-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.proto-sheet-priority {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.proto-sheet-priority-options {
  display: flex;
  gap: var(--spacing-2);
}

.proto-sheet-save {
  width: 100%;
}

/* Button Primary 스타일 (proto-button-primary) */
.proto-button-primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}
.proto-button-primary:hover {
  background: var(--button-primary-bg-hover);
}
.proto-button-primary:active {
  background: var(--button-primary-bg-active);
}
```

#### 3.3 접근성 (ARIA)

- 컨테이너: `role="dialog"`, `aria-modal="true"`
- `aria-labelledby`로 시트 제목과 연결
- 닫기 버튼: `aria-label="닫기"`
- 닫기 버튼 터치 타겟 44×44px

### 4. Organisms — CategoryList

컬러 인디케이터 + 분류명으로 구성된 3항목 목록을 구현한다.

#### 4.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>CategoryList</h4>
  <p>분류 관리 목록: 컬러 인디케이터 + 분류명 + 더보기 아이콘</p>
  <div class="proto-category-list-demo">
    <!-- 건강 -->
    <div class="proto-category-item">
      <div class="proto-category-indicator" style="background: var(--color-purple-500)"></div>
      <span class="proto-category-name">건강</span>
      <button class="proto-category-more" aria-label="건강 카테고리 더보기">⋮</button>
    </div>
    <hr class="proto-divider" role="separator">
    <!-- 자기개발 -->
    <div class="proto-category-item">
      <div class="proto-category-indicator" style="background: var(--color-periwinkle-500)"></div>
      <span class="proto-category-name">자기개발</span>
      <button class="proto-category-more" aria-label="자기개발 카테고리 더보기">⋮</button>
    </div>
    <hr class="proto-divider" role="separator">
    <!-- 생활 -->
    <div class="proto-category-item">
      <div class="proto-category-indicator" style="background: var(--color-indigo-600)"></div>
      <span class="proto-category-name">생활</span>
      <button class="proto-category-more" aria-label="생활 카테고리 더보기">⋮</button>
    </div>
  </div>
</div>
```

#### 4.2 스타일

```css
.proto-category-list-demo {
  max-width: 430px;
}

.proto-category-item {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-3);
}

.proto-category-indicator {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.proto-category-name {
  flex: 1;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.proto-category-more {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 4.3 샘플 데이터

| 색상 | 분류명 | 토큰 |
|------|--------|------|
| Purple | 건강 | `--color-purple-500` |
| Periwinkle | 자기개발 | `--color-periwinkle-500` |
| Indigo | 생활 | `--color-indigo-600` |

#### 4.4 접근성

- 더보기 버튼: `aria-label="[카테고리명] 카테고리 더보기"`
- 항목 간 Divider: `role="separator"`

### 5. Organisms — EpicCard

진행률 바가 포함된 Epic 카드 2개를 구현한다.

#### 5.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>EpicCard</h4>
  <p>진행률 바 + 제목 + 완료 비율이 포함된 Epic 카드</p>
  <div class="proto-epic-card-demo">
    <!-- Epic 1 -->
    <div class="proto-epic-card">
      <div class="proto-epic-header">
        <span class="proto-epic-title">3월 운동 루틴</span>
        <span class="proto-badge proto-badge-category">active</span>
      </div>
      <div class="proto-epic-progress-bar">
        <div class="proto-epic-progress-fill" style="width: 80%"></div>
      </div>
      <span class="proto-epic-progress-text">80% (4/5)</span>
    </div>
    <!-- Epic 2 -->
    <div class="proto-epic-card">
      <div class="proto-epic-header">
        <span class="proto-epic-title">독서 챌린지</span>
        <span class="proto-badge proto-badge-category">active</span>
      </div>
      <div class="proto-epic-progress-bar">
        <div class="proto-epic-progress-fill" style="width: 30%"></div>
      </div>
      <span class="proto-epic-progress-text">30% (3/10)</span>
    </div>
  </div>
</div>
```

#### 5.2 스타일

```css
.proto-epic-card-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-width: 430px;
}

.proto-epic-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.proto-epic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proto-epic-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.proto-epic-progress-bar {
  height: 8px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.proto-epic-progress-fill {
  height: 100%;
  background: var(--color-interactive-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--easing-default);
}

.proto-epic-progress-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

#### 5.3 샘플 데이터

| Epic | 진행률 | 상태 |
|------|--------|------|
| 3월 운동 루틴 | 80% (4/5) | active |
| 독서 챌린지 | 30% (3/10) | active |

## 주의사항

1. **Molecules/Atoms 재사용**: TodoSection 내부의 SectionHeader, TodoItem, Checkbox, Badge, Divider 등은 이전 task에서 정의한 스타일 클래스를 재사용한다. 스타일을 중복 정의하지 않는다
2. **토큰 참조 필수**: 모든 스타일은 `var()` 토큰을 사용한다. HEX 값을 직접 쓰지 않는다
3. **SVG 심볼 재사용**: 아이콘은 `<use href="#icon-name">`으로 참조한다
4. **proto- 접두사**: 프로토타입 레이아웃 클래스는 반드시 `proto-` 접두사를 사용한다
5. **컴포넌트 격리**: 각 컴포넌트 데모는 `.proto-component-card` 내에 격리한다
6. **430px 프레임**: TodoSection, BottomTabBar, TodoCreateSheet는 430px 프레임 내에 배치하여 모바일 뷰포트를 시뮬레이션한다
7. **삽입 위치**: `<div id="organisms">` 내부에 추가한다
8. **진행률 바**: `width` 인라인 스타일로 비율을 설정한다 (프로토타입이므로 하드코딩 허용)

## 검증 체크리스트

- [x] TodoSection 진행 중: SectionHeader(진행 중) + TodoItem 3개(미완료, 우선순위, 이월)
- [x] TodoSection 완료: SectionHeader(완료) + TodoItem 2개(완료)
- [x] TodoSection이 430px 프레임 내에 배치된다
- [x] TodoSection 목록 컨테이너에 `role="list"`, 각 항목에 `role="listitem"` 속성이 있다
- [x] BottomTabBar가 56px 높이 + Safe Area(20px)로 표시된다
- [x] BottomTabBar에 3탭(Life/Work/설정)이 3등분으로 배치된다
- [x] BottomTabBar 활성 탭이 `--tab-bar-active`, 비활성이 `--tab-bar-inactive`이다
- [x] BottomTabBar 상단에 1px 보더가 표시된다
- [x] BottomTabBar에 `role="tablist"`, 각 탭에 `role="tab"` 속성이 있다
- [x] TodoCreateSheet이 바텀 시트 형태로 표시된다 (상단 라운드 코너)
- [x] TodoCreateSheet에 핸들 바가 중앙에 표시된다
- [x] TodoCreateSheet에 "새 투두" 헤더 + 닫기 버튼이 있다
- [x] TodoCreateSheet에 제목, 설명, 우선순위, 분류, Epic, 날짜 필드가 있다
- [x] TodoCreateSheet에 전체 너비 저장 버튼(primary)이 있다
- [x] TodoCreateSheet에 `role="dialog"`, `aria-modal="true"` 속성이 있다
- [x] CategoryList에 3개 항목이 세로로 나열된다
- [x] CategoryList 각 항목에 컬러 인디케이터(12px 원형) + 분류명 + 더보기 버튼이 있다
- [x] CategoryList 항목 간 Divider(`role="separator"`)가 있다
- [x] CategoryList 항목 높이가 48px이다
- [x] EpicCard 2개가 세로로 나열된다
- [x] EpicCard에 제목 + 상태 Badge + 진행률 바 + 진행률 텍스트가 있다
- [x] EpicCard "3월 운동 루틴"의 진행률 바가 80% 채워져 있다
- [x] EpicCard "독서 챌린지"의 진행률 바가 30% 채워져 있다
- [x] EpicCard 진행률 바 높이가 8px, 채움 색상이 `--color-interactive-primary`이다
- [x] 모든 인터랙티브 요소의 터치 영역이 44×44px 이상이다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
- [x] `.proto-component-card`로 각 컴포넌트가 격리되어 있다
