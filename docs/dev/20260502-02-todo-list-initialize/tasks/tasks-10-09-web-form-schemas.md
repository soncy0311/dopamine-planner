# TASK-10-09: web — `lib/forms/schemas.ts` priority 이전

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-09
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입 export)

## 작업 목표

sub-prd-10 §4.6 — `apps/web/src/lib/forms/schemas.ts` 의 zod schema 갱신: `TodoFormSchema.priority` 제거, `EpicFormSchema.priority` 추가.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/lib/forms/schemas.ts` | 수정 | `TodoFormSchema.priority` 제거 + `EpicFormSchema.priority: z.enum(['high','medium','low'])` 추가 |

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
  // priority 필드 제거
});

export const EpicFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
});
```

### 회귀 영향

- `EpicFormModal` (TASK-10-11) / `EpicDetailModal` (TASK-10-12) 가 `EpicFormSchema` 또는 동등 schema 사용 — priority 필드 정합 후 wiring
- `SubIssueFormModal` (TASK-10-13) / `TodoDetailModal` (TASK-10-14) 의 `SubIssueFormSchema` / `SubIssueEditSchema` 의 priority 제거는 별도 task (10-13 / 10-14)

## 검증 과정

- [x] `TodoFormSchema` 에 priority 필드 0건
- [x] `EpicFormSchema.priority` 가 `z.enum(['high','medium','low'])` 로 정의
- [x] `pnpm --filter @todo-list/web run typecheck` 통과 (호출 측 task 미머지 시 일부 깨짐은 의도)
- [x] 본 schema 가 export 하는 타입 (`EpicFormValues` 등) 이 priority 포함

## 주의사항

1. **schema 위치 검증**: 파일 위치가 다른 경로 (`apps/web/src/lib/schemas/{epic,todo}.ts`) 인 경우 본 task 의 대상 파일을 그쪽으로 보정.
2. **default 값**: zod 자체는 default 미설정. `defaultValues` 는 폼 컴포넌트 (TASK-10-11) 에서 `medium` 명시.
3. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.6
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-11-web-epic-form-modal-priority-wire.md`](./tasks-10-11-web-epic-form-modal-priority-wire.md)
- [`./tasks-10-12-web-epic-detail-modal-priority.md`](./tasks-10-12-web-epic-detail-modal-priority.md)
- `apps/web/src/lib/forms/schemas.ts`
