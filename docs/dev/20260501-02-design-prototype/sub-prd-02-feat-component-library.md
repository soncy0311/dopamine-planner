# SUB-PRD: `컴포넌트 라이브러리 시각화`

## 작업 정보

- **작업명**: `컴포넌트 라이브러리 시각화`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-01
- **종료일**: 2026-05-02
- **최신 업데이트**: 2026-05-02
- **상태**: 완료

## 배경 및 목적

Sub-01에서 생성한 `index.html`에 **섹션 3: 컴포넌트 라이브러리**를 추가한다. Atomic Design 계층(Atoms → Molecules → Organisms)별로 모든 컴포넌트의 상태와 변형을 순수 HTML + CSS로 구현하여, 실제 React 컴포넌트 개발 전에 시각적 형태를 검증한다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 마크업 | HTML5 (Sub-01의 index.html 확장) |
| 스타일 | CSS Custom Properties (Sub-01에서 정의한 토큰 사용) |
| 아이콘 | Sub-01에서 정의한 SVG 심볼 재사용 |
| 인터랙션 | CSS :hover, :active, :focus 상태 + 최소 바닐라 JS (체크박스 토글) |

## 핵심 요구 사항

### 1. 컴포넌트 표시 규칙

각 컴포넌트는 다음 형식으로 표시한다:

```
┌─ 컴포넌트명 ──────────────────────────────┐
│ 설명 텍스트                                │
│                                            │
│ [변형1: 라벨]  [변형2: 라벨]  [변형3: 라벨] │
│                                            │
│ [상태1]  [상태2]  [상태3]  [상태4]          │
└────────────────────────────────────────────┘
```

- 컴포넌트명과 간단한 설명을 상단에 표시
- 변형(variant)을 가로로 나열
- 상태(state)를 가로로 나열
- 각 컴포넌트 블록은 카드 형태로 구분

### 2. Atoms (6종)

#### 2.1 Button

4개 변형 × 4개 상태 = 16개 조합을 그리드로 표시한다.

**변형:**
- `primary`: `--button-primary-bg` 배경, `--button-primary-text` 텍스트
- `secondary`: `--color-interactive-secondary` 배경
- `ghost`: 투명 배경, `--color-interactive-primary` 텍스트
- `destructive`: `--color-status-error` 배경, 흰색 텍스트

**상태:**
- `default`: 기본 상태
- `hover`: `:hover` 스타일 적용 (항상 표시)
- `active`: `:active` 스타일 적용 (항상 표시)
- `disabled`: `opacity: 0.5`, `cursor: not-allowed`

**스타일 규칙:**
- 최소 터치 타겟: 44×44px
- Border radius: `--radius-md` (8px)
- 패딩: `--spacing-2` `--spacing-4`
- 폰트: `--font-size-md`, `--font-weight-medium`
- 트랜지션: `--duration-fast` `--easing-default`

#### 2.2 Checkbox

3개 상태를 나란히 표시한다.

**상태:**
- `unchecked`: `--todo-item-checkbox-unchecked` 보더, 빈 내부
- `checked`: `--todo-item-checkbox-checked` 배경, 흰색 Check 아이콘
- `disabled`: `opacity: 0.5`

**스타일 규칙:**
- 크기: 20×20px (터치 영역은 44×44px)
- Border radius: `--radius-sm` (4px)
- 체크 애니메이션: `--duration-fast` (100ms)

#### 2.3 Icon

크기 변형 3종을 나란히 표시한다.

- 16px, 20px, 24px (기본)
- 각 크기에 `--color-text-primary` 적용
- `aria-hidden="true"` 속성 포함

#### 2.4 Badge

3개 변형을 나란히 표시한다.

**변형:**
- `category`: `--badge-bg` 배경, `--badge-text` 텍스트, 카테고리 이름 표시 (예: "건강", "프로젝트A")
- `priority`: 우선순위별 색상 구분
  - High: `--color-status-error` 배경, 흰색 텍스트, AlertTriangle 아이콘 포함
  - Medium: `--color-status-warning` 배경
  - Low: `--color-bg-surface` 배경, `--color-text-secondary` 텍스트
