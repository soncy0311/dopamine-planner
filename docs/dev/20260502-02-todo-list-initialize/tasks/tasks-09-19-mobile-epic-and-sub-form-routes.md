# TASK-09-19: mobile — `epic-form` / `sub-issue-form` 라우트 신설 + Epic 카드 결선

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 19
- **상태**: 대기중
- **의존성**: TASK-09-09 (registered_date 서비스), TASK-09-12 (`onAddSubIssue` prop)

## 작업 목표

sub-prd-09 §7 — mobile 의 `epic-form` / `sub-issue-form` 라우트 (Expo Router) 를 신설. web 의 `EpicFormModal` / `SubIssueFormModal` 와 props·동작 정합. Epic 카드 sub 추가 버튼 결선.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/epic-form.tsx` | 신설 | RN Epic 생성 화면 |
| `apps/mobile/src/app/sub-issue-form.tsx` | 신설 | RN Sub 생성 화면 |
| `apps/mobile/src/app/(main)/index.tsx` (또는 동등) | 수정 | FAB / EpicAccordionCard `onAddSubIssue` 결선 + 라우트 push |

### epic-form.tsx 입력 필드

- 제목 / 설명 / 분류 / priority
- 분류 = RN 등가 자유 입력 (모바일 환경에서 `CategoryComboboxCreate` 가 web DOM 가정 시 native 대체. 진입 시 패키지 호환 검증)
- 등록일은 host 가 라우트 params 로 주입 (`registeredDate` 검색 파라미터)

```tsx
// 호출 측
router.push({ pathname: '/epic-form', params: { workspace: 'life', registeredDate: today } });
```

### sub-issue-form.tsx 입력 필드

- 제목 / priority / 등록일 (변경 가능)
- epic = 라우트 params 로 주입 (`epicId`)

```tsx
router.push({ pathname: '/sub-issue-form', params: { epicId, registeredDate: today } });
```

### Epic 카드 결선

```tsx
<EpicAccordionCard
  epic={epic}
  onAddSubIssue={() =>
    router.push({ pathname: '/sub-issue-form', params: { epicId: epic.id, registeredDate: today } })
  }
/>
```

### FAB 결선

홈 FAB onClick → `router.push('/epic-form?...')`. 기존 `create-todo` 라우트 호출 잔존 0.

### 디자인 정합

- web 의 `EpicFormModal` / `SubIssueFormModal` 와 입력 필드 / 시각 정합 (Nativewind 토큰 매핑)
- TASK-09-02 의 SoT 와 web/mobile 공통 동작

## 검증 과정

- [ ] `epic-form.tsx` 신설 + 입력 필드 4개
- [ ] `sub-issue-form.tsx` 신설 + 입력 필드 3개
- [ ] FAB → `epic-form` 라우트로 이동
- [ ] EpicAccordionCard sub 추가 → `sub-issue-form` 라우트로 이동
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 수동: Expo 시뮬레이터 — FAB → epic 생성 / Epic 카드 → sub 생성 / 등록일 변경 동작
- [ ] 분류 자유 입력 RN 환경에서 동작 (또는 잠정 native 대체 명시)
- [ ] mobile 안의 `create-todo` 라우트 호출 잔존 0

## 주의사항

1. **머지 순서**: 09 / 12 머지 후. 18 의 redirect 가 본 task 의 `/epic-form` 라우트 도달 가능해야 함.
2. **`CategoryComboboxCreate` 호환**: `packages/ui` 의 컴포넌트가 RN 환경에서 정상 렌더되는지 진입 시 검증. 미호환 시 mobile 내부에 native 등가 컴포넌트 잠정 작성 + 후속 sub 에서 통합 (sub-prd-09 §미해결 §4 참고).
3. **라우트 params 직렬화**: epic 객체 통째 주입 X — `epicId` / `registeredDate` 만 검색 파라미터.
4. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §7
- [`./tasks-09-13-web-epic-form-modal-revamp.md`](./tasks-09-13-web-epic-form-modal-revamp.md)
- [`./tasks-09-14-web-sub-issue-form-modal.md`](./tasks-09-14-web-sub-issue-form-modal.md)
- [`./tasks-09-18-mobile-deprecate-create-todo-route.md`](./tasks-09-18-mobile-deprecate-create-todo-route.md)
