# SUB-PRD: `Epic 아코디언 카드`

## 작업 정보

- **작업명**: `Epic 아코디언 카드` `epic-accordion-card`
- **작업 유형**: `feat` (컴포넌트 신설 + 메인 뷰 통합)
- **시작일**: 2026-05-05
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05
- **상태**: Draft
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**:
  - [`sub-prd-01-feat-core-services.md`](./sub-prd-01-feat-core-services.md) (`useTodos` / `useEpics` 의 select 자산)
  - [`sub-prd-06-feat-web-prototype-visual-alignment.md`](./sub-prd-06-feat-web-prototype-visual-alignment.md) (TodoItem / MainDailyView 인터페이스 freeze 후 진입)

## 사전 조건 (진입 전 확인)

본 sub 는 Sub-01 의 자산이 epic 진행률 join 을 충족하는지에 의존한다. 진입 전 검증 항목:

- `packages/core/src/services/todos.ts` 의 select 가 `epic_issue.progress` 컬럼을 함께 가져오는가
- `epic_issue` 와 `sub_issue` 의 관계가 fetch 결과에 그룹핑 가능한 형태인가 (`epic_id` 컬럼 + epic 메타 별도)
- Realtime 채널이 `sub_issue.status` 변경 → `recalc_epic_progress` RPC 호출 → `epic_issue` 변경 invalidate 흐름을 일관되게 처리하는가

위 항목 중 누락 시, 본 sub 의 §작업 첫 항목으로 `packages/core` 보강 task 를 추가한다.

## 배경 및 목적

prototype 의 메인 일자 뷰는 **일반 카드** 와 **Epic 아코디언 카드** 가 혼재 노출된다. Epic 카드는 헤더(체크박스 + 카테고리 badge + 제목 + 진행률 텍스트 + chevron) + 세그먼트 progress bar + 펼침 시 sub-issue 목록과 cascade 토글(메인 체크 → sub 일괄 체크)을 제공한다. 현재 web 은 Epic 카드 자체가 부재.

본 작업은 본 main-prd 의 prototype 정합 작업 묶음 중 가장 큰 단일 책임 단위 — 컴포넌트 신설 + 데이터 의존 + Realtime 갱신 + cascade 토글 + 데이터 일관성이 한 묶음. Sub-06 (시각·UX 정합) 과 분리해 단일 sub 로 처리한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 신설 컴포넌트 | `packages/ui/src/EpicAccordionCard.tsx` |
| 통합 위치 | `apps/web/src/components/MainDailyView.tsx` |
| 데이터 | `packages/core/src/hooks/useTodos.ts` + `useEpics` (Sub-01 자산) + 기존 `EpicProgressBar` 재사용 |
| Mutation | `packages/core/src/services/todos.ts` (cascade 토글) + `recalc_epic_progress` RPC |
| Realtime | 기존 `subscribeTodos` 채널 재사용 |

## 핵심 요구 사항

prototype 인용:

- 컨테이너: `docs/base/prototype/pages/page-prototypes-desktop.html:105-134` (`proto-issue-card-accordion[data-expanded]`)
- 스타일: `docs/base/prototype/css/organisms.css:197-247` (`.proto-epic-accordion-*` 시리즈)

### 1. EpicAccordionCard 컴포넌트

```ts
export type EpicAccordionCardProps = {
  epicId: string;
  title: string;
  progressPercent: number;        // 0–100
  segments: { filled: boolean }[]; // sub-issue 수만큼 segment
  category?: { name: string; color: string };
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;       // 메인 체크 (cascade)
  mainStatus: 'todo' | 'done';
  subIssues: Array<{
    id: string;
    title: string;
    status: 'todo' | 'done';
    onToggle: () => void;
    onPress?: () => void;
  }>;
};
```

구조:

- 헤더 (`flex items-center`):
  - 메인 체크박스 (cascade trigger)
  - 카테고리 badge (Sub-06 의 토큰 재사용)
  - 제목 (truncate)
  - 진행률 텍스트 (`100%`, `50%` 등)
  - chevron-right (펼침 시 90deg 회전)
