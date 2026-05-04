# Task 03-02: 메인 페이지 (Life + Work) + 투두 생성

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-page-prototypes.md`
- **의존성**: `tasks-03-01` (페이지 프레임 CSS + 섹션 구조)
- **대상 파일**: `docs/base/prototype/index.html` — `#page-main-life`, `#page-main-work`, `#page-todo-create` 프레임 내부에 추가
- **참조 파일**:
  - `sub-prd-03-feat-page-prototypes.md` §2.2~2.4
  - `docs/base/design-system/components.md` — MainLayout 템플릿, TodoSection, BottomTabBar, TodoCreateSheet
  - `docs/base/design-system/accessibility.md` — ARIA/접근성
  - `tasks-02-01` ~ `tasks-02-04` — Sub-02 컴포넌트 CSS 클래스 참조

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #6: 페이지 4.2 — 메인 Life (DateNavigator + TodoSection 2개 + FAB + BottomTabBar)
- [x] #7: 페이지 4.3 — 메인 Work (Life와 동일 구조, Work 샘플 데이터)
- [x] #8: 페이지 4.4 — 투두 생성 (메인 배경 + TodoCreateSheet 오버레이)

## 구현 세부사항

### 1. 메인 페이지 — Life 워크스페이스 (`#page-main-life`)

tasks-03-01에서 생성한 `#page-main-life` 스텁 내부에 MainLayout 콘텐츠를 채운다.

#### 1.1 HTML 구조

```html
<div class="proto-page-frame" id="page-main-life">
  <div class="proto-page-label">4.2 메인 — Life</div>
  <div class="page-content">
    <!-- DateNavigator -->
    <div class="proto-date-navigator">
      <button class="proto-date-nav-btn" aria-label="이전 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
      </button>
      <span class="proto-date-nav-text">2026년 5월 1일 (목)</span>
      <button class="proto-date-nav-btn" aria-label="다음 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
      </button>
    </div>

    <!-- 완료 섹션 -->
    <div class="page-todo-sections">
      <div class="proto-section-header proto-section-header-done">
        <svg width="20" height="20" aria-hidden="true" style="color: var(--section-done-text)">
          <use href="#icon-circle-check"></use>
        </svg>
        <span class="proto-section-header-title">완료</span>
        <span class="proto-section-header-count">2</span>
      </div>
      <hr class="proto-divider" role="separator">
      <div role="list">
        <!-- 아침 운동 (건강, Medium) — 완료 -->
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">아침 운동</span>
          <span class="proto-badge proto-badge-category">건강</span>
        </div>
        <!-- 장보기 (생활, Low) — 완료 -->
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">장보기</span>
          <span class="proto-badge proto-badge-category">생활</span>
        </div>
      </div>

      <!-- 완료 ↔ 진행 중 간격 -->
      <div style="height: var(--spacing-5)"></div>

      <!-- 진행 중 섹션 -->
      <div class="proto-section-header proto-section-header-progress">
        <svg width="20" height="20" aria-hidden="true" style="color: var(--section-progress-text)">
          <use href="#icon-list-todo"></use>
        </svg>
        <span class="proto-section-header-title">진행 중</span>
        <span class="proto-section-header-count">3</span>
      </div>
      <hr class="proto-divider" role="separator">
      <div role="list">
        <!-- 저녁 운동 (건강, High) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">저녁 운동</span>
          <span class="proto-badge proto-badge-priority-high">
            <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
            High
          </span>
          <span class="proto-badge proto-badge-category">건강</span>
        </div>
        <!-- 책 읽기 (자기개발, Medium, 이월 2회) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">책 읽기</span>
          <span class="proto-badge proto-badge-carry-over">🔄 2</span>
          <span class="proto-badge proto-badge-category">자기개발</span>
        </div>
        <!-- 비타민 챙기 (생활, Low) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">비타민 챙기</span>
          <span class="proto-badge proto-badge-category">생활</span>
        </div>
      </div>
    </div>
  </div>

  <!-- FAB -->
  <button class="page-fab" aria-label="할 일 추가">
    <svg width="24" height="24" aria-hidden="true"><use href="#icon-plus"></use></svg>
  </button>

  <!-- BottomTabBar (Life 활성) -->
  <div class="page-tab-bar">
    <div class="proto-bottom-tab-bar" role="tablist">
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 1.2 페이지 전용 CSS

```css
/* === 페이지 4.2~4.3 — 메인 페이지 공통 === */
.page-todo-sections {
  padding: var(--spacing-4);
}
```

- DateNavigator, SectionHeader, TodoItem, Checkbox, Badge, Divider, BottomTabBar 등은 Sub-02에서 정의한 CSS 클래스를 재사용한다
- `.page-content`, `.page-tab-bar`, `.page-fab`은 tasks-03-01에서 정의한 공통 CSS를 사용한다

### 2. 메인 페이지 — Work 워크스페이스 (`#page-main-work`)

