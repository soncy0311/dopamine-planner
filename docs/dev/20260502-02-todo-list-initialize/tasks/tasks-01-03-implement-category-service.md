# TASK-01-03: services/category.ts CRUD 4종

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 03
- **상태**: 대기중
- **의존성**: 02 (도메인 매퍼)

## 작업 목표

`packages/core/src/services/category.ts` 의 stub 을 실 구현으로 교체. 워크스페이스별 카테고리 CRUD 4종을 모두 매퍼 통과 후 반환하도록 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/category.ts` | 본문 작성 | `listByWorkspace`, `create`, `update`, `remove` |

### 구현 세부사항

- `listByWorkspace(client, workspace)` — `from('category').select('*').eq('workspace', ws).order('sort_order')`. 결과를 `mapCategoryRow` 배열 매핑.
- `create(client, payload)` — `insert(payload).select().single()` → `mapCategoryRow` 통과.
- `update(client, id, patch)` — `update(patch).eq('id', id).select().single()` → 매퍼 통과.
- `remove(client, id)` — `delete().eq('id', id)`. void 반환. FK 위반 에러는 throw (호출 측이 처리).
- 모든 함수의 첫 인자는 `client: SupabaseClient<Database>`.

### 참조 코드

sub-prd-01 §3 Category 서비스.

## 검증 과정

- [ ] 4개 함수 모두 export
- [ ] 모든 반환값이 `Category` 또는 `Category[]` (매퍼 통과)
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] `grep -RIn "\.eq('user_id'" packages/core/src/services/category.ts` 결과 0건 (RLS 이중 필터 금지)

## 주의사항

1. **RLS 이중 필터 금지** — `.eq('user_id', auth.uid())` 추가 작성 금지 (sub-prd §주의사항 4).
2. **삭제 시 FK 에러는 throw** — 23503 발생 시 호출 측 (sub-03 모달) 가 친화 토스트 처리 (sub-prd §주의사항 8).
3. **매퍼 통과 의무** — supabase 응답 그대로 반환 금지. 반드시 `mapCategoryRow` 호출.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.1
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §3