- 진행률 bar: 기존 `EpicProgressBar` (segmented 모드)
- body (펼침 시): sub-issue 목록 — `<TodoItem>` 재사용 또는 `<EpicSubIssueRow>` 신설

### 2. cascade 토글

- 메인 체크 토글 → 모든 sub-issue status 일괄 변경
- 일관성 유지: 일괄 mutation 패턴 (Promise.all 병렬 vs 단일 RPC) 결정 — §주의사항 미해결 항목
- 토글 후 `recalc_epic_progress(epic_id)` RPC 호출 (디바운스 200ms — Sub-01 정합)

### 3. 일반 카드 + Epic 카드 혼재 렌더

`MainDailyView.tsx` 가 todos 결과를 epic 그룹과 standalone 그룹으로 분리:

```ts
const { epics, standalone } = useMemo(() => groupByEpic(todos, epics), [todos, epics]);
```

렌더 순서: prototype 정합 — 카드 트리 그대로. 본 sub 는 epic 카드를 epic 의 첫 sub-issue 위치에 삽입.

### 4. expand 상태 관리

- `useState<Record<epicId, boolean>>` 로 expand state 보관
- 같은 워크스페이스/일자 내에서 유지, 일자 이동 시 reset
- localStorage 영속화는 본 sub 외부 (UX 결정 시 후속)

### 5. 섹션 분할 동작

- Epic 카드는 진행 중 / 완료 어느 섹션에 노출되는가?
- prototype `page-prototypes-desktop.html:105-134` 는 완료 섹션 안에 epic 카드 배치 → epic 의 main status 기준으로 섹션 결정 (`progress 100% = done`)

## 핵심 구현 로직

### groupByEpic

```ts
type GroupResult = {
  epics: Array<{ epic: EpicData; subs: TodoData[] }>;
  standalone: TodoData[];
};

function groupByEpic(todos: TodoData[], epics: EpicData[]): GroupResult {
  const byEpic = new Map<string, TodoData[]>();
  const standalone: TodoData[] = [];
  for (const t of todos) {
    if (t.epic_id) {
      const arr = byEpic.get(t.epic_id) ?? [];
      arr.push(t);
      byEpic.set(t.epic_id, arr);
    } else standalone.push(t);
  }
  return {
    epics: epics
      .filter((e) => byEpic.has(e.id))
      .map((e) => ({ epic: e, subs: byEpic.get(e.id) ?? [] })),
    standalone,
  };
}
```

### cascade 토글

```ts
async function cascadeToggleEpic(
  epic: EpicData,
  subs: TodoData[],
  target: 'todo' | 'done',
) {
  // Promise.all 병렬 (단일 RPC 트랜잭션은 후속 결정 항목)
  await Promise.all(subs.map((s) => updateTodoStatus(s.id, target)));
  await supabase.rpc('recalc_epic_progress', { epic_id: epic.id });
}
```

### chevron 회전

```tsx
<ChevronRight
  className={expanded ? 'rotate-90 transition' : 'transition'}
  aria-hidden
/>
```

### EpicAccordionCard 헤더

```tsx
<div className="flex items-center gap-3">
  <Checkbox checked={mainStatus === 'done'} onChange={onMainToggle} />
  {category ? <CategoryBadge {...category} /> : null}
  <span className="flex-1 truncate text-sm font-medium">{title}</span>
  <span className="text-xs text-periwinkle-400">{progressPercent}%</span>
  <button
    type="button"
    aria-expanded={expanded}
    onClick={onToggleExpand}
    aria-label={expanded ? '접기' : '펼치기'}
  >
    <ChevronRight className={expanded ? 'rotate-90 transition' : 'transition'} aria-hidden />
  </button>
</div>
<EpicProgressBar segments={segments} />
{expanded ? (
  <ul role="list">
    {subIssues.map((s) => (
      <TodoItem key={s.id} {...s} />
    ))}
  </ul>
) : null}
```

