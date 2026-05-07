# TASK-08-02: `<EmptyState>` 컴포넌트 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 02
- **상태**: 완료 (2026-05-06)
- **의존성**: TASK-08-01 (디자인 시스템 SoT 머지 후), TASK-08-03 과 병렬 가능

## 작업 목표

prototype 미정의 빈 상태 영역의 표준 컴포넌트 `<EmptyState>` 를 `packages/ui` 에 신설한다. props 시그니처는 sub-prd-08 §2 정합. 데이터 fetch 0건 — host 가 props 주입.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EmptyState.tsx` | 신설 | 본체 컴포넌트 |
| `packages/ui/src/index.ts` | 수정 | `EmptyState` re-export |

### Props 시그니처 (sub-prd-08 §2 정합)

```ts
export type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};
```

### 구조 (요약)

```tsx
<div role="status" className="flex flex-col items-center gap-3 p-8 text-periwinkle-500">
  {Icon ? <Icon className="h-12 w-12" aria-hidden /> : null}
  <p className="text-base font-medium">{title}</p>
  {description ? <p className="text-sm">{description}</p> : null}
  {action ? (
    <button
      type="button"
      onClick={action.onClick}
      className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white"
    >
      {action.label}
    </button>
  ) : null}
</div>
```

### 토큰 / 스타일 정책

- inline style 0
- Tailwind 토큰 className 만 사용 (디자인 토큰 정합 — `docs/base/design-system/tokens.md`)
- 색·간격은 `empty-state.md` (TASK-08-01) 의 명세 기준

### 데이터 / 콜백 책임 분리

- 본 컴포넌트는 **데이터 fetch 0건** — `useTodos` 등 host hook 호출 금지
- `action.onClick` 은 host (`TodoSection` 등) 가 주입

### a11y

- 컨테이너에 `role="status"` 필수
- 아이콘은 `aria-hidden` (의미 전달은 텍스트로)
- 색만으로 의미 전달 금지

### 참조

- sub-prd-08 §2 / §핵심 구현 로직
- TASK-08-01 의 `docs/base/design-system/components/empty-state.md`

## 검증 과정

- [ ] `packages/ui/src/index.ts` 에서 `EmptyState` export
- [ ] props 시그니처가 sub-prd-08 §2 와 일치
- [ ] `title` 만 주입 시 정상 렌더 (description / action / icon 미렌더)
- [ ] `description` 추가 시 `<p>` 노출
- [ ] `action` 주입 시 버튼 노출 + 클릭 시 `onClick` 호출
- [ ] `icon` 주입 시 컴포넌트 렌더 + `aria-hidden` 적용
- [ ] 컨테이너에 `role="status"` 적용
- [ ] inline style 0건 (`style={...}` 미사용)
- [ ] `pnpm --filter @todo-list/ui lint` / `typecheck` 통과
- [ ] 단위 테스트 (TASK-08-05) 통과

## 주의사항

1. **데이터 fetch 금지**: 본 컴포넌트는 `packages/ui` 위치. react-query / supabase 의존 0건. host 가 props 주입.
2. **TASK-08-01 머지 우선**: 디자인 SoT 가 먼저 머지되지 않으면 본 컴포넌트의 색·간격이 docs 와 분기될 수 있음.
3. **inline style 금지**: Tailwind 토큰 className 만 사용. 카테고리 색 chip 같은 동적 색은 본 컴포넌트 범위 외.
4. **CTA 1개 정책**: `action` props 는 단수 (배열 아님). 다중 CTA 가 필요해지면 별도 컴포넌트 분기.
5. **mobile RN 분리**: 본 task 는 web 전용. mobile 용 `EmptyState` 는 후속 mobile sub.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §2
- [`./tasks-08-01-design-system-docs.md`](./tasks-08-01-design-system-docs.md)
- [`./tasks-08-04-refactor-callsites.md`](./tasks-08-04-refactor-callsites.md)
- [`./tasks-08-05-add-unit-tests.md`](./tasks-08-05-add-unit-tests.md)
