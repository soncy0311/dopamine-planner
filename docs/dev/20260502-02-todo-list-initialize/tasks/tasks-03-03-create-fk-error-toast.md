# TASK-03-03: FK(23503) 에러 친화 토스트 helper

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 03
- **상태**: 완료
- **의존성**: 01 (sonner 설치 완료)

## 작업 목표

Postgres FK 위반 (`code === '23503'`) 발생 시 사용자 친화 한글 토스트로 변환하는 helper 를 신설한다. 분류·Epic 삭제 mutation (task 09 / 10) 과 모달 내부 삭제 액션 (task 08) 에서 재사용한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/lib/errors/fkErrorToast.ts` | 신설 | `showFkOrDefaultError(err, fkMessage)` helper |

### 구현 세부사항

- 입력: PostgrestError 또는 일반 Error
- 동작: `err.code === '23503'` 이면 1 번 인자 `fkMessage` 토스트, 그 외엔 `err.message ?? '작업 실패'` 토스트
- 모두 `sonner` 의 `toast.error` 호출

### 참조 코드 (sub-prd-03 §핵심 구현 로직 "FK 에러 친화 토스트" 일반화)

```ts
// apps/web/src/lib/errors/fkErrorToast.ts
import { toast } from 'sonner';

type Pgish = { code?: string; message?: string };

export function showFkOrDefaultError(err: unknown, fkMessage: string) {
  const e = err as Pgish;
  if (e?.code === '23503') {
    toast.error(fkMessage);
    return;
  }
  toast.error(e?.message ?? '작업 실패');
}
```

### 사용 예시 (task 09 / 10 / 08 에서 호출)

```ts
const remove = useMutation({
  mutationFn: (id: string) => categoryService.remove(client, id),
  onError: (err) => {
    showFkOrDefaultError(err, '이 분류에 Epic 이 있어 삭제할 수 없어요. 먼저 Epic 을 정리해주세요.');
  },
});
```

## 검증 과정

- [x] `apps/web/src/lib/errors/fkErrorToast.ts` 파일 존재
- [x] `showFkOrDefaultError` named export
- [x] `err.code === '23503'` 분기 존재
- [x] sonner `toast.error` 호출
- [x] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **사용자 노출 메시지 의무** — 분류·Epic 삭제 시 일반 `error.message` 직접 노출 금지 (sub-prd §주의사항 4). 본 helper 만 사용.
2. **23503 식별자** — Postgres FK 위반 SQLSTATE. Supabase 가 PostgrestError 로 그대로 노출. `error.code` 가 string 타입.
3. **toast 비표시 분기 금지** — FK 도 일반 에러도 모두 토스트 표시. 사일런트 실패 만들지 말 것.
4. **i18n 미고려** — MVP 한글 하드코딩. 향후 `t(key)` 도입 시 helper 의 2 번째 인자로 키를 전달하는 식으로 확장.
5. **단일 진입점** — task 09 / 10 / 08 의 mutation `onError` 는 모두 본 helper 호출. inline 분기 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §핵심 구현 로직 "FK 에러 친화 토스트", §주의사항 4
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — categoryService.remove / epicService.remove
