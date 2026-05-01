# Task 01-04: 아이콘 시스템

## 작업 정보

- **Sub-PRD**: `sub-prd-01-feat-tokens-icons.md`
- **의존성**: `tasks-01-01` (HTML 구조 + 토큰 정의 완료 후 진행)
- **대상 파일**: `docs/client/prototype/index.html` — `<svg><defs>` 및 `<section id="icons">`
- **참조**: Lucide Icons (https://lucide.dev) — 인라인 SVG로 포함

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] SVG `<defs>` 내 10개 Lucide 아이콘 심볼 정의
- [x] 섹션 2: 아이콘 그리드 (이름 + 용도 + 크기 변형 + 컬러 변형)

## 구현 세부사항

### 1. SVG 심볼 정의

`index.html` 하단의 `<svg style="display:none"><defs>` 내에 10개 Lucide 아이콘을 `<symbol>`로 정의한다.

#### 1.1 아이콘 목록

| 심볼 ID | Lucide 이름 | 용도 |
|---------|-------------|------|
| `icon-check` | `check` | 투두 완료 |
| `icon-plus` | `plus` | 투두/항목 추가 (FAB) |
| `icon-chevron-left` | `chevron-left` | 날짜 이전 |
| `icon-chevron-right` | `chevron-right` | 날짜 다음 |
| `icon-home` | `home` | Life 탭 |
| `icon-briefcase` | `briefcase` | Work 탭 |
| `icon-settings` | `settings` | 설정 탭 |
| `icon-trash` | `trash-2` | 삭제 |
| `icon-edit` | `edit-3` | 수정 |
| `icon-alert-triangle` | `alert-triangle` | 우선순위 High |

#### 1.2 심볼 정의 형식

```html
<svg style="display:none">
  <defs>
    <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Lucide check 아이콘 path -->
    </symbol>
    <symbol id="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Lucide plus 아이콘 path -->
    </symbol>
    <!-- ... 나머지 8개 -->
  </defs>
</svg>
```

#### 1.3 SVG path 데이터

각 아이콘의 SVG path는 Lucide Icons 공식 소스에서 가져온다. 아래는 각 아이콘의 path 구성이다:

| 아이콘 | SVG 내부 요소 |
|--------|--------------|
| `check` | `<path d="M20 6 9 17l-5-5"/>` |
| `plus` | `<path d="M5 12h14"/><path d="M12 5v14"/>` |
| `chevron-left` | `<path d="m15 18-6-6 6-6"/>` |
| `chevron-right` | `<path d="m9 18 6-6-6-6"/>` |
| `home` | `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>` |
| `briefcase` | `<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>` |
| `settings` | `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>` |
| `trash-2` | `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>` |
| `edit-3` | `<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>` |
| `alert-triangle` | `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>` |

