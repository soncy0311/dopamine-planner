# TASK-09-13: web — `EpicFormModal` 생성용 통합 + 분류 자유 입력 적용

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 13
- **상태**: 대기중
- **의존성**: TASK-09-11 (`CategoryComboboxCreate`)

## 작업 목표

sub-prd-09 §3.1 — `apps/web/src/components/modals/EpicFormModal.tsx` 의 분류 입력을 native `<select>` 에서 `CategoryComboboxCreate` 로 교체하고, 생성용 모드를 통합한다 (기존이 편집 / 생성 분기였다면 생성용 통합).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/EpicFormModal.tsx` | 수정 | 분류 필드 교체 + 생성용 통합 |

### 입력 필드 (확정)

| 필드 | 타입 | 비고 |
|---|---|---|
| 제목 | text (필수) | 기존 |
| 설명 | textarea | 기존 |
| 분류 | `CategoryComboboxCreate` | **신규** — workspace 는 props 또는 호출 컨텍스트 주입 |
| priority | `high` / `medium` / `low` 라디오 또는 select | 기존 |

> **등록일**: 진입 시 호출자 (현재 일자) 에서 주입 — 사용자 입력 X.

### 호출 컨텍스트 주입

```tsx
<EpicFormModal
  workspace="life"          // host 가 주입
  defaultRegisteredDate={today}
  onSubmit={...}
  onClose={...}
/>
```

### CategoryComboboxCreate 결선

```tsx
const [category, setCategory] = useState<{ id: string; name: string } | null>(null);

<CategoryComboboxCreate
  workspace={workspace}
  value={category}
  onChange={setCategory}
  placeholder="분류 선택 또는 새로 만들기"
/>
```

### 폼 검증

- 기존 zod schema (`apps/web/src/lib/schemas/epic.ts` 또는 동등) 갱신
- 분류는 객체 (`{ id, name }`) 로 받되 submit 시 `category.id` 만 사용
- 미선택 / 미생성 시 submit 비활성

### 회귀 영향

- 기존 EpicFormModal 호출 측: TASK-09-15 의 호출 측 교체에서 함께 결선
- 본 task 단독 머지 시 TypeScript 호환 검증 우선

## 검증 과정

- [ ] `EpicFormModal.tsx` 의 native `<select>` 분류 필드 0건
- [ ] `CategoryComboboxCreate` 임포트 + 사용
- [ ] 입력 필드 4개 (제목 / 설명 / 분류 / priority) 정합
- [ ] 등록일은 props 주입, 사용자 입력 X
- [ ] `pnpm --filter @todo-list/web typecheck` / `lint` 통과
- [ ] 수동: 모달 진입 → 분류 자유 입력 → 신규 생성 → 저장 → list 갱신
- [ ] 수동: 동시 생성 race → toast.error 노출

## 주의사항

1. **머지 순서**: 11 머지 후. 11 미머지 상태에서 import 시 빌드 실패.
2. **편집 모드 처리**: 기존 EpicFormModal 이 생성 / 편집 양쪽 처리하던 경우 — 본 task 는 "생성용 통합" 이므로 편집은 별도 모달 / 별도 모드. 진입 시 코드 확인 후 분리 여부 결정 (sub-prd-09 §3.1 은 "생성용 모드 통합" 명시).
3. **workspace 주입**: host 가 정확히 'life' / 'work' 중 하나 주입 — 잘못된 값 방어 코드 X (zod 또는 type 으로 보호).
4. **scope = feat(web)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §3.1
- [`./tasks-09-11-ui-category-combobox-create.md`](./tasks-09-11-ui-category-combobox-create.md)
- [`./tasks-09-15-web-deprecate-create-todo-modal.md`](./tasks-09-15-web-deprecate-create-todo-modal.md)
