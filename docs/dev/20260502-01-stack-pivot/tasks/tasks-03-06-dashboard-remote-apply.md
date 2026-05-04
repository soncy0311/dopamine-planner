# Task 03-06: 사용자 Dashboard 작업 + 원격 적용

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 03-01 ~ 03-05 모두 완료
- **작업 주체**: **사용자 직접 수행** — Claude 는 가이드만 제공, 자동 실행 금지
- **대상 파일**: 없음 (Supabase Dashboard + 원격 DB)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-03-feat-supabase-infra.md` (§5 Dashboard 작업), `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md`

## 상태

- 2026-05-04: **사용자 작업 — 미실행** — task 정의상 Claude 자동 실행 금지(§주의사항 1). 03-01 ~ 03-05 까지 코드/문서 작업이 완료된 상태에서 사용자가 직접 Dashboard + CLI 수행.

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] **(사용자 작업)** Supabase Dashboard 에서 Site URL + Redirect URLs 화이트리스트 설정
- [ ] **(사용자 작업)** Supabase Dashboard 에서 Google Provider 활성화
- [ ] **(사용자 작업)** `supabase link` + `supabase db push` 로 원격 적용

## 구현 세부사항

### 1. Authentication → URL Configuration (Dashboard 웹 UI)

경로: `Supabase Dashboard` → 프로젝트 선택 → `Authentication` → `URL Configuration`

- **Site URL**: `https://<slug>.vercel.app` (실제 Vercel 배포 slug 로 치환)
- **Redirect URLs** (화이트리스트, 한 줄에 하나씩):
  - `https://<slug>.vercel.app/auth/callback` — 웹
  - `dopamine-planner://auth/callback` — 모바일 (Expo deep link)

> 두 redirect URL 모두 등록 필수. 누락 시 OAuth 콜백이 거부됨.

### 2. Authentication → Providers

경로: `Authentication` → `Providers`

- **Google** — 활성화 + Client ID / Secret 입력
  - Google Cloud Console 에서 OAuth 2.0 Client ID 발급 후 입력
  - Authorized redirect URI 에 Supabase 가 자동 안내하는 콜백 URL 등록 (`https://<project-ref>.supabase.co/auth/v1/callback`)
- **Kakao** / 기타 — **비활성 유지** (결정 #3 — Kakao 는 후속)

### 3. 원격 적용 (CLI)

monorepo 루트에서:

```bash
# 프로젝트 ref 확인 (Dashboard URL 또는 Settings → General)
supabase link --project-ref <project-ref>

# 로컬 마이그레이션 5개를 원격에 push
supabase db push
```

`supabase db push` 후 적용 결과 확인:

- Dashboard → `Database` → `Migrations` 탭에 5개 마이그레이션 (001~005) 표시
- Dashboard → `Database` → `Tables` 에 `profile`, `category`, `epic_issue`, `sub_issue` 4개
- Dashboard → `Database` → `Functions` 에 `carry_over_todos`, `recalc_epic_progress`, `set_updated_at` 등 표시

### 4. Realtime publication 확인

Dashboard → `SQL Editor` 에서 실행:

```sql
select * from pg_publication_tables where pubname = 'supabase_realtime';
```

기대: `profile`, `category`, `epic_issue`, `sub_issue` 4개 row 모두 출력.

### 5. 인증 RPC 호출 검증 (원격)

Dashboard → `SQL Editor` (인증된 사용자 컨텍스트) 또는 클라이언트 SDK 로:

```sql
-- 인증 사용자로 호출 (Dashboard 의 SQL Editor 는 service role 컨텍스트라 별도 검증 필요)
select * from carry_over_todos('2026-05-02');
select * from recalc_epic_progress('<test-epic-uuid>');
```

> Dashboard SQL Editor 는 기본적으로 service role 컨텍스트로 실행되므로, 진짜 인증 컨텍스트 검증은 클라이언트 SDK (Sub-04 의 web app) 에서 수행 권장. 본 task 는 적용 자체의 성공만 확인.

## 주의사항

1. **Claude 자동 실행 금지** — 본 task 는 사용자가 직접 Dashboard / CLI 수행. Claude 가 `supabase link`, `supabase db push` 를 임의 실행하지 않는다
2. **`supabase db push` 는 destructive 가능성** — 원격 마이그레이션 재실행 / 충돌 시 데이터 손실 위험. 사용자가 명시적 확인 후 실행 (CLAUDE.md §리스크 액션)
3. **service_role key 노출 금지** — Dashboard → Settings → API 에 노출되는 service_role key 는 어떤 클라이언트(웹/모바일)에도 주입하지 않는다. anon key 만 사용 (Sub-PRD §주의사항 6)
4. **Google OAuth Client ID/Secret 분리 보관** — `.env.*.local` 또는 Vercel 대시보드 환경 변수에 보관, 레포에 커밋 금지
5. **Kakao Provider 비활성** — 결정 #3 에 따라 MVP 는 Google 만. Kakao 는 후속 (Sub-PRD §5)
6. **CI 자동화는 후속** — 본 단계는 수동. CI 자동화는 별도 sprint (Sub-PRD §주의사항 3)
7. **Site URL slug** — Vercel 첫 배포 후 확정. 미배포 상태에서는 임시 placeholder 후 배포 후 갱신

## 검증 체크리스트 (사용자 수동 확인)

- [ ] Dashboard → Authentication → URL Configuration: Site URL 등록됨
- [ ] Dashboard → Authentication → URL Configuration: `https://<slug>.vercel.app/auth/callback` redirect 등록됨
- [ ] Dashboard → Authentication → URL Configuration: `dopamine-planner://auth/callback` redirect 등록됨
- [ ] Dashboard → Authentication → Providers: Google 활성화 (Client ID/Secret 입력)
- [ ] Dashboard → Authentication → Providers: Kakao 비활성 (또는 미설정)
- [ ] `supabase link --project-ref <ref>` exit code 0
- [ ] `supabase db push` exit code 0
- [ ] Dashboard → Database → Migrations: 001~005 5개 표시
- [ ] Dashboard → Database → Tables: `profile`, `category`, `epic_issue`, `sub_issue` 4개 모두 존재
- [ ] Dashboard → SQL Editor: `select * from pg_publication_tables where pubname='supabase_realtime';` 결과에 4개 테이블 모두 포함
- [ ] Dashboard → Database → Functions: `carry_over_todos`, `recalc_epic_progress` 2개 함수 존재
