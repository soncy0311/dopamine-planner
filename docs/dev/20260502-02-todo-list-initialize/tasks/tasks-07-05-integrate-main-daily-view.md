# TASK-07-05: `MainDailyView` 통합 (혼재 렌더 + expand state + cascade wiring)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 05
- **상태**: 완료 (2026-05-06)
- **의존성**: TASK-07-02, TASK-07-03, TASK-07-04 (도메인 함수 + 유틸 + 컴포넌트 모두 머지 후), 선행 sub-prd-06 머지 후

## 작업 목표

`groupByEpic` 결과를 epic 카드 + 일반 카드 혼재 렌더하고, expand state + cascade 핸들러를 host 측에서 wiring 한다. 일자 이동 시 expand state 를 reset 한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 수정 | `useEpics` + `groupByEpic` + 혼재 렌더 + expand state + cascade wiring |

### 핵심 로직

```tsx
const { data: todos = [] } = useTodos(workspaceId, selectedDate);
const { data: epics = [] } = useEpics(workspaceId);

const { epics: epicGroups, standalone } = useMemo(
  () => groupByEpic(todos, epics),
  [todos, epics],
);

const [expand, setExpand] = useState<Record<string, boolean>>({});

useEffect(() => {
  setExpand({});
}, [selectedDate]);

const handleToggleExpand = (epicId: string) => {
  setExpand((prev) => ({ ...prev, [epicId]: !prev[epicId] }));
};

const handleMainToggle = async (epic: EpicData, subs: TodoData[]) => {
  const allDone = subs.every((s) => s.status === 'done');
  const target = allDone ? 'todo' : 'done';
  await cascadeToggleEpic(client, epic, subs, target);
  queryClient.invalidateQueries({ queryKey: queryKeys.todos(...) });
  queryClient.invalidateQueries({ queryKey: queryKeys.epics(...) });
};
```

### 섹션 분할 정책

- epic 의 `progress === 1` (RPC 반환은 0~1 비율) → 완료 섹션
- 그 외 (`< 1`) → 진행 중 섹션
- standalone todo 는 기존 로직 그대로 (`status === 'done'` 기준)

### 렌더 순서

prototype 정합 — 진행 중 / 완료 섹션 내부에서 epic 카드와 일반 카드를 혼재 렌더. 본 task 는 epic 카드를 해당 섹션 내 적절한 위치 (예: 섹션 상단 또는 prototype 의 카드 트리 정합) 에 삽입.

### 백분율 변환

```tsx
<EpicAccordionCard
  epicId={epic.id}
  title={epic.title}
  progressPercent={Math.round(epic.progress * 100)}
  segments={subs.map((s) => ({ filled: s.status === 'done' }))}
  category={epic.category}
  expanded={!!expand[epic.id]}
  onToggleExpand={() => handleToggleExpand(epic.id)}
  onMainToggle={() => handleMainToggle(epic, subs)}
  mainStatus={epic.progress >= 1 ? 'done' : 'todo'}
  subIssues={subs.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    priority: s.priority,
    carryOverCount: s.carry_over_count,
    category: s.category,
    onToggle: () => toggle(s.id),
    onPress: () => openDetail(s.id),
  }))}
/>
```

### 참조 코드

- sub-prd-07 §3, §4, §5
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:105-134`
- TASK-07-02 / 07-03 / 07-04 산출물

## 검증 과정

- [ ] `useEpics` 호출 추가
- [ ] `groupByEpic` 호출 결과를 epic 카드 + 일반 카드 혼재 렌더
- [ ] expand state 가 `Record<epicId, boolean>` 형태로 보관
- [ ] `selectedDate` 변경 시 expand state reset 동작
- [ ] 메인 체크 토글 → `cascadeToggleEpic` 호출 + 진행률 갱신
- [ ] 진행률 텍스트가 0~100 정수 (백분율 변환 누락 없음)
- [ ] standalone todo 는 기존 동작 유지 (회귀 없음)
- [ ] sub-prd-06 의 chip 필터 / FAB / DateNavigator 회귀 없음
- [ ] `pnpm --filter @todo-list/web lint` / `typecheck` 통과

## 주의사항

1. **sub-prd-06 머지 후 진입** — sub-prd-06 (chip 필터) 와 동일 파일을 건드림. sub-prd-07 §주의사항 2 정합. sub-prd-06 머지 전에는 본 task 진입 금지.
2. **백분율 변환 누락 주의** — `epic.progress` 는 0~1 비율. UI 에 `progressPercent={epic.progress}` 를 그대로 주입하면 1% 로 표시되는 버그. 반드시 `Math.round(epic.progress * 100)` 변환.
3. **expand state 위치** — `MainDailyView` 의 local state. localStorage 영속화는 본 sub 외부 (sub-prd-07 §미해결 항목).
4. **cascade target 결정** — `subs.every(s => s.status === 'done')` ? `'todo'` : `'done'`. 부분 완료 상태에서 토글 시 우선 모두 done.
5. **invalidate 키 정합** — `queryKeys.todos` / `queryKeys.epics` 단일화 (sub-prd-01 정합). 새 키 발급 금지.
6. **orphan sub-issue** — `groupByEpic` 가 drop. 호출 측에서 별도 toast 미노출 (1차 정책).
7. **회귀 점검** — sub-prd-04 (모바일 핵심 화면) / sub-prd-06 (chip 필터) 회귀가 없는지 수동 확인 (TASK-07-08 게이트).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §3, §4, §5
- [`./tasks-02-08-create-main-daily-view.md`](./tasks-02-08-create-main-daily-view.md)
- [`./tasks-07-02-create-cascade-toggle-epic-service.md`](./tasks-07-02-create-cascade-toggle-epic-service.md)
- [`./tasks-07-03-create-group-by-epic-util.md`](./tasks-07-03-create-group-by-epic-util.md)
- [`./tasks-07-04-create-epic-accordion-card.md`](./tasks-07-04-create-epic-accordion-card.md)
