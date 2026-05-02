# SUB-PRD: `디자인 토큰 & 아이콘 시각화`

## 작업 정보

- **작업명**: `디자인 토큰 & 아이콘 시각화`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-01
- **종료일**: 2026-05-02
- **최신 업데이트**: 2026-05-02
- **상태**: 완료

## 배경 및 목적

Dopamine Planner 서비스의 디자인 토큰(컬러, 타이포그래피, 간격, 모션)과 아이콘 시스템을 독립 HTML 파일의 **섹션 1~2**로 시각화한다. 이 섹션은 프로토타입의 기반이 되며, Sub-02(컴포넌트)와 Sub-03(페이지)에서 동일한 토큰과 스타일을 재사용한다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS Custom Properties (토큰 직접 정의) |
| 폰트 | Pretendard Variable (CDN), JetBrains Mono (CDN) |
| 아이콘 | Lucide Icons (인라인 SVG) |
| 인터랙션 | 없음 (정적 표시) |

## 핵심 요구 사항

### 1. HTML 파일 기본 구조

독립 실행 가능한 단일 HTML 파일을 생성한다. 이 파일은 Sub-02, Sub-03에서 계속 확장된다.

- 파일 위치: `docs/base/prototype/index.html`
- CDN으로 Pretendard Variable, JetBrains Mono 폰트 로드
- `<style>` 내에 모든 CSS Custom Properties 토큰 정의
- 상단 앵커 네비게이션(목차) 배치 — 전체 섹션(1~4) 목차를 미리 구성하되, 섹션 3~4 링크는 비활성 상태로 둔다

### 2. 섹션 1: 디자인 토큰

#### 2.1 컬러 팔레트 (Primitive Colors)

3개 팔레트 그룹을 컬러 스워치 그리드로 표시한다.

**Main — Purple (5단계)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--color-purple-100` | `#D7AEF2` | 배경 하이라이트, 비활성 상태 |
| `--color-purple-200` | `#C599F2` | 호버 상태 |
| `--color-purple-300` | `#B87EF2` | 활성 상태 |
| `--color-purple-500` | `#9755D9` | Primary 브랜드색 |
| `--color-purple-700` | `#8A63BF` | 눌림 상태 |

**Sub 01 — Periwinkle (5단계)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--color-periwinkle-100` | `#D2D3FF` | 연한 배경, 태그 |
| `--color-periwinkle-200` | `#BFCEFF` | — |
| `--color-periwinkle-300` | `#BAC3FF` | — |
| `--color-periwinkle-400` | `#9DABE8` | — |
| `--color-periwinkle-500` | `#9DA3E8` | Secondary 색상 |

**Sub 02 — Neutral + Grounding (5단계)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--color-indigo-600` | `#7578BF` | 보조 텍스트/아이콘 |
| `--color-lavender-gray-300` | `#B8BAD9` | 보더, 디바이더 |
| `--color-gray-50` | `#F2F2F2` | Surface 배경 |
| `--color-white` | `#FFFFFF` | 기본 배경 |
| `--color-black-900` | `#000000` | Grounding (본문 텍스트) |

**Status Colors (4색)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--color-red-500` | `#EF4444` | Error |
| `--color-green-500` | `#22C55E` | Success |
| `--color-yellow-500` | `#F59E0B` | Warning |
| `--color-blue-500` | `#3B82F6` | Info |

**스워치 표시 형식:**
- 각 스워치: 정사각형 컬러 블록 + 토큰명 + HEX 값 + 용도 텍스트
- 그룹별로 가로 나열 (flexbox)
- Primary(`--color-purple-500`)와 Secondary(`--color-periwinkle-500`) 스워치에 별표(★) 표시

#### 2.2 시맨틱 컬러 (Semantic Tokens)

역할 기반 토큰을 카테고리별로 표시한다. 각 토큰은 참조하는 Primitive 값을 함께 보여준다.

**Text**

| 토큰명 | 참조 | 실제 값 |
|--------|------|---------|
| `--color-text-primary` | — | `#000000` |
| `--color-text-secondary` | `--color-indigo-600` | `#7578BF` |
| `--color-text-tertiary` | `--color-lavender-gray-300` | `#B8BAD9` |
| `--color-text-inverse` | — | `#FFFFFF` |
| `--color-text-brand` | `--color-purple-500` | `#9755D9` |

**Background**

