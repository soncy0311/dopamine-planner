# Dopamine Planner Design System

> Dopamine Planner (Todo List) 서비스의 웹(Next.js SPA)과 모바일(Expo / RN 네이티브) 환경에서 **일관된 UI/UX**를 보장하기 위한 디자인 시스템 **규칙·스펙** 모음.

---

## 이 문서의 역할과 한계

본 디렉토리는 디자인 시스템의 **규칙·스펙**만 정의한다.

- 어떤 토큰이 존재해야 하는가
- 어떤 네이밍 규칙을 따라야 하는가
- 어떤 색·간격·접근성 기준을 지켜야 하는가

실제 CSS 변수 정의, 컴포넌트 React/RN 코드, Tailwind 설정 등 **구현은 코드 레포에서 본 문서를 참조하여 작성**한다.

| 항목 | 구현 위치 (코드 레포) |
|---|---|
| Tailwind 토큰 매핑 | `packages/config/tailwind.config.js` (Sub-02 산출물) |
| 웹 글로벌 스타일 | `apps/web/src/app/globals.css` |
| 모바일 글로벌 스타일 | `apps/mobile/src/global.css` (Nativewind v4) |
| 공통 컴포넌트 (web) | `packages/ui/src/components/` |
| 모바일 컴포넌트 (RN) | `apps/mobile/src/components/` |

---

## 기술 스택

| 영역 | 선택 | 근거 |
|------|------|------|
| 스타일링 (web) | Tailwind CSS v3 + shadcn/ui | Zero-runtime, 코드 소유권 모델 |
| 스타일링 (mobile) | Nativewind v4 | web 과 동일 className 으로 RN 스타일 매핑 |
| 디자인 토큰 매핑 | `packages/config/tailwind.config.js` (공유) | web/mobile 단일 source of truth |
| 아이콘 | Lucide Icons (24px 기본) | 경량, 트리셰이킹, RN 호환 |
| 폰트 | Pretendard Variable (한글) + JetBrains Mono (코드) | 가변 폰트, 한글 최적화 |
| UI 컴포넌트 (web) | shadcn/ui + Radix Primitives | WAI-ARIA 접근성 내장 |

---

## 문서 구조

```
docs/base/design-system/
├── README.md              ← 개요 (이 파일)
├── color-system.md        ← Color Story · 60-30-10 · 팔레트 · 대비 검증
├── tokens.md              ← 토큰 3계층 네이밍 + Primitive/Semantic/Component 목록
├── typography.md          ← 폰트 · 타입 스케일 · 가중치
├── spacing.md             ← 간격 · 반경 · 브레이크포인트
├── motion.md              ← duration · easing · 모션 정책
├── components.md          ← 컴포넌트 명세 (Atomic Design 4단계)
└── accessibility.md       ← WCAG · ARIA · 키보드 · 스크린 리더
```

| 파일 | 책임 |
|---|---|
| `color-system.md` | 브랜드 서사 → 팔레트 도출 근거 + WCAG 검증 |
| `tokens.md` | 모든 토큰의 네이밍 규칙·존재 목록·참조 체인 |
| `typography.md` | 폰트 스택, 크기/줄높이/가중치 스케일 |
| `spacing.md` | 4px base 간격, radius, 브레이크포인트 |
| `motion.md` | duration / easing / `prefers-reduced-motion` |
| `components.md` | Atoms → Templates 의 명세 |
| `accessibility.md` | WCAG AA 기준 + 컴포넌트별 체크리스트 |

---

## 토큰 계층 원칙

```
Primitive  →  Semantic  →  Component
(값 기반)     (역할 기반)    (컴포넌트 한정)
```

| 계층 | 위치 (스펙) | 예시 | 용도 |
|------|------|------|------|
| **Primitive** | `tokens.md` § Primitive | `color-purple-500: #9755D9` | 팔레트 원본값. 직접 사용 금지 |
| **Semantic** | `tokens.md` § Semantic | `color-interactive-primary → color-purple-500` | UI 역할 매핑. 다크 모드 전환 포인트 |
| **Component** | `tokens.md` § Component | `button-primary-bg → color-interactive-primary` | 컴포넌트별 세부 조정. Semantic 만 참조 |

**계층 위반 금지 규칙**:
- Semantic 의 참조 컬럼은 반드시 Primitive 토큰
- Component 의 참조 컬럼은 반드시 Semantic 토큰 (Primitive 직접 참조 금지)

---

## 컬러 시스템 — 60-30-10 규칙

| 비율 | 역할 | 색상 | 적용 영역 |
|------|------|------|-----------|
| **60%** | Dominant | `color-white` / `color-gray-50` | 앱 배경, 카드 배경, 여백 |
| **30%** | Subdominant | Periwinkle 100~500 + Lavender Gray 300 | 섹션 헤더, 카드 보더, 태그, 비활성 요소 |
| **10%** | Accent | Purple 500 (`#9755D9`) | CTA 버튼, 체크박스, FAB, 포커스 링 |
| — | Grounding | Off-black `#000000` (브랜드 Hue 미세 섞음 검토) | 본문 텍스트, 주요 아이콘 |

> 자세한 도출 과정과 WCAG 검증은 `color-system.md` 참조.

---

## 반응형 기준

| 구분 | 기준 | 레이아웃 |
|------|------|----------|
| **Mobile** (기본) | ~430px | 단일 컬럼, 하단 탭 바 |
| **Tablet** | 431–768px | 단일 컬럼, 여백 확대 |
| **Desktop** | 769px~ | 최대 너비 480px 중앙 정렬 |

> 모바일은 RN 네이티브 — 브레이크포인트 대신 `Dimensions` API 또는 Nativewind responsive prefix 사용.

---

## 구현 우선순위

| 순서 | 항목 | 산출물 |
|------|------|--------|
| **P0** | 토큰을 `packages/config/tailwind.config.js` 로 매핑 | Sub-02 (`stack-pivot`) |
| **P0** | 타이포그래피 + Pretendard CDN 로딩 | `apps/web/src/app/layout.tsx` 폰트 셋업 |
| **P1** | Atoms 컴포넌트 (Button, Checkbox, Badge, Icon, Divider) | `packages/ui/src/components/` |
| **P1** | Molecules 컴포넌트 (TodoItem, SectionHeader, DateNavigator, TabBarItem) | `packages/ui/src/components/` |
| **P2** | Organisms 컴포넌트 (TodoSection, BottomTabBar, TodoCreateSheet) | `packages/ui/src/components/` |
| **P2** | Storybook 카탈로그 | (후속) |
| **P3** | 다크 모드 (Semantic 재매핑) | `tokens.md` Semantic 표에 Dark 컬럼 추가 후 코드 반영 |
| **P3** | 모션/스와이프 인터랙션 | RN: `react-native-reanimated`, web: `framer-motion` 검토 |

---

## 관련 문서

- [Color System (서사 + 팔레트 + 대비)](./color-system.md)
- [Tokens (3계층 명세)](./tokens.md)
- [Typography](./typography.md)
- [Spacing](./spacing.md)
- [Motion](./motion.md)
- [Components](./components.md)
- [Accessibility](./accessibility.md)