Life와 동일한 HTML 구조를 사용하되, Work 샘플 데이터로 교체한다.

#### 2.1 HTML 구조

```html
<div class="proto-page-frame" id="page-main-work">
  <div class="proto-page-label">4.3 메인 — Work</div>
  <div class="page-content">
    <!-- DateNavigator -->
    <div class="proto-date-navigator">
      <button class="proto-date-nav-btn" aria-label="이전 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
      </button>
      <span class="proto-date-nav-text">2026년 5월 1일 (목)</span>
      <button class="proto-date-nav-btn" aria-label="다음 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
      </button>
    </div>

    <!-- 완료 섹션 -->
    <div class="page-todo-sections">
      <div class="proto-section-header proto-section-header-done">
        <svg width="20" height="20" aria-hidden="true" style="color: var(--section-done-text)">
          <use href="#icon-circle-check"></use>
        </svg>
        <span class="proto-section-header-title">완료</span>
        <span class="proto-section-header-count">2</span>
      </div>
      <hr class="proto-divider" role="separator">
      <div role="list">
        <!-- 코드 리뷰 (프로젝트A, High) — 완료 -->
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">코드 리뷰</span>
          <span class="proto-badge proto-badge-category">프로젝트A</span>
        </div>
        <!-- 스탠드업 미팅 (미팅, Medium) — 완료 -->
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">스탠드업 미팅</span>
          <span class="proto-badge proto-badge-category">미팅</span>
        </div>
      </div>

      <!-- 완료 ↔ 진행 중 간격 -->
      <div style="height: var(--spacing-5)"></div>

      <!-- 진행 중 섹션 -->
      <div class="proto-section-header proto-section-header-progress">
        <svg width="20" height="20" aria-hidden="true" style="color: var(--section-progress-text)">
          <use href="#icon-list-todo"></use>
        </svg>
        <span class="proto-section-header-title">진행 중</span>
        <span class="proto-section-header-count">3</span>
      </div>
      <hr class="proto-divider" role="separator">
      <div role="list">
        <!-- API 설계 (프로젝트A, High) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">API 설계</span>
          <span class="proto-badge proto-badge-priority-high">
            <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
            High
          </span>
          <span class="proto-badge proto-badge-category">프로젝트A</span>
        </div>
        <!-- 배포 스크립트 작성 (운영, Medium) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">배포 스크립트 작성</span>
          <span class="proto-badge proto-badge-category">운영</span>
        </div>
        <!-- 주간 보고서 (운영, Low, 이월 1회) — 미완료 -->
        <div class="proto-todo-item" role="listitem">
          <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <span class="proto-checkbox-box"></span>
          </div>
          <span class="proto-todo-item-title">주간 보고서</span>
          <span class="proto-badge proto-badge-carry-over">🔄 1</span>
          <span class="proto-badge proto-badge-category">운영</span>
        </div>
      </div>
    </div>
  </div>

  <!-- FAB -->
  <button class="page-fab" aria-label="할 일 추가">
    <svg width="24" height="24" aria-hidden="true"><use href="#icon-plus"></use></svg>
  </button>

  <!-- BottomTabBar (Work 활성) -->
  <div class="page-tab-bar">
    <div class="proto-bottom-tab-bar" role="tablist">
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 2.2 Life와의 차이점

| 항목 | Life | Work |
|------|------|------|
| 페이지 라벨 | 4.2 메인 — Life | 4.3 메인 — Work |
| 완료 항목 | 아침 운동(건강), 장보기(생활) | 코드 리뷰(프로젝트A), 스탠드업 미팅(미팅) |
| 진행 중 항목 | 저녁 운동(건강, High), 책 읽기(자기개발, 이월2), 비타민 챙기(생활) | API 설계(프로젝트A, High), 배포 스크립트 작성(운영), 주간 보고서(운영, 이월1) |
| BottomTabBar 활성 탭 | Life | Work |

### 3. 투두 생성 페이지 (`#page-todo-create`)

Life 메인 페이지를 배경으로 하고, 반투명 오버레이 위에 TodoCreateSheet 바텀 시트를 표시한다.

#### 3.1 HTML 구조

