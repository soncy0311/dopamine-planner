# Task 03-04: 탭 전환 + 체크박스 토글 JS

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-page-prototypes.md`
- **의존성**: `tasks-03-02` (Life/Work 메인 페이지), `tasks-03-03` (Settings 설정 페이지)
- **대상 파일**: `docs/base/prototype/index.html` — `#page-main-interactive` 프레임 내부 + `<script>` 블록
- **참조 파일**:
  - `sub-prd-03-feat-page-prototypes.md` §3
  - `docs/base/design-system/components.md` — BottomTabBar, TodoItem
  - `docs/base/design-system/accessibility.md` — ARIA 속성, 키보드 탐색

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #12: 탭 전환 JS 구현 (Life ↔ Work ↔ Settings 패널 전환)
- [x] #13: 체크박스 토글 JS 구현 (TodoItem 완료/미완료 전환)

## 구현 세부사항

### 1. 인터랙티브 데모 프레임 (`#page-main-interactive`)

tasks-03-01에서 생성한 `#page-main-interactive` 스텁 내부에 탭 전환이 가능한 데모를 구현한다. 이 프레임은 Life/Work/Settings 3개 워크스페이스를 하나의 프레임 내에서 전환한다.

> **주의**: Sub-PRD 주의사항 #3 — 탭 전환은 이 인터랙티브 데모 프레임 내에서만 동작한다. 개별 페이지 프레임(`#page-main-life`, `#page-main-work` 등) 간 전환이 아니다.

#### 1.1 HTML 구조

