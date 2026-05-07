# TASK-10-14: web — `TodoDetailModal.tsx` priority 필드 제거 + schema / fetch / update 갱신

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-14
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-09 (forms schemas)

## 작업 목표

sub-prd-10 §4.5 — `apps/web/src/components/modals/TodoDetailModal.tsx` 에서:
1. priority 필드 / `PriorityRadioGroup` 제거
2. `SubIssueEditSchema.priority` 제거
3. `fetchTodoDetail` select 절 priority 제거
4. `update.mutateAsync.patch.priority` 제거

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/TodoDetailModal.tsx` | 수정 | priority 필드 / schema / fetch / update payload 모두 제거 |

### 변경 세부

#### 1. `SubIssueEditSchema.priority` 제거

```ts
// 변경 전
const SubIssueEditSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  ...
  priority: z.enum(['high', 'medium', 'low']),
});

// 변경 후 — priority 필드 제거
```

#### 2. `fetchTodoDetail` select 갱신

```ts
const { data } = await supabase
  .from('sub_issue')
  .select('id, title, description, registered_date, status, epic_id, category_id')
  // priority 제거
  .eq('id', subId)
  .single();
```

#### 3. `TodoDetailFetch` 타입 갱신 — priority 필드 제거

#### 4. `PriorityRadioGroup` 렌더 제거

```tsx
// 변경 전
<Controller name="priority" control={control} render={...} />

// 변경 후 — 블록 전체 삭제
```

#### 5. `update.mutateAsync.patch` 갱신

```tsx
// 변경 전
await update.mutateAsync({
  id: subId,
  patch: {
    title: values.title,
    description: values.description ?? null,
    priority: values.priority,  // 제거
  },
});

// 변경 후
await update.mutateAsync({
  id: subId,
  patch: {
    title: values.title,
    description: values.description ?? null,
  },
});
```

### 회귀 영향

- Sub 편집 시 priority 입력 부재
- DB 의 `sub_issue.priority` 가 drop (TASK-10-02) 되었으므로 양방향 정합

## 검증 과정

- [x] `TodoDetailModal.tsx` 안 priority 키워드 0건
- [x] `SubIssueEditSchema` 에 priority 필드 0건
- [x] `fetchTodoDetail` select 에 priority 0건
- [x] `update.mutateAsync.patch` 에 priority 0건
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: Sub 편집 모달 진입 → priority 입력 부재 → 저장 → DB row 정합

## 주의사항

1. **양방향 정합**: TASK-10-04 의 `mapSubIssueRow` 가 priority 미매핑이라 fetch select 에 priority 잔존 시 typecheck 실패 (의도된 강제).
2. **편집 fields 동등성**: 본 task 후 Sub 편집 모달은 title / description / status (또는 동등) 만 노출. 추가 필드 신설 X.
3. **scope = refactor(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.5
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-09-web-form-schemas.md`](./tasks-10-09-web-form-schemas.md)
- `apps/web/src/components/modals/TodoDetailModal.tsx`
