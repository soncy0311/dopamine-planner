# SUB-PRD: `Supabase 인프라`

## 작업 정보

- **작업명**: `Supabase 인프라`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-04
- **종료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **상태**: 부분 완료 — 코드/문서 산출물 작성 완료. 로컬 reset/타입 자동생성(03-04) 및 Dashboard·원격 적용(03-06) 은 사용자 환경 작업으로 분리.

## 배경 및 목적

v2 의 "자체 서버 0" 구조 (main PRD §1) 를 위한 DB 스키마 + RLS + RPC 2종 + Realtime publication 을 코드(SQL 마이그레이션)로 관리한다. main PRD §데이터베이스 스키마 의 5개 마이그레이션 파일을 정의하고, 자동 생성된 TS 타입을 `packages/shared/src/database.ts` 로 내보내 Sub-04 / Sub-05 가 import 할 수 있도록 한다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| BaaS | Supabase (Free) |
| DB | PostgreSQL 15+ |
| 함수 언어 | plpgsql (`SECURITY DEFINER`) |
| 인증 | Supabase Auth (Google OAuth — MVP) |
| 실시간 | `supabase_realtime` publication |
| CLI | Supabase CLI (`supabase init`, `supabase db reset`, `supabase gen types`) |

## 핵심 요구 사항

### 1. `supabase init`

`supabase/config.toml` + 디렉토리 골격을 생성한다. 본 레포는 monorepo 루트에서 단일 Supabase 프로젝트로 관리한다 (`supabase/` 가 루트에 위치).

### 2. 마이그레이션 5개

순서 보장: 001 → 002 → 003 → 004 → 005.

#### `supabase/migrations/001_initial_schema.sql`

- 테이블 4개: `profile`, `category`, `epic_issue`, `sub_issue`
- 컬럼·관계는 `detail-todo-service-initialize.md` §3 ERD 와 1:1 일치
- 각 테이블에 `enable row level security`
- updated_at 자동 갱신 트리거 (필요 시)

#### `supabase/migrations/002_rls_policies.sql`

테이블별 정책. `auth.uid() = user_id` 기준 (또는 `category` / `epic_issue` 의 user_id 경유).

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profile` | self | self | self | — |
| `category` | self | self | self | self |
| `epic_issue` | self | self | self | self |
| `sub_issue` | self | self | self | self |

#### `supabase/migrations/003_carry_over_todos.sql`

```sql
create or replace function carry_over_todos(target_date date)
returns table(moved_count integer)
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt integer;
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  with moved as (
    update sub_issue
       set due_date = target_date
     where user_id = uid
       and status <> 'done'
       and due_date < target_date
    returning id
  )
  select count(*) into cnt from moved;
  return query select cnt;
end;
$$;

revoke all on function carry_over_todos(date) from public, anon;
grant execute on function carry_over_todos(date) to authenticated;
```

#### `supabase/migrations/004_recalc_epic_progress.sql`

```sql
create or replace function recalc_epic_progress(epic_id uuid)
returns table(progress numeric)
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  total integer;
  done integer;
  pct numeric;
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  select count(*) filter (where true), count(*) filter (where status = 'done')
    into total, done
    from sub_issue
   where user_id = uid and epic_id = recalc_epic_progress.epic_id;
  pct := case when total = 0 then 0 else (done::numeric / total::numeric) end;
  update epic_issue set progress = pct where id = recalc_epic_progress.epic_id and user_id = uid;
  return query select pct;
end;
$$;

