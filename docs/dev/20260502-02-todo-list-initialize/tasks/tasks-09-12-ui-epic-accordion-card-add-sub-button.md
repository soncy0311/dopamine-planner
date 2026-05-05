# TASK-09-12: ui — `EpicAccordionCard` 에 `onAddSubIssue` prop / 버튼 노출

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 12
- **상태**: 대기중
- **의존성**: 없음 (sub-prd-07 산출물 위에 props 추가만)

## 작업 목표

sub-prd-09 §3.2 — `packages/ui/src/EpicAccordionCard.tsx` 에 sub 추가 진입점을 도입한다. `onAddSubIssue?: () => void` prop + expanded 상태에서 sub 목록 하단에 "+ 서브 이슈 추가" 버튼 노출.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EpicAccordionCard.tsx` | 수정 | props 보강 + 버튼 노출 |
| `packages/ui/__tests__/EpicAccordionCard.test.tsx` | 수정 | 신규 prop / 버튼 동작 케이스 |

### Props 보강

```ts
type EpicAccordionCardProps = {
  // ... 기존
  onAddSubIssue?: () => void;
};
```

### 버튼 노출 위치 / 동작

- expanded 상태 (`open`) 에서만 노출
- sub 목록의 마지막 항목 아래 위치
- 텍스트: "+ 서브 이슈 추가"
- variant: ghost / link 수준 (디자인 토큰 참조 — sub-prd-07 패턴 정합)
- `onAddSubIssue` 가 undefined 면 버튼 자체 비노출 (옵셔널 동작)
- 클릭 시 `onAddSubIssue()` 호출 — host 가 모달 / 라우트 진입 책임

### 단위 테스트 케이스

- 기본 (props 미주입) → 버튼 비노출
- `onAddSubIssue` 주입 + collapsed → 버튼 비노출
- `onAddSubIssue` 주입 + expanded → 버튼 노출
- 버튼 클릭 → `onAddSubIssue` 호출 (vi.fn spy)
- a11y: 버튼 = `<button>` (또는 등가 role)

### 시각 / 토큰

- prototype 명시적 인용 부재 — sub-prd-07 의 카드 내 보조 액션 패턴 재사용
- 하드코딩 색 hex 0건

## 검증 과정

- [ ] `EpicAccordionCard.tsx` props 에 `onAddSubIssue?: () => void` 추가
- [ ] expanded 상태 + props 주입 시 버튼 노출 (단위 테스트 통과)
- [ ] props 미주입 시 기존 동작 (버튼 비노출) 회귀 0
- [ ] 단위 테스트 5 케이스 통과
- [ ] `pnpm --filter @todo-list/ui typecheck` / `lint` / `test` 통과
- [ ] sub-prd-07 의 expand / cascade toggle 회귀 0

## 주의사항

1. **하위 호환**: 기존 host (sub-prd-07 머지 결과물) 가 prop 미주입이므로 옵셔널. props 미주입 시 기존 렌더 결과 동일.
2. **web / mobile 공유**: 본 컴포넌트는 sub-prd-07 의 패키지 공유 패턴 (RN 환경에서도 정상 동작). 단 본 task 의 버튼이 RN 환경 (Tailwind/Nativewind) 에서도 렌더 OK 인지 진입 시 확인.
3. **신호 분리**: 본 task 는 prop 만 노출. host 측 결선 (web = TASK-09-14, mobile = TASK-09-19) 은 별도.
4. **scope = feat(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §3.2
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- [`./tasks-09-14-web-sub-issue-form-modal.md`](./tasks-09-14-web-sub-issue-form-modal.md)
- [`./tasks-09-19-mobile-epic-and-sub-form-routes.md`](./tasks-09-19-mobile-epic-and-sub-form-routes.md)
