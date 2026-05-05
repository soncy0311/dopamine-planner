# TASK-08-04: 호출 측 리팩터 (`TodoSection` / `DoneSection` / `MainDailyView`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 04
- **상태**: 미착수
- **의존성**: TASK-08-02 (`<EmptyState>`) + TASK-08-03 (`<Spinner>`) 머지 후

## 작업 목표

기존 메인 뷰의 하드코딩된 빈 상태 / "불러오는 중…" 텍스트를 신 컴포넌트(`<EmptyState>` / `<Spinner>`) 로 교체한다. 본 sub 의 1차 범위는 메인 뷰 한정 — 모달 내부 alert 등은 후속.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/TodoSection.tsx` (L29–30) | 수정 | `items.length === 0` 분기 → `<EmptyState>` |
| `apps/web/src/components/DoneSection.tsx` | 수정 | TodoSection 래퍼 시 간접 적용 / 직접 빈 상태 처리 시 동일 교체 |
| `apps/web/src/components/MainDailyView.tsx` (L54–55) | 수정 | `isLoading` 분기 → `<Spinner variant="inline" />` |

### 리팩터 패턴

#### TodoSection 빈 상태

변경 전 (예시 — 실 코드 확인 필요):

```tsx
{items.length === 0 ? (
  <p className="text-sm text-periwinkle-400">아직 할 일이 없어요</p>
) : (
  /* 리스트 렌더 */
)}
```

변경 후:

```tsx
import { EmptyState } from '@todo-list/ui';

{items.length === 0 ? (
  <EmptyState
    title="아직 할 일이 없어요"
    description="새 투두를 만들어 시작해보세요"
    action={{ label: '새 투두 만들기', onClick: openCreateModal }}
  />
) : (
  /* 리스트 렌더 */
)}
```

> CTA 의 `onClick` 은 host 가 보유한 신규 투두 모달 트리거 함수. 본 task 진입 시 `TodoSection` 의 props 또는 context 에서 가져올 수 있는지 확인 — 없으면 props 추가.

#### DoneSection 빈 상태

`DoneSection` 이 `TodoSection` 의 status filter wrapper 라면 별도 작업 없음 (간접 적용). 직접 빈 상태 처리 시 동일 패턴으로 교체. CTA 는 미주입 (완료 섹션의 빈 상태에는 신규 투두 만들기 부적절).

#### MainDailyView 로딩

변경 전 (예시):

```tsx
{isLoading ? (
  <p>불러오는 중…</p>
) : (
  /* 메인 뷰 */
)}
```

변경 후:

```tsx
import { Spinner } from '@todo-list/ui';

{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Spinner variant="inline" size="md" />
  </div>
) : (
  /* 메인 뷰 */
)}
```

### 기존 toast 호출

본 sub 의 toast 작업은 SoT 명세 등재(TASK-08-01) + 정합 검증(TASK-08-06) 만. 기존 6개 컴포넌트의 `toast.success` / `toast.error` 호출은 변경 0건. 색·위치가 `toast.md` 명세와 어긋나면 TASK-08-06 에서 발견 → 본 task 외부에서 수정.

### 1차 범위 한정

- 메인 뷰 (TodoSection / DoneSection / MainDailyView) 의 isLoading / 빈 상태만 적용
- 모달 내부 `alert(...)` / 하드코딩 fallback 텍스트는 후속 sub
- 검색·필터 결과 빈 상태 등 미존재 화면은 본 task 외

## 검증 과정

- [ ] `TodoSection.tsx` — 빈 상태 분기가 `<EmptyState>` 로 교체됨
- [ ] `DoneSection.tsx` — 빈 상태 처리가 신 컴포넌트로 일관 (직접 처리 시) 또는 wrapper 변경 없음 (간접 적용 시)
- [ ] `MainDailyView.tsx` — `isLoading` 분기가 `<Spinner variant="inline" />` 로 교체됨
- [ ] 신규 투두 CTA 의 `onClick` 이 모달 트리거에 정상 연결
- [ ] 기존 하드코딩 텍스트("아직 할 일이 없어요" / "불러오는 중…") 잔존 0건
- [ ] `pnpm --filter @todo-list/web typecheck` 통과
- [ ] `make lint` / `make build` 통과
- [ ] 수동: 빈 워크스페이스 / 빈 일자에 EmptyState 노출 + CTA 동작
- [ ] 수동: 페칭 중 Spinner 노출 → 결과 도착 시 사라짐
- [ ] 회귀 0건 — sub-prd-06 (chip 필터·FAB) / sub-prd-07 (Epic 카드) 정상 동작

## 주의사항

1. **TASK-08-02 / 03 머지 우선**: 신 컴포넌트가 export 되지 않은 상태에서 본 task 진입 시 빌드 실패.
2. **1차 범위 한정**: 메인 뷰만. 모달 내부 alert / 검색 결과 빈 상태 등은 후속 sub. 범위 확장 시 sub-prd-08 갱신 후 진행.
3. **CTA `onClick` 책임**: `EmptyState.action.onClick` 은 host 책임. 신규 투두 모달 트리거가 부재하면 본 task 에서 props / context 연결 추가.
4. **DoneSection 분기 처리**: TodoSection wrapper 인지 직접 빈 상태 처리인지 진입 시 코드 확인 후 결정. 직접 처리이면 CTA 미주입.
5. **기존 toast 호출 변경 금지**: 6개 컴포넌트의 `toast.*` 호출은 본 task 변경 0건. 정합 검증은 TASK-08-06.
6. **mobile 회귀 회피**: `packages/ui` 변경(02 / 03) 으로 mobile 빌드가 깨지지 않는지 본 task 종료 시 함께 확인.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §5
- [`./tasks-08-02-create-empty-state.md`](./tasks-08-02-create-empty-state.md)
- [`./tasks-08-03-create-spinner.md`](./tasks-08-03-create-spinner.md)
- [`./tasks-08-06-verify-build-and-manual.md`](./tasks-08-06-verify-build-and-manual.md)