revoke all on function recalc_epic_progress(uuid) from public, anon;
grant execute on function recalc_epic_progress(uuid) to authenticated;
```

> 위 두 함수의 본문은 detail-todo-service-initialize.md §3 ERD 와 칼럼명이 일치하도록 본 단계에서 최종 확정한다. 칼럼명 mismatch 가 있으면 detail 문서를 우선으로 정렬한다.

#### `supabase/migrations/005_realtime_publication.sql`

```sql
alter publication supabase_realtime add table profile, category, epic_issue, sub_issue;
```

(존재하지 않는 publication 생성이 필요한 경우 `create publication supabase_realtime …` 우선 처리)

### 3. 타입 자동생성

```bash
supabase gen types typescript --local > packages/shared/src/database.ts
```

- 출력 파일은 `Database` 타입을 `export` 해야 함
- `packages/core/src/supabase/types.ts` 가 이 import 를 사용 (Sub-02 산출물)

### 4. 환경 변수 갱신

| 파일 | 추가 | 제거 |
|---|---|---|
| `env/.env.web.example` | (변동 없음 — 기존 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 유지) | `SUPABASE_SERVICE_ROLE_KEY` |
| `env/.env.mobile.example` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `EXPO_PUBLIC_WEBVIEW_URL` |

### 5. Supabase Dashboard 작업 (사용자 직접 수행)

본 Sub-PRD 의 "검증" 단계로 사용자가 직접 수행한다.

- **Authentication → URL Configuration**:
  - Site URL: `https://<slug>.vercel.app`
  - Redirect URLs (화이트리스트):
    - `https://<slug>.vercel.app/auth/callback` (웹)
    - `dopamine-planner://auth/callback` (모바일)