| 토큰명 | 참조 | 실제 값 |
|--------|------|---------|
| `--color-bg-base` | `--color-white` | `#FFFFFF` |
| `--color-bg-surface` | `--color-gray-50` | `#F2F2F2` |
| `--color-bg-elevated` | `--color-white` | `#FFFFFF` |
| `--color-bg-brand-subtle` | `--color-purple-100` | `#D7AEF2` |
| `--color-bg-secondary-subtle` | `--color-periwinkle-100` | `#D2D3FF` |

**Interactive (Primary)**

| 토큰명 | 참조 | 실제 값 |
|--------|------|---------|
| `--color-interactive-primary` | `--color-purple-500` | `#9755D9` |
| `--color-interactive-primary-hover` | `--color-purple-300` | `#B87EF2` |
| `--color-interactive-primary-active` | `--color-purple-700` | `#8A63BF` |
| `--color-interactive-primary-disabled` | `--color-purple-100` | `#D7AEF2` |

**Interactive (Secondary)**

| 토큰명 | 참조 | 실제 값 |
|--------|------|---------|
| `--color-interactive-secondary` | `--color-periwinkle-500` | `#9DA3E8` |
| `--color-interactive-secondary-hover` | `--color-periwinkle-300` | `#BAC3FF` |
| `--color-interactive-secondary-active` | `--color-periwinkle-400` | `#9DABE8` |

**Border**

| 토큰명 | 참조 | 실제 값 |
|--------|------|---------|
| `--color-border-default` | `--color-lavender-gray-300` | `#B8BAD9` |
| `--color-border-focus` | `--color-purple-500` | `#9755D9` |
| `--color-border-subtle` | `--color-gray-50` | `#F2F2F2` |

**Status**

| 토큰명 | 실제 값 |
|--------|---------|
| `--color-status-success` | `#22C55E` |
| `--color-status-error` | `#EF4444` |
| `--color-status-warning` | `#F59E0B` |
| `--color-status-info` | `#3B82F6` |

**시맨틱 토큰 표시 형식:**
- 좌측: 컬러 블록 + 토큰명
- 우측: 참조 토큰 → 실제 HEX 값 (화살표로 매핑 표시)
- 카테고리별 섹션 구분 (Text, Background, Interactive, Border, Status)

#### 2.3 컴포넌트 컬러 (Component Tokens)

컴포넌트별 전용 토큰을 그룹으로 표시한다.

**표시할 컴포넌트 토큰 그룹:**
- Button (primary-bg, primary-text, hover, active, disabled)
- Tab Bar (bg, active, inactive)
- Todo Item (bg, border, completed-text, checkbox-checked, checkbox-unchecked)
- Category Badge (bg, text)
- FAB (bg, text, shadow)
- Section Header (done-text, progress-text)

**표시 형식:**
- 컴포넌트 이름을 헤더로
- 해당 토큰들을 컬러 블록 + 토큰명 + 참조 체인으로 나열

#### 2.4 타이포그래피

**Type Scale (6단계)**

| 토큰명 | 크기 | Line Height | 용도 |
|--------|------|-------------|------|
| `--font-size-xs` | 0.6875rem (11px) | 1rem (16px) | 캡션, 이월 횟수 |
| `--font-size-sm` | 0.8125rem (13px) | 1.125rem (18px) | 보조 텍스트, 날짜 |
| `--font-size-md` | 0.9375rem (15px) | 1.375rem (22px) | 본문 기본, 투두 제목 |
| `--font-size-lg` | 1.0625rem (17px) | 1.5rem (24px) | 섹션 헤더 |
| `--font-size-xl` | 1.25rem (20px) | 1.75rem (28px) | 페이지 타이틀 |
| `--font-size-2xl` | 1.5rem (24px) | 2rem (32px) | 날짜 네비게이션 |