- `carry-over`: `--color-bg-surface` 배경, 이월 횟수 표시 (예: "🔄 2")

**스타일 규칙:**
- Border radius: `--radius-sm` (4px)
- 패딩: `--spacing-1` `--spacing-2`
- 폰트: `--font-size-xs`, `--font-weight-medium`

#### 2.5 Divider

수평 구분선을 표시한다.

- 색상: `--color-border-default`
- 높이: 1px
- `role="separator"` 속성

#### 2.6 Avatar

2개 크기 × 2개 타입 = 4개 조합을 표시한다.

**크기:** sm (32px), md (40px)
**타입:** 이미지 (placeholder), 이니셜 (배경색 + 텍스트)
- 모양: 원형 (`--radius-full`)

### 3. Molecules (5종)

#### 3.1 TodoItem

4개 변형을 세로로 나열한다. 각 항목은 48px 최소 높이이다.

**변형:**

1. **미완료 (기본)**: Checkbox(unchecked) + 제목 텍스트 + Category Badge
2. **완료**: Checkbox(checked) + ~~취소선 제목~~ + Category Badge, 텍스트 색상 `--todo-item-completed-text`
3. **우선순위 표시**: Checkbox + 제목 + Priority Badge(High) + Category Badge
4. **이월 표시**: Checkbox + 제목 + Carry-over Badge("🔄 2") + Category Badge

**스타일 규칙:**
- 배경: `--todo-item-bg`
- 하단 보더: `--todo-item-border`
- 패딩: `--spacing-3` `--spacing-4`
- 제목 폰트: `--font-size-md`, `--font-weight-regular`
- 완료 시 제목: `text-decoration: line-through`, 색상 `--todo-item-completed-text`
- Checkbox와 제목 간격: `--spacing-3`
- 제목과 Badge 간격: `--spacing-2`

#### 3.2 SectionHeader

2개 변형을 세로로 나열한다.

**변형:**

1. **완료 섹션**: Check 아이콘 + "완료" + 개수 Badge, 텍스트 색상 `--section-done-text`
2. **진행 중 섹션**: 목록 아이콘 + "진행 중" + 개수 Badge, 텍스트 색상 `--section-progress-text`

**스타일 규칙:**
- 폰트: `--font-size-lg`, `--font-weight-semibold`
- 아이콘과 텍스트 간격: `--spacing-2`
- 개수 Badge: `--font-size-sm`, `--font-weight-regular`
- 하단 마진: `--spacing-2`

#### 3.3 DateNavigator

주간 뷰와 월간 달력 펼치기를 지원하는 날짜 네비게이션을 구현한다.

**구성:**
- **헤더**: ChevronLeft(이전) 버튼 + 월/년 타이틀 + ChevronRight(다음) 버튼 + 펼치기 토글(ChevronDown/Up)
- **주간 스트립**: 일~토 7일 그리드. 선택일은 보라색(`--color-interactive-primary`) 원형 배경, 오늘은 보라색 테두리(outline)로 표시
- **월간 달력**: 펼침 시 7×5 그리드로 해당 월 전체를 표시. 다른 월 날짜는 `--color-text-tertiary`로 흐림 처리

**스타일 규칙:**
- 헤더 타이틀 폰트: `--font-size-lg`, `--font-weight-bold`
- 주간 스트립 요일 라벨: `--font-size-xs`, `--color-text-secondary`
- 주간 스트립 날짜: `--font-size-sm`, `--font-weight-medium`
- 선택일 원형 배경: `--color-interactive-primary`, 텍스트 `--color-text-inverse`
- 오늘 표시: 2px 보더 `--color-interactive-primary`, 배경 투명
- 좌우 패딩: `--spacing-6`
- 헤더-스트립 간격: `--spacing-2`

#### 3.4 TabBarItem

