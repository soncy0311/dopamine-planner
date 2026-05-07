# SUB-PRD: `웹 관리 화면`

## 작업 정보

- **작업명**: `웹 관리 화면`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-05
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05 (task 14 완료 — 정적 검증 + grep 정책 통과 / 수동 시나리오는 사용자 확인 대기)
- **상태**: 완료 (자동 검증) / 수동 시나리오 사용자 확인 대기
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: [`sub-prd-01-feat-core-services.md`](./sub-prd-01-feat-core-services.md), [`sub-prd-02-feat-web-main-view.md`](./sub-prd-02-feat-web-main-view.md)

## 배경 및 목적

Sub-02 가 메인 일자 뷰 (조회·토글) 를 완성했지만, **시드 데이터 추가** (분류·Epic·Sub 신규 생성) 가 불가능한 상태다. 본 sub 는 Sub-02 위에 다음을 얹는다:

- 투두 생성 / 상세·수정·삭제 모달
- 분류(Category) 관리 화면 + 모달
- Epic 관리 화면 + 모달 (진행률 표시)
- 설정 화면 (계정 정보, 로그아웃)
- 라우트·네비게이션 추가

본 sub 가 종료되면 신규 사용자가 로그인 → 분류 생성 → Epic 생성 → Sub 생성 → 토글까지 단일 환경(웹) 에서 끝까지 수행 가능해진다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (`output: 'export'` SPA), React 19 |
| 폼 | `react-hook-form` + `zod` (resolver) |
| 모달 | Radix UI Dialog (이미 `@todo-list/ui` 에 추가) |
| 상태 | TanStack Query v5 (Sub-01 의 mutation 훅) |
| 토스트 | `sonner` (또는 `@todo-list/ui` 의 wrapper) |
| 스타일 | Tailwind v4 + 디자인 토큰 |

## 핵심 요구 사항

### 1. 투두 생성 모달 (`<CreateTodoModal>`)

- 트리거: FAB 또는 메인 뷰의 + 버튼
- 필드: 제목 (필수) / 설명 (선택) / 우선순위 (`high|medium|low`) / 분류 (cascading) / Epic (cascading) / due_date (기본=현재 선택일)
- cascading select — 분류 선택 후 해당 워크스페이스의 Epic 만 표시 (Sub-01 의 `useEpics(categoryId)`)
- 제출 → `useCreateTodo()` → 성공 시 모달 닫기 + 토스트
- ESC / overlay 클릭으로 닫기

### 2. 투두 상세·수정·삭제 모달 (`<TodoDetailModal>`)

- TodoItem 클릭 시 open
- 동일 폼에 기존 값 채움 (수정 모드)
- 하단에 "삭제" 버튼 — confirm 후 `useDeleteTodo()`
- 수정 → `useUpdateTodo()`

### 3. 분류 관리 화면 (`/life/categories`, `/work/categories`)

- 워크스페이스별 분류 리스트 + sort_order 순
- "분류 추가" 버튼 → `<CategoryFormModal>` (생성)
- 각 항목 옆 수정·삭제 아이콘
- 삭제 시 FK 위반 (23503) 발생 가능 → 친화 토스트 (`이 분류에 Epic 이 있어 삭제할 수 없어요`)
- 색상 선택은 디자인 시스템 팔레트 내 (예: 8색)

### 4. Epic 관리 화면 (`/life/epics`, `/work/epics`)

- 분류별 그룹 리스트 + 진행률 세그먼트 프로그레스바
- "Epic 추가" 버튼 → `<EpicFormModal>` — 분류 선택 cascading
- 각 항목 옆 수정·삭제 아이콘
- 삭제 시 하위 Sub 존재하면 23503 → 친화 토스트
- Epic 메인 체크박스 — 토글 시 하위 Sub 일괄 토글 (서비스 단에서 일괄 update)

### 5. 설정 화면 (`/settings`)

- 계정 정보 (email, displayName) 표시
- 로그아웃 버튼 — `supabase.auth.signOut()` → `qc.clear()` → `/login` 으로 redirect
- 분류 관리 / Epic 관리 진입 링크
- (추후 통계·테마 항목 placeholder)

### 6. 라우트·네비 추가

- `apps/web/src/app/(main)/life/categories/page.tsx`
- `apps/web/src/app/(main)/work/categories/page.tsx`
- `apps/web/src/app/(main)/life/epics/page.tsx`
- `apps/web/src/app/(main)/work/epics/page.tsx`
- `apps/web/src/app/(main)/settings/page.tsx`
- 사이드 네비에 `설정` 항목 추가 (Sub-02 의 `<SideNav>` 갱신)

## 핵심 구현 로직

### cascading select (분류 → Epic)

```tsx
const [categoryId, setCategoryId] = useState<string | null>(null);
const { data: categories } = useCategories(workspace);
const { data: epics } = useEpics(categoryId);

<Select value={categoryId} onChange={setCategoryId}>
  {categories?.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
</Select>
<Select value={epicId} onChange={setEpicId} disabled={!categoryId}>
  {epics?.map(e => <Option key={e.id} value={e.id}>{e.title}</Option>)}
</Select>
```

### Zod + RHF 폼

```tsx
const TodoFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  categoryId: z.string().uuid(),
  epicId: z.string().uuid(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const form = useForm<z.infer<typeof TodoFormSchema>>({
  resolver: zodResolver(TodoFormSchema),
  defaultValues: { priority: 'medium', dueDate: today() },
});
```

### FK 에러 친화 토스트

