# Task 03-03: 관리 페이지 (분류 + Epic + 설정)

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-page-prototypes.md`
- **의존성**: `tasks-03-01` (페이지 프레임 CSS + 섹션 구조)
- **대상 파일**: `docs/client/prototype/index.html` — `#page-category`, `#page-epic`, `#page-settings` 프레임 내부에 추가
- **참조 파일**:
  - `sub-prd-03-feat-page-prototypes.md` §2.5~2.7
  - `docs/client/design-system/components.md` — ManageLayout 템플릿, CategoryList, EpicCard
  - `docs/client/design-system/accessibility.md` — ARIA/접근성
  - `tasks-02-04-organisms.md` — CategoryList, EpicCard CSS 클래스 참조

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #9: 페이지 4.5 — 분류 관리 (ManageLayout + CategoryList)
- [x] #10: 페이지 4.6 — Epic 관리 (ManageLayout + EpicCard 3개)
- [x] #11: 페이지 4.7 — 설정 (ManageLayout 변형 + 프로필 카드 + 메뉴 + 로그아웃)

## 구현 세부사항

### 1. ManageLayout 공통 헤더 CSS

3페이지 모두 ManageLayout을 사용하므로 공통 헤더 CSS를 한 번만 정의한다.

```css
/* === 페이지 4.5~4.7 — ManageLayout 공통 === */
.page-manage-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 var(--spacing-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.page-manage-header-back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.page-manage-header-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-manage-header-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-interactive-primary);
}
```

### 2. 분류 관리 페이지 (`#page-category`)

#### 2.1 HTML 구조

```html
<div class="proto-page-frame" id="page-category">
  <div class="proto-page-label">4.5 분류 관리</div>
  <div class="page-content">
    <!-- ManageLayout 헤더 -->
    <div class="page-manage-header">
      <button class="page-manage-header-back" aria-label="뒤로 가기">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
      </button>
      <h3 class="page-manage-header-title">분류 관리</h3>
      <button class="page-manage-header-action" aria-label="분류 추가">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-plus"></use></svg>
      </button>
    </div>

    <!-- CategoryList -->
    <div class="page-category-list">
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

#### 2.2 페이지 전용 CSS

```css
/* === 페이지 4.5 — 분류 관리 === */
.page-category-list {
  padding: var(--spacing-2) 0;
}
```

- CategoryList 항목 스타일(`.proto-category-item`, `.proto-category-indicator`, `.proto-category-name`, `.proto-category-more`, `.proto-divider`)은 Sub-02 `tasks-02-04`에서 정의한 클래스를 재사용한다

#### 2.3 샘플 데이터

| 색상 토큰 | 분류명 |
|---|---|
| `--color-purple-500` | 건강 |
| `--color-periwinkle-500` | 자기개발 |
| `--color-indigo-600` | 생활 |

### 3. Epic 관리 페이지 (`#page-epic`)

#### 3.1 HTML 구조

```html
<div class="proto-page-frame" id="page-epic">
  <div class="proto-page-label">4.6 Epic 관리</div>
  <div class="page-content">
    <!-- ManageLayout 헤더 -->
    <div class="page-manage-header">
      <button class="page-manage-header-back" aria-label="뒤로 가기">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
      </button>
      <h3 class="page-manage-header-title">Epic 관리 — 건강</h3>
      <button class="page-manage-header-action" aria-label="Epic 추가">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-plus"></use></svg>
      </button>
    </div>

    <!-- EpicCard 리스트 -->
    <div class="page-epic-list">
      <!-- Epic 1: 3월 운동 루틴 80% -->
      <div class="proto-epic-card">
        <div class="proto-epic-header">
          <span class="proto-epic-title">3월 운동 루틴</span>
        </div>
        <div class="proto-epic-progress-bar">
          <div class="proto-epic-progress-fill" style="width: 80%"></div>
        </div>
        <div class="proto-epic-footer">
          <span class="proto-epic-progress-text">80% (4/5)</span>
          <span class="proto-epic-status">
            <span class="proto-epic-status-dot"></span>
            active
          </span>
        </div>
      </div>

      <!-- Epic 2: 식단 관리 25% -->
      <div class="proto-epic-card">
        <div class="proto-epic-header">
          <span class="proto-epic-title">식단 관리</span>
        </div>
        <div class="proto-epic-progress-bar">
          <div class="proto-epic-progress-fill" style="width: 25%"></div>
        </div>
        <div class="proto-epic-footer">
          <span class="proto-epic-progress-text">25% (2/8)</span>
          <span class="proto-epic-status">
            <span class="proto-epic-status-dot"></span>
            active
          </span>
        </div>
      </div>

      <!-- Epic 3: 수면 개선 0% -->
      <div class="proto-epic-card">
        <div class="proto-epic-header">
          <span class="proto-epic-title">수면 개선</span>
        </div>
        <div class="proto-epic-progress-bar">
          <div class="proto-epic-progress-fill" style="width: 0%"></div>
        </div>
        <div class="proto-epic-footer">
          <span class="proto-epic-progress-text">0% (0/3)</span>
          <span class="proto-epic-status">
            <span class="proto-epic-status-dot"></span>
            active
          </span>
        </div>
      </div>
    </div>
  </div>

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

#### 3.2 페이지 전용 CSS

```css
/* === 페이지 4.6 — Epic 관리 === */
.page-epic-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
}

