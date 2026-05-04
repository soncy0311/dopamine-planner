# Task 03-04: 로컬 검증 + 타입 자동생성

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 03-01, 03-02, 03-03 모두 완료 (5개 마이그레이션 파일 작성 완료)
- **대상 파일**:
  - `packages/shared/src/database.ts` (자동 생성 산출물 — 기존 placeholder 덮어쓰기)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-03-feat-supabase-infra.md`, `sub-prd-02-feat-core-package.md` (Task 02-02 가 본 산출물에 의존)

## 상태

- 2026-05-04: **사용자 환경 작업 — 미실행** — Supabase CLI / Docker 미설치(`command -v supabase` not found). 본 task 의 모든 체크리스트는 사용자가 로컬 환경에서 직접 실행해야 한다. 실행 후 `packages/shared/src/database.ts` placeholder (`export type Database = any;`) 가 자동 생성 타입으로 덮어써진다. Sub-04 / Sub-05 가 이 산출물을 import 하므로 빠른 시기에 실행 권장.

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `supabase db reset` 로컬 검증 (무에러 통과) *(❌ 사용자 환경)*
- [ ] SQL Studio 에서 `select carry_over_todos('2026-05-02')` 직접 호출 *(❌ 사용자 환경)*
- [ ] `supabase gen types typescript --local > packages/shared/src/database.ts` *(❌ 사용자 환경)*

## 구현 세부사항

### 1. `supabase db reset`

monorepo 루트에서 실행:

```bash
supabase start   # 로컬 Supabase 스택 (Docker) 가동 — 미가동 시
supabase db reset
```

기대 결과:

- 마이그레이션 5개(`001` → `005`) 가 순서대로 적용
- 에러 0건 — 어떤 단계라도 실패 시 해당 마이그레이션 파일을 수정 후 재실행
- 종료 후 `psql` 또는 Supabase Studio (기본 `http://localhost:54323`) 로 접속 가능

### 2. RPC 호출 검증

Supabase Studio 의 SQL Editor (또는 `psql`) 에서 직접 호출.

**(a) 익명 컨텍스트 — `unauthorized` 확인**:

```sql
-- 별도 role 설정 없이 (anon)
select carry_over_todos('2026-05-02');
-- 기대: ERROR: unauthorized
```

또는 `set role anon;` 후 동일 호출.

**(b) 인증 컨텍스트 — `moved_count` 반환 확인**:

테스트 사용자 1명을 `auth.users` + `profile` 에 시드 후, `select set_config('request.jwt.claims', json_build_object('sub', '<test-uuid>')::text, true);` 등으로 JWT claim 시뮬레이션. 또는 Supabase Auth UI 로 로컬 테스트 사용자 생성 후 클라이언트 SDK 호출.

```sql
-- 인증 컨텍스트 (auth.uid() = <test-uuid>)
select * from carry_over_todos('2026-05-02');
-- 기대: moved_count 반환 (값 ≥ 0)
```

> 본 검증 패턴은 `recalc_epic_progress(<epic-uuid>)` 도 동일하게 수행한다.

### 3. `supabase gen types` 실행

monorepo 루트에서:

```bash
supabase gen types typescript --local > packages/shared/src/database.ts
```

기존 placeholder (`export type Database = any;` 등) 를 덮어쓰는 것이 정상.

산출물 검증:

- 파일 상단 `export type Database = { ... }` 또는 `export interface Database { ... }`
- `Database['public']['Tables']` 에 `profile`, `category`, `epic_issue`, `sub_issue` 4개 키 존재
- `Database['public']['Functions']` 에 `carry_over_todos`, `recalc_epic_progress` 2개 키 존재

이후 Sub-02 의 Task 02-02 / 02-03 import 가 실제 타입으로 해소된다.

## 주의사항

1. **본 task 가 Sub-02 의존성 해소** — 02-02 / 02-03 의 `Database` import 가 실제 타입으로 컴파일 가능해진다 (Sub-PRD §3)
2. **인프라 변경 후마다 재실행** — 003·004·005 추가 / 스키마 변경 시 매번 `supabase gen types` 재실행 (Sub-PRD §주의사항 4)
3. **로컬 우선** — 원격 적용은 03-06. 본 단계는 로컬 검증만 (Sub-PRD §주의사항 2)
4. **Supabase Docker 미가동 시** — `supabase start` 로 가동. 디스크/메모리 자원 확인. 종료는 `supabase stop`
5. **RPC 인증 호출 검증이 어려운 경우** — 검증 대신 `pgTAP` 또는 SDK 기반 통합 테스트로 대체 가능. 단 본 단계 검증 체크리스트는 최소한 anonymous `unauthorized` 발생을 확인

## 검증 체크리스트

- [ ] `supabase db reset` exit code 0 (무에러)
- [ ] 익명 컨텍스트로 `select carry_over_todos('2026-05-02')` 호출 → `unauthorized` 에러 발생 (로그/스크린샷)
- [ ] 인증 컨텍스트로 동일 호출 → `moved_count` 반환 (값 ≥ 0)
- [ ] `ls packages/shared/src/database.ts` — 파일 존재
- [ ] `grep -n "export type Database\|export interface Database" packages/shared/src/database.ts` — 1건 매치
- [ ] `grep -E "profile|category|epic_issue|sub_issue" packages/shared/src/database.ts` — 4개 테이블명 모두 매치
- [ ] `grep -E "carry_over_todos|recalc_epic_progress" packages/shared/src/database.ts` — 2개 함수명 모두 매치
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (Sub-02 Task 02-02 / 02-03 의 `Database` import 해소)