```ts
const remove = useMutation({
  mutationFn: (id: string) => categoryService.remove(client, id),
  onError: (err: any) => {
    if (err?.code === '23503') {
      toast.error('이 분류에 Epic 이 있어 삭제할 수 없어요. 먼저 Epic 을 정리해주세요.');
    } else {
      toast.error(err.message ?? '삭제 실패');
    }
  },
});
```

### 로그아웃

```ts
async function logout() {
  await supabase.auth.signOut();
  qc.clear(); // 모든 캐시 폐기 — 다른 계정 로그인 시 잔존 방지
  router.replace('/login');
}
```

## 구현 시 주의사항

1. **모달 ESC / overlay 닫기 의무** — Radix Dialog 의 기본 동작 유지. `modal={true}` 명시
2. **색상 토큰 팔레트 내** — 분류 색상은 디자인 시스템 팔레트 8색 안에서만 선택 가능. 자유 입력 금지
3. **모바일 뷰포트 풀스크린 모달** — `sm:max-w-lg sm:rounded-lg` 로 데스크톱은 카드, 모바일은 풀스크린
4. **FK 에러 처리 의무** — 분류·Epic 삭제 시 23503 친화 토스트 필수. 일반 `error.message` 노출 금지
5. **로그아웃 시 `qc.clear()` 의무** — 다른 계정으로 재로그인할 때 캐시 잔존 방지
6. **cascading 초기화** — 분류 변경 시 Epic 선택값을 null 로 reset (이전 분류의 Epic 이 잘못 제출되지 않도록)
7. **due_date 기본값 = 현재 선택일** — 메인 뷰의 `?date=` 와 일치. today 가 아님
8. **Epic 메인 체크박스 일괄 토글은 단일 트랜잭션** — 하위 Sub 일괄 update 는 `from('sub_issue').update().in('id', subIds)` 1회

## 작업

- [x] `apps/web/src/components/modals/CreateTodoModal.tsx` 신설
- [x] `apps/web/src/components/modals/TodoDetailModal.tsx` 신설 (수정·삭제 통합)
- [x] `apps/web/src/components/modals/CategoryFormModal.tsx` 신설 (생성·수정)
- [x] `apps/web/src/components/modals/EpicFormModal.tsx` 신설 (생성·수정)
- [x] `apps/web/src/components/modals/ConfirmDeleteDialog.tsx` 신설 (공용 confirm)
- [x] `apps/web/src/app/(main)/life/categories/page.tsx` 신설
- [x] `apps/web/src/app/(main)/work/categories/page.tsx` 신설
- [x] `apps/web/src/app/(main)/life/epics/page.tsx` 신설
- [x] `apps/web/src/app/(main)/work/epics/page.tsx` 신설
- [x] `apps/web/src/app/(main)/settings/page.tsx` 신설
- [x] `apps/web/src/components/SideNav.tsx` 수정 — `설정` 항목 추가 (sub-02 산출로 이미 적용)
- [x] `apps/web/src/components/MainDailyView.tsx` 수정 — FAB onClick 에 `<CreateTodoModal>` open 연결
- [x] `apps/web/src/components/TodoItem.tsx` 수정 — 클릭 시 `<TodoDetailModal>` open (sub-02 가 onPress 콜백 prop 으로 분리, host 인 MainDailyView 에서 setDetailTodoId 연결)
- [x] `apps/web/src/lib/forms/schemas.ts` 신설 (Zod 스키마)
- [x] `apps/web/src/lib/auth/logout.ts` 신설 (`signOut + qc.clear + redirect`)
- [x] FK 에러 친화 토스트 처리
- [x] `pnpm --filter @todo-list/web build` 통과 ✅ 2026-05-05
- [x] `pnpm --filter @todo-list/web typecheck` 통과 ✅ 2026-05-05
- [x] `pnpm --filter @todo-list/web lint` 통과 ✅ 2026-05-05

## 검증 기준

> **수동 항목** (브라우저 시나리오 8종) 은 agent 직접 수행 불가로 사용자 확인 후 [x] 마킹 필요. **자동 항목** (build / typecheck) 은 task 14 에서 통과 확인 완료.

- [ ] 신규 사용자 시뮬레이션 — `/life/categories` 진입 → 분류 1개 생성 → `/life/epics` 에서 Epic 1개 생성 → `/life` 에서 FAB → Sub 1개 생성 → 토글 → 완료 섹션 이동 (5단계 시나리오 통과) — **수동 확인 필요**
- [ ] 분류 삭제 시 하위 Epic 존재하면 친화 토스트 (`이 분류에 Epic 이 있어 삭제할 수 없어요`) — **수동 확인 필요**
- [ ] Epic 메인 체크박스 토글 시 하위 Sub 일괄 토글 + 진행률 100% 또는 0% 즉시 반영 — **수동 확인 필요**
- [ ] 설정 화면 로그아웃 → `/login` 으로 redirect + 이후 `/life` 직접 진입 시 다시 로그인 화면 — **수동 확인 필요**
- [ ] 다른 계정으로 재로그인 시 이전 계정의 데이터가 캐시에 남지 않음 (`qc.clear()` 검증) — **수동 확인 필요**
- [ ] 모달 ESC / overlay 클릭으로 닫기 동작 — **수동 확인 필요**
- [ ] 데스크톱 뷰포트에서 모달은 카드, 모바일 뷰포트(<640px) 에서 모달은 풀스크린 — **수동 확인 필요**
- [ ] cascading select — 분류 변경 시 Epic 선택값이 null 로 초기화 — **수동 확인 필요**
- [x] `pnpm --filter @todo-list/web build` 통과 ✅ 2026-05-05
- [x] `pnpm --filter @todo-list/web typecheck` 통과 ✅ 2026-05-05

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