```html
<div class="proto-page-frame" id="page-main-interactive">
  <div class="proto-page-label">4.8 인터랙티브 데모 (탭 전환 + 체크박스)</div>

  <!-- Life 워크스페이스 (기본 표시) -->
  <div class="page-interactive-panel" id="panel-life" style="display: block;">
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
      <div class="page-todo-sections">
        <!-- 완료 섹션 -->
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
            <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
              <span class="proto-checkbox-box">
                <svg width="14" height="14"><use href="#icon-check"></use></svg>
              </span>
            </div>
            <span class="proto-todo-item-title">아침 운동</span>
            <span class="proto-badge proto-badge-category">건강</span>
          </div>
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
          <div class="proto-todo-item" role="listitem">
            <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
              <span class="proto-checkbox-box"></span>
            </div>
            <span class="proto-todo-item-title">책 읽기</span>
            <span class="proto-badge proto-badge-carry-over">🔄 2</span>
            <span class="proto-badge proto-badge-category">자기개발</span>
          </div>
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
  </div>

  <!-- Work 워크스페이스 (숨김) -->
  <div class="page-interactive-panel" id="panel-work" style="display: none;">
    <div class="page-content">
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
            <div class="proto-checkbox proto-checkbox-checked" role="checkbox" aria-checked="true" tabindex="0">
              <span class="proto-checkbox-box">
                <svg width="14" height="14"><use href="#icon-check"></use></svg>
              </span>
            </div>
            <span class="proto-todo-item-title">코드 리뷰</span>
            <span class="proto-badge proto-badge-category">프로젝트A</span>
          </div>
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
        <div style="height: var(--spacing-5)"></div>
        <div class="proto-section-header proto-section-header-progress">
          <svg width="20" height="20" aria-hidden="true" style="color: var(--section-progress-text)">
            <use href="#icon-list-todo"></use>
          </svg>
          <span class="proto-section-header-title">진행 중</span>
          <span class="proto-section-header-count">3</span>
        </div>
        <hr class="proto-divider" role="separator">
        <div role="list">
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
          <div class="proto-todo-item" role="listitem">
            <div class="proto-checkbox" role="checkbox" aria-checked="false" tabindex="0">
              <span class="proto-checkbox-box"></span>
            </div>
            <span class="proto-todo-item-title">배포 스크립트 작성</span>
            <span class="proto-badge proto-badge-category">운영</span>
          </div>
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
  </div>

  <!-- Settings 워크스페이스 (숨김) -->
  <div class="page-interactive-panel" id="panel-settings" style="display: none;">
    <div class="page-content">
      <div class="page-manage-header page-settings-header">
        <h3 class="page-manage-header-title page-settings-title">설정</h3>
      </div>
      <div class="page-settings-content">
        <div class="page-profile-card">
          <div class="page-profile-avatar">홍</div>
          <div class="page-profile-info">
            <span class="page-profile-name">홍길동</span>
            <span class="page-profile-email">hong@email.com</span>
            <span class="page-profile-provider">Google 계정 연동</span>
          </div>
        </div>
        <div class="page-settings-section">
          <h4 class="page-settings-section-title">계정</h4>
          <hr class="proto-divider" role="separator">
          <div class="page-settings-menu-item">
            <span>소셜 계정 연동</span>
            <svg width="20" height="20" aria-hidden="true" class="page-settings-chevron">
              <use href="#icon-chevron-right"></use>
            </svg>
          </div>
        </div>
        <div class="page-settings-section">
          <h4 class="page-settings-section-title">앱</h4>
          <hr class="proto-divider" role="separator">
          <div class="page-settings-menu-item">
            <span>알림 설정</span>
            <svg width="20" height="20" aria-hidden="true" class="page-settings-chevron">
              <use href="#icon-chevron-right"></use>
            </svg>
          </div>
        </div>
        <div class="page-settings-section">
          <h4 class="page-settings-section-title">정보</h4>
          <hr class="proto-divider" role="separator">
          <div class="page-settings-menu-item">
            <span>버전 정보</span>
            <svg width="20" height="20" aria-hidden="true" class="page-settings-chevron">
              <use href="#icon-chevron-right"></use>
            </svg>
          </div>
        </div>
        <button class="proto-button page-settings-logout">로그아웃</button>
      </div>
    </div>
  </div>

  <!-- BottomTabBar (인터랙티브 — Life 기본 활성) -->
  <div class="page-tab-bar">
    <div class="proto-bottom-tab-bar" id="interactive-tab-bar" role="tablist">
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true" data-panel="panel-life" tabindex="0">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false" data-panel="panel-work" tabindex="-1">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false" data-panel="panel-settings" tabindex="-1">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 1.2 패널 CSS

```css
/* === 인터랙티브 데모 패널 === */
.page-interactive-panel {
  position: absolute;
  top: 33px; /* 라벨 높이 */
  left: 0;
  right: 0;
  bottom: 76px; /* TabBar 높이 */
}
```

### 2. 탭 전환 JS

`#page-main-interactive` 프레임 내의 BottomTabBar 탭을 클릭하면 해당 워크스페이스 패널을 표시하고 나머지를 숨긴다.

#### 2.1 구현

```javascript
// === 탭 전환 (인터랙티브 데모) ===
(function() {
  const tabBar = document.getElementById('interactive-tab-bar');
  if (!tabBar) return;

  const tabs = tabBar.querySelectorAll('[role="tab"]');
  const frame = document.getElementById('page-main-interactive');

  function switchTab(selectedTab) {
    tabs.forEach(tab => {
      const panelId = tab.getAttribute('data-panel');
      const panel = frame.querySelector('#' + panelId);
      const isSelected = tab === selectedTab;

      // 패널 표시/숨김
      if (panel) {
        panel.style.display = isSelected ? 'block' : 'none';
      }

      // 탭 활성/비활성 클래스 전환
      tab.classList.toggle('proto-tab-bar-item-active', isSelected);
      tab.classList.toggle('proto-tab-bar-item-inactive', !isSelected);

      // ARIA 상태 업데이트
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      // tabindex 관리 (로빙 탭인덱스)
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });
  }

  // 클릭 이벤트
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // 키보드 탐색 (좌우 방향키)
  tabBar.addEventListener('keydown', (e) => {
    const tabArray = Array.from(tabs);
    const currentIndex = tabArray.indexOf(document.activeElement);
    let newIndex = -1;

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabArray.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
    }

    if (newIndex >= 0) {
      e.preventDefault();
      tabArray[newIndex].focus();
      switchTab(tabArray[newIndex]);
    }
  });
})();
```

