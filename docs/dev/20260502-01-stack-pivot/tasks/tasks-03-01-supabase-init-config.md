# Task 03-01: `supabase init` + config 검토

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 없음 (Sub-PRD 03 의 기반 단계)
- **대상 파일**:
  - `supabase/` (디렉토리, `supabase init` 자동 생성)
  - `supabase/config.toml`
  - `supabase/.gitignore`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-03-feat-supabase-infra.md`

## 상태

- 2026-05-04: **부분 완료** — 골격 파일 수동 작성 완료. CLI 검증(`supabase --version`)은 사용자 환경에서 수행 필요.

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `supabase init` 실행 (루트에 `supabase/` 생성) *(수동 작성 — `supabase/config.toml` + `.gitignore` + `seed.sql` + `migrations/.gitkeep`)*
- [x] `supabase/config.toml` 검토 (project_id `dopamine-planner`, 기본 포트 유지)

## 구현 세부사항

### 1. `supabase init` 실행

monorepo 루트(`/Users/sson/workspace/daon-company/todo-list`)에서 실행한다.

```bash
supabase init
```

산출물:

- `supabase/config.toml` — 프로젝트 로컬 설정 (project_id, api/db 포트, auth, storage 등)
- `supabase/migrations/` — 빈 디렉토리 (003-02 ~ 03-03 에서 채움)
- `supabase/seed.sql` — 시드 SQL (본 단계에서는 비워둠)
- `supabase/.gitignore` — `temp/`, `.env`, `seed.sql` 등 로컬 산출물 제외

### 2. `supabase/config.toml` 검토

기본값을 유지한다 (변경 0건이 정상). 검토 포인트:

- `project_id` — 디렉토리명 기반 자동 채움. 변경 불필요
- `[api] port`, `[db] port` — 로컬 포트 충돌 없으면 그대로 유지
- `[auth] site_url` — 로컬 개발용 기본값. 원격 Site URL 은 Dashboard 에서 별도 설정 (03-06)
- `[auth.external.google]` 등 — 본 단계에서 활성화하지 않음 (원격 Dashboard 책임)

변경이 필요한 경우(포트 충돌 등) 변경 사유를 commit body 에 명시.

### 3. `supabase/.gitignore` 확인

`supabase init` 자동 생성 결과에 다음 항목이 포함되어야 한다 (없을 시 추가):

```
.branches
.temp
.env
seed.sql
```

## 주의사항

1. **monorepo 루트 단일 프로젝트** — `supabase/` 는 루트에 위치한다. `apps/web/supabase/` 등 하위 위치 금지 (Sub-PRD §1)
2. **Dashboard 직접 수정 금지** — 모든 스키마 변경은 마이그레이션 파일로 관리한다. `config.toml` 의 auth/storage 등도 가능한 한 코드로 (Sub-PRD §주의사항 1)
3. **`supabase` CLI 미설치 시** — 사용자에게 `brew install supabase/tap/supabase` 안내 후 진행
4. **본 단계는 골격만** — 실제 마이그레이션 / 원격 적용은 후속 task

## 검증 체크리스트

- [x] `ls supabase/config.toml` — 파일 존재
- [x] `ls -d supabase/migrations` — 디렉토리 존재 (`.gitkeep` 보존)
- [x] `cat supabase/.gitignore` — `.env`, `seed.sql`, `.temp`, `.branches` 항목 포함
- [x] `grep -n "project_id" supabase/config.toml` — 1건 매치 (`dopamine-planner`)
- [ ] `supabase --version` 실행 가능 (CLI 설치 확인) *(❌ 사용자 환경 — `brew install supabase/tap/supabase`)*
