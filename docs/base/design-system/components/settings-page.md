# Settings Page

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·간격·문구는 합류 후 갱신될 수 있다.**

설정 페이지의 page-level 레이아웃 명세. prototype 정합 — 분류·Epic 직접 관리 UI 는 의도적으로 제거되며, 분류 생성은 `EpicFormModal` 의 `CategoryComboboxCreate`, 분류 삭제는 DB trigger 로 위임된다 (Sub-09).

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Templates
- 구현체 (web): `apps/web/src/app/(main)/settings/page.tsx`
- 구현체 (mobile RN): `apps/mobile/src/app/(main)/settings/`

---

## 1. 사용 위치

- web: `apps/web/src/app/(main)/settings/page.tsx`
- mobile: `apps/mobile/src/app/(main)/settings/`

prototype 인용: `docs/base/prototype/pages/page-prototypes.html` L822-880.

## 2. 분류

Template (page-level). 단일 페이지 레이아웃 — 단독 라우트 1개.

## 3. 섹션 구조 (4블록)

| 블록 | 내용 | 비고 |
|---|---|---|
| 프로필 | 이름 · 이메일 · provider (Supabase auth user 정보) | 카드형 — 상단 |
| 계정 | 소셜 계정 연동 (placeholder), 알림 설정 (placeholder) | 잠정 placeholder — 디자인 결정자 합류 후 갱신 |
| 앱 | 테마 등 (placeholder) | 잠정 placeholder |
| 정보 | 버전 정보, 로그아웃 | 로그아웃은 destructive |

## 4. 레이아웃

- 단일 컬럼, 카드형. 각 섹션이 하나의 카드(`SettingsSection`) 로 분리
- 섹션 간 간격: `spacing-6` (24px)
- 카드 내부 padding: `spacing-4` (16px)
- 카드 radius: `radius-md`
- 카드 background: `color-bg-elevated`
- 페이지 최대 너비: `layout-max-width` (좁은 단일 컬럼 — 가독성 우선)
- 섹션 제목과 카드 본문 사이 간격: `spacing-3` (12px)

## 5. 재사용 컴포넌트 후보

| 컴포넌트 | 역할 |
|---|---|
| `SettingsSection` | 섹션 카드 wrapper (제목 + children) |
| `SettingsRow` | 카드 내부 row — label + value / action 버튼 / toggle |

본 sub 에서 패키지 추출 여부는 사용 패턴 확인 후 결정. 잠정 — 우선 페이지 내 로컬 컴포넌트로 두고, 패턴 누적 시 `packages/ui` 로 이동.

## 6. 부재 진입점 (의도적)

분류·Epic 직접 관리 UI 부재 — 분류 생성은 `EpicFormModal` 의 `CategoryComboboxCreate`, 분류 삭제는 DB trigger (Sub-09 마이그레이션 008 의 orphan 자동 삭제).

## 7. 접근성 (a11y)

- 페이지 제목: `<h1>` 단일 (예: "설정")
- 섹션 제목: `<h2>` (각 섹션 카드별 1개)
- 섹션 카드: `<section aria-labelledby={섹션 제목 id}>`
- 로그아웃 버튼: destructive variant — `aria-label="로그아웃"` 명시. 클릭 시 confirm 또는 즉시 실행 (잠정 — 즉시 실행 + toast)
- 모든 인터랙션 요소: 최소 터치 타겟 44×44px, `focus-visible` 가시성
- placeholder 항목: `aria-disabled="true"` + 시각적 disabled 표시

## 8. 토큰 정합

| 요소 | 토큰 |
|---|---|
| 페이지 padding | `spacing-6` (24px) |
| 섹션 간격 | `spacing-6` (24px) |
| 카드 padding | `spacing-4` (16px) |
| 카드 radius | `radius-md` |
| 카드 background | `color-bg-elevated` |
| 섹션 제목 타이포 | `font-size-lg`, `font-weight-semibold` |
| row label 타이포 | `font-size-md`, `font-weight-regular` |
| row value 타이포 | `font-size-md`, `color-text-secondary` |
| 로그아웃 버튼 | Button destructive 토큰 |

> 하드코딩 hex 0건. Tailwind 토큰 className 만 사용.

## 9. 향후 갱신 항목

- 알림 / 테마 항목 실제 동작 정의 (디자인 결정자 합류 후)
- 프로필 카드의 avatar 표시 여부 / 사이즈
- 다크 모드 시 색 매핑
- 분류·Epic inline 편집 진입점 검토 (현재 부재 — 후속 sub)