활성/비활성 2개 상태를 나란히 표시한다.

**구성:** 아이콘(24px) + 라벨 텍스트

**상태:**
- `active`: 아이콘/텍스트 색상 `--tab-bar-active`, 폰트 `--font-weight-semibold`
- `inactive`: 아이콘/텍스트 색상 `--tab-bar-inactive`, 폰트 `--font-weight-regular`

**스타일 규칙:**
- 라벨 폰트: `--font-size-xs`
- 아이콘-라벨 간격: `--spacing-1`
- 세로 중앙 정렬
- `role="tab"`, `aria-selected` 속성

#### 3.5 FormField

3개 상태를 세로로 나열한다.

**상태:**

1. **기본**: 라벨 + 입력 필드(빈 테두리) + 도움말 텍스트
2. **에러**: 라벨 + 입력 필드(빨간 테두리) + 에러 메시지(빨간 텍스트)
3. **비활성**: 라벨 + 입력 필드(회색 배경) + 도움말 텍스트(흐리게)

**스타일 규칙:**
- 라벨 폰트: `--font-size-sm`, `--font-weight-medium`
- 입력 필드: `--radius-md` 보더, `--spacing-3` 패딩, `--font-size-md`
- 기본 보더: `--color-border-default`
- 포커스 보더: `--color-border-focus` (2px)
- 에러 보더: `--color-status-error`
- 도움말 폰트: `--font-size-xs`, `--color-text-tertiary`
- 라벨-입력 간격: `--spacing-1`
- 입력-도움말 간격: `--spacing-1`

### 4. Organisms (5종)

#### 4.1 TodoSection

SectionHeader + TodoItem[] 조합을 2개 변형으로 표시한다.

**변형:**

1. **완료 섹션**: 완료 SectionHeader + 완료 TodoItem 2개
2. **진행 중 섹션**: 진행 중 SectionHeader + 미완료 TodoItem 3개 (우선순위/이월 포함)

430px 너비 프레임 내에 배치한다.

#### 4.2 BottomTabBar

3탭 하단 바를 구현한다.

**구성:**
- Life 탭: Home 아이콘 + "Life"
- Work 탭: Briefcase 아이콘 + "Work"
- Settings 탭: Settings 아이콘 + "설정"

**스타일 규칙:**
- 배경: `--tab-bar-bg`
- 높이: 56px + 하단 Safe Area (env(safe-area-inset-bottom) 또는 고정 20px)
- 3등분 가로 배치
- 상단 보더: 1px `--color-border-subtle`
- 활성 탭 1개 + 비활성 탭 2개로 표시
- `role="tablist"` 속성

#### 4.3 TodoCreateSheet

바텀 시트 형태의 투두 생성 폼을 구현한다.

**구성 (위에서 아래):**
1. 핸들 바 (작은 회색 바, 중앙)
2. 헤더: "새 투두" + 닫기(✕) 버튼
3. FormField: 제목 (필수, placeholder: "할 일을 입력하세요")
4. FormField: 설명 (선택, textarea)
5. 우선순위 선택: High / Medium / Low Badge 3개 가로 나열
6. 분류 선택: Select 드롭다운 (placeholder: "분류를 선택하세요")
7. 등록일 선택: 날짜 입력 필드
8. 저장 Button (primary, 전체 너비)

**스타일 규칙:**
- 배경: `--color-bg-elevated`
- 상단 Border Radius: `--radius-lg`
- 패딩: `--spacing-6`
- 요소 간격: `--spacing-4`
- 430px 너비 프레임 내 하단 고정으로 표시
- `role="dialog"`, `aria-modal="true"` 속성

#### 4.4 CategoryList

분류 관리 목록을 구현한다.

**구성:** 3개 CategoryList Item을 세로로 나열

각 Item:
- 좌측: 컬러 인디케이터(12px 원형) + 분류명
- 우측: 더보기(⋮) 아이콘 버튼

