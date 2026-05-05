# TASK-06-04: `packages/ui/TodoItem` props 확장 + 섹션 헤더 시각

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 04
- **상태**: 미착수
- **의존성**: TASK-06-01 (priority 색 토큰 필요)

## 작업 목표

TodoItem 에 `priority` / `carryOverCount` props 를 확장하여 prototype 의 priority 3색 badge + 이월 "+N" 뱃지를 노출한다. 더불어 TodoSection / DoneSection 섹션 헤더의 활성/비활성 시각 톤을 prototype 정합으로 조정한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/TodoItem.tsx` | 수정 | `priority` / `carryOverCount` props 추가 + badge 렌더 |
| `apps/web/src/components/TodoSection.tsx` | 수정 | 헤더 활성 시각 (검정) |
| `apps/web/src/components/DoneSection.tsx` | 수정 | 헤더 50% opacity |
| `apps/web/src/components/MainDailyView.tsx` | 수정 | TodoItem 호출 측에 priority / carryOverCount 전달 |

### Props 시그니처 (TodoItem)

```tsx
type TodoItemProps = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  category?: { name: string; color: string };
  priority?: 'high' | 'medium' | 'low' | null;   // 신설
  carryOverCount?: number;                        // 신설
  onToggle: () => void;
  onPress?: () => void;
};
```

### 렌더 규칙

- `priority` 가 truthy → 3색 badge 인라인 (제목 좌측 또는 카드 우측, prototype 위치 정합)
  - high → `bg-priority-high-bg text-priority-high`
  - medium → `bg-priority-medium-bg text-priority-medium`
  - low → `bg-priority-low-bg text-priority-low`
- `carryOverCount > 0` → 제목 우측에 `+{N}` 뱃지 + `aria-label="이월 {N}회"`
- `carryOverCount === 0 || undefined` → 미노출

### 핵심 코드

```tsx
{priority ? (
  <span className={priorityBadgeClass(priority)}>
    {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
  </span>
) : null}
{carryOverCount && carryOverCount > 0 ? (
  <span className="text-xs text-muted-foreground" aria-label={`이월 ${carryOverCount}회`}>
    +{carryOverCount}
  </span>
) : null}
```

### MainDailyView 호출 측

```tsx
<TodoItem
  id={todo.id}
  title={todo.title}
  status={todo.status}
  category={todo.category}
  priority={todo.priority}
  carryOverCount={todo.carry_over_count}
  onToggle={() => toggle(todo.id)}
  onPress={() => openDetail(todo.id)}
/>
```

### 참조 코드

- sub-prd-06 §4 "TodoItem 카드 메타"
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:157, 432-437`
- prototype `docs/base/prototype/css/atoms.css:258`, `molecules.css:58-59`

## 검증 과정

- [ ] `TodoItem` props 에 `priority` / `carryOverCount` 추가
- [ ] priority 3 case (high/medium/low) 모두 시각 분기
- [ ] `carryOverCount === 0` 또는 `undefined` 일 때 뱃지 미노출
- [ ] DoneSection 헤더가 50% opacity (`opacity-50` 또는 `text-foreground/50`)
- [ ] TodoSection 헤더는 활성 톤 (검정 / 기본 foreground)
- [ ] MainDailyView 가 todo 의 priority / carry_over_count 를 정확히 전달
- [ ] `pnpm --filter @todo-list/ui lint` / `pnpm --filter @todo-list/web lint` 통과

## 주의사항

1. **MainDailyView 동시 수정 충돌** — TASK-06-05 (chip 통합) 도 같은 파일을 건드림. 본 task 가 먼저 머지된 뒤 TASK-06-05 진입.
2. **mobile RN TodoItem 영향 분리** — sub-prd-06 §주의사항 1 — `packages/ui` 의 props 확장만 허용. mobile 의 RN TodoItem 은 후속 mobile sub 에서 정합.
3. **priority 색 토큰 의존** — TASK-06-01 머지 후 진입. 토큰 미정의 상태에서 작업 시 className mismatch 발생.
4. **도메인 데이터 select 검증** — `packages/core` 의 `useTodos` 가 `priority` / `carry_over_count` 를 select 하는지 사전 확인. 누락 시 별도 task 분리 필요 (sub-prd-06 §배경 §(b) 에 따르면 이미 select 됨).
5. **inline style 금지** — priority 색은 Tailwind 토큰 className 으로만 적용. inline `style.color` 금지 (분류 color chip 1 점 예외만 허용).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §4
- [`./tasks-02-03-create-ui-todo-item.md`](./tasks-02-03-create-ui-todo-item.md) — 본 컴포넌트 신설 task
- [`./tasks-06-01-setup-design-tokens-and-pretendard.md`](./tasks-06-01-setup-design-tokens-and-pretendard.md)
