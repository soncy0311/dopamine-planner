# TASK-10-11: web — `EpicFormModal.tsx` `useCreateEpic` payload 에 priority 전달

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-11
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입), TASK-10-09 (`EpicFormSchema.priority`)

## 작업 목표

sub-prd-10 §4.2 — `apps/web/src/components/modals/EpicFormModal.tsx` 의 priority radiogroup 은 이미 존재하나 `useCreateEpic` payload 에 priority 가 누락 (현 L65~70). DB 저장 미연동 상태를 해결.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/EpicFormModal.tsx` | 수정 | `useCreateEpic` 호출 payload 에 `priority` 추가 |

### 변경 세부

```tsx
// 변경 전 (L65~70 잠정)
await create.mutateAsync({
  workspace,
  title: values.title,
  description: values.description ?? null,
  category_id: values.category,
  // priority 누락
});

// 변경 후
await create.mutateAsync({
  workspace,
  title: values.title,
  description: values.description ?? null,
  category_id: values.category,
  priority: values.priority,  // 추가 (default 'medium')
});
```

### 기본값 / 검증

- `useForm` 의 `defaultValues.priority = 'medium'` 설정 (이미 존재 시 보존)
- `EpicFormSchema.priority` (TASK-10-09) 가 enum 으로 검증
- Submit 시 priority 값 유효성 zod 보장

### 회귀 영향

- Epic 생성 시 DB 의 `epic_issue.priority` 가 사용자 선택 값으로 저장
- 메인 일자 뷰의 EpicCard 헤더 priority badge 가 사용자 선택 색으로 노출

## 검증 과정

- [x] `useCreateEpic` 호출 payload 에 `priority` 전달
- [x] `defaultValues.priority` = `'medium'`
- [x] `pnpm --filter @todo-list/web run typecheck` 통과
- [x] 수동: Epic 생성 모달 열기 → priority 선택 (high/medium/low) → 저장 → DB row 확인 + EpicCard 헤더 badge 색 확인

## 주의사항

1. **편집 모달 별도 task**: 본 task 는 생성용. Epic 편집은 TASK-10-12 의 `EpicDetailModal` 에서 처리.
2. **`useCreateEpic` 시그니처**: `services/epic.ts` 의 `EpicInsert` 타입이 priority 자동 수용 (TASK-10-05 검증). 별도 hook 시그니처 변경 X.
3. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.2
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-09-web-form-schemas.md`](./tasks-10-09-web-form-schemas.md)
- [`./tasks-10-12-web-epic-detail-modal-priority.md`](./tasks-10-12-web-epic-detail-modal-priority.md)
- `apps/web/src/components/modals/EpicFormModal.tsx`