```html
<div class="proto-page-frame" id="page-todo-create">
  <div class="proto-page-label">4.4 투두 생성</div>

  <!-- 배경: Life 메인 콘텐츠 (정적 복제) -->
  <div class="page-content page-todo-create-bg">
    <!-- DateNavigator -->
    <div class="proto-date-navigator">
      <button class="proto-date-nav-btn" aria-label="이전 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
      </button>
      <span class="proto-date-nav-text">2026년 5월 1일 (목)</span>
      <button class="proto-date-nav-btn" aria-label="다음 날짜">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
      </button>
    </div>
    <div class="page-todo-sections">
      <div class="proto-section-header proto-section-header-done">
        <svg width="20" height="20" aria-hidden="true" style="color: var(--section-done-text)">
          <use href="#icon-circle-check"></use>
        </svg>
        <span class="proto-section-header-title">완료</span>
        <span class="proto-section-header-count">2</span>
      </div>
      <hr class="proto-divider" role="separator">
      <div role="list">
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="-1">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">아침 운동</span>
          <span class="proto-badge proto-badge-category">건강</span>
        </div>
        <div class="proto-todo-item proto-todo-item-completed" role="listitem">
          <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="-1">
            <span class="proto-checkbox-box">
              <svg width="14" height="14"><use href="#icon-check"></use></svg>
            </span>
          </div>
          <span class="proto-todo-item-title">장보기</span>
          <span class="proto-badge proto-badge-category">생활</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 오버레이 -->
  <div class="page-todo-create-overlay"></div>

  <!-- 바텀 시트 -->
  <div class="page-todo-create-sheet" role="dialog" aria-modal="true" aria-labelledby="page-sheet-title">
    <div class="proto-sheet-handle"></div>
    <div class="proto-sheet-header">
      <h5 id="page-sheet-title" class="proto-sheet-title">새 투두</h5>
      <button class="proto-sheet-close" aria-label="닫기">✕</button>
    </div>
    <!-- 제목 -->
    <div class="proto-form-field">
      <label class="proto-form-label" for="page-title-input">제목 *</label>
      <input class="proto-form-input" id="page-title-input" type="text" placeholder="할 일을 입력하세요">
    </div>
    <!-- 설명 -->
    <div class="proto-form-field">
      <label class="proto-form-label" for="page-desc-input">설명</label>
      <textarea class="proto-form-input proto-form-textarea" id="page-desc-input" placeholder="설명을 입력하세요 (선택)" rows="3"></textarea>
    </div>
    <!-- 우선순위 -->
    <div class="proto-sheet-priority">
      <span class="proto-form-label">우선순위</span>
      <div class="proto-sheet-priority-options">
        <span class="proto-badge proto-badge-priority-high">
          <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
          High
        </span>
        <span class="proto-badge proto-badge-priority-medium proto-badge-selected">Medium</span>
        <span class="proto-badge proto-badge-priority-low">Low</span>
      </div>
    </div>
    <!-- 분류 -->
    <div class="proto-form-field">
      <label class="proto-form-label" for="page-category-select">분류</label>
      <select class="proto-form-input" id="page-category-select">
        <option value="" disabled selected>분류를 선택하세요</option>
        <option>건강</option>
        <option>자기개발</option>
        <option>생활</option>
      </select>
    </div>
    <!-- Epic -->
    <div class="proto-form-field">
      <label class="proto-form-label" for="page-epic-select">Epic</label>
      <select class="proto-form-input" id="page-epic-select">
        <option value="" disabled selected>Epic을 선택하세요</option>
        <option>3월 운동 루틴</option>
        <option>식단 관리</option>
        <option>수면 개선</option>
      </select>
    </div>
    <!-- 날짜 -->
    <div class="proto-form-field">
      <label class="proto-form-label" for="page-date-input">날짜</label>
      <input class="proto-form-input" id="page-date-input" type="date" value="2026-05-01">
    </div>
    <!-- 저장 버튼 -->
    <button class="proto-button proto-button-primary proto-sheet-save">저장하기</button>
  </div>

  <!-- BottomTabBar (Life 활성 — 배경 상태) -->
  <div class="page-tab-bar">
    <div class="proto-bottom-tab-bar" role="tablist">
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 3.2 페이지 전용 CSS

```css
/* === 페이지 4.4 — 투두 생성 (오버레이 + 바텀 시트) === */
.page-todo-create-bg {
  filter: brightness(0.6);
}

.page-todo-create-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.page-todo-create-sheet {
  position: absolute;
  bottom: 76px; /* TabBar 높이 위 */
  left: 0;
  right: 0;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  z-index: 3;
}