## 구현 시 주의사항

1. **TodoItem 직접 수정 금지**: Sub-06 의 freeze 인터페이스 준수. sub-issue row 는 기존 `<TodoItem>` 재사용 또는 신설 `<EpicSubIssueRow>` 로 처리.
2. **MainDailyView 충돌**: Sub-06 (chip 필터) 가 같은 파일을 건드린다. **Sub-06 머지 후 본 sub 진입**.
3. **cascade 토글의 일관성**: Promise.all 병렬 시 일부 실패 가능 → rollback / toast 알림 정책은 Sub-08 (Toast) 와 협의. 본 sub 는 1차로 실패 시 rollback 없이 invalidate.
4. **Epic 진행률 디바운스**: sub_issue 변경 직후 RPC 호출 디바운스 200ms — Sub-01 정합. 일괄 cascade 시 1회로 합침.
5. **EpicProgressBar 재사용**: `packages/ui/src/EpicProgressBar.tsx` 가 segments props 호환되는지 사전 확인. 미호환 시 보강 task 추가.
6. **mobile 정합 분리**: `apps/mobile/` 의 RN Epic 카드는 본 sub 외부 (RN 의 expand/collapse 패턴은 별도 — `LayoutAnimation` 또는 reanimated).
7. **Realtime 갱신 race**: epic 진행률 갱신이 클라 optimistic update 와 충돌하지 않도록 `queryKeys` 단일화 (Sub-01 정합).

## 작업

- [ ] `packages/core` 의 `useTodos` / `useEpics` select 가 epic 진행률 + sub-issue 그룹핑 호환인지 검증 (필요 시 보강)
- [ ] `packages/ui/src/EpicAccordionCard.tsx` 신설
- [ ] (선택) `packages/ui/src/EpicSubIssueRow.tsx` 신설 또는 TodoItem 재사용 결정
- [ ] `packages/core/src/services/todos.ts` — `cascadeToggleEpic` 함수 신설
- [ ] `apps/web/src/components/MainDailyView.tsx` — `groupByEpic` + 혼재 렌더
- [ ] Realtime 채널이 epic 진행률 변경을 invalidate 하는지 검증
- [ ] 단위 테스트 — `groupByEpic`, `cascadeToggleEpic`, EpicAccordionCard 렌더 / expand / cascade
- [ ] (선택) e2e (Playwright) — epic 펼치기 → sub 토글 → 진행률 갱신 시나리오

## 검증 기준

### 자동

- `groupByEpic` 단위 테스트:
  - epic 0개 / 1개 / 다수 케이스
  - epic_id 없는 standalone todo 가 별도 분리
- `EpicAccordionCard` 단위 테스트:
  - `expanded` prop 에 따른 body 노출 / 미노출
  - 메인 체크 클릭 → `onMainToggle` 호출
  - chevron 클릭 → `onToggleExpand` 호출
- `cascadeToggleEpic` 단위 테스트:
  - sub-issue 일괄 status 변경 호출
  - `recalc_epic_progress` 1회 호출 (디바운스)
- `make lint` / `make build` 통과

### 수동

- 메인 뷰에서 epic 카드 + 일반 카드 혼재 노출
- chevron 클릭 → sub-issue 목록 펼침 + chevron 회전
- 메인 체크 토글 → 모든 sub 체크 (또는 해제) + 진행률 텍스트 갱신 (디바운스 200ms 후)
- 다른 디바이스에서 동일 워크스페이스 열어두면 Realtime 으로 epic 진행률 반영
- 키보드 only 로 chevron 토글 + sub-issue 토글 가능

## 미해결 / 사용자 결정 필요

- cascade 토글 시 mutation 일괄(단일 RPC) vs 개별(Promise.all) — race / 일관성 trade-off
- expand 상태 localStorage 영속화 여부 (UX)
- mobile 정합 동시 진행 / 후속 분리
