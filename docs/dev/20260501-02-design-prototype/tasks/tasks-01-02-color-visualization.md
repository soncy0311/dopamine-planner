# Task 01-02: 컬러 시각화

## 작업 정보

- **Sub-PRD**: `sub-prd-01-feat-tokens-icons.md`
- **의존성**: `tasks-01-01` (HTML 구조 + 토큰 정의 완료 후 진행)
- **대상 파일**: `docs/base/prototype/index.html` — `<section id="tokens">` 내부
- **참조 파일**: `docs/base/design-system/tokens/colors.css`, `semantic.css`, `components.css`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] 섹션 1.1: 컬러 팔레트 스워치 그리드 (Purple/Periwinkle/Neutral/Status)
- [x] 섹션 1.2: 시맨틱 컬러 매핑 표시 (토큰 → 참조 → HEX)
- [x] 섹션 1.3: 컴포넌트 컬러 그룹 표시
- [x] 주요 컬러 조합에 WCAG 대비율 표시

## 구현 세부사항

### 1. 섹션 1.1: 컬러 팔레트 스워치 그리드

`<section id="tokens">` 내부에 4개 팔레트 그룹을 스워치 그리드로 표시한다.

#### 1.1.1 그룹 구성

| 그룹명 | 토큰 수 | 토큰 목록 |
|--------|---------|-----------|
| Main — Purple | 5 | `--color-purple-100` ~ `700` |
| Sub 01 — Periwinkle | 5 | `--color-periwinkle-100` ~ `500` |
| Sub 02 — Neutral + Grounding | 5 | `--color-indigo-600`, `--color-lavender-gray-300`, `--color-gray-50`, `--color-white`, `--color-black-900` |
| Status | 4 | `--color-red-500`, `--color-green-500`, `--color-yellow-500`, `--color-blue-500` |

#### 1.1.2 스워치 표시 형식

각 스워치는 다음 정보를 포함한다:

```
┌──────────────┐
│              │  ← 정사각형 컬러 블록 (background-color: var(--token))
│              │
└──────────────┘
토큰명            ← --color-purple-500
#9755D9           ← HEX 값
Primary 브랜드색   ← 용도 텍스트
```

#### 1.1.3 레이아웃 및 스타일

- 그룹별로 가로 나열 (flexbox, `flex-wrap: wrap`)
- 그룹 이름을 소제목(`<h3>`)으로 표시
- Primary(`--color-purple-500`)와 Secondary(`--color-periwinkle-500`) 스워치에 별표(★) 표시
- `--color-white` 스워치는 보더(`1px solid var(--color-border-default)`)로 구분
- 프로토타입 전용 클래스: `proto-swatch-grid`, `proto-swatch`, `proto-swatch-block`, `proto-swatch-label`

#### 1.1.4 각 스워치의 토큰명, HEX, 용도

**Main — Purple:**

| 토큰명 | HEX | 용도 |
|--------|-----|------|
| `--color-purple-100` | `#D7AEF2` | 배경 하이라이트, 비활성 상태 |
| `--color-purple-200` | `#C599F2` | 호버 상태 |
| `--color-purple-300` | `#B87EF2` | 활성 상태 |
| `--color-purple-500` | `#9755D9` | Primary 브랜드색 ★ |
| `--color-purple-700` | `#8A63BF` | 눌림 상태 |

**Sub 01 — Periwinkle:**

| 토큰명 | HEX | 용도 |
|--------|-----|------|
| `--color-periwinkle-100` | `#D2D3FF` | 연한 배경, 태그 |
| `--color-periwinkle-200` | `#BFCEFF` | — |
| `--color-periwinkle-300` | `#BAC3FF` | — |
| `--color-periwinkle-400` | `#9DABE8` | — |
| `--color-periwinkle-500` | `#9DA3E8` | Secondary 색상 ★ |

**Sub 02 — Neutral + Grounding:**

| 토큰명 | HEX | 용도 |
|--------|-----|------|
| `--color-indigo-600` | `#7578BF` | 보조 텍스트/아이콘 |
| `--color-lavender-gray-300` | `#B8BAD9` | 보더, 디바이더 |
| `--color-gray-50` | `#F2F2F2` | Surface 배경 |
| `--color-white` | `#FFFFFF` | 기본 배경 |
| `--color-black-900` | `#000000` | Grounding (본문 텍스트) |

**Status:**

| 토큰명 | HEX | 용도 |
|--------|-----|------|
| `--color-red-500` | `#EF4444` | Error |
| `--color-green-500` | `#22C55E` | Success |
| `--color-yellow-500` | `#F59E0B` | Warning |
| `--color-blue-500` | `#3B82F6` | Info |

### 2. 섹션 1.2: 시맨틱 컬러 매핑

