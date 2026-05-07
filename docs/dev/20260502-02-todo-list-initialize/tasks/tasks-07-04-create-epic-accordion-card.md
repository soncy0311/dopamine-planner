# TASK-07-04: `EpicAccordionCard` 컴포넌트 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 04
- **상태**: 완료 (2026-05-06)
- **의존성**: TASK-07-01 (도메인 타입 확정), 선행 sub-prd-06 (priority / carryOverCount 확장된 TodoItem) 머지 후

## 작업 목표

prototype 정합 헤더(체크박스 + 카테고리 badge + 제목 + 진행률 텍스트 + chevron) + segmented progress bar + 펼침 시 sub-issue 목록을 렌더하는 `EpicAccordionCard` 컴포넌트를 `packages/ui` 에 신설한다. 데이터 fetch 는 host 책임 (props 주입형).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EpicAccordionCard.tsx` | 신설 | 본체 컴포넌트 |
| `packages/ui/src/index.ts` | 수정 | `EpicAccordionCard` re-export |

### Props 시그니처 (sub-prd-07 §1 정합)

```ts
export type EpicAccordionCardProps = {
  epicId: string;
  title: string;
  progressPercent: number;        // 0–100 (호출 측에서 0~1 비율 → 백분율 변환 후 주입)
  segments: { filled: boolean }[]; // sub-issue 수만큼 segment
  category?: { name: string; color: string };
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;
  mainStatus: 'todo' | 'done';
  subIssues: Array<{
    id: string;
    title: string;
    status: 'todo' | 'done';
    priority?: 'high' | 'medium' | 'low' | null;
    carryOverCount?: number;
    category?: { name: string; color: string };
    onToggle: () => void;
    onPress?: () => void;
  }>;
};
```

### 구조 (요약)

```tsx
<article data-expanded={expanded} className="...">
  <header className="flex items-center gap-3">
    <Checkbox checked={mainStatus === 'done'} onChange={onMainToggle} />
    {category ? <CategoryBadge {...category} /> : null}
    <span className="flex-1 truncate text-sm font-medium">{title}</span>
    <span className="text-xs text-periwinkle-400">{progressPercent}%</span>
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={`epic-${epicId}-body`}
      onClick={onToggleExpand}
      aria-label={expanded ? '접기' : '펼치기'}
    >
      <ChevronRight className={expanded ? 'rotate-90 transition' : 'transition'} aria-hidden />
    </button>
  </header>
  <EpicProgressBar
    total={segments.length}
    done={segments.filter((s) => s.filled).length}
    segments
  />
  {expanded ? (
    <ul id={`epic-${epicId}-body`} role="list" className="...">
      {subIssues.map((s) => (
        <TodoItem key={s.id} {...s} />
      ))}
    </ul>
  ) : null}
</article>
```

### EpicProgressBar adaptor

- 본 컴포넌트의 props `segments: { filled }[]` 와 기존 `EpicProgressBar` 의 props `{ total, done, segments?: boolean }` 가 다르다.
- adaptor: `total = segments.length`, `done = segments.filter(s => s.filled).length`, `segments={true}` (segmented 모드).
- 별도 컴포넌트 신설은 회피. `EpicProgressBar` 에 새 시그니처를 추가하지 않는다.

### sub-issue row

- 결정: **`TodoItem` 재사용** (sub-prd-07 §주의사항 1 의 옵션 중 채택). 신설 `EpicSubIssueRow` 는 만들지 않는다.
- 이유: sub-prd-06 의 TodoItem props 가 priority / carryOverCount 까지 확장되어 sub-issue 표현에 충분.
- 시각 차이가 필요해지면 `<ul>` wrapper 의 className 으로 들여쓰기 / 구분선 처리.

### 데이터 / 콜백 책임 분리

- 본 컴포넌트는 **데이터 fetch 0건** — `useTodos` / `useEpics` 호출 금지.
- toggle / expand / cascade 콜백은 host (`MainDailyView`) 가 주입.
- `packages/ui` 의 peerDependencies 0건 정책 유지 (sub-prd-02 정합).

### 참조 코드

- sub-prd-07 §1 / §핵심 구현 로직
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:105-134`
- prototype `docs/base/prototype/css/organisms.css:197-247`
- `packages/ui/src/EpicProgressBar.tsx` — segmented 모드 props 호환 확인

## 검증 과정

- [ ] `packages/ui/src/index.ts` 에서 `EpicAccordionCard` export
- [ ] props 시그니처가 sub-prd-07 §1 과 일치
- [ ] `expanded === false` 일 때 `<ul>` body 미렌더
- [ ] `expanded === true` 일 때 `subIssues.length` 만큼 TodoItem 렌더
- [ ] 메인 체크 클릭 → `onMainToggle` 호출
- [ ] chevron 클릭 → `onToggleExpand` 호출
- [ ] chevron 의 `aria-expanded` 값이 `expanded` 와 동기
- [ ] chevron 에 `expanded` 일 때 `rotate-90` className 적용
- [ ] EpicProgressBar adaptor 변환 (`total / done`) 정확
- [ ] `pnpm --filter @todo-list/ui lint` / `typecheck` 통과
- [ ] 단위 테스트 (TASK-07-07) — expand 분기 / 콜백 호출 / sub-issue 렌더

## 주의사항

1. **데이터 fetch 금지** — 본 컴포넌트는 `packages/ui` 위치. react-query / supabase 의존 0건. host 가 props 주입.
2. **백분율 변환 책임** — `progressPercent` 는 0~100 정수. 호출 측에서 `Math.round(epic.progress * 100)` 변환 후 주입. 본 컴포넌트는 그대로 표시만.
3. **TodoItem 직접 수정 금지** — sub-prd-06 의 freeze 인터페이스 준수. priority / carryOverCount 등 props 는 그대로 통과.
4. **EpicProgressBar 시그니처 변경 금지** — adaptor 로 호환. 기존 컴포넌트의 props 를 바꾸면 다른 호출 측 회귀.
5. **mobile RN 분리** — 본 task 는 web 전용. mobile RN 의 epic 카드는 후속 mobile sub.
6. **inline style 금지** — Tailwind 토큰 / 기존 atom / molecule 클래스만 사용. 카테고리 color chip 1점 예외만 허용.
7. **접근성** — chevron 에 `aria-expanded` + `aria-label` 필수. 키보드 only 토글 가능해야 함 (TASK-07-08 검증).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §1, §핵심 구현 로직
- [`./tasks-02-04-create-ui-epic-progress-bar.md`](./tasks-02-04-create-ui-epic-progress-bar.md)
- [`./tasks-02-03-create-ui-todo-item.md`](./tasks-02-03-create-ui-todo-item.md)
- [`./tasks-06-04-extend-todo-item-meta.md`](./tasks-06-04-extend-todo-item-meta.md)
