# TASK-09-02: 디자인 시스템 SoT 등재 (`category-combobox-create`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 02
- **상태**: 대기중
- **의존성**: 없음 (TASK-09-11 의 SoT — 코드 task 보다 우선 머지)

## 작업 목표

`docs/base/design-system/components/category-combobox-create.md` 를 신설하여 분류 자유 입력 Combobox 의 디자인 명세를 SoT 로 등재한다. sub-prd-09 §4 / §8 를 따른다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/base/design-system/components/category-combobox-create.md` | 신설 | 자유 입력 분류 Combobox 디자인 명세 |
| `docs/base/design-system/components.md` | 수정 | Molecules 분류표에 `category-combobox-create` 링크 추가 |

### category-combobox-create.md 명세 항목

- **사용 위치**: `EpicFormModal` 의 분류 입력 필드 (생성 진입점). prototype L578-590 인용
- **분류 단계**: Molecules — 기존 `Combobox` (Atom 수준 generic WAI-ARIA 1.2 정합) 위에 도메인-특화 동작 layering
- **Props**: `workspace: 'life' | 'work'` / `value: { id, name, color? } | null` / `onChange(category)` / `placeholder?`
- **동작 흐름**:
  1. 마운트 시 `useCategories(workspace)` 로 옵션 자동 페치
  2. 입력 텍스트로 옵션 필터링
  3. 매칭 0건 시 마지막 옵션으로 "+ '<입력>' 분류 만들기" 노출
  4. 신규 옵션 선택 시 `categoryService.create(workspace, name)` RPC 호출 → 응답으로 `onChange` 트리거
  5. 동시 생성 race → `workspace + name` unique constraint 위반 → toast.error
- **a11y**: `role="combobox"` / `aria-expanded` / `aria-controls` / `aria-activedescendant` (WAI-ARIA 1.2 Combobox pattern). 키보드 네비게이션 (`ArrowDown` / `ArrowUp` / `Enter` / `Escape`)
- **시각**: 선택된 분류 색 dot + 이름. prototype 색 토큰 정합 — 하드코딩 hex 0건
- **에러 / 로딩**: 옵션 페치 로딩 중 → 인라인 spinner. 신규 생성 RPC 진행 중 → 옵션 항목에 spinner 표시 + 재클릭 비활성

### components.md 보강

- `## Molecules` 분류표에 `category-combobox-create` 행 추가 (기존 `combobox` 와 별도 행, 신·구 분리 명시)

### 잠정안 선언

문서 상단에 "본 명세는 디자인 결정자 합류 전 잠정안. 색·간격·문구는 합류 후 갱신될 수 있음" 한 줄 명시.

## 검증 과정

- [ ] `docs/base/design-system/components/category-combobox-create.md` 존재 + 명세 항목 7건 (사용 위치 / 분류 / Props / 동작 / a11y / 시각 / 에러·로딩)
- [ ] `docs/base/design-system/components.md` Molecules 표에 행 추가 + 링크 동작
- [ ] 하드코딩 색 hex 0건 (모든 색 = 토큰 참조)
- [ ] 잠정안 선언 한 줄 존재
- [ ] sub-prd-09 §4 와 props 시그니처 1:1 일치

## 주의사항

1. **코드보다 우선 머지**: 본 task 는 TASK-09-11 의 SoT. SoT 가 없는 상태에서 코드 머지 시 docs / 코드 분기.
2. **기존 `Combobox` 와 별도**: prototype 의 자유 입력은 generic `Combobox` 만으로 표현 불가. 신·구 컴포넌트 분리 사유를 명세에 명시.
3. **잠정안 선언 필수**: sub-prd-08 패턴 동일.
4. **scope = docs**: PR scope 는 `docs`.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §4 / §8
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md)
- [`../../../base/design-system/tokens.md`](../../../base/design-system/tokens.md)
- [`../../../base/prototype/pages/page-prototypes.html`](../../../base/prototype/pages/page-prototypes.html) L578-590
