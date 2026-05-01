# Task 01-03: 타이포그래피 + 간격 + 모션 시각화

## 작업 정보

- **Sub-PRD**: `sub-prd-01-feat-tokens-icons.md`
- **의존성**: `tasks-01-01` (HTML 구조 + 토큰 정의 완료 후 진행)
- **대상 파일**: `docs/client/prototype/index.html` — `<section id="tokens">` 내부
- **참조 파일**: `docs/client/design-system/tokens/typography.css`, `spacing.css`, `motion.css`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] 섹션 1.4: 타이포그래피 스케일 + Weight 샘플 렌더링
- [x] 섹션 1.5: 간격 시각화 (블록) + Border Radius 시각화
- [x] 섹션 1.6: 모션 Duration × Easing 애니메이션 데모

## 구현 세부사항

### 1. 섹션 1.4: 타이포그래피

#### 1.1 Type Scale 렌더링 (6단계)

각 스케일 단계를 실제 크기의 텍스트로 렌더링한다.

| 토큰명 | 크기 | Line Height | 용도 |
|--------|------|-------------|------|
| `--font-size-xs` | 0.6875rem (11px) | `--line-height-xs` 1rem (16px) | 캡션, 이월 횟수 |
| `--font-size-sm` | 0.8125rem (13px) | `--line-height-sm` 1.125rem (18px) | 보조 텍스트, 날짜 |
| `--font-size-md` | 0.9375rem (15px) | `--line-height-md` 1.375rem (22px) | 본문 기본, 투두 제목 |
| `--font-size-lg` | 1.0625rem (17px) | `--line-height-lg` 1.5rem (24px) | 섹션 헤더 |
| `--font-size-xl` | 1.25rem (20px) | `--line-height-xl` 1.75rem (28px) | 페이지 타이틀 |
| `--font-size-2xl` | 1.5rem (24px) | `--line-height-2xl` 2rem (32px) | 날짜 네비게이션 |

#### 1.2 샘플 텍스트

각 스케일 단계마다 3종의 샘플 텍스트를 렌더링한다:

- **Pretendard 한글**: "투두 리스트 서비스"
- **Pretendard 영문**: "Dopamine Planner"
- **JetBrains Mono**: "2026-05-01 (12:00)"

#### 1.3 표시 형식

```
xs (11px / 16px) — 캡션, 이월 횟수
  Regular(400)         Medium(500)          SemiBold(600)        Bold(700)
  투두 리스트 서비스     투두 리스트 서비스     투두 리스트 서비스     투두 리스트 서비스
  Dopamine Planner    Dopamine Planner    Dopamine Planner    Dopamine Planner
  2026-05-01 (12:00)   2026-05-01 (12:00)   2026-05-01 (12:00)   2026-05-01 (12:00)

sm (13px / 18px) — 보조 텍스트, 날짜
  ...
```

#### 1.4 Font Weight 비교 (4단계)

동일 텍스트를 4가지 Weight로 가로 나열하여 비교한다.

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--font-weight-regular` | 400 | 본문 |
| `--font-weight-medium` | 500 | 강조 텍스트, 카테고리명 |
| `--font-weight-semibold` | 600 | 섹션 헤더, 탭 활성 |
| `--font-weight-bold` | 700 | 날짜, 페이지 타이틀 |

#### 1.5 레이아웃

- 스케일 단계별로 행을 구성
- 각 행 내에서 Weight 4개를 가로 나열 (flexbox 또는 grid)
- 행 상단에 토큰명, 크기(px), Line Height, 용도를 라벨로 표시
- JetBrains Mono 샘플은 `font-family: var(--font-family-mono)` 적용
- 프로토타입 전용 클래스: `proto-type-scale`, `proto-type-row`, `proto-type-sample`, `proto-type-label`

### 2. 섹션 1.5: 간격 & Border Radius

#### 2.1 Spacing Scale 시각화 (7단계)

회색 블록으로 각 간격의 실제 크기를 시각화한다.

| 토큰명 | 값 | px | 용도 |
|--------|-----|-----|------|
| `--spacing-1` | 0.25rem | 4px | 아이콘과 텍스트 사이 |
| `--spacing-2` | 0.5rem | 8px | 요소 내부 여백 |
| `--spacing-3` | 0.75rem | 12px | 리스트 아이템 간격 |
| `--spacing-4` | 1rem | 16px | 카드 내부 패딩 |
| `--spacing-5` | 1.25rem | 20px | 섹션 간 간격 |
| `--spacing-6` | 1.5rem | 24px | 화면 좌우 패딩 |
| `--spacing-8` | 2rem | 32px | 큰 섹션 간격 |

#### 2.2 Spacing 표시 형식

```
--spacing-1  4px   ■          아이콘과 텍스트 사이
--spacing-2  8px   ■■         요소 내부 여백
--spacing-3  12px  ■■■        리스트 아이템 간격
--spacing-4  16px  ■■■■       카드 내부 패딩
--spacing-5  20px  ■■■■■      섹션 간 간격
--spacing-6  24px  ■■■■■■     화면 좌우 패딩
--spacing-8  32px  ■■■■■■■■   큰 섹션 간격
```

- 높이 고정(예: 24px), 너비가 간격값에 비례
- 블록 색상: `var(--color-purple-500)` 또는 `var(--color-bg-brand-subtle)`
- 우측에 토큰명, px 값, 용도 표시
- 프로토타입 전용 클래스: `proto-spacing-scale`, `proto-spacing-row`, `proto-spacing-block`

#### 2.3 Border Radius 시각화 (4단계)

동일 크기 박스에 각 radius를 적용하여 나열한다.

| 토큰명 | 값 | px | 용도 |
|--------|-----|-----|------|
| `--radius-sm` | 0.25rem | 4px | 태그, 뱃지 |
| `--radius-md` | 0.5rem | 8px | 카드, 입력 필드 |
| `--radius-lg` | 0.75rem | 12px | 모달, 바텀 시트 |
| `--radius-full` | 9999px | — | 원형 (FAB, 아바타) |

#### 2.4 Border Radius 표시 형식

```
┌──────┐  ┌──────┐  ╭──────╮  ●
│ sm   │  │ md   │  │ lg   │  full
│ 4px  │  │ 8px  │  │ 12px │  9999px
└──────┘  └──────┘  ╰──────╯
```

- 동일 크기 정사각형 박스 (예: 80px × 80px)
- 배경색: `var(--color-bg-brand-subtle)`
- 보더: `2px solid var(--color-interactive-primary)`
- 박스 아래에 토큰명, 값, 용도 텍스트
- 프로토타입 전용 클래스: `proto-radius-scale`, `proto-radius-item`

### 3. 섹션 1.6: 모션

#### 3.1 Duration × Easing 애니메이션 데모

3종 Duration × 3종 Easing = 9개 조합을 시각화한다.

**Duration (3단계):**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--duration-fast` | 100ms | 체크박스 토글, 호버 |
| `--duration-normal` | 200ms | 버튼 상태 전환, 페이드 |
| `--duration-slow` | 300ms | 바텀 시트 진입, 페이지 전환 |

