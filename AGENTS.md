# Todo List

## 기본 원칙

- 모든 구현과 구조적 판단은 `docs/` 하위 요구사항·설계 문서를 기준으로 한다
- 하위 폴더에서 작업할 때 해당 폴더에 `README.md`가 있으면 루트 규칙과 함께 해당 파일의 규칙을 따른다
- 클라이언트(web/mobile) 규칙 → `apps/web/README.md`, `apps/mobile/README.md`

### 플랜 모드

- 신규 기능, 구조 변경, 복수 파일 수정 등 일정 크기 이상의 작업은 반드시 플랜 모드로 진입하여 계획을 먼저 작성한다
- 플랜에는 작업 목표, 변경 대상 파일, 구현 순서, 검증 항목을 포함한다
- 사용자가 플랜을 검토·승인한 뒤에 코드 작성을 시작한다
- 하나의 플랜 작업이 끝나고 새로운 단위의 작업이 시작되면 다시 플랜 모드로 돌아가 새 계획을 세운다
- 구현 중 플랜과 달라지는 부분이 생기면 플랜을 먼저 업데이트하고 승인받은 뒤 계속한다

### 세션 관리 & Subagent

- 복잡한 작업은 반드시 메인 세션에서 전체 흐름을 관리한다
- 단순 반복 작업(파일 일괄 수정, 포맷팅, 검색 등)은 subagent에게 위임한다
- subagent에게 위임할 때는 대상 파일, 변경 내용, 완료 조건을 명확하게 지시한다
- subagent의 작업 결과는 반드시 메인 세션에서 보고를 받아 diff를 검토한다
- subagent가 플랜 범위를 벗어나는 변경을 하지 않도록 지시 범위를 한정한다

## 프로젝트 구조

```
todo-list/                  (Monorepo — pnpm + Turborepo)
├── apps/
│   ├── web/                Next.js 15 (React 19) — 정적 SPA (`output: 'export'`, OAuth 콜백 Route Handler 한정)
│   └── mobile/             Expo 52 (React Native) — 네이티브 클라이언트
├── packages/
│   ├── core/               Supabase 클라이언트·도메인 로직·Realtime 훅 (web/mobile 공유)
│   ├── ui/                 공유 UI 컴포넌트 (shadcn/ui + Radix)
│   ├── shared/             공유 타입·유틸
│   └── config/             공유 설정
└── docs/                   요구사항·설계 문서
```

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | Next.js 15 (App Router, `output: 'export'` SPA), React 19, TypeScript |
| Mobile | Expo 52 (React Native 네이티브) |
| Backend (BaaS) | Supabase (PostgreSQL + Auth + Realtime) |
| API | Supabase 직접 호출 + Postgres RPC 함수 (`SECURITY DEFINER`) — `packages/core` 의 services 가 단일 호출 진입점. 자체 서버 운영 안 함 — Next.js API Route Handler 는 OAuth 콜백 (`apps/web/src/app/api/auth/callback`) 한정 |
| 스타일 | Tailwind v4 (web), Nativewind v4 (mobile) — `packages/config/tailwind.config.js` 단일 SoT |
| SDK | @supabase/supabase-js, @supabase/ssr |
| Monorepo | pnpm workspaces + Turborepo |
| Infra | Vercel (프론트엔드) + Supabase (백엔드) |

## 브랜치 정책

- `main` → 프로덕션 배포 브랜치
- `stage` → 스테이징 검증 브랜치
- `dev` → 개발 통합 브랜치
- `{type}/{name}` → 작업 브랜치 (kebab-case). type은 커밋 컨벤션과 동일 (`feat`, `fix`, `refactor`, `chore`, `docs`, `test` 등)
- 작업 브랜치는 `dev`에서 분기하여 `dev`로 PR 머지한다
- 한 브랜치는 하나의 목적만 담는다

## 작업 방법

### 1. 스프린트 단위 기능 업데이트

1. 요구사항 문서(`docs/`) 확인 → 검증 항목 정리
2. Sub-PRD 또는 Task 문서 작성
3. `dev`에서 `{type}/{name}` 브랜치 생성 (예: `feat/todo-create`, `chore/tailwind-setup`)
4. 구현 (Atomic 커밋, `commit-message` 스킬 사용)
5. 테스트 작성 및 실행 (Unit + E2E)
6. `create-pr` 스킬로 PR 생성 (base: `dev`)
7. 리뷰 후 머지

