# Task 02-05: Supabase generated/shared 타입 갱신

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-05 |
| 상태 | 완료 |
| 의존성 | 02-02, 02-04 완료 필요 |

## 작업 목표

DB 변경 결과를 `packages/shared` 의 Supabase 타입에 반영한다. `epic_issue.category_id` 의 Row/Insert/Update 타입이 nullable 을 허용하고, RPC 를 추가했다면 함수 타입도 공유 타입에 포함되도록 갱신한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/shared/src/database.ts` | 수정 - generated Database 타입 갱신 |
| `env/.env.example` | 확인 - 타입 생성에 필요한 환경 변수 추가 여부 확인 |
| `Makefile` | 확인 - `make sb-gen-types` 진입점 확인 |

### 구현 세부사항

1. **타입 생성**
   - 루트 Makefile 의 단일 진입점인 `make sb-gen-types` 를 사용한다.
   - 생성 결과에서 `epic_issue.category_id` Row 타입이 `string | null` 인지 확인한다.
   - Insert/Update 타입이 분류 없는 Epic 생성/수정을 허용하는지 확인한다.

2. **RPC 타입 확인**
   - 02-04 에서 RPC 를 추가했다면 `Database['public']['Functions']` 에 함수 타입이 포함되는지 확인한다.
   - 인자명과 반환 타입이 service 구현에서 쓰기 좋은 형태인지 검토한다.

3. **후속 영향 기록**
   - shared 타입 변경으로 발생하는 TypeScript 오류는 후속 core/web/mobile task 에서 처리한다.
   - 단, generated 타입 파일 자체를 수동 편집하지 않는다.

### 참조 코드

- `packages/shared/src/database.ts`: Supabase generated type 위치
- `Makefile`: 타입 생성 명령 진입점
- `supabase/migrations/{next}_category_nullable_set_null.sql`: 타입 변경의 DB 근거

## 검증 과정

- [x] `packages/shared/src/database.ts` 에서 `epic_issue.category_id` Row 타입이 nullable 이다.
- [x] Insert/Update 타입에서 `category_id: null` 또는 생략이 허용된다.
- [x] RPC 를 추가했다면 generated function 타입이 반영되어 있다.
- [x] generated 타입 외 임의 수동 타입 덮어쓰기를 하지 않았다.

## 주의사항

- 모든 실행 커맨드는 루트 `Makefile` 을 진입점으로 사용한다.
- 실제 DB migration 적용과 타입 생성은 환경 의존 작업이므로 실패 시 원인과 필요한 환경을 기록한다.
- "분류 없음"을 타입 레벨에서 가짜 category id 문자열로 표현하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