**Font Weight (4단계)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--font-weight-regular` | 400 | 본문 |
| `--font-weight-medium` | 500 | 강조 텍스트, 카테고리명 |
| `--font-weight-semibold` | 600 | 섹션 헤더, 탭 활성 |
| `--font-weight-bold` | 700 | 날짜, 페이지 타이틀 |

**표시 형식:**
- 각 스케일 단계를 실제 크기의 텍스트로 렌더링
- Pretendard: 한글 샘플 "도파민 플래너 서비스" + 영문 샘플 "Dopamine Planner Service"
- JetBrains Mono: 숫자/코드 샘플 "2026-05-01 (12:00)"
- Weight별로 동일 텍스트를 가로 나열하여 비교

#### 2.5 간격 & 레이아웃

**Spacing Scale (7단계)**

| 토큰명 | 값 | px | 용도 |
|--------|-----|-----|------|
| `--spacing-1` | 0.25rem | 4px | 아이콘과 텍스트 사이 |
| `--spacing-2` | 0.5rem | 8px | 요소 내부 여백 |
| `--spacing-3` | 0.75rem | 12px | 리스트 아이템 간격 |
| `--spacing-4` | 1rem | 16px | 카드 내부 패딩 |
| `--spacing-5` | 1.25rem | 20px | 섹션 간 간격 |
| `--spacing-6` | 1.5rem | 24px | 화면 좌우 패딩 |
| `--spacing-8` | 2rem | 32px | 큰 섹션 간격 |

**Border Radius (4단계)**

| 토큰명 | 값 | px | 용도 |
|--------|-----|-----|------|
| `--radius-sm` | 0.25rem | 4px | 태그, 뱃지 |
| `--radius-md` | 0.5rem | 8px | 카드, 입력 필드 |
| `--radius-lg` | 0.75rem | 12px | 모달, 바텀 시트 |
| `--radius-full` | 9999px | — | 원형 (FAB, 아바타) |

**표시 형식:**
- Spacing: 회색 블록으로 각 간격의 실제 크기를 시각화 (높이 고정, 너비가 간격값)
- Border Radius: 동일 크기 박스에 각 radius를 적용하여 나열

#### 2.6 모션

**Duration (3단계)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--duration-fast` | 100ms | 체크박스 토글, 호버 |
| `--duration-normal` | 200ms | 버튼 상태 전환, 페이드 |
| `--duration-slow` | 300ms | 바텀 시트 진입, 페이지 전환 |

**Easing (3종)**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 범용 |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 요소 진입 |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 요소 퇴장 |

**표시 형식:**
- 각 Duration × Easing 조합을 박스의 좌→우 이동 애니메이션으로 시각화
- 호버 시 애니메이션 재생 (CSS transition으로 구현)

### 3. 섹션 2: 아이콘 시스템

Lucide Icons 10개를 인라인 SVG로 포함한다.

**아이콘 목록:**

| 아이콘명 | Lucide 이름 | 용도 |
|---------|-------------|------|
| Check | `check` | 투두 완료 |
| Plus | `plus` | 투두/항목 추가 (FAB) |
| ChevronLeft | `chevron-left` | 날짜 이전 |
| ChevronRight | `chevron-right` | 날짜 다음 |
| Home | `home` | Life 탭 |
| Briefcase | `briefcase` | Work 탭 |
| Settings | `settings` | 설정 탭 |
| Trash2 | `trash-2` | 삭제 |
| Edit3 | `edit-3` | 수정 |
| AlertTriangle | `alert-triangle` | 우선순위 High |

**표시 형식:**
- SVG를 `<defs>` + `<use>`로 심볼 재사용
- 그리드 레이아웃: 아이콘(24px) + 이름 + 용도 텍스트
- 크기 변형 데모: 16px / 20px / 24px 나란히 표시
- 컬러 변형 데모: `--color-text-primary`, `--color-text-secondary`, `--color-interactive-primary` 적용

## 핵심 구현 로직

### HTML 파일 골격

```
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dopamine Planner — Design System Prototype</title>
  <!-- Pretendard Variable CDN -->
  <!-- JetBrains Mono CDN -->
  <style>
    /* === Primitive Tokens === */
    /* === Semantic Tokens === */
    /* === Component Tokens === */
    /* === Typography Tokens === */
    /* === Spacing Tokens === */
    /* === Motion Tokens === */
    /* === 프로토타입 레이아웃 스타일 === */
  </style>
</head>
<body>
  <nav><!-- 앵커 네비게이션 --></nav>
  <main>
    <section id="tokens"><!-- 섹션 1: 디자인 토큰 --></section>
    <section id="icons"><!-- 섹션 2: 아이콘 시스템 --></section>
    <!-- 섹션 3, 4는 Sub-02, Sub-03에서 추가 -->
  </main>
  <svg style="display:none">
    <defs><!-- 아이콘 심볼 정의 --></defs>
  </svg>
</body>
</html>
```

### 토큰 정의 방식

`<style>` 내에 `:root`로 모든 토큰을 정의한다. `docs/base/design-system/tokens/*.css`의 값을 그대로 옮긴다.

```css
:root {
  /* Primitive */
  --color-purple-100: #D7AEF2;
  /* ... */
  
  /* Semantic (Primitive 참조) */
  --color-text-primary: var(--color-black-900);
  /* ... */
  
  /* Component (Semantic 참조) */
  --button-primary-bg: var(--color-interactive-primary);
  /* ... */
}
```

### 프로토타입 자체 스타일

