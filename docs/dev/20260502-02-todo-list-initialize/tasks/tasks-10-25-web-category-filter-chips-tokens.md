# TASK-10-25: web — `CategoryFilterChips.tsx` 토큰 정합 (격차 #11)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-25
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (독립)

## 작업 목표

sub-prd-10 §8.3 / 격차 #11 — `apps/web/src/components/CategoryFilterChips.tsx` 의 시각 토큰을 prototype `proto-filter-chip` 정합으로 갱신:
- 비활성: `border` + `bg-elevated` + `text-secondary`
- 활성: `--badge-bg` + `--badge-text` (사용자 결정 §D 잠정안 채택 시) + 동일 border 색
- (사용자 결정 §D 채택 시) `components.md §FilterChips.상태` 토큰 갱신

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/CategoryFilterChips.tsx` | 수정 | border + bg + active 토큰 정합 |
| `docs/base/design-system/components.md` | 수정 (사용자 결정 §D 채택 시) | §FilterChips.상태 토큰 갱신 (`--color-interactive-primary` → `--badge-bg/--badge-text`) |

### 변경 세부

#### 1. 비활성 칩 클래스

```tsx
// 변경 전
className="bg-periwinkle-100 text-periwinkle-500 px-3 py-1 rounded-full text-xs"

// 변경 후 — molecules.css L582-605 정합
className="border border-periwinkle-200 bg-white text-periwinkle-500 rounded-full h-8 px-3 text-xs hover:bg-periwinkle-100"
```

#### 2. 활성 칩 클래스

```tsx
// 변경 전
className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs"

// 변경 후 — sub-prd-10 §사용자 결정 §D 잠정안: --badge-bg / --badge-text
className="border border-purple-100 bg-purple-100 text-purple-700 rounded-full h-8 px-3 text-xs"
```

> Tailwind 토큰 `bg-purple-100 text-purple-700` 가 `--badge-bg / --badge-text` 와 동등인지 디자인 결정자 확인 필요. 잠정 — 동등 매핑.

#### 3. "전체" 칩 동등 처리

"전체" 칩도 동일 토큰 정합. category 없는 상태 = "전체" 활성.

#### 4. components.md 갱신 (사용자 결정 §D 채택 시)

```diff
- ## §FilterChips.상태
- - 활성: `background: var(--color-interactive-primary)` + `color: var(--color-text-inverse)`
+ ## §FilterChips.상태
+ - 활성: `background: var(--badge-bg)` + `color: var(--badge-text)` + `border-color: var(--badge-bg)`
+ - 비활성: `background: var(--color-bg-elevated)` + `color: var(--color-text-secondary)` + `border 1px var(--color-border-default)`
```

### 회귀 영향

- 메인 일자 뷰 / 카테고리 필터 영역의 chip 시각 변경
- 활성 색이 진보라 → 연보라 (`badge-bg`) 로 톤 변경

## 검증 과정

- [x] `CategoryFilterChips.tsx` 의 비활성 칩에 border 클래스 존재
- [x] 활성 칩 색이 `--badge-bg/--badge-text` 매핑 (잠정 `bg-purple-100 text-purple-700`)
- [x] "전체" 칩 동등 토큰 적용
- [x] (사용자 결정 §D 채택 시) `components.md §FilterChips.상태` 갱신
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: 비활성 / 활성 / hover 시각 검증

## 주의사항

1. **사용자 결정 §D**: components.md 와 prototype 사이 자체 격차 — 어느 쪽을 SoT 로 할지. 잠정 = prototype (`--badge-bg`). 비채택 시 본 task 의 활성 색 변경 X (현 `--color-interactive-primary` 유지).
2. **mobile 동등 컴포넌트**: TASK-10-28 에서 처리.
3. **`--badge-bg` 토큰 매핑**: components.md §Badge.토큰 의 카테고리/priority 별 매핑 확인 후 칩의 default(`--badge-bg-neutral`?) 결정.
4. **scope = refactor(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.3 / §사용자 결정 §D
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md) §FilterChips
- `docs/base/prototype/css/molecules.css` (L582-605)
- `apps/web/src/components/CategoryFilterChips.tsx`
