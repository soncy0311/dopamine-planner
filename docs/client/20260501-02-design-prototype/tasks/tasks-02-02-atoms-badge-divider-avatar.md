# Task 02-02: Atoms Part 2 (Badge, Divider, Avatar)

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-component-library.md`
- **의존성**: `tasks-02-01` (섹션 구조 + `#atoms` div 존재 필요)
- **대상 파일**: `docs/client/prototype/index.html` — `<div id="atoms">` 내부에 추가
- **참조 파일**:
  - `sub-prd-02-feat-component-library.md` §2.4~2.6
  - `docs/client/design-system/components.md` — Atoms (Badge, Divider, Avatar)

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] #6: Atoms — Badge: 3 변형 (category, priority 3종, carry-over)
- [x] #7: Atoms — Divider: 수평 구분선
- [x] #8: Atoms — Avatar: 2 크기 × 2 타입
- [x] #19(일부): Badge, Divider, Avatar에 해당하는 ARIA 접근성 속성

## 구현 세부사항

### 1. Atoms — Badge

3개 변형을 컴포넌트 카드로 표시한다. Priority는 3단계(High/Medium/Low)를 모두 포함한다.

#### 1.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Badge</h4>
  <p>3개 변형: category, priority (High/Medium/Low), carry-over</p>
  <div class="proto-badge-demo">
    <!-- Category -->
    <div class="proto-badge-group">
      <span class="proto-badge-group-label">Category</span>
      <span class="proto-badge proto-badge-category">건강</span>
      <span class="proto-badge proto-badge-category">프로젝트A</span>
    </div>
    <!-- Priority -->
    <div class="proto-badge-group">
      <span class="proto-badge-group-label">Priority</span>
      <span class="proto-badge proto-badge-priority-high">
        <svg width="12" height="12" aria-hidden="true"><use href="#icon-alert-triangle"></use></svg>
        High
      </span>
      <span class="proto-badge proto-badge-priority-medium">Medium</span>
      <span class="proto-badge proto-badge-priority-low">Low</span>
    </div>
    <!-- Carry-over -->
    <div class="proto-badge-group">
      <span class="proto-badge-group-label">Carry-over</span>
      <span class="proto-badge proto-badge-carry-over">🔄 2</span>
      <span class="proto-badge proto-badge-carry-over">🔄 5</span>
    </div>
  </div>
</div>
```

#### 1.2 Badge 공통 스타일

```css
.proto-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  border-radius: var(--radius-sm);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-sans);
  white-space: nowrap;
}
```

#### 1.3 각 변형의 스타일

**Category:**
```css
.proto-badge-category {
  background: var(--badge-bg);
  color: var(--badge-text);
}
```

**Priority — High:**
```css
.proto-badge-priority-high {
  background: var(--color-status-error);
  color: var(--color-text-inverse);
}
```
- `AlertTriangle` 아이콘(12px)을 텍스트 앞에 포함한다
- 색상 비의존성: 아이콘 + 텍스트로 우선순위를 전달한다

**Priority — Medium:**
```css
.proto-badge-priority-medium {
  background: var(--color-status-warning);
  color: var(--color-black-900);
}
```

**Priority — Low:**
```css
.proto-badge-priority-low {
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
}
```

**Carry-over:**
```css
.proto-badge-carry-over {
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
}
```

#### 1.4 데모 레이아웃

```css
.proto-badge-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.proto-badge-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.proto-badge-group-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-width: 80px;
}
```

### 2. Atoms — Divider

수평 구분선을 컴포넌트 카드로 표시한다.

#### 2.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Divider</h4>
  <p>수평 구분선</p>
  <div class="proto-divider-demo">
    <p>위쪽 콘텐츠</p>
    <hr class="proto-divider" role="separator">
    <p>아래쪽 콘텐츠</p>
  </div>
</div>
```

#### 2.2 스타일

```css
.proto-divider {
  border: none;
  height: 1px;
  background: var(--color-border-default);
  margin: var(--spacing-3) 0;
}
```

#### 2.3 접근성 (ARIA)

- `role="separator"` 속성을 포함한다

### 3. Atoms — Avatar

2크기(sm/md) × 2타입(image/initials) = 4개 조합을 표시한다.

#### 3.1 컴포넌트 카드 구조

