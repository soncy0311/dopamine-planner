# TASK-09-17: web — 설정 페이지 prototype 정합 재구현

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 17
- **상태**: 대기중
- **의존성**: TASK-09-03 (설정 페이지 SoT), TASK-09-16

## 작업 목표

sub-prd-09 §5 — `apps/web/src/app/(main)/settings/page.tsx` 를 prototype L822-880 정합으로 전면 재구현한다. 4 섹션 (프로필 / 계정 / 앱 / 정보) 구조.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/(main)/settings/page.tsx` | 전면 재구현 | 4 섹션 정합 |
| `apps/web/src/components/SettingsSection.tsx` (재사용 검토) | 신설 (필요 시) | 섹션 카드 wrapper |
| `apps/web/src/components/SettingsRow.tsx` (재사용 검토) | 신설 (필요 시) | label + value + action row |

### 섹션 구조

| 블록 | 항목 | 상태 |
|---|---|---|
| **프로필 카드** | 이름·이메일·provider | Supabase auth user 실값 |
| **계정** | 소셜 계정 연동, 알림 설정 | placeholder (잠정) |
| **앱** | 테마 등 | placeholder (잠정) |
| **정보** | 버전 정보, 로그아웃 | 버전 = package.json, 로그아웃 = sub-prd-03/08 의 logout helper |

### 데이터 소스

- 프로필: `useSupabaseSession` 또는 동등 — `user.email`, `user.user_metadata.name`, `user.app_metadata.provider`
- 버전: `process.env.NEXT_PUBLIC_APP_VERSION` 또는 build-time injection
- 로그아웃: 기존 logout helper 재사용 (sub-prd-03 / 08 산출물)

### 제거 (sub-prd-09 §6)

- 분류 관리 / Epic 관리 진입점 4개 — 본 task 의 새 settings 에 미포함

### 시각 / 토큰

- 토큰 참조 (하드코딩 hex 0건)
- 섹션 간 spacing = 토큰
- TASK-09-03 의 SoT (`settings-page.md`) 와 1:1 일치

### 잠정 placeholder 처리

- 알림 / 테마 / 소셜 연동 항목 = "곧 제공 예정" 비활성 row
- 디자인 결정자 합류 시점에 갱신

## 검증 과정

- [ ] `settings/page.tsx` 가 4 섹션 (프로필 / 계정 / 앱 / 정보) 노출
- [ ] 프로필 카드 = Supabase auth user 실값
- [ ] 분류 / Epic 관리 진입점 0
- [ ] 로그아웃 동작 (기존 helper 재사용)
- [ ] 버전 정보 노출
- [ ] 하드코딩 hex 0건 (토큰 참조)
- [ ] `pnpm --filter @todo-list/web typecheck` / `lint` / `build` 통과
- [ ] 수동: 페이지 진입 → prototype 정합 시각 확인
- [ ] 수동: 로그아웃 클릭 → 세션 종료 + 리다이렉트
- [ ] TASK-09-03 의 settings-page.md SoT 와 1:1 일치

## 주의사항

1. **머지 순서**: 03 (SoT) 와 16 (관리 페이지 삭제) 머지 후.
2. **잠정 placeholder 명시**: 비활성 / "곧 제공 예정" 표시 명확 — 사용자가 동작 부재로 혼란하지 않도록.
3. **logout helper 재사용**: 신규 logout 로직 작성 X — 기존 helper 재사용. 부재 시 본 task 외부 (별도 sub) 에서 도입.
4. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §5
- [`./tasks-09-03-design-system-settings-page.md`](./tasks-09-03-design-system-settings-page.md)
- [`../../../base/design-system/components/settings-page.md`](../../../base/design-system/components/settings-page.md) (TASK-09-03 산출물)
- [`../../../base/prototype/pages/page-prototypes.html`](../../../base/prototype/pages/page-prototypes.html) L822-880
