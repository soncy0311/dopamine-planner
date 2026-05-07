# TASK-10-16: mobile — `lib/forms/schemas.ts` priority 이전

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-16
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입 export)

## 작업 목표

sub-prd-10 §5.1 — `apps/mobile/src/lib/forms/schemas.ts` 의 zod schema 갱신: `TodoFormSchema.priority` 제거, `EpicFormSchema.priority` 추가. (web 의 task-10-09 와 동등 변경)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/lib/forms/schemas.ts` | 수정 | TodoForm priority 제거 + EpicForm priority 추가 |

### 변경 세부

```ts
// 변경 전
export const TodoFormSchema = z.object({
  title: z.string().min(1).max(200),
  ...
  priority: z.enum(['high', 'medium', 'low']),
  ...
});

export const EpicFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  // priority 부재
});

// 변경 후
export const TodoFormSchema = z.object({
  title: z.string().min(1).max(200),
  ...
  // priority 제거
});

export const EpicFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
});
```

### 회귀 영향

- `apps/mobile/src/app/sub-issue-form.tsx` (TASK-10-17) / `apps/mobile/src/app/epic-form.tsx` (TASK-10-18) 가 본 schema 정합 후 wiring

## 검증 과정

- [x] `TodoFormSchema` 에 priority 0건
- [x] `EpicFormSchema.priority` enum 정의
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과 (호출 측 task 미머지 시 일부 깨짐은 의도)

## 주의사항

1. **schema 위치 검증**: 파일 위치가 다를 시 `apps/mobile/src/lib/schemas/{epic,todo}.ts` 등으로 보정.
2. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.1
- [`./tasks-10-09-web-form-schemas.md`](./tasks-10-09-web-form-schemas.md) (web 동등)
- [`./tasks-10-17-mobile-sub-issue-form.md`](./tasks-10-17-mobile-sub-issue-form.md)
- [`./tasks-10-18-mobile-epic-form-priority.md`](./tasks-10-18-mobile-epic-form-priority.md)
- `apps/mobile/src/lib/forms/schemas.ts`
