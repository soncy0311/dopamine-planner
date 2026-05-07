# TASK-02-03: `packages/ui/TodoItem` 컴포넌트

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 03
- **상태**: 완료
- **의존성**: (없음 — host 가 react-query 훅 호출 후 콜백 주입)

## 작업 목표

web/mobile 공유 가능한 TodoItem 컴포넌트를 `@todo-list/ui` 에 신설한다. 체크박스 + 제목 + 분류 라벨(color chip) 을 한 행으로 렌더하며, 토글/클릭 인터랙션은 prop 콜백으로만 노출한다 (직접 react-query 훅 호출 금지).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/TodoItem.tsx` | 신설 | `<TodoItem />` 컴포넌트 |
| `packages/ui/src/index.ts` | 갱신 | TodoItem 재-export |

### Props 시그니처

```tsx
type TodoItemProps = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  category?: { name: string; color: string };
  onToggle: () => void;          // host 가 useToggleTodo 호출
  onPress?: () => void;          // 상세 모달 open (Sub-03)
};
```

### 구현 세부사항

- 체크박스 영역 (44x44 px 이상) 클릭 → `onToggle()` 호출 (이벤트 전파 차단)
- 체크박스 외 영역 클릭 → `onPress?.()` 호출 (제공된 경우만)
- `status === 'done'` 일 때 제목에 `line-through` + 회색 톤 적용
- 분류 라벨 — `category` 가 있으면 우측에 color chip + name 표시. 색은 `category.color` 를 inline `style.backgroundColor` 로 적용 (디자인 토큰 className 만 사용 원칙의 예외 — 분류 색은 사용자 정의 color chip 이므로 동적 hex 허용)
- WCAG 44x44 hit area 체크박스/탭 영역 보장

### 참조 코드

sub-prd-02 §4 "5. `<TodoItem>` 컴포넌트" 명세 그대로.

## 검증 과정

- [x] `packages/ui/src/TodoItem.tsx` 파일 존재
- [x] `packages/ui/src/index.ts` 에 재-export 추가 (`TodoItem`, `TodoItemProps`, `TodoItemCategory`)
- [x] `onToggle` / `onPress` prop 시그니처 일치
- [x] react-query 직접 import 0건
- [x] `@todo-list/core` 직접 import 0건 (host 책임)
- [x] `pnpm --filter @todo-list/ui lint` (=`tsc --noEmit`) 통과

## 주의사항

1. **react-query 의존 금지** — `useToggleTodo` 직접 호출 금지. host (apps/web `MainDailyView`) 가 hook 호출 후 콜백으로 주입. `packages/ui` 의 peerDependencies 0건 유지.
2. **색은 inline style 1점 예외** — 분류 color chip 은 사용자 정의 hex 이므로 inline `style.backgroundColor` 허용. 그 외 모든 색·간격은 Tailwind 토큰 className 만 사용.
3. **WCAG 44x44** — 체크박스 시각 크기는 작더라도 hit area (`p-*` 패딩 또는 `min-w/h`) 는 44x44 이상 보장.
4. **이벤트 전파** — 체크박스 클릭이 카드 클릭(`onPress`) 으로 버블링되지 않도록 `e.stopPropagation()`.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §4-5
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useToggleTodo`
