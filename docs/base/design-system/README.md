# Todo List Design System

> Todo List 서비스의 웹(Next.js)과 모바일(WebView) 환경에서 **일관된 UI/UX**를 보장하기 위한 디자인 시스템.

---

## 기술 스택

| 영역 | 선택 | 근거 |
|------|------|------|
| 스타일링 | Tailwind CSS v4 | Zero-runtime, 번들 최소(3-5KB gzipped) |
| UI 컴포넌트 | shadcn/ui + Radix Primitives | 코드 소유권 모델, WAI-ARIA 접근성 내장 |
| 디자인 토큰 | CSS Custom Properties | 테마 전환 용이, 런타임 오버헤드 없음 |
| 아이콘 | Lucide Icons (24px 기본) | 경량, 트리셰이킹, React 공식 지원 |
| 폰트 | Pretendard (한글) + JetBrains Mono (코드) | 가변 폰트, 한글 최적화 |

---

## 디렉토리 구조

```
docs/base/design-system/
├── README.md              ← 이 파일
├── tokens/
│   ├── index.css          ← 토큰 진입점 (모든 토큰 import)
│   ├── colors.css         ← Primitive 컬러 토큰
│   ├── semantic.css       ← Semantic 컬러 토큰 (Light Theme)
│   ├── components.css     ← Component 컬러 토큰
│   ├── typography.css     ← 타이포그래피 토큰
│   ├── spacing.css        ← 간격·레이아웃 토큰
│   └── motion.css         ← 모션·트랜지션 토큰
├── components.md          ← 컴포넌트 명세 (Atoms → Templates)
└── accessibility.md       ← 접근성 가이드라인
```

> 실제 구현은 `packages/ui/src/` 에 위치하며, 이 문서는 **설계 명세** 역할을 한다.

---

## 토큰 계층 구조

```
Primitive  →  Semantic  →  Component
(값 기반)     (역할 기반)    (컴포넌트 한정)
```

| 계층 | 파일 | 예시 | 용도 |
|------|------|------|------|
| **Primitive** | `colors.css` | `--color-purple-500: #9755D9` | 팔레트 원본값 등록 |
| **Semantic** | `semantic.css` | `--color-interactive-primary: var(--color-purple-500)` | UI 역할 매핑, 테마 전환 포인트 |
| **Component** | `components.css` | `--button-primary-bg: var(--color-interactive-primary)` | 컴포넌트별 세부 조정 |

---

## 컬러 시스템 — 60-30-10 규칙

| 비율 | 역할 | 색상 | 적용 영역 |
|------|------|------|-----------|
| **60%** | Dominant | `#FFFFFF` / `#F2F2F2` | 앱 배경, 카드 배경, 여백 |
| **30%** | Subdominant | Periwinkle + Lavender Gray | 섹션 헤더, 카드 보더, 태그, 비활성 요소 |
| **10%** | Accent | Purple 500 `#9755D9` | CTA 버튼, 체크박스, FAB, 포커스 링 |
| — | Grounding | `#000000` | 본문 텍스트, 주요 아이콘 |

---

## 반응형 기준

| 구분 | 기준 | 레이아웃 |
|------|------|----------|
| **Mobile** (기본) | ~430px | 단일 컬럼, 하단 탭 바 |
| **Tablet** | 431–768px | 단일 컬럼, 여백 확대 |
| **Desktop** | 769px~ | 최대 너비 480px 중앙 정렬 |

---

## 구현 우선순위

| 순서 | 항목 | 산출물 |
|------|------|--------|
| **P0** | 디자인 토큰 정의 | `tokens/*.css`, Tailwind config 확장 |
| **P0** | 타이포그래피 + Pretendard 설정 | 폰트 로딩, 글로벌 스타일 |
| **P1** | Atoms 컴포넌트 | Button, Checkbox, Badge, Icon, Divider |
| **P1** | Molecules 컴포넌트 | TodoItem, SectionHeader, DateNavigator, TabBarItem |
| **P2** | Organisms 컴포넌트 | TodoSection, BottomTabBar, TodoCreateSheet |
| **P2** | Storybook 설정 | 컴포넌트 카탈로그 + 문서화 |
| **P3** | 다크 모드 | Semantic 토큰 재매핑 |
| **P3** | 모션/애니메이션 | 트랜지션, 스와이프, 바텀 시트 |

---

## 관련 문서

- [컴포넌트 명세](./components.md)
- [접근성 가이드라인](./accessibility.md)
