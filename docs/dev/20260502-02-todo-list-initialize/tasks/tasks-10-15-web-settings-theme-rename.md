# TASK-10-15: web — Settings "앱" → "테마" rename + value placeholder

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-15
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (독립 — 다른 task 와 무관)

## 작업 목표

sub-prd-10 §4.7 — `apps/web/src/app/(main)/settings/page.tsx` 의 SettingsSection 명을 정합:
1. `<SettingsSection title="앱">` → `<SettingsSection title="테마">`
2. 행 변경: `<SettingsRow label="테마" value="곧 제공 예정" disabled />` → `<SettingsRow label="화면 모드" value="시스템" disabled />`

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/(main)/settings/page.tsx` | 수정 | "앱" → "테마" rename + 행 라벨/값 갱신 |

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

### 시각 검증

- "테마" 섹션 제목 + "화면 모드 — 시스템" 행 + disabled (클릭 비활성, 시각 흐림)
- 사용자가 클릭 시도 시 시각 피드백 0 (별도 toast 불요 — sub-prd-10 §주의사항 7)

## 검증 과정

- [x] SettingsSection title 이 `"테마"`
- [x] SettingsRow label 이 `"화면 모드"`, value `"시스템"`, disabled 적용
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: Settings 페이지에서 "테마" 섹션 + "화면 모드 — 시스템" + disabled 시각 확인

## 주의사항

1. **실 토글 동작 미구현**: sub-prd-10 사용자 결정 — 라벨만 placeholder. 시스템/라이트/다크 + 영속화는 후속 sub.
2. **mobile 동등 task 별도**: TASK-10-22 에서 mobile settings 동등 갱신.
3. **scope = refactor(web)** 또는 `chore(web)`: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.7 / §주의사항 7
- [`./tasks-10-22-mobile-settings-theme-rename.md`](./tasks-10-22-mobile-settings-theme-rename.md)
- `apps/web/src/app/(main)/settings/page.tsx`
