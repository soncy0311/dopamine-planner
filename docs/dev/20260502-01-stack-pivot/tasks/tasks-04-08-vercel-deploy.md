# Task 04-08: (사용자) Vercel 배포 셋업

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: 04-07 완료 (`pnpm --filter @todo-list/web build` 통과 — 정적 export 성공)
- **작업 주체**: **사용자 직접 수행** (Claude 자동 실행 금지 — Vercel 대시보드는 외부 시스템)
- **대상 파일**: 없음 (Vercel 대시보드 설정)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] **(사용자 작업)** Vercel 대시보드에서 본 레포 연결 (Production: main, Preview: dev + 작업 브랜치)
- [ ] **(사용자 작업)** Vercel 환경 변수 주입 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 구현 세부사항

### 1. Vercel 프로젝트 생성

1. Vercel 대시보드 (https://vercel.com/new) → New Project
2. 본 GitHub 레포 import
3. 프로젝트 이름 지정

### 2. 빌드 설정 (monorepo)

| 항목 | 값 |
|------|-----|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm --filter @todo-list/web build` |
| Output Directory | `out` |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |

### 3. 브랜치 설정

- **Production Branch**: `main`
- **Preview Branches**: `dev` 및 모든 작업 브랜치 (`feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `test/*`) — 기본 설정으로 모든 PR 브랜치 자동 preview

### 4. 환경 변수 주입

Vercel 대시보드 → Project Settings → Environment Variables 에 추가.

| 키 | 값 출처 | 적용 환경 |
|----|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key | Production, Preview, Development |

> ❌ `SUPABASE_SERVICE_ROLE_KEY` 절대 추가 금지. 클라이언트/Vercel 함수 모두에 노출되면 RLS 우회 가능 (Sub-PRD §주의사항 3)

### 5. 첫 배포 후 Site URL 갱신

- Vercel 첫 배포 완료 후 production URL 확정 (예: `https://todo-list-xxxx.vercel.app`)
- Supabase Dashboard → Authentication → URL Configuration:
  - **Site URL**: production URL 로 갱신
  - **Redirect URLs**: production URL + `/auth/callback`, preview URL 패턴 (`https://*.vercel.app/auth/callback`) 추가
- 이 작업은 Sub-03 task 03-06 의 후속 (배포 URL 확정 후에만 가능)

## 주의사항

1. **service_role key 절대 주입 금지** — Vercel 환경 변수에도 추가하지 않는다 (Sub-PRD §주의사항 3)
2. **CLAUDE.md §리스크 액션** — Vercel 대시보드 설정은 외부 시스템 변경. 사용자 명시 확인 후에만 진행. Claude 가 직접 실행할 수 없는 작업
3. **Site URL 갱신 순서** — Vercel 첫 배포 → URL 확정 → Supabase Dashboard 갱신. 이 순서를 지키지 않으면 OAuth redirect 실패
4. **`apps/web/.env*` gitignore 정상 동작 확인** — 로컬 `.env.local` 이 git 에 포함되지 않는다 (Vercel 은 대시보드의 환경 변수만 사용)
5. **monorepo Build Command** — `cd ../..` 으로 루트 이동 필수. pnpm workspace 가 루트에서만 동작

## 검증 체크리스트 (사용자 수동 확인)

- [ ] Vercel 프로젝트가 본 GitHub 레포에 연결됨
- [ ] `dev` 브랜치 push → Vercel preview URL 자동 생성
- [ ] `main` 브랜치 push → production 자동 배포
- [ ] 빌드 로그에 `Generating static pages` 또는 `Exporting (static)` 메시지 확인
- [ ] Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 존재. `SUPABASE_SERVICE_ROLE_KEY` 부재
- [ ] production URL 의 `/login` 진입 → Google OAuth 버튼 클릭 → 동의 화면 → `/auth/callback` → `/life` redirect 정상 동작
- [ ] production URL 미인증 상태로 `/life` 직접 접근 시 `/login` 으로 redirect
- [ ] `apps/web/.env*` 가 git history 에 없음 (`git log --all -- 'apps/web/.env*'` 결과 0건 또는 `.example` 만)
- [ ] Supabase Dashboard 의 Site URL / Redirect URL 이 Vercel production URL 로 갱신됨
