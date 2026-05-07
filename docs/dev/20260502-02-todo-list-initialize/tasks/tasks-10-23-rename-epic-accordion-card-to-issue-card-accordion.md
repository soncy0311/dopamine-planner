# TASK-10-23: rename — `EpicAccordionCard` → `IssueCardAccordion` (사용자 결정 §A 잠정안)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-23
- **상태**: 완료 (2026-05-07) (사용자 결정 §A 의 잠정안 = prototype 정합 채택 시)
- **의존성**: TASK-10-08 (ui EpicAccordionCard priority 추가), TASK-10-19 (mobile main daily view priority wiring)

## 작업 목표

sub-prd-10 §8.1 / 격차 #9 — prototype 의 `proto-issue-card-accordion` 명명을 SoT 로 채택해 코드 / docs 의 `EpicAccordionCard` → `IssueCardAccordion` rename. atomic 머지로 광범위 영향 제어.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/base/design-system/components.md` | 수정 | §3 Organisms `EpicCard` → `IssueCardAccordion` rename + 설명 갱신 (Sub 0/N 변형 명시) |
| `packages/ui/src/EpicAccordionCard.tsx` | rename | `packages/ui/src/IssueCardAccordion.tsx` |
| `packages/ui/src/index.ts` | 수정 | re-export 갱신 (`export { IssueCardAccordion } from './IssueCardAccordion'`) |
| `apps/web/src/components/MainDailyView.tsx` | 수정 | import / 사용처 동반 rename |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정 | import / 사용처 동반 rename |
| `apps/mobile/src/components/EpicAccordionCard.tsx` | rename | `IssueCardAccordion.tsx` (mobile 동등) |

### 변경 세부

#### 1. `components.md` 갱신

- `§3 Organisms.EpicCard` → `§3 Organisms.IssueCardAccordion`
- 설명에 prototype 의 변형 (Sub 0 → `IssueCard` Atom/Molecule 분리 / Sub n → `IssueCardAccordion`) 명시
- prototype 분류 (Atom / Molecule / Organism) 검증 후 `IssueCard` 의 위치 결정 — 잠정 Molecule

#### 2. 파일 rename

```bash
git mv packages/ui/src/EpicAccordionCard.tsx packages/ui/src/IssueCardAccordion.tsx
git mv apps/mobile/src/components/EpicAccordionCard.tsx apps/mobile/src/components/IssueCardAccordion.tsx
```

#### 3. export 명 / import 일괄 변경

```bash
# 코드 export 명 변경
sed -i '' 's/EpicAccordionCard/IssueCardAccordion/g' \
  packages/ui/src/IssueCardAccordion.tsx \
  packages/ui/src/index.ts \
  apps/web/src/components/MainDailyView.tsx \
  apps/mobile/src/components/MainDailyViewMobile.tsx \
  apps/mobile/src/components/IssueCardAccordion.tsx
```

> macOS sed 는 `-i ''` 가 필요. 실행 전 grep 으로 호출 측 누락 0 검증:
> `grep -rn "EpicAccordionCard" apps/ packages/`

#### 4. prop 시그니처 보존

`epicId` / `priority` / `subIssues` 등 prop 명은 그대로 유지 — 의미가 명확하므로 rename 동반 X. sub-prd-10 §8.1 정합.

### 회귀 영향

- 컴파일 에러 0 (rename 일괄 처리 시)
- 시각 / 동작 변화 0 (단순 rename)

## 검증 과정

- [x] `grep -rn "EpicAccordionCard" packages/ apps/ docs/base/` — 0건
- [x] `grep -rn "IssueCardAccordion" packages/ apps/ docs/base/` — 정합 위치에만 존재
- [x] `pnpm --filter @todo-list/{ui,web,mobile} run typecheck` 모두 통과
- [x] `pnpm --filter @todo-list/{ui,web,mobile} run lint` 통과
- [x] 수동: web / mobile 시각 / 동작 회귀 0 (단순 rename — 검증은 빠르게)

## 주의사항

1. **사용자 결정 §A 잠정안 채택 시**: 본 task 활성. 비채택 (대안 (b) prototype rename) 시 본 task 는 비활성 → prototype CSS/HTML 갱신 task 로 대체 (sub-prd-11 후보).
2. **atomic 머지**: rename 은 광범위 영향 — 단일 PR 로 묶어 머지. 단계별 분리 시 컴파일 깨짐.
3. **import 누락 방지**: sed 일괄 변경 전후 `grep -rn` 으로 호출 측 cover 검증.
4. **`packages/ui/src/index.ts` re-export**: 외부 (apps/web) 가 패키지 entrypoint 로 import 시 본 re-export 갱신 누락 시 빌드 실패.
5. **scope = refactor(ui+web+mobile+docs)**: PR scope. 본문에 rename 이유 / 호출 측 영향 명시.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.1 / §사용자 결정 §A
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md) §EpicCard / §IssueCardAccordion (rename 후)
- `docs/base/prototype/pages/page-prototypes.html` (`proto-issue-card{,-accordion}`)
- `docs/base/prototype/css/organisms.css` (L301-366)
- [`./tasks-10-08-ui-epic-accordion-card-priority-badge.md`](./tasks-10-08-ui-epic-accordion-card-priority-badge.md)
- [`./tasks-10-19-mobile-main-daily-view.md`](./tasks-10-19-mobile-main-daily-view.md)
