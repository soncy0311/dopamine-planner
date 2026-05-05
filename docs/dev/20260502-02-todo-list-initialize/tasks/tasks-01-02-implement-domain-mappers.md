# TASK-01-02: domain 매퍼 3종 구현

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 02
- **상태**: 대기중
- **의존성**: (없음 — services / hooks 이 본 매퍼에 의존)

## 작업 목표

`packages/core/src/domain/{category,epic,todo}.ts` 의 stub 을 실 구현으로 교체한다. DB Row(snake_case) → View(camelCase) 일방향 매퍼 + 일자별 합성 매퍼를 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/domain/category.ts` | 본문 작성 | `mapCategoryRow` |
| `packages/core/src/domain/epic.ts` | 본문 작성 | `mapEpicRow` |
| `packages/core/src/domain/todo.ts` | 본문 작성 | `mapSubIssueRow`, `mapTodoDailyView(rows, date)` |

### 구현 세부사항

- 입력 타입은 `packages/shared/src/database.ts` 의 `Database['public']['Tables']['<table>']['Row']`
- 출력 타입은 API_CONTRACT §7 의 TS 타입 (camelCase)
- 역변환 매퍼는 만들지 않는다. insert payload 는 호출 측이 snake_case 직접 작성
- `mapTodoDailyView(rows, date)`:
  - 입력: `sub_issue` row 배열 + 기준 날짜
  - 출력: `{ done: SubIssue[]; todo: SubIssue[] }` — `status === 'done'` 분리
  - epic / category JOIN 결과가 nested 로 들어오면 매퍼가 평탄화 처리

### 참조 코드

- sub-prd-01 §2 도메인 매퍼
- API_CONTRACT §7 TS 타입 정의

## 검증 과정

- [ ] 3개 파일 모두 export 함수 보유 (`mapCategoryRow`, `mapEpicRow`, `mapSubIssueRow`, `mapTodoDailyView`)
- [ ] DB Row 의 모든 필수 필드가 View 타입에 매핑되어 있음 (누락된 컬럼 없음)
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] `mapTodoDailyView` 의 done/todo 분리가 `status === 'done'` 기준으로 동작

## 주의사항

1. **단일 방향 매퍼** — 역변환(Camel → snake) 은 만들지 않는다. 호출 측 단일 책임.
2. **API_CONTRACT 정합** — 필드명·타입은 §7 와 1:1 일치. 추가/삭제 금지.
3. **null 처리** — DB nullable 필드는 View 에서도 `| null` 유지. 임의로 default 값 주입 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §7
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §2
