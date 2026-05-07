# TASK-10-22: mobile — Settings "앱" → "테마" rename + value placeholder

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-22
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (독립)

## 작업 목표

sub-prd-10 §5.7 — mobile settings 라우트의 "앱" 섹션을 "테마" 로 rename + 행 라벨/값 갱신. (TASK-10-15 의 mobile 동등)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(main)/settings/` 또는 동등 라우트 (예: `settings.tsx` / `settings/index.tsx`) | 수정 | "앱" → "테마" rename + 행 라벨 "화면 모드" + value "시스템" + disabled |

### 진입 절차

1. mobile settings 라우트 위치 확인:
   ```bash
   grep -rn "앱\|테마" apps/mobile/src/app/
   ```
2. 발견 위치에 따라 SettingsSection (또는 동등 RN 컴포넌트) 의 title / row 라벨 갱신

### 변경 세부

```tsx
// 변경 전
<SettingsSection title="앱">
  <SettingsRow label="테마" value="곧 제공 예정" disabled />
</SettingsSection>

// 변경 후
<SettingsSection title="테마">
  <SettingsRow label="화면 모드" value="시스템" disabled />
</SettingsSection>
```

> mobile 의 SettingsSection / SettingsRow 가 별도 컴포넌트가 아니라 ad-hoc View / Text 라면 그대로 라벨 텍스트만 갱신.

### 시각 / 동작 검증

- "테마" 섹션 제목
- "화면 모드 — 시스템" 행
- disabled (`accessibilityState={{ disabled: true }}` + 시각 흐림) — 클릭 시 피드백 0

## 검증 과정

- [x] mobile settings 라우트의 "앱" 텍스트 0건
- [x] "테마" / "화면 모드" / "시스템" 정합
- [x] disabled state 시각 표시 (회색 텍스트 등)
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 Settings 진입 → "테마" 섹션 / "화면 모드 — 시스템" / disabled 시각 확인

## 주의사항

1. **mobile settings 라우트 부재 시**: sub-prd-10 §5.7 — "앱" 섹션 자체가 mobile 에 부재라면 본 task 는 신설. 단, "테마" 섹션 신설은 본 sub 범위 — disabled placeholder 만 채워 일관성 유지.
2. **실 토글 미구현**: sub-prd-10 사용자 결정 — 라벨만 placeholder.
3. **scope = refactor(mobile)** 또는 `chore(mobile)`: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.7
- [`./tasks-10-15-web-settings-theme-rename.md`](./tasks-10-15-web-settings-theme-rename.md) (web 동등)
- `apps/mobile/src/app/(main)/settings/`