**샘플 데이터:**
- 🟣 건강 (Purple)
- 🔵 자기개발 (Periwinkle)
- 🟢 생활 (Indigo)

**스타일 규칙:**
- 항목 높이: 48px
- 좌우 패딩: `--spacing-4`
- 인디케이터-텍스트 간격: `--spacing-3`
- 항목 간 Divider

#### 4.5 IssueCard (EpicAccordion 통합)

진행률이 포함된 IssueCard를 구현한다. 기존 EpicAccordion 컴포넌트는 IssueCard의 아코디언(IssueCard-accordion) 변형으로 통합되었다.

**구성:**
- 제목: Issue 이름
- 세그먼트 프로그레스바: 서브 이슈 수만큼 분할되는 세그먼트 바. 완료된 세그먼트는 `--color-interactive-primary`, 미완료 세그먼트는 `--color-bg-surface`
- 진행률 텍스트: 프로그레스바 오른쪽에 퍼센트만 인라인 표시 (예: "80%"). 갯수 표시 "(4/5)" 제거
- 상태 Badge: "active"
- 아코디언 변형(IssueCard-accordion): 펼침 시 서브 이슈 목록을 표시하며, 메인 체크박스로 서브 이슈 일괄 체크/해제 가능

**샘플 데이터:**
1. "3월 운동 루틴" — 80% (서브 이슈 5개 중 4개 완료)
2. "독서 챌린지" — 30% (서브 이슈 10개 중 3개 완료)

**스타일 규칙:**
- 배경: `--color-bg-elevated`
- Border: `--color-border-default`
- Border Radius: `--radius-md`
- 패딩: `--spacing-4`
- 세그먼트 프로그레스바 높이: 8px, 각 세그먼트 Border Radius: `--radius-sm`, 세그먼트 간 간격: 2px
- 제목 폰트: `--font-size-md`, `--font-weight-semibold`
- 진행률 텍스트: `--font-size-sm`, `--color-text-secondary`, 프로그레스바 우측 인라인 배치
- 카드 간 간격: `--spacing-3`

## 핵심 구현 로직

### Sub-01 파일 확장

Sub-01에서 생성한 `docs/base/prototype/index.html`에 `<section id="components">` 를 추가한다.

```html
<section id="components">
  <h2>3. 컴포넌트 라이브러리</h2>
  
  <div id="atoms">
    <h3>3.1 Atoms</h3>
    <!-- Button, Checkbox, Icon, Badge, Divider, Avatar -->
  </div>
  
  <div id="molecules">
    <h3>3.2 Molecules</h3>
    <!-- TodoItem, SectionHeader, DateNavigator, TabBarItem, FormField -->
  </div>
  
  <div id="organisms">
    <h3>3.3 Organisms</h3>
    <!-- TodoSection, BottomTabBar, TodoCreateSheet, CategoryList, IssueCard -->
  </div>
</section>
```

### 상태 시각화 방식

인터랙티브 상태(hover, active, focus)는 두 가지 방식으로 표시한다:

1. **항상 표시**: 각 상태를 별도 요소로 나란히 배치 (예: Button의 default/hover/active/disabled)
2. **실제 인터랙션**: CSS `:hover`, `:active`, `:focus` 의사 클래스를 적용하여 마우스 조작 시 변화 확인

## 구현 시 주의사항

1. **Sub-01 토큰 의존**: 모든 스타일은 Sub-01에서 정의한 CSS Custom Properties를 사용한다. HEX 값을 직접 쓰지 않는다
2. **SVG 심볼 재사용**: 아이콘은 Sub-01에서 정의한 `<use href="#icon-name">`으로 참조한다
3. **접근성 속성**: 각 컴포넌트에 적절한 ARIA 속성을 포함한다
   - Checkbox: `role="checkbox"`, `aria-checked`
   - TabBarItem: `role="tab"`, `aria-selected`
   - TodoItem: `role="listitem"`
   - TodoCreateSheet: `role="dialog"`, `aria-modal="true"`
   - Divider: `role="separator"`
   - Icon (장식용): `aria-hidden="true"`