**Easing (3종):**

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 범용 |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 요소 진입 |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 요소 퇴장 |

#### 3.2 표시 형식

9개 조합을 3×3 그리드로 배치한다.

```
              default           enter             exit
fast (100ms)  [■ ──────→]       [■ ──────→]       [■ ──────→]
normal(200ms) [■ ──────→]       [■ ──────→]       [■ ──────→]
slow (300ms)  [■ ──────→]       [■ ──────→]       [■ ──────→]
```

#### 3.3 인터랙션

- **호버 시 애니메이션 재생**: CSS `transition`으로 구현
- 각 셀에 정사각형 박스가 좌측에 위치
- 호버하면 박스가 우측 끝으로 이동 (transform: translateX)
- 마우스를 떼면 원래 위치로 복귀
- transition 속성: `transition: transform [duration] [easing]`

#### 3.4 레이아웃

- 행 라벨: Duration 토큰명 + 값
- 열 라벨: Easing 토큰명
- 각 셀: 트랙 영역(배경 `var(--color-bg-surface)`) + 이동 박스(배경 `var(--color-interactive-primary)`)
- 프로토타입 전용 클래스: `proto-motion-grid`, `proto-motion-cell`, `proto-motion-track`, `proto-motion-box`

## 주의사항

1. **토큰 참조**: 모든 스타일 속성에 `var()` 토큰을 사용한다 (직접 px/ms 값 X)
2. **폰트 적용**: Pretendard 샘플은 `var(--font-family-sans)`, JetBrains Mono 샘플은 `var(--font-family-mono)`를 사용한다
3. **모션은 CSS만으로 구현**: JavaScript를 사용하지 않는다. CSS `transition` + `:hover` 의사 클래스로 구현한다
4. **프로토타입 스타일 분리**: 모든 레이아웃 클래스에 `proto-` 접두사를 사용한다

## 검증 체크리스트

- [x] 타이포그래피 6단계(xs~2xl)가 실제 크기로 렌더링된다
- [x] 각 스케일 단계에서 4개 Weight(400/500/600/700)가 가로로 나열되어 비교 가능하다
- [x] Pretendard 폰트로 한글 샘플 "투두 리스트 서비스"가 정상 표시된다
- [x] Pretendard 폰트로 영문 샘플 "Dopamine Planner"가 정상 표시된다
- [x] JetBrains Mono 폰트로 숫자 샘플 "2026-05-01 (12:00)"가 정상 표시된다
- [x] Spacing 7단계가 시각적 블록으로 크기 차이를 확인할 수 있다
- [x] 각 Spacing 블록 옆에 토큰명, px 값, 용도가 표시된다
- [x] Border Radius 4단계(sm/md/lg/full)가 동일 크기 박스에 적용되어 시각적으로 구분된다
- [x] 모션 9개 조합(3 Duration × 3 Easing)이 그리드로 표시된다
- [x] 각 모션 셀을 호버하면 박스가 좌→우로 이동하는 애니메이션이 재생된다
- [x] 마우스를 떼면 박스가 원래 위치로 복귀한다
- [x] 모든 스타일 속성이 `var()` 토큰을 사용한다
