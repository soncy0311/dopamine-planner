# Issue Creation — Epic / Sub 추가·편집

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·간격·문구는 합류 후 갱신될 수 있다.**

이슈 생성 흐름의 정책 SoT. 하나의 "투두 생성" 모달로 Epic 과 Sub 을 모두 다루던 이전 구조를 폐기하고, **Epic 추가** 와 **Sub 추가** 를 별도 컴포넌트·진입점으로 분리한다. prototype 정합 — `EpicCreateSheet` / `SubCreateSheet` (mobile) 와 `DesktopModal` 의 Epic / Sub 변형이 본 정책을 따른다.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Organisms
- 구현체 (web): `apps/web/src/components/modals/EpicFormModal.tsx`, `EpicDetailModal.tsx`, `SubIssueFormModal.tsx`, `TodoDetailModal.tsx`
- 구현체 (mobile RN): `apps/mobile/src/app/epic-form.tsx`, sub 추가/편집 화면

---

## 1. 정책 요지

| 항목 | Epic | Sub |
|---|---|---|
| 제목 (필수) | ✓ | ✓ |
| 설명 (선택) | ✓ | ✓ |
| 등록일 | ✓ | ✓ |
| **분류 (Combobox)** | ✓ — 본 폼에서 부여 | ✗ — 상위 Epic 에서 상속 |
| **우선순위 (High/Medium/Low)** | ✓ — 본 폼에서 부여 | ✗ — 상위 Epic 에서 상속 |
| 상위 Epic 표기 | (해당 없음) | ✓ — readonly input. 진입 시점에 결정 |

### 1.1 분류·우선순위가 Epic 단위인 이유

- **분류**: 동일 Epic 내 Sub 들이 같은 분류를 공유하는 게 사용자 멘탈 모델과 일치. Sub 마다 분류를 다르게 둘 유즈케이스 부재.
- **우선순위**: Sub 단위 우선순위는 정렬 / 표시 일관성을 깨고, Epic 카드 헤더의 priority badge 와 행 단위 priority 가 충돌. Epic 단위로 통일.

→ Sub 행에는 **별도 priority 배지를 노출하지 않는다** (`components.md` §Atoms.Badge.priority 정합).

## 2. 진입점

| 진입점 | 플랫폼 | 결과 |
|---|---|---|
| FAB (`+`) | mobile | `EpicCreateSheet` 열림 |
| AddButton (`+ 추가`) | desktop | `DesktopModal` (Epic 변형) 열림 |
| Epic 카드의 "서브 이슈 추가" 버튼 | mobile / desktop | `SubCreateSheet` (mobile) / `DesktopModal` (Sub 변형) 열림. 상위 Epic 컨텍스트가 자동 주입 |
| Epic 카드 제목 클릭 | mobile / desktop | Epic **편집** 진입 — `epic-form?id=...` 라우트 (mobile) / `EpicDetailModal` (web). 삭제 액션 포함 |
| Sub 행 클릭 | mobile / desktop | Sub **편집** 진입 — `TodoDetailModal` (web) / sub 편집 화면 (mobile) |

## 3. 폼 동작

### 3.1 Epic 추가
- 제목 비어있으면 저장 비활성.
- 분류 Combobox: 자유 입력 + 검색 + "+ 분류 만들기" 옵션 ([`./category-combobox-create.md`](./category-combobox-create.md)).
- 우선순위 기본값 `Medium` (선택 표시 — `proto-badge-selected`).
- 등록일 기본값: 현재 보고 있는 날짜 (`defaultRegisteredDate` prop).
- 저장 성공 → toast `"Epic 이 생성되었어요"` + 시트/모달 닫기.

### 3.2 Sub 추가
- 진입 시점에 상위 Epic 결정. 이후 Epic 변경 불가 (Epic 이동은 별도 사용자 흐름 — 현재 미지원).
- 상위 Epic input 은 `readonly` + `aria-readonly="true"`, value 는 Epic 제목.
- 제목 비어있으면 저장 비활성.
- 등록일 기본값: 진입 시점 날짜 (FAB 클릭 시점의 `currentDate`).
- 저장 시 `epic_id` 는 진입 컨텍스트의 Epic id 그대로 사용. priority / category_id 는 폼에 부재.
- 저장 성공 → toast + 시트/모달 닫기.

### 3.3 Epic 편집
- `EpicCreateSheet` / Epic `DesktopModal` 와 동일 폼 + **삭제 버튼** 추가 (destructive variant).
- 삭제 시 confirm 다이얼로그 후 `useDeleteEpic`. 하위 Sub 도 함께 삭제됨을 안내.

### 3.4 Sub 편집
- `SubCreateSheet` / Sub `DesktopModal` 와 동일 폼 + **삭제 버튼** + Epic 헤더 노출 (`Epic: <title>`).
- 분류·우선순위는 본 폼에 부재. 변경하려면 상위 Epic 편집으로 이동.

## 4. 레이아웃

### 4.1 Mobile (`*CreateSheet`)
- 바텀 시트, 상단 모서리 `--radius-lg`.
- 슬라이드 업 `--duration-slow` (300ms).
- 핸들 + 헤더 + 폼 필드 + 저장 버튼 (`proto-button-primary`).

### 4.2 Desktop (`DesktopModal`)
- 중앙 정렬, 너비 480px, `--radius-lg`.
- 백드롭 `rgba(0,0,0,0.4)`. fade-in `--duration-normal`.
- 우측 상단 닫기 버튼 (`✕`).

## 5. 접근성 (a11y)

- `aria-modal="true"` + 포커스 트랩 + `Escape` 닫기.
- 헤더 제목은 `<h5 id="...">` + `aria-labelledby` 연결.
- Sub 시트의 readonly Epic input 은 `readonly` + `aria-readonly="true"`.
- 삭제 버튼 destructive variant — 클릭 시 confirm.
- 우선순위 배지 그룹: `role="radiogroup"` + 각 옵션 `role="radio"` + `aria-checked`. (잠정 — 시각만 우선 구현, a11y semantics 후속.)

## 6. 토큰 정합

| 요소 | 토큰 |
|---|---|
| 시트/모달 padding | `--spacing-6` |
| 시트 상단 `--radius-lg` | mobile 한정 |
| 모달 `--radius-lg` | desktop |
| 폼 필드 간격 | `--spacing-4` |
| 저장 버튼 | Button Primary |
| 삭제 버튼 | Button Destructive |
| readonly input | `--color-bg-subtle` 배경, `--color-text-secondary` 텍스트 |

## 7. 향후 갱신 항목

- Sub 의 Epic 이동 사용자 흐름 도입 여부
- Epic 편집 시 분류 변경의 cascade 영향 (Sub 들의 표시 분류) 정책
- 우선순위 정렬: Epic 카드 정렬 시 priority 가중치 사용 여부
- 다크 모드 시 readonly input 색 매핑
