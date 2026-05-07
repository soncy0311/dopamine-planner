# TASK-09-21: mobile — 설정 페이지 prototype 정합 재구현

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 21
- **상태**: 대기중
- **의존성**: TASK-09-03 (설정 페이지 SoT), TASK-09-20

## 작업 목표

sub-prd-09 §7 — mobile 의 설정 페이지를 web (TASK-09-17) 와 동일한 4 섹션 구조의 RN 버전으로 재구현한다. TASK-09-03 SoT 정합.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(main)/settings/index.tsx` (또는 동등 경로) | 전면 재구현 | 4 섹션 RN |
| 재사용 RN 컴포넌트 (필요 시) | 신설 검토 | `SettingsSection` / `SettingsRow` RN 등가 |

### 섹션 구조 (TASK-09-17 와 동일)

| 블록 | 항목 | 상태 |
|---|---|---|
| 프로필 카드 | 이름·이메일·provider | Supabase auth 실값 |
| 계정 | 소셜 연동, 알림 | placeholder (잠정) |
| 앱 | 테마 | placeholder (잠정) |
| 정보 | 버전, 로그아웃 | 버전 = build-time / 로그아웃 = 기존 helper |

### 데이터 소스 (mobile)

- `useSupabaseSession` 또는 동등 (`packages/core` 공유)
- 버전: `Constants.expoConfig?.version` (Expo)
- 로그아웃: 기존 helper 재사용

### 시각 / 토큰

- Nativewind 토큰 매핑
- TASK-09-03 의 SoT 와 1:1 일치
- 분류 / Epic 관리 진입점 부재 (sub-prd-09 §6)

### 잠정 placeholder 처리

- 알림 / 테마 / 소셜 연동 = "곧 제공 예정" 비활성 row

## 검증 과정

- [ ] settings 라우트가 4 섹션 노출
- [ ] 프로필 카드 = Supabase auth user 실값
- [ ] 분류 / Epic 관리 진입점 0
- [ ] 로그아웃 동작
- [ ] 버전 정보 노출
- [ ] 하드코딩 색 0건
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 수동: 시뮬레이터 진입 → web 과 동등한 시각 / 동작
- [ ] TASK-09-03 SoT 와 1:1 일치

## 주의사항

1. **머지 순서**: 03 (SoT) / 20 (관리 라우트 삭제) 머지 후.
2. **web / mobile 시각 정합**: 동일 SoT 기반이지만 RN / Web 컴포넌트 차이 흡수 — 토큰 / 레이아웃 일관성 우선.
3. **잠정 placeholder 명시**: 비활성 표시 명확.
4. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §5 / §7
- [`./tasks-09-03-design-system-settings-page.md`](./tasks-09-03-design-system-settings-page.md)
- [`./tasks-09-17-web-settings-page-revamp.md`](./tasks-09-17-web-settings-page-revamp.md)
- [`../../../base/design-system/components/settings-page.md`](../../../base/design-system/components/settings-page.md) (TASK-09-03 산출물)