> **구현 시 주의**: 위 path 데이터는 참조용이다. 구현 시 Lucide Icons 공식 소스(https://lucide.dev)에서 최신 SVG path를 확인하여 사용한다.

### 2. 섹션 2: 아이콘 그리드

`<section id="icons">` 내부에 아이콘 시스템을 시각화한다.

#### 2.1 기본 아이콘 그리드

10개 아이콘을 그리드 레이아웃으로 표시한다.

```
┌─────────────────────────────────────┐
│ ✓ Check          투두 완료           │
│ + Plus           투두/항목 추가 (FAB) │
│ < ChevronLeft    날짜 이전           │
│ > ChevronRight   날짜 다음           │
│ ⌂ Home           Life 탭            │
│ 💼 Briefcase     Work 탭            │
│ ⚙ Settings       설정 탭            │
│ 🗑 Trash2        삭제               │
│ ✏ Edit3          수정               │
│ ⚠ AlertTriangle  우선순위 High       │
└─────────────────────────────────────┘
```

각 행의 구성:
- 아이콘 (24px, `<svg><use href="#icon-name"></svg>`)
- 아이콘 이름 (영문)
- 용도 텍스트 (한글)

#### 2.2 크기 변형 데모

각 아이콘에 대해 3가지 크기를 나란히 표시한다.

| 크기 | width/height |
|------|-------------|
| Small | 16px |
| Medium | 20px |
| Large | 24px (기본) |

```
Check:  [16px] [20px] [24px]
Plus:   [16px] [20px] [24px]
...
```

- `<svg>` 태그의 `width`/`height` 속성으로 크기를 조절한다
- 각 크기 아래에 px 값을 라벨로 표시한다

#### 2.3 컬러 변형 데모

각 아이콘에 대해 3가지 컬러를 적용하여 표시한다.

| 컬러 | 토큰 | 값 |
|------|------|-----|
| Primary | `--color-text-primary` | `#000000` |
| Secondary | `--color-text-secondary` | `#7578BF` |
| Brand | `--color-interactive-primary` | `#9755D9` |

```
Check:  [Primary] [Secondary] [Brand]
Plus:   [Primary] [Secondary] [Brand]
...
```

- SVG의 `color` CSS 속성으로 컬러를 변경한다 (`stroke: currentColor`이므로 `color` 속성이 적용됨)
- 각 컬러 아래에 토큰명을 라벨로 표시한다

#### 2.4 아이콘 참조 방식

모든 아이콘은 `<use href="#icon-name">`으로 참조한다. SVG 마크업을 중복하지 않는다.

```html
<!-- 기본 사용 -->
<svg width="24" height="24"><use href="#icon-check"></use></svg>

<!-- 크기 변형 -->
<svg width="16" height="16"><use href="#icon-check"></use></svg>
<svg width="20" height="20"><use href="#icon-check"></use></svg>
<svg width="24" height="24"><use href="#icon-check"></use></svg>

<!-- 컬러 변형 -->
<svg width="24" height="24" style="color: var(--color-text-primary)"><use href="#icon-check"></use></svg>
<svg width="24" height="24" style="color: var(--color-text-secondary)"><use href="#icon-check"></use></svg>
<svg width="24" height="24" style="color: var(--color-interactive-primary)"><use href="#icon-check"></use></svg>
```

#### 2.5 레이아웃

- 아이콘 그리드: CSS Grid 또는 Flexbox로 구성
- 크기 변형과 컬러 변형은 각 아이콘 행 내에 가로로 나열하거나, 별도 데모 섹션으로 분리
- 프로토타입 전용 클래스: `proto-icon-grid`, `proto-icon-row`, `proto-icon-demo`, `proto-icon-size-variant`, `proto-icon-color-variant`

## 주의사항

1. **SVG 심볼 재사용**: 아이콘 SVG는 `<defs>` 내 `<symbol>`로 정의하고 `<use href="#icon-name">`으로 참조한다. 동일 아이콘을 여러 곳에서 사용할 때 마크업을 중복하지 않는다
2. **currentColor 활용**: 심볼 정의에서 `stroke="currentColor"`을 사용하여 CSS `color` 속성으로 컬러를 제어한다
3. **토큰 참조**: 컬러 변형에 반드시 `var()` 토큰을 사용한다 (직접 HEX 값 X)
4. **viewBox 유지**: 모든 심볼은 `viewBox="0 0 24 24"`를 유지한다. 크기 변경은 `<svg>`의 `width`/`height`로만 조절한다
5. **프로토타입 스타일 분리**: 모든 레이아웃 클래스에 `proto-` 접두사를 사용한다

## 검증 체크리스트

- [x] `<svg><defs>` 내에 10개 아이콘 심볼이 모두 정의되어 있다
- [x] 각 심볼의 ID가 `icon-` 접두사로 시작한다 (icon-check, icon-plus 등)
- [x] 섹션 2에 10개 아이콘이 그리드로 표시된다
- [x] 각 아이콘 옆에 영문 이름과 용도 텍스트가 표시된다
- [x] 10개 아이콘의 기본 크기가 24px로 표시된다
- [x] 크기 변형 데모에서 16px / 20px / 24px가 나란히 표시된다
- [x] 크기 변형이 아이콘 형태를 왜곡하지 않는다 (viewBox 유지)
- [x] 컬러 변형 데모에서 Primary / Secondary / Brand 3색이 표시된다
- [x] 컬러 변형이 `var()` 토큰을 사용한다
- [x] 모든 아이콘이 `<use href="#icon-name">`으로 참조되어 마크업 중복이 없다
- [x] `<svg style="display:none">` 블록이 화면에 표시되지 않는다
