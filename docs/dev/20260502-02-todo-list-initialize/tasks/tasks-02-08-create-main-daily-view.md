# TASK-02-08: `MainDailyView` 컴포넌트 (`useTodos` + `subscribeTodos` + 섹션 조립)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 08
- **상태**: 완료
- **의존성**: 01 (supabase client), 02 (useDateQuery), 05 (DateNavigator), 06 (FAB), 07 (TodoSection)

## 작업 목표

메인 일자 뷰의 진입 컴포넌트를 신설한다. workspace prop (`life|work`) 을 받아 일자별 todo 데이터 fetch · Realtime 구독 · 섹션 조립 · FAB 트리거를 한 곳에서 처리한다. `<MainDailyView workspace="life" />` 한 줄로 페이지가 완성되는 구조.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 신설 | `<MainDailyView />` 컴포넌트 |

### Props 시그니처

```tsx
type MainDailyViewProps = {
  workspace: 'life' | 'work';
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- 진입 시 호출:
  - `useSupabaseClient()` (또는 `import { supabase }` 직접) → client 인스턴스
  - `useQueryClient()` → qc
  - `useDateQuery()` (task 02) → `[date, setDate]`
  - `useEffect(() => subscribeTodos(client, qc), [client, qc])` → cleanup 으로 unsubscribe (Sub-01 의 `subscribeTodos` 가 cleanup 함수 반환)
  - `useTodos(workspace, date)` → `{ data, isLoading }`
- 렌더 조립
  - `<DateNavigator date={date} onChange={setDate} />` (task 05)
  - `<DoneSection items={data?.done ?? []} onToggle={...} onPress={...} />` (task 07)
  - `<TodoSection items={data?.todo ?? []} onToggle={...} onPress={...} />`
  - `<FAB onClick={openCreateModal} ariaLabel="새 일 추가" className="md:hidden" />` (task 06)
- 토글 콜백 — host 책임으로 `useToggleTodo()` mutation 을 호출하여 `mutate({ id, epicId, nextStatus })` 형태로 주입
- 모달 open 핸들러 (`openCreateModal`) 는 본 sub 에서는 placeholder (`() => {}`) 또는 console.log. **CRUD 모달 import 금지** (Sub-03 가 추가)
- `isLoading` 시 스켈레톤/로딩 indicator (디자인 시스템 토큰)

### 참조 코드

sub-prd-02 §핵심 구현 로직 `<MainDailyView>` 골격 그대로:

```tsx
'use client';

export function MainDailyView({ workspace }: { workspace: Workspace }) {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  const [date, setDate] = useDateQuery();

  useEffect(() => subscribeTodos(client, qc), [client, qc]);

  const { data, isLoading } = useTodos(workspace, date);

  return (
    <div className="flex flex-col h-full">
      <DateHeader date={date} onChange={setDate} />
      <DoneSection items={data?.done ?? []} />
      <TodoSection items={data?.todo ?? []} />
      <FAB onClick={openCreateModal} />
    </div>
  );
}
```

## 검증 과정

- [x] `apps/web/src/components/MainDailyView.tsx` 파일 존재
- [x] `'use client'` 디렉티브
- [x] `subscribeTodos` cleanup effect 등록 (`useEffect(() => subscribeTodos(supabase, qc), [qc])`)
- [x] `useTodos({ client, workspace, date })` 호출 (Sub-01 의 객체 인자 시그니처 준수)
- [x] `useDateQuery` (task 02), `<DateNavigator>` (task 05), `<TodoSection>` (task 07), `<FAB>` (task 06) 모두 사용
- [x] CRUD 모달 import 0건 — `grep "import.*Modal"` 0
- [x] `carryOverTodos` 직접 호출 0건 — `grep "carryOverTodos"` 0
- [x] `tsc --noEmit` 본 파일 관련 에러 0건

## 주의사항

1. **자동 이월 호출 금지** — `carryOverTodos` 직접 호출 금지. `useTodos` 내부 effect 가 처리 (Sub-01 §자동 이월 진입 트리거 위임).
2. **CRUD 모달 import 금지** — `openCreateModal` 은 placeholder. Sub-03 가 모달 컴포넌트 신설 후 본 파일을 수정하여 연결.
3. **Realtime cleanup** — `subscribeTodos` 가 cleanup 함수를 반환하도록 Sub-01 에서 설계됨. effect 가 그대로 반환하면 unmount 시 자동 unsubscribe.
4. **워크스페이스 캐시 분리** — `useTodos(workspace, date)` 의 queryKey 가 workspace 별로 분리되어 있음을 신뢰. 본 파일에서 별도 캐시 분리 로직 추가 금지.
5. **Realtime echo 허용** — 자기 변경 echo 로 인한 invalidate 는 MVP 허용 (sub-prd §주의사항 5). 본 파일에서 dedupe 시도 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §핵심 구현 로직, §6, §8
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useTodos`, `useToggleTodo`, `subscribeTodos`, `carryOverTodos`
