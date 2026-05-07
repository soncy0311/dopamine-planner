# TASK-06-05: `apps/web/components/CategoryFilterChips` 신설 + MainDailyView 통합 + FAB 데스크탑 노출

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 05
- **상태**: 완료
- **의존성**: TASK-06-04 (MainDailyView 동시 수정 회피 — TodoItem props 전달 먼저)

## 작업 목표

prototype `page-prototypes-desktop.html:85-91` 정합 — 메인 뷰 상단 가로 스크롤 카테고리 chip 필터를 신설하고 MainDailyView 에 통합한다. 동시에 FAB 의 `md:hidden` wrap 을 제거해 데스크탑·모바일 공통 노출로 변경한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/CategoryFilterChips.tsx` | 신설 | 가로 스크롤 chip 필터 컴포넌트 |
| `apps/web/src/components/MainDailyView.tsx` | 수정 | chip 필터 통합 + todos 클라이언트 필터 + FAB `md:hidden` 제거 |

### Props 시그니처 (CategoryFilterChips)

```tsx
type Category = { id: string; name: string; color: string };

type CategoryFilterChipsProps = {
  categories: Category[];
  selectedId: string | null;     // null = "전체"
  onSelect: (id: string | null) => void;
};
```

### 구현 세부사항

- "전체" chip 하드코딩 (selectedId === null 일 때 활성)
- 동적 카테고리 list — 호출 측이 `useCategories(workspace)` 결과를 props 로 주입
- 가로 스크롤: `flex overflow-x-auto [&::-webkit-scrollbar]:hidden`
- 활성 chip: `aria-pressed="true"` + 활성 토큰 (`bg-primary text-primary-foreground` 등)
- 비활성 chip: `aria-pressed="false"` + 기본 토큰
- 키보드: Tab 으로 chip 간 이동, Enter/Space 로 선택

### MainDailyView 통합

```tsx
const { data: categories = [] } = useCategories(workspace);
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

const filteredTodos = useMemo(
  () => (selectedCategoryId ? todos.filter((t) => t.category?.id === selectedCategoryId) : todos),
  [todos, selectedCategoryId],
);

// JSX:
// <CategoryFilterChips categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
// ... TodoSection / DoneSection 가 filteredTodos 를 사용
// <FAB onPress={...} />   ← md:hidden wrap 제거
```

### 참조 코드

- sub-prd-06 §2 "카테고리 chip 필터", §6 "FAB 데스크탑 노출"
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:85-91`
- prototype `docs/base/prototype/css/molecules.css:569-605`
- prototype `docs/base/prototype/css/pages.css:41-55`

## 검증 과정

- [x] `CategoryFilterChips.tsx` 신설 + props 시그니처 일치
- [x] "전체" chip 노출 + 초기 활성
- [x] `useCategories(workspace)` 결과를 chip 으로 렌더
- [x] chip 클릭 시 todos 클라이언트 필터링 동작
- [x] 활성 chip 에 `aria-pressed="true"`
- [x] 가로 스크롤바 미노출 (`[&::-webkit-scrollbar]:hidden`)
- [x] 키보드 Tab + Enter/Space 로 선택 가능
- [x] FAB 의 `md:hidden` wrap 제거 → 데스크탑에서도 우측 하단 fixed 노출
- [x] 모바일 (`<md:`) 에서도 FAB / chip 정상 노출 (regression 0)
- [x] `pnpm --filter @todo-list/web lint` 통과

## 주의사항

1. **MainDailyView 동시 수정 충돌 회피** — TASK-06-04 가 같은 파일을 건드림. **TASK-06-04 머지 후 본 task 진입**. 두 변경을 하나의 PR 로 묶을 경우 task 간 순서 유지.
2. **useCategories 검증** — sub-prd-06 §주의사항 3 — `packages/core/src/hooks/useCategories.ts` 가 Sub-01 단계에 머지됐는지 확인 (사전 조사: 이미 존재). 없으면 별도 task 로 분리.
3. **클라이언트 측 필터** — 서버 fetch 변경 없음. `useTodos` 결과를 클라이언트에서 `filter()`. 카테고리 별 query 분리 금지 (캐시 단편화).
4. **FAB regression 검증** — 모바일에서 `MobileTabBar` 와 FAB 위치가 겹치지 않는지 시각 검증.
5. **빈 카테고리 list** — 워크스페이스에 카테고리 0건일 때 "전체" chip 만 노출.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §2, §6
- [`./tasks-06-04-extend-todo-item-meta.md`](./tasks-06-04-extend-todo-item-meta.md)
- [`./tasks-01-08-implement-categories-hooks.md`](./tasks-01-08-implement-categories-hooks.md) — `useCategories` 신설 task
