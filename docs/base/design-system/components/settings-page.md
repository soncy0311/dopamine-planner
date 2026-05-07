# Settings Page

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·간격·문구는 합류 후 갱신될 수 있다.**

설정 페이지의 page-level 레이아웃 명세. prototype 정합 — 분류·Epic 직접 관리 UI 는 의도적으로 제거되며, 분류 생성은 `EpicCreateSheet` 의 `CategoryComboboxCreate`, 분류 삭제는 DB trigger 로 위임된다 (Sub-09).

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Templates
- 구현체 (web): `apps/web/src/app/(main)/settings/page.tsx`
- 구현체 (mobile RN): `apps/mobile/src/app/(main)/settings/`

---

## 1. 사용 위치

- web: `apps/web/src/app/(main)/settings/page.tsx`
- mobile: `apps/mobile/src/app/(main)/settings/`

prototype 정합: `docs/base/prototype/pages/page-prototypes.html` 의 `4.6 설정` frame 및 `page-prototypes-desktop.html` 의 `5.5 설정` frame.

## 2. 분류

Template (page-level). 단일 페이지 레이아웃 — 단독 라우트 1개.

## 3. 섹션 구조 (3블록)

| 블록 | 내용 | 비고 |
|---|---|---|
| 프로필 | 이름 · 이메일 · provider (Supabase auth user 정보) | 카드형 — 상단. 이름은 인라인 편집 (커밋 7c529e2) |
| 테마 | 화면 모드 (시스템 / 라이트 / 다크) | 보조값 라벨 노출 (예: "시스템"). Sub 값은 `SettingsMenuItem` value 변형 사용 |
| 정보 | 버전 정보 | + 하단 로그아웃 버튼 (destructive) |

> **이전 "계정" / "앱" 섹션은 제거됨** (커밋 7c529e2 + prototype 갱신). 소셜 계정 연동·알림 설정은 향후 별도 sub 에서 재도입 검토.

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

분류·Epic 직접 관리 UI 부재 — 분류 생성은 `EpicCreateSheet` (mobile) / `EpicFormModal` (web) 의 `CategoryComboboxCreate`, 분류 삭제는 DB trigger (Sub-09 마이그레이션 008 의 orphan 자동 삭제). Epic 편집은 메인 화면 Epic 카드 제목 클릭으로 `EpicDetailModal` (web) 또는 `epic-form` 라우트 (mobile) 진입. 별도 "Epic 관리" 라우트는 부재 (모바일 prototype `4.5 Epic 관리` 페이지도 삭제).

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

- 테마 항목 실제 동작 정의 (시스템 / 라이트 / 다크 토글 + 영속화)
- 프로필 카드의 avatar 표시 여부 / 사이즈
- 다크 모드 시 색 매핑
- 알림 설정 / 소셜 계정 연동 재도입 시점·UI 결정 (현재 섹션 부재)
- 분류·Epic inline 편집 진입점 검토 (현재 메인 화면 카드 클릭으로만 진입)