#### 2.2 동작 요약

| 탭 클릭 | 표시되는 패널 | 숨겨지는 패널 |
|---------|-------------|-------------|
| Life | `#panel-life` | `#panel-work`, `#panel-settings` |
| Work | `#panel-work` | `#panel-life`, `#panel-settings` |
| 설정 | `#panel-settings` | `#panel-life`, `#panel-work` |

### 3. 체크박스 토글 JS

`#pages` 섹션 내의 TodoItem 체크박스를 클릭하면 완료/미완료 상태를 토글한다.

#### 3.1 구현

```javascript
// === 체크박스 토글 (페이지 프로토타입) ===
(function() {
  const pagesSection = document.getElementById('pages');
  if (!pagesSection) return;

  // 이벤트 위임: #pages 컨테이너에서 체크박스 클릭 감지
  pagesSection.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.proto-checkbox:not(.proto-checkbox-disabled)');
    if (!checkbox) return;

    // 배경 콘텐츠(투두 생성 페이지) 내 체크박스는 토글하지 않음
    if (checkbox.closest('.page-todo-create-bg')) return;

    toggleCheckbox(checkbox);
  });

  // 키보드 접근성: Space 키로 체크박스 토글
  pagesSection.addEventListener('keydown', (e) => {
    if (e.key !== ' ') return;

    const checkbox = e.target.closest('.proto-checkbox:not(.proto-checkbox-disabled)');
    if (!checkbox) return;
    if (checkbox.closest('.page-todo-create-bg')) return;

    e.preventDefault();
    toggleCheckbox(checkbox);
  });

  function toggleCheckbox(checkbox) {
    const isChecked = checkbox.getAttribute('aria-checked') === 'true';
    const todoItem = checkbox.closest('.proto-todo-item');

    // 체크박스 상태 토글
    checkbox.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
    checkbox.classList.toggle('proto-checkbox-checked', !isChecked);

    // 체크 아이콘 추가/제거
    const box = checkbox.querySelector('.proto-checkbox-box');
    if (!isChecked) {
      // 미완료 → 완료: 체크 아이콘 추가
      if (!box.querySelector('svg')) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-check');
        svg.appendChild(use);
        box.appendChild(svg);
      }
    } else {
      // 완료 → 미완료: 체크 아이콘 제거
      const svg = box.querySelector('svg');
      if (svg) svg.remove();
    }

    // 부모 TodoItem 완료 스타일 토글 (취소선 적용)
    if (todoItem) {
      todoItem.classList.toggle('proto-todo-item-completed', !isChecked);
    }
  }
})();
```

#### 3.2 동작 요약

| 현재 상태 | 클릭 후 | 변경 사항 |
|----------|---------|----------|
| 미완료 (`aria-checked="false"`) | 완료 | `proto-checkbox-checked` 추가, 체크 SVG 삽입, `proto-todo-item-completed` 추가 |
| 완료 (`aria-checked="true"`) | 미완료 | `proto-checkbox-checked` 제거, 체크 SVG 삭제, `proto-todo-item-completed` 제거 |

### 4. 스크립트 배치

두 스크립트 모두 HTML `<body>` 끝에 단일 `<script>` 블록으로 배치한다. 기존 Sub-02의 체크박스 토글 JS(컴포넌트 섹션용)와 충돌하지 않도록 범위를 `#pages` 섹션으로 한정한다.

```html
  <!-- 기존 Sub-02 script (컴포넌트 라이브러리 섹션용) -->
  <script>
    // ... 기존 코드 유지 ...
  </script>

  <!-- Sub-03 script (페이지 프로토타입 섹션용) -->
  <script>
    // 탭 전환 IIFE ...
    // 체크박스 토글 IIFE ...
  </script>
</body>
```

## 주의사항

