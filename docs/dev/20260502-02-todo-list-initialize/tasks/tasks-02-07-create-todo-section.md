# TASK-02-07: `DoneSection` / `TodoSection` 신설 (단일 컴포넌트 2회 렌더)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 07
- **상태**: 대기중
- **의존성**: 03 (TodoItem)

## 작업 목표

메인 일자 뷰의 "완료" / "진행 중" 두 섹션을 동일 컴포넌트 (`<TodoSection title status="done|todo" items={...} />`) 로 두 번 렌더하는 구조로 만든다. sub-prd §4 "동일 컴포넌트 2회 렌더" 명세 준수.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/TodoSection.tsx` | 신설 | `<TodoSection />` (두 섹션 공용) |
| `apps/web/src/components/DoneSection.tsx` | 신설 (얇은 wrapper) | `<TodoSection status="done" title="완료" />` 호출 |

### Props 시그니처 (TodoSection)

```tsx
type TodoSectionProps = {
  title: '완료' | '진행 중';
  status: 'done' | 'todo';
  items: TodoView[];                  // useTodos 반환값의 done|todo 배열
  onToggle: (item: TodoView) => void; // host 가 useToggleTodo wrap
  onPress?: (item: TodoView) => void; // 상세 모달 (Sub-03)
};
```

### 구현 세부사항

- 헤더 — `${title} (${items.length})` (e.g. `완료 (2)`, `진행 중 (3)`)
- 본문 — `items.map(item => <TodoItem ...>)` (task 03)
- 빈 상태 placeholder
  - `status='done'` 빈 배열 → `완료된 일이 없어요`
  - `status='todo'` 빈 배열 → `진행 중인 일이 없어요`
- `DoneSection` / `TodoSection` 별도 named export 가 호출하는 호스트 측 import 편의를 위해 wrapper 만 제공 (또는 `TodoSection` 단일 export + props 만 다르게 호출). sub-prd §작업 6 의 파일명 둘 다 신설 요구를 충족시키되 코드 중복은 방지.

### 참조 코드

sub-prd-02 §4 "섹션 컴포넌트" + §핵심 구현 로직 `<MainDailyView>` 골격 中:

```tsx
<DoneSection items={data?.done ?? []} />
<TodoSection items={data?.todo ?? []} />
```

## 검증 과정

- [ ] `apps/web/src/components/TodoSection.tsx` 파일 존재
- [ ] `apps/web/src/components/DoneSection.tsx` 파일 존재
- [ ] 카운트 표시 (`완료 (N)` / `진행 중 (N)`) 정확
- [ ] 빈 상태 메시지 2종 분기 존재
- [ ] `<TodoItem>` (task 03) import 사용
- [ ] react-query hook 직접 import 0건 (host 책임)
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **단일 컴포넌트 2회 렌더 원칙** — sub-prd §4 가 명시. `DoneSection` 과 `TodoSection` 의 본문 로직이 거의 동일해야 한다. `DoneSection` 은 `TodoSection` 을 wrap 하는 얇은 컴포넌트로 둠.
2. **react-query 직접 호출 금지** — 토글 콜백은 host (`MainDailyView`, task 08) 가 `useToggleTodo` 호출 후 prop 으로 주입. 본 컴포넌트는 mutation hook import 0건.
3. **카운트 = items.length** — `useTodos` 반환의 `done` / `todo` 배열 그대로 사용. 별도 카운트 쿼리 추가 금지.
4. **빈 상태 문구** — sub-prd 본문 그대로. 디자인 시스템 토큰의 muted 톤으로 표시.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §4
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useTodos`, `useToggleTodo`
