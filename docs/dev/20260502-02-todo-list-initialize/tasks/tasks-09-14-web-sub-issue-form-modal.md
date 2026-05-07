# TASK-09-14: web — `SubIssueFormModal` 신설 + Epic 카드 결선

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 14
- **상태**: 대기중
- **의존성**: TASK-09-09 (registered_date 서비스), TASK-09-12 (`onAddSubIssue` prop)

## 작업 목표

sub-prd-09 §3.1 — `apps/web/src/components/modals/SubIssueFormModal.tsx` 를 신설하여 Epic 카드 "서브 이슈 추가" 진입점 전용 모달을 도입한다. `EpicAccordionCard.onAddSubIssue` 와 결선.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/SubIssueFormModal.tsx` | 신설 | sub 생성 전용 모달 |
| `apps/web/src/components/MainDailyView.tsx` (또는 Epic 카드 host) | 수정 | `onAddSubIssue` 결선 + 모달 상태 관리 |

### 입력 필드 (확정)

| 필드 | 타입 | 기본값 | 사용자 변경 |
|---|---|---|---|
| 제목 | text (필수) | "" | O |
| priority | `high` / `medium` / `low` | medium | O |
| 등록일 | date | 호스트 일자 | O (사용자 변경 가능) |

> **epic**: 호출 컨텍스트에서 주입 — 사용자 선택 불가 (sub-prd-09 §3.1).

### Props 시그니처

```ts
type SubIssueFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  epicId: string;
  defaultRegisteredDate: string;  // YYYY-MM-DD
  onSubmit?: (sub: SubIssueCreated) => void;
};
```

### Epic 카드 결선 (host 측)

```tsx
const [subModalEpicId, setSubModalEpicId] = useState<string | null>(null);

<EpicAccordionCard
  epic={epic}
  onAddSubIssue={() => setSubModalEpicId(epic.id)}
/>

{subModalEpicId && (
  <SubIssueFormModal
    isOpen
    epicId={subModalEpicId}
    defaultRegisteredDate={selectedDate}
    onClose={() => setSubModalEpicId(null)}
  />
)}
```

### 폼 검증

- 제목 필수
- priority 기본값 medium
- 등록일 = 호스트 일자, 변경 시 입력값 유효성 검증 (YYYY-MM-DD)
- submit 시 `subIssueService.create({ epicId, title, priority, registeredDate, userId, workspace })`

### 회귀 영향

- 신규 모달 — 기존 모달 영향 0
- Epic 카드 host (MainDailyView) 만 props 결선

## 검증 과정

- [ ] `SubIssueFormModal.tsx` 신설 + Props 시그니처 정합
- [ ] 입력 필드 3개 (제목 / priority / 등록일)
- [ ] epic 은 props 주입, 사용자 선택 X
- [ ] Epic 카드 host 가 `onAddSubIssue` 결선
- [ ] `pnpm --filter @todo-list/web typecheck` / `lint` 통과
- [ ] 수동: Epic 카드 펼침 → "+ 서브 이슈 추가" → 모달 → 저장 → 해당 epic 안에 sub 추가
- [ ] 수동: 등록일 변경 → 다른 일자에 sub 등록되어 본 일자 list 에서 사라짐 확인

## 주의사항

1. **머지 순서**: 09 / 12 머지 후. 09 미머지 시 `registered_date` 컬럼 미존재로 service 실패.
2. **모달 상태 관리 위치**: Epic 카드 host (`MainDailyView`) 가 책임. Epic 카드 자체가 모달을 들고 있으면 cascade 시 다중 인스턴스 — 회피.
3. **epic 자동 주입**: 사용자가 epic 을 변경할 수 없는 UX — epic 컨텍스트가 명시적이도록 모달 제목에 epic 이름 표시 권장.
4. **카테고리 입력 X**: sub 는 epic 의 분류를 상속 (또는 epic 과 분리 — 진입 시 도메인 확인). sub-prd-09 §3.1 의 입력 필드 명세에 분류 부재.
5. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §3.1 / §3.2
- [`./tasks-09-09-core-service-list-by-date-filter.md`](./tasks-09-09-core-service-list-by-date-filter.md)
- [`./tasks-09-12-ui-epic-accordion-card-add-sub-button.md`](./tasks-09-12-ui-epic-accordion-card-add-sub-button.md)