역할 기반 토큰을 6개 카테고리별로 표시한다. 각 토큰은 참조하는 Primitive 값을 함께 보여준다.

#### 2.1 표시 형식

```
┌────────┐  --color-text-primary  →  --color-black-900  →  #000000
│ 컬러블록 │
└────────┘
```

- 좌측: 컬러 블록 + 토큰명
- 우측: 참조 토큰 → 실제 HEX 값 (화살표로 매핑 표시)
- 참조가 없는 토큰(직접 값)은 화살표 없이 HEX만 표시

#### 2.2 카테고리별 토큰 목록

**Text (5개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-text-primary` | `--color-black-900` | `#000000` |
| `--color-text-secondary` | `--color-indigo-600` | `#7578BF` |
| `--color-text-tertiary` | `--color-lavender-gray-300` | `#B8BAD9` |
| `--color-text-inverse` | `--color-white` | `#FFFFFF` |
| `--color-text-brand` | `--color-purple-500` | `#9755D9` |

**Background (5개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-bg-base` | `--color-white` | `#FFFFFF` |
| `--color-bg-surface` | `--color-gray-50` | `#F2F2F2` |
| `--color-bg-elevated` | `--color-white` | `#FFFFFF` |
| `--color-bg-brand-subtle` | `--color-purple-100` | `#D7AEF2` |
| `--color-bg-secondary-subtle` | `--color-periwinkle-100` | `#D2D3FF` |

**Interactive — Primary (4개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-interactive-primary` | `--color-purple-500` | `#9755D9` |
| `--color-interactive-primary-hover` | `--color-purple-300` | `#B87EF2` |
| `--color-interactive-primary-active` | `--color-purple-700` | `#8A63BF` |
| `--color-interactive-primary-disabled` | `--color-purple-100` | `#D7AEF2` |

**Interactive — Secondary (3개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-interactive-secondary` | `--color-periwinkle-500` | `#9DA3E8` |
| `--color-interactive-secondary-hover` | `--color-periwinkle-300` | `#BAC3FF` |
| `--color-interactive-secondary-active` | `--color-periwinkle-400` | `#9DABE8` |

**Border (3개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-border-default` | `--color-lavender-gray-300` | `#B8BAD9` |
| `--color-border-focus` | `--color-purple-500` | `#9755D9` |
| `--color-border-subtle` | `--color-gray-50` | `#F2F2F2` |

**Status (4개):**

| 토큰명 | 참조 | HEX |
|--------|------|-----|
| `--color-status-success` | `--color-green-500` | `#22C55E` |
| `--color-status-error` | `--color-red-500` | `#EF4444` |
| `--color-status-warning` | `--color-yellow-500` | `#F59E0B` |
| `--color-status-info` | `--color-blue-500` | `#3B82F6` |

#### 2.3 레이아웃

- 카테고리별 섹션 구분 (소제목 `<h3>` + 구분선)
- 프로토타입 전용 클래스: `proto-semantic-group`, `proto-semantic-row`, `proto-semantic-block`, `proto-semantic-ref`

### 3. 섹션 1.3: 컴포넌트 컬러 그룹

컴포넌트별 전용 토큰을 그룹으로 표시한다.

#### 3.1 표시 형식

- 컴포넌트 이름을 헤더(`<h4>`)로 표시
- 해당 토큰들을 컬러 블록 + 토큰명 + 참조 체인으로 나열

```
Button
  ┌──┐ --button-primary-bg → --color-interactive-primary → --color-purple-500 → #9755D9
  └──┘
```

#### 3.2 컴포넌트별 토큰 목록

**Button (5개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--button-primary-bg` | → `--color-interactive-primary` → `--color-purple-500` | `#9755D9` |
| `--button-primary-text` | → `--color-text-inverse` → `--color-white` | `#FFFFFF` |
| `--button-primary-bg-hover` | → `--color-interactive-primary-hover` → `--color-purple-300` | `#B87EF2` |
| `--button-primary-bg-active` | → `--color-interactive-primary-active` → `--color-purple-700` | `#8A63BF` |
| `--button-primary-bg-disabled` | → `--color-interactive-primary-disabled` → `--color-purple-100` | `#D7AEF2` |

**Tab Bar (3개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--tab-bar-bg` | → `--color-bg-elevated` → `--color-white` | `#FFFFFF` |
| `--tab-bar-active` | → `--color-interactive-primary` → `--color-purple-500` | `#9755D9` |
| `--tab-bar-inactive` | → `--color-lavender-gray-300` | `#B8BAD9` |

**Todo Item (5개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--todo-item-bg` | → `--color-bg-elevated` → `--color-white` | `#FFFFFF` |
| `--todo-item-border` | → `--color-border-default` → `--color-lavender-gray-300` | `#B8BAD9` |
| `--todo-item-completed-text` | → `--color-text-tertiary` → `--color-lavender-gray-300` | `#B8BAD9` |
| `--todo-item-checkbox-checked` | → `--color-interactive-primary` → `--color-purple-500` | `#9755D9` |
| `--todo-item-checkbox-unchecked` | → `--color-border-default` → `--color-lavender-gray-300` | `#B8BAD9` |

**Category Badge (2개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--badge-bg` | → `--color-bg-secondary-subtle` → `--color-periwinkle-100` | `#D2D3FF` |
| `--badge-text` | → `--color-interactive-secondary` → `--color-periwinkle-500` | `#9DA3E8` |

**FAB (3개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--fab-bg` | → `--color-interactive-primary` → `--color-purple-500` | `#9755D9` |
| `--fab-text` | → `--color-text-inverse` → `--color-white` | `#FFFFFF` |
| `--fab-shadow` | (직접 값) | `rgba(151, 85, 217, 0.3)` |

**Section Header (2개):**

| 토큰명 | 참조 체인 | 최종 HEX |
|--------|----------|----------|
| `--section-done-text` | → `--color-text-secondary` → `--color-indigo-600` | `#7578BF` |
| `--section-progress-text` | → `--color-text-primary` → `--color-black-900` | `#000000` |

#### 3.3 레이아웃

- 프로토타입 전용 클래스: `proto-component-group`, `proto-component-row`

### 4. WCAG 대비율 표시

주요 컬러 조합(Text on Background)에 대비율 수치를 텍스트로 표시한다.

#### 4.1 표시 대상 조합

| 전경색 | 배경색 | 대비율 | 통과 여부 |
|--------|--------|--------|-----------|
| `--color-black-900` (#000000) | `--color-white` (#FFFFFF) | 21:1 | AA ✓ / AAA ✓ |
| `--color-purple-500` (#9755D9) | `--color-white` (#FFFFFF) | 계산 필요 | 표시 |
| `--color-text-inverse` (#FFFFFF) | `--color-purple-500` (#9755D9) | 계산 필요 | 표시 |
| `--color-indigo-600` (#7578BF) | `--color-white` (#FFFFFF) | 계산 필요 | 표시 |
| `--color-indigo-600` (#7578BF) | `--color-gray-50` (#F2F2F2) | 계산 필요 | 표시 |
| `--color-lavender-gray-300` (#B8BAD9) | `--color-white` (#FFFFFF) | 계산 필요 | 표시 |

#### 4.2 표시 형식

- 각 조합을 실제 전경/배경색으로 렌더링한 박스 안에 대비율 수치와 WCAG 등급을 표시
- 형식: `4.6:1 AA ✓` 또는 `2.1:1 AA ✗`
- WCAG AA 기준: 일반 텍스트 4.5:1, 대형 텍스트 3:1
- 프로토타입 전용 클래스: `proto-contrast-grid`, `proto-contrast-item`

#### 4.3 대비율 계산

대비율은 구현 시 WCAG 공식으로 계산하여 정적 텍스트로 삽입한다. 별도 JavaScript는 사용하지 않는다.

## 주의사항

1. **스워치 컬러 블록**에는 반드시 `var()` 토큰을 사용한다 (직접 HEX 값 X)
2. **시맨틱/컴포넌트 참조 체인**은 정확하게 표시한다 — 토큰 정의 파일(`semantic.css`, `components.css`)과 대조
3. **프로토타입 스타일 분리**: 모든 레이아웃 클래스에 `proto-` 접두사를 사용한다
4. **WCAG 대비율**은 구현 시점에 정확히 계산하여 기입한다

## 검증 체크리스트

- [x] Primitive 토큰 19개 컬러가 모두 스워치로 표시된다
- [x] 4개 팔레트 그룹(Purple, Periwinkle, Neutral, Status)이 구분되어 표시된다
- [x] Primary(★)와 Secondary(★) 스워치가 별표로 표시된다
- [x] `--color-white` 스워치가 보더로 구분된다
- [x] Semantic 토큰이 6개 카테고리(Text, Background, Interactive Primary, Interactive Secondary, Border, Status)로 구분된다
- [x] 각 Semantic 토큰에 참조 Primitive 토큰과 최종 HEX 값이 함께 표시된다
- [x] Component 토큰이 6개 컴포넌트 그룹(Button, Tab Bar, Todo Item, Badge, FAB, Section Header)으로 표시된다
- [x] 각 Component 토큰에 참조 체인(Component → Semantic → Primitive → HEX)이 표시된다
- [x] 주요 컬러 조합에 WCAG 대비율 수치와 등급이 표시된다
- [x] 모든 컬러 블록이 `var()` 토큰을 사용하여 렌더링된다
