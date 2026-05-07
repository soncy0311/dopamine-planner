# TASK-10-12: web — `EpicDetailModal.tsx` priority 필드 추가 + schema / fetch / update wiring

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-12
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입), TASK-10-09 (forms schemas)

## 작업 목표

sub-prd-10 §4.3 — `apps/web/src/components/modals/EpicDetailModal.tsx` 에 priority 필드를 추가해 Epic 편집 시 priority 변경 가능하도록 wiring.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/EpicDetailModal.tsx` | 수정 | `PriorityRadioGroup` 추가 + `EpicEditSchema.priority` + `fetchEpicDetail` select priority + `useUpdateEpic.patch` priority |

### 변경 세부

#### 1. `EpicEditSchema` 갱신

```ts
const EpicEditSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),  // 추가
});
```

#### 2. `fetchEpicDetail` select 절 priority 추가

```ts
const { data } = await supabase
  .from('epic_issue')
  .select('id, title, description, category_id, priority')  // priority 추가
  .eq('id', epicId)
  .single();
```

#### 3. `EpicDetailFetch` 타입 갱신

```ts
type EpicDetailFetch = {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  priority: 'high' | 'medium' | 'low';  // 추가
};
```

#### 4. `defaultValues` 에 priority 채움

```ts
const { reset } = useForm({
  defaultValues: {
    ...
    priority: data?.priority ?? 'medium',
  },
});
```

#### 5. `PriorityRadioGroup` 컴포넌트 렌더

```tsx
<Controller
  name="priority"
  control={control}
  render={({ field }) => (
    <PriorityRadioGroup value={field.value} onChange={field.onChange} />
  )}
/>
```

> `PriorityRadioGroup` 는 `EpicFormModal` 또는 `apps/web/src/components/forms/PriorityRadioGroup.tsx` 에 이미 존재하는 컴포넌트 재사용. 부재 시 EpicFormModal 의 라디오 마크업 추출 / 컴포넌트화.

#### 6. `useUpdateEpic.patch` 에 priority 포함

```tsx
await update.mutateAsync({
  id: epicId,
  patch: {
    title: values.title,
    description: values.description ?? null,
    category_id: values.category,
    priority: values.priority,  // 추가
  },
});
```

### 회귀 영향

- Epic 편집 모달에서 priority 변경 가능
- Realtime 구독을 통해 다른 디바이스 즉시 반영 (TASK-10-30 회귀 검증)

## 검증 과정

- [x] `EpicEditSchema.priority` 정의
- [x] `fetchEpicDetail` select 에 priority 포함
- [x] `EpicDetailFetch` 타입에 priority
- [x] `defaultValues.priority` 채움
- [x] `PriorityRadioGroup` 렌더
- [x] `useUpdateEpic.patch` 에 priority 포함
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: 편집 진입 → priority 변경 → 저장 → DB / EpicCard 헤더 즉시 반영

## 주의사항

1. **`PriorityRadioGroup` 재사용**: EpicFormModal / EpicDetailModal 모두 동일 컴포넌트 사용. 부재 시 본 task 안에서 추출.
2. **`useUpdateEpic` 시그니처**: TASK-10-05 검증으로 `EpicUpdate` 가 priority 자동 수용. 별도 hook 변경 X.
3. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.3
- [`./tasks-10-09-web-form-schemas.md`](./tasks-10-09-web-form-schemas.md)
- [`./tasks-10-11-web-epic-form-modal-priority-wire.md`](./tasks-10-11-web-epic-form-modal-priority-wire.md)
- `apps/web/src/components/modals/EpicDetailModal.tsx`
