# TASK-10-01: main-prd Sub-PRD 표 갱신 (Sub-10 행 추가)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-01
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (sub-prd-10 의 가장 선행 task — 코드 변경 0)

## 작업 목표

sub-prd-10 §7 — `main-prd-todo-list-initialize.md` 의 Sub-PRD 섹션을 갱신하여 Sub-10 행을 추가하고 카운트를 9개 → 10개로 갱신한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md` | 수정 | Sub-PRD 표 10행으로 확장 + 카운트 갱신 |

### 변경 사항

1. **L272 카운트 갱신**:
   - 기존: `(9개 — Sub-01~05 = 1차 / Sub-06~08 = prototype 정합 후속 / Sub-09 = 모달·DB·설정 정합)`
   - 변경: `(10개 — Sub-01~05 = 1차 / Sub-06~08 = prototype 정합 후속 / Sub-09 = 모달·DB·설정 정합 / Sub-10 = priority Epic 이전 + 잔존 정책 정합)`
2. **L289 (Sub-09 행 뒤) Sub-10 행 추가**:
   - 번호: Sub-10
   - 제목: `refactor/priority-on-epic-and-design-system-alignment`
   - 범위 요약: `priority` 컬럼 epic_issue 이전 + Sub priority 제거 + 디자인 SoT 잔존 격차(AddButton / Settings / EpicCard priority badge) + prototype 시각 정합(TodoItem grid / FilterChips / DateNavigator / SegmentedProgressBar)
   - 산출물: 마이그레이션 013, `EpicAccordionCard` priority prop, `TodoItem` priority 제거, web/mobile 폼·Settings 정합, prototype 시각 정합
   - 선행: Sub-01 / Sub-02 / Sub-03 / Sub-06 / Sub-07 / Sub-08 / Sub-09

## 검증 과정

- [x] main-prd Sub-PRD 표에 Sub-10 행이 다른 sub 와 같은 컬럼 형식으로 존재
- [x] 카운트 텍스트가 9 → 10 으로 갱신
- [x] 산출물·선행 항목이 sub-prd-10 §1~§8 과 1:1 정합
- [x] markdown 링크 깨짐 0건

## 주의사항

1. **scope = docs**: 본 task 는 코드 변경 0건. PR scope 는 `docs`.
2. **선행 task**: 본 task 가 머지되지 않으면 후속 task 의 §관련 문서 링크가 sub-prd-10 만 가리켜 main-prd SoT 와 어긋남. 가장 먼저 머지.
3. **API_CONTRACT 갱신 부재**: 본 sub 는 API 시그니처 변경이 없음 (테이블 컬럼 이전이지만 외부 API 형은 동일하게 priority 가 epic 응답에 포함되도록 자연 반영). API_CONTRACT 갱신 task 없음.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §7
- [`../../../CLAUDE.md`](../../../CLAUDE.md)
