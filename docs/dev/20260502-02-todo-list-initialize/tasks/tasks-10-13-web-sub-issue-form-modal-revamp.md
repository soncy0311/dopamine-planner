# TASK-10-13: web — `SubIssueFormModal.tsx` priority 라디오 제거 + 상위 Epic readonly input 변환

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-13
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-09 (`SubIssueFormSchema` 정합 가능)

## 작업 목표

sub-prd-10 §4.4 — `apps/web/src/components/modals/SubIssueFormModal.tsx` 에서:
1. priority 라디오 그룹 제거 (현 L142~146)
2. `Dialog.Description` 의 Epic 표기를 readonly input 으로 변환
3. `SubIssueFormSchema` priority 필드 제거 (L17 / L42 / L73)
4. `create.mutateAsync` payload 의 `priority: values.priority` 제거

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/SubIssueFormModal.tsx` | 수정 | priority radiogroup 제거 + Epic readonly input + schema priority 제거 + payload 갱신 |

### 변경 세부

#### 1. priority radiogroup 제거 (L142~146)

```tsx
// 변경 전
<Controller
  name="priority"
  control={control}
  render={({ field }) => <PriorityRadioGroup ... />}
/>

// 변경 후 — 블록 전체 삭제
```

#### 2. 상위 Epic 표기 → readonly input

```tsx
// 변경 전 (Dialog.Description 내부)
<Dialog.Description>Epic: {epicTitle}</Dialog.Description>

// 변경 후 — issue-creation.md §3.2 정합
<label className="block">
  <span className="text-xs text-text-secondary">상위 Epic</span>
  <input
    type="text"
    value={epicTitle}
    readOnly
    aria-readonly="true"
    className="mt-1 w-full bg-periwinkle-100 text-text-primary rounded-md px-3 py-2"
  />
</label>
```

#### 3. `SubIssueFormSchema` priority 제거

```ts
// L17
const SubIssueFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  registered_date: z.string(),
  // priority 제거 (L42 enum 정의 / L73 default 모두 함께 제거)
});
```

#### 4. payload 갱신

```tsx
// 변경 전
await create.mutateAsync({
  title: values.title,
  description: values.description ?? null,
  registered_date: values.registered_date,
  priority: values.priority,  // 제거
  epic_id: epicId,
});

// 변경 후
await create.mutateAsync({
  title: values.title,
  description: values.description ?? null,
  registered_date: values.registered_date,
  epic_id: epicId,
});
```

### 회귀 영향

- Sub 생성 시 priority 미입력 (DB 컬럼 자체 부재 — TASK-10-02 정합)
- 모달 안 Epic 표기가 readonly input (회색 배경) — issue-creation.md §3.2 정합

## 검증 과정

- [x] `SubIssueFormModal.tsx` 안 priority 키워드 0건
- [x] Epic 표기가 `<input readOnly>` 로 노출
- [x] `SubIssueFormSchema` 에 priority 필드 0건
- [x] payload 에 `priority` 0건
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: Sub 생성 모달 진입 → Epic 표기 readonly + priority 입력 부재 → 저장 → list 갱신

## 주의사항

1. **bg 토큰**: `bg-periwinkle-100` 또는 디자인 SoT 의 `bg-subtle` 매핑 일관 사용 — 디자인 토큰 SoT 정합 우선.
2. **`aria-readonly`**: 접근성 요구 — readOnly 와 함께 `aria-readonly="true"` 둘 다 명시.
3. **payload 정합**: `services/todo.ts` 의 `TodoInsert` (TASK-10-05) 가 priority 미포함이라 typecheck 가 본 변경을 강제. 누락 시 컴파일 실패 (양방향 검증).
4. **scope = refactor(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.4
- [`./tasks-10-09-web-form-schemas.md`](./tasks-10-09-web-form-schemas.md)
- [`../../../base/design-system/components/issue-creation.md`](../../../base/design-system/components/issue-creation.md) §3.2
- `apps/web/src/components/modals/SubIssueFormModal.tsx`