1. **탭 전환 범위**: 탭 전환은 `#page-main-interactive` 프레임 내에서만 동작한다. 개별 페이지 프레임(`#page-main-life`, `#page-main-work`, `#page-settings`) 간 전환이 아니다
2. **이벤트 위임**: `#pages` 컨테이너에 이벤트 리스너를 등록하여 동적으로 추가된 요소도 처리할 수 있게 한다
3. **투두 생성 배경 제외**: `.page-todo-create-bg` 내부의 체크박스는 배경 콘텐츠이므로 토글하지 않는다
4. **키보드 접근성**: Space 키로 체크박스 토글, 좌우 방향키로 탭 전환이 가능해야 한다
5. **ARIA 상태 동기화**: 클래스 토글과 함께 `aria-checked`, `aria-selected` 속성도 반드시 업데이트한다
6. **SVG 네임스페이스**: JS로 SVG 요소를 생성할 때 `createElementNS`를 사용하고, `use`의 `href`는 `setAttributeNS`로 설정한다
7. **기존 JS 격리**: Sub-02의 체크박스 토글 JS(컴포넌트 라이브러리 섹션용)와 충돌하지 않도록 별도 `<script>` 블록 + IIFE로 격리한다
8. **`<script>` 위치**: HTML `<body>` 끝에 배치하여 DOM 로딩 완료 후 실행한다

## 검증 체크리스트

### 탭 전환
- [x] 인터랙티브 데모 프레임(`#page-main-interactive`)이 존재한다
- [x] 초기 상태: Life 패널이 표시되고, Work/Settings 패널이 숨겨져 있다
- [x] Life 탭이 `proto-tab-bar-item-active`, `aria-selected="true"` 상태이다
- [x] Work 탭 클릭 시: Work 패널이 표시되고 Life/Settings 패널이 숨겨진다
- [x] Work 탭이 `proto-tab-bar-item-active`, `aria-selected="true"`로 변경된다
- [x] Settings 탭 클릭 시: Settings 패널이 표시된다
- [x] 좌우 방향키로 탭 간 이동 및 전환이 가능하다
- [x] 활성 탭의 `tabindex="0"`, 비활성 탭의 `tabindex="-1"`이 올바르게 설정된다
- [x] 탭 전환 시 이전 활성 탭의 `proto-tab-bar-item-active` 클래스가 제거된다
- [x] Life 패널에 Life 샘플 데이터가, Work 패널에 Work 샘플 데이터가 표시된다
- [x] Settings 패널에 설정 페이지 콘텐츠(프로필 카드 + 메뉴)가 표시된다

### 체크박스 토글
- [x] 페이지 프로토타입 내 미완료 체크박스 클릭 시 완료로 전환된다
- [x] 완료 체크박스 클릭 시 미완료로 전환된다
- [x] 완료 전환 시 `proto-checkbox-checked` 클래스가 추가된다
- [x] 완료 전환 시 체크 SVG 아이콘이 `.proto-checkbox-box` 내에 추가된다
- [x] 미완료 전환 시 `proto-checkbox-checked` 클래스가 제거된다
- [x] 미완료 전환 시 체크 SVG 아이콘이 제거된다
- [x] `aria-checked` 속성이 `"true"` ↔ `"false"`로 토글된다
- [x] 부모 `.proto-todo-item`에 `proto-todo-item-completed` 클래스가 토글된다 (취소선 적용)
- [x] Space 키로 포커스된 체크박스를 토글할 수 있다
- [x] 투두 생성 페이지(`.page-todo-create-bg`) 내 체크박스는 토글되지 않는다
- [x] disabled 체크박스는 클릭/키보드로 토글되지 않는다
- [x] 기존 컴포넌트 라이브러리 섹션의 체크박스 토글과 충돌하지 않는다

### 스크립트
- [x] `<script>` 블록이 `<body>` 끝에 배치된다
- [x] 기존 Sub-02 스크립트와 별도 `<script>` 블록으로 분리된다
- [x] IIFE로 감싸져 전역 스코프를 오염하지 않는다