/* Epic 카드 footer (진행률 텍스트 + 상태) */
.proto-epic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Epic 상태 표시 */
.proto-epic-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.proto-epic-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-status-success);
}
```

- EpicCard 기본 스타일(`.proto-epic-card`, `.proto-epic-header`, `.proto-epic-title`, `.proto-epic-progress-bar`, `.proto-epic-progress-fill`, `.proto-epic-progress-text`)은 Sub-02 `tasks-02-04`에서 정의한 클래스를 재사용한다
- `.proto-epic-footer`, `.proto-epic-status`, `.proto-epic-status-dot`은 페이지에서 필요한 추가 마크업이므로 신규 정의한다

#### 3.3 샘플 데이터 (Sub-PRD와 일치)

| Epic | 진행률 | 완료/전체 | 상태 |
|------|--------|----------|------|
| 3월 운동 루틴 | 80% | 4/5 | active |
| 식단 관리 | 25% | 2/8 | active |
| 수면 개선 | 0% | 0/3 | active |

### 4. 설정 페이지 (`#page-settings`)

ManageLayout 변형 — 헤더가 간소화되어 제목만 표시한다.

#### 4.1 HTML 구조

```html
<div class="proto-page-frame" id="page-settings">
  <div class="proto-page-label">4.7 설정</div>
  <div class="page-content">
    <!-- 간소화 헤더 (제목만) -->
    <div class="page-manage-header page-settings-header">
      <h3 class="page-manage-header-title page-settings-title">설정</h3>
    </div>

    <!-- 프로필 카드 -->
    <div class="page-settings-content">
      <div class="page-profile-card">
        <div class="page-profile-avatar">홍</div>
        <div class="page-profile-info">
          <span class="page-profile-name">홍길동</span>
          <span class="page-profile-email">hong@email.com</span>
          <span class="page-profile-provider">Google 계정 연동</span>
        </div>
      </div>

      <!-- 계정 섹션 -->
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

      <!-- 앱 섹션 -->
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

      <!-- 정보 섹션 -->
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

      <!-- 로그아웃 버튼 -->
      <button class="proto-button page-settings-logout">로그아웃</button>
    </div>
  </div>

  <!-- BottomTabBar (설정 활성) -->
  <div class="page-tab-bar">
    <div class="proto-bottom-tab-bar" role="tablist">
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-home"></use></svg>
        <span class="proto-tab-bar-item-label">Life</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-inactive" role="tab" aria-selected="false">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-briefcase"></use></svg>
        <span class="proto-tab-bar-item-label">Work</span>
      </div>
      <div class="proto-tab-bar-item proto-tab-bar-item-active" role="tab" aria-selected="true">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-settings"></use></svg>
        <span class="proto-tab-bar-item-label">설정</span>
      </div>
    </div>
  </div>
</div>
```

#### 4.2 페이지 전용 CSS

```css
/* === 페이지 4.7 — 설정 === */
.page-settings-header {
  justify-content: flex-start;
}

.page-settings-title {
  text-align: left;
  padding-left: var(--spacing-2);
}

.page-settings-content {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* 프로필 카드 */
.page-profile-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-subtle);
}

.page-profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-interactive-primary);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.page-profile-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.page-profile-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.page-profile-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.page-profile-provider {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 설정 섹션 */
.page-settings-section {
  display: flex;
  flex-direction: column;
}

.page-settings-section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  padding-left: var(--spacing-4);
  margin: 0 0 var(--spacing-2) 0;
}

/* 메뉴 항목 */
.page-settings-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  cursor: pointer;
}

.page-settings-chevron {
  color: var(--color-text-tertiary);
}

/* 로그아웃 버튼 (destructive) */
.page-settings-logout {
  width: 100%;
  height: 48px;
  background: var(--color-status-error);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  margin-bottom: var(--spacing-6);
  transition: opacity var(--duration-fast) var(--easing-default);
}

.page-settings-logout:hover {
  opacity: 0.9;
}
```

#### 4.3 프로필 카드 설명

