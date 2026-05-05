# TASK-06-07: `CreateTodoModal` / `TodoDetailModal` priority radio + 분류 combobox 정합

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 07
- **상태**: 미착수 (사용자 결정 필요: 라벨 정합 — "등록일" vs "기한")
- **의존성**: TASK-06-01 (priority 색 토큰), TASK-06-06 (Combobox)

## 작업 목표

CreateTodoModal / TodoDetailModal 의 우선순위 native `<select>` 를 3색 badge `radiogroup` 으로, 분류 native `<select>` 를 Combobox 로 교체한다. 두 모달의 변경 정합을 일치시킨다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/CreateTodoModal.tsx` | 수정 | priority radio + 분류 Combobox |
| `apps/web/src/components/modals/TodoDetailModal.tsx` | 수정 | 동일 정합 |

### Priority radio group

```tsx
<fieldset>
  <legend className="text-sm font-medium">우선순위</legend>
  <div role="radiogroup" className="flex gap-2" onKeyDown={handleArrowKeys}>
    {(['high', 'medium', 'low'] as const).map((p, i) => (
      <button
        key={p}
        type="button"
        role="radio"
        aria-checked={value === p}
        tabIndex={value === p || (value == null && i === 0) ? 0 : -1}
        onClick={() => onChange(p)}
        className={priorityBadgeClass(p, value === p)}
      >
        {p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}
      </button>
    ))}
  </div>
</fieldset>
```

`handleArrowKeys`: ArrowLeft/Right → 인접 옵션 활성. roving tabindex 패턴.

### 분류 Combobox

```tsx
<Combobox<Category>
  options={categories}
  value={selectedCategory}
  onChange={(c) => setValue('categoryId', c?.id ?? null)}
  getId={(c) => c.id}
  getLabel={(c) => c.name}
  placeholder="분류 검색..."
/>
{/* hidden form field 로 categoryId 저장 (zod schema 와 정합) */}
<input type="hidden" {...register('categoryId')} />
```

### 라벨 정합 결정

- prototype "등록일" vs 도메인 `due_date` ("이 투두를 보여줄 날짜" = "기한")
- **본 plan 가정**: 도메인 정합 "기한" 유지 (sub-prd-06 §주의사항 7).
- 결정자 합류 시 본 task 본문 갱신.

### 참조 코드

- sub-prd-06 §5 "CreateTodoModal / TodoDetailModal"
- sub-prd-06 §주의사항 7 "라벨 정합 결정"
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:432-448`
- 기존 schema: `apps/web/src/lib/forms/schemas.ts` 의 `priority: z.enum(['high', 'medium', 'low'])`

## 검증 과정

- [ ] CreateTodoModal: priority `<select>` → radio group 교체
- [ ] CreateTodoModal: 분류 `<select>` → Combobox 교체
- [ ] TodoDetailModal: 동일 정합
- [ ] priority radio 키보드 ArrowLeft/Right 로 이동 + Enter/Space 로 선택
- [ ] roving tabindex (`tabIndex={0/-1}`) 적용
- [ ] Combobox 선택 결과가 hidden input 의 `categoryId` 에 반영
- [ ] 폼 제출 시 zod schema 통과 (priority enum + categoryId UUID)
- [ ] 라벨 텍스트 "기한" (또는 사용자 결정 결과)
- [ ] 키보드 only 로 모달 전체 작성/제출 가능
- [ ] `pnpm --filter @todo-list/web lint` 통과

## 주의사항

1. **사용자 결정 미해결 — 라벨** — sub-prd-06 §주의사항 7 — "등록일" vs "기한". 본 plan 은 "기한" 가정. 결정자 합류 시 본 task 본문과 모달 텍스트를 함께 갱신.
2. **schema 변경 0** — `apps/web/src/lib/forms/schemas.ts` 의 `priority` enum 은 이미 정의됨. UI 만 교체. 폼 라이브러리 (`react-hook-form`) 와 통합 시 `Controller` 또는 `register` + setValue 패턴.
3. **TASK-06-06 머지 후 진입** — Combobox 미신설 상태에서 시작 시 import 깨짐.
4. **roving tabindex** — radiogroup 전체가 한 tab stop. ArrowLeft/Right 로 그룹 내부 이동.
5. **CreateTodoModal / TodoDetailModal 동시 정합** — 두 모달이 같은 priority/분류 UX 를 공유하므로 헬퍼 컴포넌트 (`PriorityRadioGroup`, `CategoryCombobox`) 를 추출하면 중복 0. 단, 추출 여부는 구현 시 판단 (premature abstraction 회피).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §5
- [`./tasks-03-07-create-todo-create-modal.md`](./tasks-03-07-create-todo-create-modal.md)
- [`./tasks-03-08-create-todo-detail-modal.md`](./tasks-03-08-create-todo-detail-modal.md)
- [`./tasks-06-06-create-combobox-component.md`](./tasks-06-06-create-combobox-component.md)