```html
<div class="proto-component-card">
  <h4>Avatar</h4>
  <p>2가지 크기(sm: 32px, md: 40px) × 2가지 타입(이미지, 이니셜)</p>
  <div class="proto-avatar-demo">
    <!-- SM / Image -->
    <div class="proto-avatar-group">
      <span class="proto-avatar-group-label">sm (32px)</span>
      <div class="proto-avatar proto-avatar-sm proto-avatar-image" role="img" aria-label="사용자 아바타">
        <!-- placeholder 이미지 (배경색으로 대체) -->
      </div>
      <div class="proto-avatar proto-avatar-sm proto-avatar-initials" role="img" aria-label="홍길동">
        <span>홍</span>
      </div>
    </div>
    <!-- MD / Image -->
    <div class="proto-avatar-group">
      <span class="proto-avatar-group-label">md (40px)</span>
      <div class="proto-avatar proto-avatar-md proto-avatar-image" role="img" aria-label="사용자 아바타">
        <!-- placeholder 이미지 (배경색으로 대체) -->
      </div>
      <div class="proto-avatar proto-avatar-md proto-avatar-initials" role="img" aria-label="김철수">
        <span>김</span>
      </div>
    </div>
  </div>
</div>
```

#### 3.2 스타일

```css
.proto-avatar {
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.proto-avatar-sm {
  width: 32px;
  height: 32px;
}

.proto-avatar-md {
  width: 40px;
  height: 40px;
}

.proto-avatar-image {
  background: var(--color-bg-brand-subtle);
  /* placeholder — 실제 구현 시 <img> 태그 사용 */
}

.proto-avatar-initials {
  background: var(--color-interactive-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.proto-avatar-sm .proto-avatar-initials {
  font-size: var(--font-size-xs);
}
```

#### 3.3 데모 레이아웃

```css
.proto-avatar-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.proto-avatar-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.proto-avatar-group-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-width: 80px;
}
```

#### 3.4 접근성 (ARIA)

- 이미지 타입: `role="img"`, `aria-label="사용자 아바타"` (실제 구현 시 `<img alt="...">` 사용)
- 이니셜 타입: `role="img"`, `aria-label="이름"` (전체 이름을 aria-label에 포함)

## 주의사항

1. **토큰 참조 필수**: 모든 스타일은 `var()` 토큰을 사용한다. HEX 값을 직접 쓰지 않는다
2. **SVG 심볼 재사용**: Priority High Badge의 AlertTriangle 아이콘은 `<use href="#icon-alert-triangle">`으로 참조한다
3. **proto- 접두사**: 프로토타입 레이아웃 클래스는 반드시 `proto-` 접두사를 사용한다
4. **컴포넌트 격리**: 각 컴포넌트 데모는 `.proto-component-card` 내에 격리한다
5. **색상 비의존성**: Priority High Badge는 아이콘 + 텍스트로 정보를 전달하여 색상만으로 구분하지 않도록 한다
6. **삽입 위치**: `<div id="atoms">` 내부에 tasks-02-01에서 생성한 Button/Checkbox/Icon 카드 뒤에 추가한다

## 검증 체크리스트

- [x] Badge Category 변형이 `--badge-bg` 배경, `--badge-text` 텍스트로 표시된다
- [x] Badge Priority High에 `AlertTriangle` 아이콘 + "High" 텍스트가 표시된다
- [x] Badge Priority High가 `--color-status-error` 배경, 흰색 텍스트이다
- [x] Badge Priority Medium이 `--color-status-warning` 배경이다
- [x] Badge Priority Low가 `--color-bg-surface` 배경, `--color-text-secondary` 텍스트이다
- [x] Badge Carry-over가 "🔄 2" 형식으로 표시된다
- [x] Badge의 border-radius가 `--radius-sm`, 패딩이 `--spacing-1` `--spacing-2`이다
- [x] Badge의 폰트가 `--font-size-xs`, `--font-weight-medium`이다
- [x] Divider가 1px 높이의 수평선으로 표시된다
- [x] Divider 색상이 `--color-border-default`이다
- [x] Divider에 `role="separator"` 속성이 있다
- [x] Avatar sm이 32px 원형으로 표시된다
- [x] Avatar md가 40px 원형으로 표시된다
- [x] Avatar image 타입에 placeholder가 표시된다
- [x] Avatar initials 타입에 이니셜 텍스트가 표시된다
- [x] Avatar가 `--radius-full`로 원형이다
- [x] 모든 스타일이 `var()` 토큰을 참조한다
- [x] `.proto-component-card`로 각 컴포넌트가 격리되어 있다