| 요소 | 스타일 |
|------|--------|
| Avatar | md(40px), 이니셜 "홍", `--color-interactive-primary` 배경 |
| 이름 | `--font-size-lg`, `--font-weight-semibold` |
| 이메일 | `--font-size-sm`, `--color-text-secondary` |
| 연동 정보 | `--font-size-xs`, `--color-text-tertiary` |
| 카드 배경 | `--color-bg-elevated`, `--radius-md` |

## 주의사항

1. **ManageLayout 공통 CSS**: `.page-manage-header` 관련 CSS는 한 번만 정의하고 3페이지에서 공유한다
2. **Sub-02 CSS 재사용**: CategoryList(`.proto-category-item` 등), EpicCard(`.proto-epic-card` 등), BottomTabBar, Divider 스타일은 Sub-02에서 정의한 클래스를 재사용한다. 스타일을 중복 정의하지 않는다
3. **신규 마크업**: 설정 페이지의 프로필 카드, 메뉴 항목, 섹션 헤더는 Sub-02에 없는 마크업이므로 `page-` 접두사 CSS를 신규 정의한다
4. **EpicCard 차이**: Sub-02 데모(2개, 80%/30%)와 달리 페이지에서는 3개(80%/25%/0%)를 표시하며, 상태 표시(active dot)를 추가한다. `.proto-epic-footer`, `.proto-epic-status`, `.proto-epic-status-dot`은 신규 CSS이다
5. **설정 헤더 변형**: 뒤로가기/추가 버튼 없이 제목만 표시. `.page-settings-header`로 좌측 정렬 오버라이드한다
6. **로그아웃 버튼**: destructive 변형으로, `--color-status-error` 배경 + `--color-text-inverse` 텍스트를 사용한다

## 검증 체크리스트

### 분류 관리 페이지
- [x] ManageLayout 헤더: 뒤로가기(ChevronLeft) + "분류 관리" 제목 + 추가(Plus) 버튼
- [x] 헤더 높이가 56px이다
- [x] 뒤로가기/추가 버튼 터치 타겟이 44×44px이다
- [x] 3개 카테고리 항목이 세로로 나열된다 (건강, 자기개발, 생활)
- [x] 각 항목에 12px 원형 컬러 인디케이터가 표시된다
  - 건강: `--color-purple-500`
  - 자기개발: `--color-periwinkle-500`
  - 생활: `--color-indigo-600`
- [x] 각 항목에 더보기(⋮) 버튼이 우측에 표시된다
- [x] 항목 간 Divider(`role="separator"`)가 있다
- [x] 항목 높이가 48px이다
- [x] BottomTabBar Life 탭이 활성 상태이다

### Epic 관리 페이지
- [x] ManageLayout 헤더: 뒤로가기 + "Epic 관리 — 건강" 제목 + 추가 버튼
- [x] 3개 EpicCard가 세로로 나열된다
- [x] EpicCard 간격이 `--spacing-3`이다
- [x] 콘텐츠 좌우 패딩이 `--spacing-4`이다
- [x] "3월 운동 루틴" 진행률 바가 80% 채워져 있다
- [x] "식단 관리" 진행률 바가 25% 채워져 있다
- [x] "수면 개선" 진행률 바가 0% (빈 상태)이다
- [x] 각 EpicCard에 상태 표시(녹색 8px dot + "active" 텍스트)가 있다
- [x] 진행률 바 채움 색상이 `--color-interactive-primary`이다
- [x] 상태 dot 색상이 `--color-status-success`이다
- [x] BottomTabBar Life 탭이 활성 상태이다

### 설정 페이지
- [x] 간소화 헤더에 "설정" 제목만 좌측 정렬로 표시된다
- [x] 프로필 카드: Avatar(40px, 이니셜 "홍", `--color-interactive-primary` 배경)
- [x] 프로필 카드: 이름 "홍길동" (`--font-weight-semibold`)
- [x] 프로필 카드: 이메일 "hong@email.com" (`--color-text-secondary`)
- [x] 프로필 카드: "Google 계정 연동" (`--color-text-tertiary`)
- [x] 프로필 카드 배경이 `--color-bg-elevated`이다
- [x] 3개 메뉴 섹션이 표시된다: 계정(소셜 계정 연동), 앱(알림 설정), 정보(버전 정보)
- [x] 섹션 헤더가 `--font-size-xs`, `--color-text-tertiary`로 표시된다
- [x] 메뉴 항목 높이가 48px이다
- [x] 메뉴 항목 우측에 ChevronRight 아이콘이 `--color-text-tertiary`로 표시된다
- [x] 로그아웃 버튼: destructive 스타일 (`--color-status-error` 배경), 전체 너비
- [x] 로그아웃 버튼 하단 여백이 `--spacing-6`이다
- [x] BottomTabBar 설정 탭이 활성 상태이다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
