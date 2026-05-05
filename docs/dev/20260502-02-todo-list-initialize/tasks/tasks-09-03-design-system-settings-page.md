# TASK-09-03: 디자인 시스템 SoT 등재 (`settings-page`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 03
- **상태**: 대기중
- **의존성**: 없음 (TASK-09-17 / TASK-09-21 의 SoT — 우선 머지)

## 작업 목표

`docs/base/design-system/components/settings-page.md` 를 신설하여 설정 페이지 (Template) 의 디자인 명세를 SoT 로 등재한다. sub-prd-09 §5 / §8 를 따른다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/base/design-system/components/settings-page.md` | 신설 | 설정 페이지 (Template) 명세 |
| `docs/base/design-system/components.md` | 수정 | Templates 분류표에 `settings-page` 행 추가 |

### settings-page.md 명세 항목

- **분류**: Template (page-level)
- **사용 위치**: `apps/web/src/app/(main)/settings/page.tsx`, `apps/mobile/src/app/(main)/settings/`. prototype L822-880 인용
- **섹션 구조 (4 블록)**:
  1. **프로필 카드** — 이름·이메일·provider (Supabase auth user). 아바타 placeholder
  2. **계정** — 소셜 계정 연동 (잠정 placeholder), 알림 설정 (잠정 placeholder)
  3. **앱** — 테마 등 (잠정 placeholder)
  4. **정보** — 버전 정보, 로그아웃
- **레이아웃**: 단일 컬럼, 카드형 섹션. 섹션 간 간격 = 토큰 `spacing.6` (또는 등가)
- **재사용 컴포넌트 후보**: `SettingsSection` (제목 + children), `SettingsRow` (label + value + action) — sub-prd-09 §3 §3.2 공유 UI 작업 참조
- **부재 진입점 (의도적)**: 분류 관리 / Epic 관리 진입점 0개. 명세에 "본 페이지는 분류·Epic 직접 관리 UI 부재 — 분류 생성은 EpicFormModal 의 CategoryComboboxCreate, 분류 삭제는 DB trigger" 한 줄 명시
- **a11y**: 섹션 제목 = `<h2>`. 로그아웃 버튼 = destructive variant
- **잠정안 선언**: 알림 / 테마 / 소셜 연동 항목은 디자인 결정자 합류 전 placeholder

### components.md 보강

- `## Templates` 분류표에 `settings-page` 행 추가 (기존 Template 행 패턴 정합)

### 잠정안 선언

문서 상단에 "본 명세는 디자인 결정자 합류 전 잠정안. 색·간격·문구·placeholder 항목은 합류 후 갱신될 수 있음" 한 줄 명시.

## 검증 과정

- [ ] `docs/base/design-system/components/settings-page.md` 존재 + 4 섹션 명세
- [ ] `docs/base/design-system/components.md` Templates 표에 행 추가 + 링크 동작
- [ ] 하드코딩 색 hex 0건
- [ ] 잠정안 선언 한 줄 존재
- [ ] "분류·Epic 직접 관리 UI 부재" 정책 한 줄 명시 (sub-prd-09 §6 정합)
- [ ] prototype L822-880 인용 정합

## 주의사항

1. **코드보다 우선 머지**: TASK-09-17 / TASK-09-21 의 SoT.
2. **placeholder 항목 명시**: 결정자 합류 전 항목은 명세에 "잠정 placeholder" 표기. 코드 구현 시 동일 표기로 진입.
3. **mobile 정합**: 본 명세는 web / mobile 공유 SoT. 플랫폼별 구체적 컴포넌트 (RN vs React) 차이는 코드 task (17 / 21) 에서 흡수.
4. **scope = docs**: PR scope 는 `docs`.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §5 / §6 / §8
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md)
- [`../../../base/prototype/pages/page-prototypes.html`](../../../base/prototype/pages/page-prototypes.html) L822-880