4. **터치 타겟**: 모든 인터랙티브 요소의 최소 터치 영역은 44×44px
5. **컴포넌트 격리**: 각 컴포넌트 데모는 카드(`.proto-component-card`) 내에 격리하여, 스타일 간섭을 방지한다

## 작업

- [x] 앵커 네비게이션에 섹션 3 링크 활성화
- [x] `<section id="components">` 추가
- [x] Atoms — Button: 4 변형 × 4 상태 그리드
- [x] Atoms — Checkbox: 3 상태
- [x] Atoms — Icon: 3 크기 변형
- [x] Atoms — Badge: 3 변형 (category, priority 3종, carry-over)
- [x] Atoms — Divider: 수평 구분선
- [x] Atoms — Avatar: 2 크기 × 2 타입
- [x] Molecules — TodoItem: 4 변형 (미완료, 완료, 우선순위, 이월)
- [x] Molecules — SectionHeader: 2 변형 (완료, 진행 중)
- [x] Molecules — DateNavigator: 날짜 표시 바
- [x] Molecules — TabBarItem: 2 상태 (활성, 비활성)
- [x] Molecules — FormField: 3 상태 (기본, 에러, 비활성)
- [x] Organisms — TodoSection: 2 변형 (완료 섹션, 진행 중 섹션)
- [x] Organisms — BottomTabBar: 3탭 하단 바
- [x] Organisms — TodoCreateSheet: 바텀 시트 폼
- [x] Organisms — CategoryList: 3개 항목 목록
- [x] Organisms — IssueCard: 2개 카드 (세그먼트 프로그레스바 + 아코디언 변형 포함, 기존 EpicAccordion 통합)
- [x] 모든 컴포넌트에 ARIA 접근성 속성 추가

## 검증 기준

- [x] Button 16개 조합(4변형 × 4상태)이 모두 시각적으로 구분됨
- [x] Button hover/active 시 CSS transition이 `--duration-fast`로 적용됨
- [x] Checkbox 체크/해제 토글이 동작함
- [x] Badge 3종(category, priority, carry-over)이 시각적으로 구분됨
- [x] Priority Badge에서 High는 AlertTriangle 아이콘 + 텍스트로 색상 비의존성 확인
- [x] TodoItem 완료 시 취소선 + 텍스트 색상 변경이 적용됨
- [x] TodoItem 이월 표시(🔄 2)가 Badge로 표시됨
- [x] SectionHeader의 완료/진행 중이 색상과 아이콘으로 구분됨
- [x] DateNavigator가 주간 스트립(7일 그리드) + 월간 달력 펼치기 구조로 표시됨
- [x] DateNavigator 선택일에 보라색 원형 배경, 오늘에 보라색 테두리가 표시됨
- [x] TabBarItem 활성/비활성 색상이 `--tab-bar-active`/`--tab-bar-inactive`로 구분됨
- [x] FormField 에러 상태에서 빨간 보더 + 에러 메시지가 표시됨
- [x] TodoSection이 SectionHeader + TodoItem 조합으로 올바르게 구성됨
- [x] BottomTabBar가 56px 높이 + 3탭으로 표시됨
- [x] TodoCreateSheet이 바텀 시트 형태로 폼 요소를 포함함 (Epic 필드 제거, "등록일" 필드 포함)
- [x] CategoryList에 컬러 인디케이터 + 이름이 표시됨
- [x] IssueCard에 세그먼트 프로그레스바가 서브 이슈 수만큼 분할되어 표시됨
- [x] IssueCard 진행률이 퍼센트만 프로그레스바 우측에 인라인 표시됨
- [x] 모든 인터랙티브 요소의 터치 영역이 44×44px 이상

---

*이 문서는 디자인 시스템 프로토타입 프로젝트의 상세 구현 가이드입니다. 전체적인 프로젝트 내용은 `main-prd-design-prototype.md` 파일을 참조하세요.*