프로토타입 레이아웃용 스타일은 토큰과 분리하여 별도 접두사(`proto-`)를 사용한다. 토큰 검증 대상과 프로토타입 UI 스타일을 혼동하지 않기 위함이다.

## 구현 시 주의사항

1. **토큰 값 정확성**: `docs/base/design-system/tokens/*.css`에 정의된 값과 정확히 일치해야 한다. 값을 임의로 변경하지 않는다
2. **계층 참조 유지**: Semantic 토큰은 반드시 Primitive 토큰의 `var()` 참조를 사용한다. Component 토큰은 Semantic 토큰을 참조한다. 직접 HEX 값을 쓰지 않는다
3. **SVG 심볼 재사용**: 아이콘 SVG는 `<defs>` 내 `<symbol>`로 정의하고 `<use href="#icon-name">`으로 참조한다. 동일 아이콘을 여러 곳에서 사용할 때 마크업 중복을 방지한다
4. **프로토타입 스타일 분리**: 프로토타입 자체의 레이아웃 스타일(섹션 배경, 그리드 등)은 `proto-` 접두사 클래스를 사용하여 디자인 시스템 토큰/스타일과 구분한다
5. **폰트 폴백**: CDN 로딩 실패를 대비하여 `system-ui, -apple-system, sans-serif` 폴백을 지정한다
6. **WCAG 대비율 표시**: 주요 컬러 스워치(Text on Background 조합)에 대비율 수치를 텍스트로 표시한다. 예: `Purple 500 on White: 4.6:1 ✓`

## 작업

- [x] `docs/base/prototype/` 디렉토리 생성
- [x] `index.html` 기본 구조 작성 (DOCTYPE, head, body, nav)
- [x] Pretendard Variable, JetBrains Mono CDN 링크 추가
- [x] `:root`에 Primitive Color Tokens 정의
- [x] `:root`에 Semantic Color Tokens 정의 (var 참조)
- [x] `:root`에 Component Color Tokens 정의 (var 참조)
- [x] `:root`에 Typography Tokens 정의
- [x] `:root`에 Spacing Tokens 정의
- [x] `:root`에 Motion Tokens 정의
- [x] 상단 앵커 네비게이션 구현 (섹션 1~4 목차)
- [x] 섹션 1.1: 컬러 팔레트 스워치 그리드 (Purple/Periwinkle/Neutral/Status)
- [x] 섹션 1.2: 시맨틱 컬러 매핑 표시 (토큰 → 참조 → HEX)
- [x] 섹션 1.3: 컴포넌트 컬러 그룹 표시
- [x] 섹션 1.4: 타이포그래피 스케일 + Weight 샘플 렌더링
- [x] 섹션 1.5: 간격 시각화 (블록) + Border Radius 시각화
- [x] 섹션 1.6: 모션 Duration × Easing 애니메이션 데모
- [x] SVG `<defs>` 내 10개 Lucide 아이콘 심볼 정의
- [x] 섹션 2: 아이콘 그리드 (이름 + 용도 + 크기 변형 + 컬러 변형)
- [x] 주요 컬러 조합에 WCAG 대비율 표시

## 검증 기준

- [ ] `index.html`을 브라우저에서 더블 클릭하여 정상 렌더링 확인
- [ ] Primitive 토큰 19개 컬러가 모두 스워치로 표시됨
- [ ] Semantic 토큰이 Primitive 참조 체인과 함께 표시됨
- [ ] Component 토큰이 컴포넌트별 그룹으로 표시됨
- [ ] 타이포그래피 6단계 × 4 Weight가 실제 크기로 렌더링됨
- [ ] Pretendard 폰트로 한글이 정상 표시됨
- [ ] JetBrains Mono 폰트로 숫자/코드가 정상 표시됨
- [ ] Spacing 7단계가 시각적 블록으로 크기 차이를 확인할 수 있음
- [ ] Border Radius 4단계가 시각적으로 구분됨
- [ ] 모션 3종 Duration × 3종 Easing 조합이 호버 시 애니메이션으로 확인 가능
- [ ] 10개 Lucide 아이콘이 24px 크기로 표시됨
- [ ] 아이콘 크기 변형(16/20/24px)이 나란히 표시됨
- [ ] 아이콘 컬러 변형(primary/secondary/brand)이 표시됨
- [ ] 앵커 네비게이션 클릭 시 해당 섹션으로 스크롤됨

---

*이 문서는 디자인 시스템 프로토타입 프로젝트의 상세 구현 가이드입니다. 전체적인 프로젝트 내용은 `main-prd-design-prototype.md` 파일을 참조하세요.*
