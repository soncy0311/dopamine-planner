# TASK-09-15: web — `CreateTodoModal` 폐기 + 호출 측 진입점 교체

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 15
- **상태**: 대기중
- **의존성**: TASK-09-13, TASK-09-14

## 작업 목표

sub-prd-09 §3.1 / §UX 격차 (b) — 홈 FAB 가 sub 를 epic 컨텍스트 없이 만드는 현 흐름을 폐기. `CreateTodoModal` 삭제 + 호출 측 진입점을 `EpicFormModal` 로 교체.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/CreateTodoModal.tsx` | 삭제 | 폐기 |
| `apps/web/src/components/MainDailyView.tsx` | 수정 | `handleCreate` → `EpicFormModal` open |
| sub-prd-08 산출물의 `EmptyState` CTA 호출 측 | 수정 | CTA → `EpicFormModal` open |

### 호출 측 교체 패턴

```tsx
// 변경 전
const [createOpen, setCreateOpen] = useState(false);
<CreateTodoModal isOpen={createOpen} onClose={...} />

// 변경 후
const [epicFormOpen, setEpicFormOpen] = useState(false);
<EpicFormModal
  isOpen={epicFormOpen}
  workspace={workspace}
  defaultRegisteredDate={selectedDate}
  onClose={() => setEpicFormOpen(false)}
/>
```

### FAB 결선

`MainDailyView` 의 FAB onClick → `setEpicFormOpen(true)`. 기존 `CreateTodoModal` 호출 잔존 0.

### EmptyState CTA 결선 (sub-prd-08)

`TodoSection` 의 `<EmptyState>` 의 `action.onClick` → 동일하게 `setEpicFormOpen(true)` 로 교체. host (MainDailyView) 가 함수 주입.

### 잔존 import 검증

`grep -r "CreateTodoModal" apps/web/src` → 0건 확인 후 파일 삭제.

## 검증 과정

- [ ] `apps/web/src/components/modals/CreateTodoModal.tsx` 파일 삭제
- [ ] `grep -r "CreateTodoModal" apps/web/src` 0건
- [ ] `MainDailyView` 의 FAB → `EpicFormModal` open
- [ ] `EmptyState` CTA (sub-prd-08) → `EpicFormModal` open
- [ ] `pnpm --filter @todo-list/web typecheck` / `lint` / `build` 통과
- [ ] 수동: 홈 FAB → EpicFormModal 진입 (CreateTodoModal 진입점 부재)
- [ ] 수동: 빈 일자 EmptyState CTA → EpicFormModal 진입
- [ ] 회귀 0건 — sub-prd-06 / 07 / 08 동작 정상

## 주의사항

1. **머지 순서**: 13 / 14 머지 후. 13 미머지 시 `EpicFormModal` 갱신 결과물 부재.
2. **단일 진입점 원칙**: sub_issue 직접 생성 진입점 0개. 사용자가 sub 를 만들려면 반드시 epic 카드 → "+ 서브 이슈 추가" 경로.
3. **scope = refactor(web)**: PR scope (파일 삭제 + 호출 측 교체).
4. **mobile 동등 작업**: TASK-09-18 (mobile create-todo 폐기) 가 동시 진행되어야 web / mobile UX 정합.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §3.1 / §배경 (b)
- [`./tasks-09-13-web-epic-form-modal-revamp.md`](./tasks-09-13-web-epic-form-modal-revamp.md)
- [`./tasks-09-14-web-sub-issue-form-modal.md`](./tasks-09-14-web-sub-issue-form-modal.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