/* 선택된 우선순위 배지 강조 */
.proto-badge-selected {
  outline: 2px solid var(--color-interactive-primary);
  outline-offset: 1px;
}
```

#### 3.3 폼 필드 id 충돌 방지

페이지 내 form field `id`는 컴포넌트 라이브러리 섹션(Sub-02 TodoCreateSheet)과 충돌하지 않도록 `page-` 접두사를 사용한다:

| 컴포넌트 섹션 (Sub-02) | 페이지 섹션 (Sub-03) |
|---|---|
| `sheet-title-input` | `page-title-input` |
| `sheet-desc-input` | `page-desc-input` |
| `sheet-category` | `page-category-select` |
| `sheet-epic` | `page-epic-select` |
| `sheet-date` | `page-date-input` |

#### 3.4 배경 콘텐츠 접근성

배경 Life 콘텐츠의 인터랙티브 요소는 `tabindex="-1"`로 설정하여 바텀 시트 열림 상태에서 키보드 포커스가 배경으로 이동하지 않도록 한다.

## 주의사항

1. **Sub-02 CSS 재사용**: DateNavigator, SectionHeader, TodoItem, Checkbox, Badge, Divider, BottomTabBar, TodoCreateSheet 관련 CSS 클래스는 Sub-02에서 이미 정의했으므로 새로 정의하지 않는다
2. **Life/Work 구조 일관성**: 두 페이지는 동일한 HTML 구조를 사용하며, 샘플 데이터와 BottomTabBar 활성 탭만 다르다
3. **투두 생성 배경**: Life 콘텐츠를 정적으로 복제한다 (프로토타입이므로 동적 참조 불필요)
4. **form field id 접두사**: 페이지 내 form field에는 `page-` 접두사를 사용하여 Sub-02 컴포넌트 섹션과 충돌하지 않도록 한다
5. **우선순위 기본 선택**: Medium 배지에 `.proto-badge-selected` 클래스를 적용하여 기본 선택 상태를 시각적으로 표시한다
6. **FAB 위치**: `position: absolute`, BottomTabBar 위 `--spacing-4` 간격으로 우측 하단 고정 (tasks-03-01의 `.page-fab` CSS 사용)

## 검증 체크리스트

### Life 메인 페이지
- [x] DateNavigator가 상단에 "2026년 5월 1일 (목)"으로 표시된다
- [x] DateNavigator 좌우 버튼에 `aria-label` 속성이 있다
- [x] 완료 섹션: SectionHeader "완료 (2)" + TodoItem 2개 (아침 운동, 장보기)
- [x] 진행 중 섹션: SectionHeader "진행 중 (3)" + TodoItem 3개 (저녁 운동, 책 읽기, 비타민 챙기)
- [x] 완료 섹션과 진행 중 섹션 간격이 `--spacing-5`이다
- [x] 저녁 운동에 High 우선순위 배지가 표시된다
- [x] 책 읽기에 이월 2회 배지가 표시된다
- [x] FAB가 56px 원형으로 우측 하단에 고정 표시된다
- [x] FAB에 `aria-label="할 일 추가"` 속성이 있다
- [x] FAB가 BottomTabBar 위 `--spacing-4` 간격에 위치한다
- [x] BottomTabBar Life 탭이 활성 상태이다
- [x] BottomTabBar에 `role="tablist"`, 각 탭에 `role="tab"` 속성이 있다

### Work 메인 페이지
- [x] 완료 섹션: TodoItem 2개 (코드 리뷰, 스탠드업 미팅)
- [x] 진행 중 섹션: TodoItem 3개 (API 설계, 배포 스크립트 작성, 주간 보고서)
- [x] API 설계에 High 우선순위 배지가 표시된다
- [x] 주간 보고서에 이월 1회 배지가 표시된다
- [x] BottomTabBar Work 탭이 활성 상태이다

### 투두 생성 페이지
- [x] 배경에 Life 메인 콘텐츠가 어둡게 표시된다
- [x] `rgba(0, 0, 0, 0.4)` 오버레이가 전체를 덮는다
- [x] 바텀 시트가 하단에서 올라온 형태로 표시된다
- [x] 핸들 바(40px × 4px)가 시트 상단 중앙에 표시된다
- [x] "새 투두" 헤더 + 닫기 버튼(✕)이 표시된다
- [x] 폼 필드: 제목, 설명, 우선순위, 분류, Epic, 날짜가 모두 포함된다
- [x] 우선순위 Medium이 기본 선택 상태(강조)로 표시된다
- [x] "저장하기" 버튼이 전체 너비 primary 스타일이다
- [x] 바텀 시트에 `role="dialog"`, `aria-modal="true"` 속성이 있다
- [x] 배경 콘텐츠의 인터랙티브 요소가 `tabindex="-1"`이다
- [x] 폼 필드 `id`에 `page-` 접두사가 사용된다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
