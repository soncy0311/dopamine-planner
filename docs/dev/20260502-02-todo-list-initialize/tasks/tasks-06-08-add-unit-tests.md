# TASK-06-08: 단위 테스트 추가 — DateNavigator / TodoItem / Combobox / CategoryFilterChips / Modal

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 08
- **상태**: 미착수
- **의존성**: TASK-06-03, TASK-06-04, TASK-06-05, TASK-06-06, TASK-06-07 (모두 머지 후 진입)

## 작업 목표

sub-prd-06 에서 신설/변경된 컴포넌트의 회귀 방지를 위해 vitest + `@testing-library/react` 기반 단위 테스트를 추가한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/__tests__/DateNavigator.test.tsx` | 신설 | 토글 / 월간 셀 / Esc / prev/next 의미 단위 |
| `packages/ui/__tests__/TodoItem.test.tsx` | 신설 또는 갱신 | priority 분기 / carryOverCount 분기 |
| `apps/web/__tests__/Combobox.test.tsx` | 신설 | 자동완성 / 키보드 / 외부 클릭 |
| `apps/web/__tests__/CategoryFilterChips.test.tsx` | 신설 | 활성 chip + 클릭 콜백 |
| `apps/web/__tests__/CreateTodoModal.test.tsx` | 보강 | priority radiogroup 키보드 |
| `packages/ui/vitest.config.ts` (또는 `vitest.config.mjs`) | 필요 시 신설 | vitest 설정 |

### 테스트 케이스 명세

#### DateNavigator

- 헤더 클릭 시 월간 그리드 펼침 → `aria-expanded="true"`
- 다시 클릭 시 접힘
- 펼침 상태에서 Esc → 접힘
- 월간 셀 42개 렌더 (6주 × 7열)
- 셀 클릭 시 `onChange(date)` 호출
- 접힘 상태 prev → ±7일, 펼침 상태 prev → ±1개월

#### TodoItem

- `priority='high'` → high badge 노출
- `priority=null` → badge 미노출
- `carryOverCount=3` → "+3" 뱃지 + `aria-label="이월 3회"`
- `carryOverCount=0` → 뱃지 미노출

#### Combobox

- input 입력 시 옵션 필터링
- ArrowDown → activeIndex 증가
- Enter → `onChange(option)` 호출 + close
- Esc → close
- 외부 클릭 → close
- WAI-ARIA: `role="combobox"` + `aria-expanded` + `aria-activedescendant` 동기화

#### CategoryFilterChips

- "전체" chip 초기 활성 (`aria-pressed="true"`)
- 카테고리 chip 클릭 → `onSelect(id)` 호출
- 활성 chip 만 `aria-pressed="true"`

#### CreateTodoModal (보강)

- priority radiogroup ArrowRight → 다음 priority 활성
- ArrowLeft → 이전 priority 활성
- 첫 옵션에서 ArrowLeft → wrap (또는 stay, 구현 결정 — APG 명세에 따라 stay 권장)

### vitest 셋업 (필요 시)

```ts
// packages/ui/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### 참조 코드

- 기존 테스트 패턴: sub-prd-01 의 `tasks-01-15-add-unit-tests.md`
- sub-prd-06 §테스트 4건

## 검증 과정

- [ ] 5개 테스트 파일 모두 신설/갱신
- [ ] `pnpm --filter @todo-list/ui test` 통과
- [ ] `pnpm --filter @todo-list/web test` 통과
- [ ] `make test` 통과 (turbo 통합)
- [ ] 각 테스트 케이스 명세 (위) 모두 커버
- [ ] CI 환경에서도 안정적 통과 (timezone / locale 의존성 회피)

## 주의사항

1. **vitest 인프라 부재 가능** — `packages/ui` 에 vitest 설정 미존재 시 본 task 의 첫 항목으로 셋업 (`vitest.config.ts` + `package.json` test script + `@testing-library/react` 의존성 추가).
2. **TASK-06-03 ~ 07 모두 머지 후 진입** — 컴포넌트 미완성 상태에서 테스트 작성 시 인터페이스 변경 시 재작성 비용 발생.
3. **Date 의존 테스트의 결정성** — DateNavigator 테스트에서 `new Date()` 직접 사용 금지. `vi.setSystemTime()` 으로 고정 시점 설정.
4. **외부 클릭 테스트** — JSDOM 의 `fireEvent.mouseDown(document.body)` 로 외부 클릭 시뮬레이션.
5. **a11y 검증** — `role` / `aria-*` 속성을 `getByRole` + `toHaveAttribute` 로 검증. snapshot 테스트 지양 (회귀 noise 큼).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §테스트
- [`./tasks-01-15-add-unit-tests.md`](./tasks-01-15-add-unit-tests.md) — 기존 테스트 셋업 패턴
- [`./tasks-06-03-extend-date-navigator-monthly.md`](./tasks-06-03-extend-date-navigator-monthly.md)
- [`./tasks-06-04-extend-todo-item-meta.md`](./tasks-06-04-extend-todo-item-meta.md)
- [`./tasks-06-05-create-category-filter-chips.md`](./tasks-06-05-create-category-filter-chips.md)
- [`./tasks-06-06-create-combobox-component.md`](./tasks-06-06-create-combobox-component.md)
- [`./tasks-06-07-revamp-todo-modals.md`](./tasks-06-07-revamp-todo-modals.md)