### 2. 핫픽스

1. `main`에서 `fix/{name}` 브랜치 생성
2. 수정 및 테스트
3. PR 생성 (base: `main`)
4. 머지 후 `dev`, `stage`에도 반영

### 공통 원칙

- 어떤 플로우든 검증 항목 → PRD → 구현 → 테스트 → PR 순서를 깨지 않는다
- 구현 중 요구사항이 바뀌면 PRD와 검증 항목을 먼저 업데이트한다

## 스킬 정보

- 커밋 메시지 작성은 `commit-message` 스킬을 사용한다
- PR 생성은 `create-pr` 스킬을 사용한다. base 브랜치는 작업 플로우에 정의된 값을 따른다

## 코드 규칙

- TypeScript strict 모드 사용
- Prettier 적용: semi, singleQuote, trailingComma: all, printWidth: 100, tabWidth: 2
- 패키지 간 의존: `workspace:*` 프로토콜 사용
- 실행 / 빌드 / 린트 등 모든 커맨드는 루트 `Makefile` 을 단일 진입점으로 사용한다 (`pnpm`/`turbo`/`supabase` 를 wrap)
- 카탈로그 확인: `make help` / 환경 검증: `make doctor`
- 자주 쓰는 명령:
  - `make dev` — 호스트에서 turbo dev (web/packages 동시 watch)
  - `make sb-start` / `make sb-stop` — Supabase 로컬 스택 기동/중지
  - `make mobile-dev` / `make mobile-ios` / `make mobile-android` — Expo 시뮬레이터 (호스트)
  - `make sb-reset` / `make sb-gen-types` — Supabase DB 재적용 / 타입 생성
  - `make build` / `make lint` / `make test` — turbo 빌드/린트/테스트

## 환경 변수 관리

- 환경 변수 파일은 루트 `env/` 폴더에서 **단일 통합 파일** 로 중앙 관리한다
- `env/.env.example` 만 원격에 커밋하고, `env/.env.local` 은 `.gitignore` 처리
- 새 환경 변수를 추가할 때는 반드시 `env/.env.example` 도 함께 갱신한다
- web/mobile 의 `dev`/`build` 스크립트는 `dotenv-cli` 로 `env/.env.local` 을 로드한다
- Makefile 의 `sb-*` / `up` / `down` 명령은 `env/.env.local` 을 자동 export 한 뒤 supabase CLI 호출 (config.toml 의 `env()` 보간이 참조)
- 프로덕션(Vercel)은 대시보드에서 환경 변수를 주입한다
- 변수명 중복 사유: Next.js (`NEXT_PUBLIC_`) 와 Expo (`EXPO_PUBLIC_`) 가 각자 자기 접두사만 클라이언트 번들에 포함하므로 같은 값(예: Supabase URL/KEY) 도 두 변수명으로 작성한다

### 환경 변수 파일 구조

```
env/
├── .env.example           # 통합 템플릿 (커밋)
└── .env.local             # 실제 값 (gitignore) — web · mobile · supabase CLI 모두 본 파일 참조
```

## GitHub Projects 설정

| 항목 | 값 |
|---|---|
| project_url | https://github.com/users/soncy0311/projects/3 |
| project_id | `PVT_kwHOAx9shM4BWSik` |
| owner | `soncy0311` (user) |
| project_number | `3` |
| status_field_id | `PVTSSF_lAHOAx9shM4BWSikzhRoGOM` |
| sprint_field_id | `PVTIF_lAHOAx9shM4BWSikzhRoGO4` |

### Status 옵션 ID

| 상태 | option_id |
|---|---|
| Backlog | `0e96dda6` |
| Todo | `f75ad846` |
| In Progress | `47fc9ee4` |
| In Review | `3d5e5ac3` |
| Done | `98236657` |

## 참고 문서

- `docs/base/design-system/` — 디자인 시스템 명세 (토큰, 컴포넌트, 접근성)
- `docs/base/prototype/` — HTML/CSS 프로토타입
