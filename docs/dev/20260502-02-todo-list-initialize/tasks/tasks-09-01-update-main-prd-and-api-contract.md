# TASK-09-01: main-prd Sub-PRD 표 + API_CONTRACT 갱신

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 01
- **상태**: 대기중
- **의존성**: 없음 (sub-prd-09 의 가장 선행 task — 코드 변경 0)

## 작업 목표

sub-prd-09 §9 와 §주의사항 4 를 정합하여 두 문서를 갱신한다.

1. `main-prd-todo-list-initialize.md` 의 Sub-PRD 표에 **Sub-09 행 추가**
2. `API_CONTRACT.md` 의 sub_issue 시그니처 (`due_date` → `registered_date`), `carry_over_todos` RPC 의미 변경, `category_create` RPC 명세를 sub-prd-09 §1 과 일치시킴

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md` | 수정 | Sub-PRD 표 9행 추가 |
| `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` | 수정 | sub_issue / carry_over / category_create 시그니처 갱신 |

### main-prd Sub-PRD 표 항목

- 번호: Sub-09
- 제목: `feat/issue-flow-and-settings-revamp`
- 범위 요약: sub_issue / Epic 모달 분리 + 분류 자유입력 Combobox + 설정·관리 페이지 정합 + DB rename / trigger
- 산출물: 마이그레이션 004/005/006, `CategoryComboboxCreate`, `EpicFormModal` / `SubIssueFormModal`, settings page 재구현
- 선행: Sub-01 / 02 / 03 / 06 / 07 / 08

### API_CONTRACT 갱신

- `sub_issue` 테이블 스키마: `due_date` 필드 → `registered_date` (의미: "그 날짜에 등록 / 이월된 sub")
- `carry_over_todos(target_date)` RPC: 본문 의미 변경 (`registered_date < target_date AND status<>'done'` → `registered_date = target_date`). `carry_over_count++` 유지
- `category_create(workspace, name, color?)` RPC 시그니처 명시 (이미 존재하면 재사용 표기, 없으면 신설 표기. `SECURITY DEFINER`. 반환 = 신규 row)

## 검증 과정

- [ ] main-prd Sub-PRD 표에 Sub-09 행이 다른 sub 와 같은 컬럼 형식으로 존재
- [ ] API_CONTRACT 의 sub_issue 컬럼 표에 `due_date` 흔적 0건
- [ ] API_CONTRACT 의 `carry_over_todos` 본문 설명이 "registered_date = target_date" 의미로 갱신
- [ ] API_CONTRACT 의 `category_create` RPC 시그니처 (workspace / name / color) + 권한 명시
- [ ] sub-prd-09 §1 / §2 의 컬럼·RPC 명과 1:1 일치
- [ ] markdown 링크 깨짐 0건

## 주의사항

1. **scope = docs**: 본 task 는 코드 변경 0건. PR scope 는 `docs`.
2. **선행 task**: 본 task 가 머지되지 않으면 후속 task 의 §관련 문서 링크가 sub-prd-09 만 가리킴 → API 계약 변경 사실이 흩어진다. 가장 먼저 머지.
3. **API_CONTRACT 변경 사유 커밋 본문 명시**: docs/CLAUDE.md §문서 작성 규칙 — 변경 사유 기재 필수.
4. **sub-prd-09 §미해결 항목 인용**: 자동 이월 스케줄링 / inline 편집 등 미해결 항목은 API_CONTRACT 에 옮기지 않음 (PRD 책임).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §9 / §주의사항 4
- [`../API_CONTRACT.md`](../API_CONTRACT.md)
- [`../../../CLAUDE.md`](../../../CLAUDE.md)
