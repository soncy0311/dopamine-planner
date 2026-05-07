# TASK-09-11: ui — `CategoryComboboxCreate` 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 11
- **상태**: 대기중
- **의존성**: TASK-09-02 (디자인 SoT), TASK-09-07 (자동 생성 타입)

## 작업 목표

sub-prd-09 §4 / §주의사항 4 — 분류 자유 입력 Combobox 컴포넌트를 `packages/ui` 에 신설한다. 기존 `apps/web/src/components/ui/Combobox.tsx` (자유 입력 미지원) 와 별도 — 도메인 특화 Molecule.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/CategoryComboboxCreate.tsx` | 신설 | 자유 입력 분류 Combobox |
| `packages/ui/src/index.ts` | 수정 | `CategoryComboboxCreate` re-export |
| `packages/ui/__tests__/CategoryComboboxCreate.test.tsx` | 신설 | 검색 / 신규 생성 옵션 / a11y 단위 테스트 |

### Props 시그니처

```ts
export type CategoryComboboxCreateProps = {
  workspace: 'life' | 'work';
  value: { id: string; name: string; color?: string } | null;
  onChange: (category: { id: string; name: string; color?: string }) => void;
  placeholder?: string;
};
```

### 동작 흐름

1. `useCategories(workspace)` 로 옵션 자동 페치 (host 가 옵션 주입 필요 X)
2. 입력 텍스트로 클라이언트 사이드 필터링
3. 매칭 0건 시 마지막 옵션으로 `+ '<입력>' 분류 만들기` 노출
4. 신규 옵션 선택 시 `categoryService.create(workspace, name)` RPC 호출 → 응답으로 `onChange` 트리거
5. 동시 생성 race → DB unique constraint (`workspace + name`) 위반 → `toast.error` (sub-prd-09 §주의사항 8)

### a11y 요구 (sub-prd-09 §4 / TASK-09-02 SoT)

- `role="combobox"` / `aria-expanded` / `aria-controls` / `aria-activedescendant`
- 키보드 네비게이션: ArrowDown / ArrowUp / Enter / Escape
- 옵션 항목 = `role="option"` / `aria-selected`

### 단위 테스트 케이스

- 옵션 페치 / 표시
- 입력 텍스트 → 옵션 필터링
- 매칭 0건 → "분류 만들기" 옵션 노출
- 신규 옵션 선택 → RPC 호출 → onChange 발화
- 키보드 네비게이션
- a11y 어트리뷰트 정합

### 시각

- 선택된 분류 = 색 dot + 이름 (디자인 토큰 참조)
- prototype L578-590 정합

## 검증 과정

- [ ] `packages/ui/src/CategoryComboboxCreate.tsx` 신설 + Props 시그니처 정합
- [ ] `packages/ui/src/index.ts` 에서 re-export
- [ ] 단위 테스트 6개 케이스 모두 통과
- [ ] `pnpm --filter @todo-list/ui typecheck` 통과
- [ ] `pnpm --filter @todo-list/ui lint` 통과
- [ ] 하드코딩 색 hex 0건 (토큰 참조)
- [ ] a11y 어트리뷰트 정합 (role / aria-*)
- [ ] TASK-09-02 의 SoT (`category-combobox-create.md`) 와 props / 동작 1:1 일치

## 주의사항

1. **SoT 우선 머지**: TASK-09-02 (디자인 SoT) 미머지 상태에서 본 task 머지 시 docs / 코드 분기.
2. **기존 `Combobox` 와 별도**: `apps/web/src/components/ui/Combobox.tsx` 는 generic, 본 컴포넌트는 도메인 특화 — 두 컴포넌트 공존. 제목 / 패키지 위치도 다름 (`packages/ui` vs `apps/web/src/components`).
3. **race condition**: DB unique constraint 위반 시 `toast.error` — sonner 호출 (sub-prd-08 toast 명세 정합).
4. **`useCategories` 의존**: `packages/core/src/hooks/useCategories.ts` 의 시그니처 / 캐시 정합. 본 task 진입 시 hooks 시그니처 확인.
5. **mobile 공유**: 본 컴포넌트는 web 전용 React DOM 가정. mobile 동등 컴포넌트는 후속 (TASK-09-19 의 epic-form 안에서 RN 등가물 별도 검토 — 본 sub 내 RN 신설 불필요 시 native input + custom dropdown 으로 대체).
6. **scope = feat(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §4 / §주의사항 4 / 8
- [`./tasks-09-02-design-system-category-combobox-create.md`](./tasks-09-02-design-system-category-combobox-create.md)
- [`../../../base/design-system/components/category-combobox-create.md`](../../../base/design-system/components/category-combobox-create.md) (TASK-09-02 산출물)
- `apps/web/src/components/ui/Combobox.tsx` (별도 generic)
