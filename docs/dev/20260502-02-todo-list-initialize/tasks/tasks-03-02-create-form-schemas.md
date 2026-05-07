# TASK-03-02: `lib/forms/schemas.ts` Zod 스키마 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 02
- **상태**: 완료
- **의존성**: 01 (zod / @hookform/resolvers 설치 완료)

## 작업 목표

투두 / 분류 / Epic 폼의 입력 검증 스키마를 단일 모듈에 모은다. 각 모달 (task 05~08) 이 동일한 스키마를 import 하여 react-hook-form `zodResolver` 에 주입할 수 있도록 한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/lib/forms/schemas.ts` | 신설 | `TodoFormSchema`, `CategoryFormSchema`, `EpicFormSchema` + 추론 타입 |

### 구현 세부사항

- `import { z } from 'zod'`
- 3 개 스키마 export
- 각 스키마에 대해 `z.infer` 로 타입 추출 후 `TodoFormValues` / `CategoryFormValues` / `EpicFormValues` 도 함께 export
- 모든 한글 에러 메시지는 사용자 노출 가능한 친화 문구

### 참조 코드 (sub-prd-03 §핵심 구현 로직 인용 + 확장)

```ts
// apps/web/src/lib/forms/schemas.ts
import { z } from 'zod';

export const TodoFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  description: z.string().max(2000, '설명은 2000자 이내').optional(),
  priority: z.enum(['high', 'medium', 'low']),
  categoryId: z.string().uuid('분류를 선택해주세요'),
  epicId: z.string().uuid('Epic 을 선택해주세요'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
export type TodoFormValues = z.infer<typeof TodoFormSchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내'),
  color: z.string().regex(/^#([0-9a-f]{6})$/i, '팔레트 색상이 아닙니다'),
});
export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export const EpicFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내'),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid('분류를 선택해주세요'),
});
export type EpicFormValues = z.infer<typeof EpicFormSchema>;
```

## 검증 과정

- [x] `apps/web/src/lib/forms/schemas.ts` 파일 존재
- [x] `TodoFormSchema`, `CategoryFormSchema`, `EpicFormSchema` 3 종 export
- [x] 추론 타입 `TodoFormValues` / `CategoryFormValues` / `EpicFormValues` 함께 export
- [x] 모든 검증 메시지 한글
- [x] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **워크스페이스 필드 비포함** — `workspace` (`'life' | 'work'`) 는 모달 props 로 주입되는 컨텍스트이지 폼 입력값이 아님. 스키마에 넣지 말 것.
2. **dueDate 는 string** — Date 객체가 아니라 `YYYY-MM-DD` 문자열. 메인 뷰의 `?date=` 쿼리와 일관 유지.
3. **color regex** — palette 화이트리스트 검증은 폼 컴포넌트에서 추가로 수행 (task 05). 본 스키마는 hex 형식만 검증.
4. **uuid 검증 유형** — 분류/Epic 미선택 상태는 빈 문자열이 아니라 `undefined` 가 되도록 폼 default 를 잡고, 제출 시 `z.string().uuid()` 가 친화 메시지로 잡도록 설정.
5. **본 sub 의 단일 import 진입점** — task 05~08 모두 본 모듈만 import. 모달별 inline 스키마 생성 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — 도메인 필드 정의
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §핵심 구현 로직 "Zod + RHF 폼"
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — 도메인 매퍼 / 서비스 계약
