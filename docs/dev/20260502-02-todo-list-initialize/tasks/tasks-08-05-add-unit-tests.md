# TASK-08-05: 단위 테스트 추가 (`EmptyState` / `Spinner`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 05
- **상태**: 미착수
- **의존성**: TASK-08-02 (`<EmptyState>`) + TASK-08-03 (`<Spinner>`) 머지 후. TASK-08-04 와 병렬 가능

## 작업 목표

신설 자산(`EmptyState` / `Spinner`) 의 회귀 방지 단위 테스트를 추가한다. `vitest` + `@testing-library/react` 환경. sub-prd-06 TASK-06-08 / sub-prd-07 TASK-07-07 의 셋업이 머지되어 있다면 재사용, 부재 시 본 task 첫 단계로 셋업.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/vitest.config.ts` | 조건부 신설 | sub-prd-06 / 07 의 셋업 머지 시 재사용. 부재 시 본 task 에서 신설 |
| `packages/ui/__tests__/EmptyState.test.tsx` | 신설 | EmptyState 단위 테스트 |
| `packages/ui/__tests__/Spinner.test.tsx` | 신설 | Spinner 단위 테스트 |

### vitest 셋업 조건부 진행

본 task 진입 시 `packages/ui/vitest.config.ts` 가 이미 존재하면(sub-prd-06 / 07 의 결과 재사용) 추가 셋업 작업 없음. 부재 시 본 task 첫 단계로:

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

`packages/ui/package.json` 에 `test` script + 의존성 (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) 추가.

### EmptyState.test.tsx — 케이스

| # | 케이스 | 검증 |
|---|---|---|
| 1 | `title` 만 주입 | title 노출, description / action / icon 미렌더 |
| 2 | `title` + `description` | description `<p>` 노출 |
| 3 | `title` + `action` | 버튼 노출 + 클릭 시 `onClick` 호출 (`fireEvent.click`) |
| 4 | `icon` 주입 | icon 컴포넌트 렌더 + `aria-hidden` 적용 |
| 5 | a11y | 컨테이너에 `role="status"` 적용 |

### Spinner.test.tsx — 케이스

| # | 케이스 | 검증 |
|---|---|---|
| 1 | 기본 (props 미주입) | `role="status"`, `aria-label="로딩 중"`, `h-6 w-6` (md) |
| 2 | `size="sm"` | `h-4 w-4` className |
| 3 | `size="lg"` | `h-10 w-10` className |
| 4 | `variant="fullscreen"` | 중앙 정렬 wrapper 노출 |
| 5 | `label="데이터 불러오는 중"` | `aria-label` 적용 |
| 6 | `motion-reduce:animate-none` | className 에 포함 (정적 폴백 보장) |

### 테스트 패턴

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../src/EmptyState';

describe('EmptyState', () => {
  it('renders title only', () => {
    render(<EmptyState title="아직 할 일이 없어요" />);
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onClick when action button is pressed', () => {
    const onClick = vi.fn();
    render(<EmptyState title="t" action={{ label: '만들기', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: '만들기' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## 검증 과정

- [ ] `packages/ui/vitest.config.ts` 존재 (재사용 또는 신설)
- [ ] `EmptyState.test.tsx` 5 케이스 모두 통과
- [ ] `Spinner.test.tsx` 6 케이스 모두 통과
- [ ] `pnpm --filter @todo-list/ui test` 통과
- [ ] `make test` (turbo 전체) 통과
- [ ] 기존 sub-prd-06 / 07 의 단위 테스트 회귀 0건

## 주의사항

1. **셋업 중복 회피**: `vitest.config.ts` 가 이미 존재하면 본 task 에서 신설하지 않음. 진입 시 파일 존재 여부 확인.
2. **`prefers-reduced-motion` 검증 한계**: jsdom 은 `matchMedia` 모킹 필요. 본 task 는 className 존재(`motion-reduce:animate-none`) 검증으로 대체. 실제 정적 표시는 TASK-08-06 수동 검증.
3. **단위 테스트 범위**: 본 task 는 컴포넌트 단위 테스트만. host 통합 테스트 (TodoSection 등) 는 후속 sub.
4. **a11y 검증**: `role="status"`, `aria-label` 등 attr 존재 검증. 시각적 a11y (focus-visible 등) 는 수동 검증 (TASK-08-06).
5. **mobile 회귀 회피**: 본 task 는 `packages/ui` 한정. mobile RN 의 같은 이름 컴포넌트가 미존재함을 가정.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §검증 기준 §자동
- [`./tasks-08-02-create-empty-state.md`](./tasks-08-02-create-empty-state.md)
- [`./tasks-08-03-create-spinner.md`](./tasks-08-03-create-spinner.md)
- [`./tasks-06-08-add-unit-tests.md`](./tasks-06-08-add-unit-tests.md)
- [`./tasks-07-07-add-unit-tests.md`](./tasks-07-07-add-unit-tests.md)