- **Authentication → Providers**: **Google 만 활성화** (Kakao 후속 — 결정 #3)

## 핵심 구현 로직

### RPC 작성 원칙 (detail §5.2)

1. `language plpgsql security definer set search_path = public`
2. 함수 본문 첫 줄: `if auth.uid() is null then raise exception 'unauthorized'; end if;`
3. WHERE 절에 `auth.uid()` 명시 — 본인 데이터만 조작
4. `revoke all on function … from public, anon;` + `grant execute … to authenticated;`
5. 반환 타입은 명시적 `returns table(...)` 또는 단일 스칼라 — 클라이언트 타입 추론을 위해

### 마이그레이션 순서 보장

RLS (002) 가 RPC (003·004) 보다 먼저 적용되어야 함수 본문의 `auth.uid()` 검증이 의미를 갖는다. Realtime publication (005) 은 마지막에 등록.

## 구현 시 주의사항

1. **Dashboard 직접 수정 금지** — 모든 스키마 변경은 마이그레이션 파일로. Dashboard 에서 임시로 변경 시 `supabase db diff` 로 잡아내 마이그레이션에 반영
2. **로컬 검증 우선** — 원격 적용 전 `supabase db reset` 으로 로컬 DB 재생성 + SQL Studio 에서 RPC 직접 호출 테스트
3. **원격 적용은 사용자 직접 실행** — `supabase link --project-ref <ref>` + `supabase db push`. CI 자동화는 후속
4. **타입 자동생성은 인프라 변경 직후마다** — 003·004·005 추가 시마다 `supabase gen types` 재실행하여 `packages/shared/src/database.ts` 갱신. Sub-04 / Sub-05 는 이 파일을 import
5. **칼럼명 SoT** — `detail-todo-service-initialize.md` §3 ERD 가 source of truth. 마이그레이션 작성 중 ERD 와 mismatch 발견 시 detail 문서를 우선 갱신
6. **anon key 만 클라이언트에 노출** — service_role key 는 어떤 클라이언트(웹/모바일/팩토리)에도 주입 금지

## 작업

- [x] `supabase init` 실행 (루트에 `supabase/` 생성) — 수동 골격 작성 (`config.toml`, `.gitignore`, `seed.sql`, `migrations/.gitkeep`)
- [x] `supabase/config.toml` 검토 (project_id `dopamine-planner`, 기본 포트 유지)
- [x] `supabase/migrations/001_initial_schema.sql` 작성 — 4개 테이블 + enum 4종 + 트리거 + RLS 활성화
- [x] `supabase/migrations/002_rls_policies.sql` 작성 — 테이블별 정책 15건
- [x] `supabase/migrations/003_carry_over_todos.sql` 작성 — RPC 함수 (carry_over_count + 1 동시 갱신)
- [x] `supabase/migrations/004_recalc_epic_progress.sql` 작성 — RPC 함수
- [x] `supabase/migrations/005_realtime_publication.sql` 작성 — publication 존재 검사 + 4개 테이블 등록
- [ ] `supabase db reset` 로컬 검증 (무에러 통과) *(❌ 사용자 환경 — CLI/Docker 미설치)*
- [ ] SQL Studio 에서 `select carry_over_todos('2026-05-02')` 직접 호출 *(❌ 사용자 환경)*
- [ ] `supabase gen types typescript --local > packages/shared/src/database.ts` *(❌ 사용자 환경 — 현재 placeholder `Database = any` 유지)*
- [x] `env/.env.web.example` 갱신 (SERVICE_ROLE_KEY 제거)
- [x] `env/.env.mobile.example` 갱신 (EXPO_PUBLIC_SUPABASE_URL/ANON_KEY 추가, WEBVIEW_URL 제거)
- [ ] **(사용자 작업)** Supabase Dashboard 에서 Site URL + Redirect URLs 화이트리스트 설정
- [ ] **(사용자 작업)** Supabase Dashboard 에서 Google Provider 활성화
- [ ] **(사용자 작업)** `supabase link` + `supabase db push` 로 원격 적용

## 검증 기준

- [ ] `supabase db reset` 무에러 통과 *(❌ 사용자 환경)*
- [ ] SQL Studio 에서 anonymous 로 `select carry_over_todos('2026-05-02')` 호출 시 `unauthorized` 에러 발생 *(❌ 사용자 환경)*
- [ ] SQL Studio 에서 authenticated 로 동일 호출 시 `moved_count` 반환 (값 ≥ 0) *(❌ 사용자 환경)*
- [ ] `select * from pg_publication_tables where pubname = 'supabase_realtime';` 결과에 `profile`, `category`, `epic_issue`, `sub_issue` 4개 모두 포함 *(❌ 사용자 환경)*
- [ ] `packages/shared/src/database.ts` 가 `Database` 타입을 export 하며 4개 테이블 + 2개 RPC 시그니처 포함 *(❌ 사용자 환경 — `supabase gen types` 실행 후 자동 충족)*
- [x] `grep -n "SUPABASE_SERVICE_ROLE_KEY" env/.env.web.example` 결과 0건
- [x] `grep -n "EXPO_PUBLIC_WEBVIEW_URL" env/.env.mobile.example` 결과 0건
- [ ] Supabase Dashboard Authentication → URL Configuration 에 두 redirect URL 등록 확인 *(❌ 사용자 작업)*
- [ ] Supabase Dashboard Authentication → Providers 에 Google 만 활성화 (Kakao 비활성) *(❌ 사용자 작업)*

### 에이전트 작성 산출물 추가 검증 (2026-05-04 통과)

- [x] `grep -c "create table" supabase/migrations/001_initial_schema.sql` = 4
- [x] `grep -c "enable row level security" supabase/migrations/001_initial_schema.sql` = 4
- [x] `grep -c "create policy" supabase/migrations/002_rls_policies.sql` = 15
- [x] `grep -c "auth.uid()" supabase/migrations/002_rls_policies.sql` = 20 (≥15)
- [x] `grep -n "profile_delete" supabase/migrations/002_rls_policies.sql` = 0건
- [x] 003·004 양쪽에 `security definer`, `raise exception 'unauthorized'`, `revoke all`, `grant execute` 매치
- [x] 005 의 `add table` 줄에 4개 테이블 모두 포함

---

*이 문서는 `스택 전환` 프로젝트의 Sub-PRD 입니다. 전체 범위는 `main-prd-stack-pivot.md` 를 참조하세요.*
