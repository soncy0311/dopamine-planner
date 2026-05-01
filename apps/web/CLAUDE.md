# Todo List — Web (Next.js)

## 개요

Next.js 15 + React 19 기반 웹 클라이언트. 모바일 WebView에서도 로드되므로 **모바일 우선 설계**를 따른다.

## 기술 스택

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 (스타일링)
- shadcn/ui + Radix Primitives (UI 컴포넌트)
- Lucide Icons (아이콘)
- Pretendard (폰트)
- @supabase/supabase-js (Supabase SDK)
- @supabase/ssr (서버 사이드 인증)

## 디자인 시스템

- 디자인 토큰·컴포넌트 명세는 `docs/client/design-system/`을 따른다
- 컬러는 3단계 토큰 계층(Primitive → Semantic → Component)을 사용한다
- 60-30-10 컬러 규칙: 60% White/Gray, 30% Periwinkle, 10% Purple 500
- WCAG 2.1 AA 접근성 기준을 준수한다

## 디렉토리 구조

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router (페이지·레이아웃)
│   │   ├── api/          # API Routes (비즈니스 로직)
│   │   └── auth/         # OAuth 콜백 라우트
│   └── lib/
│       └── supabase/     # Supabase 클라이언트 설정
│           ├── client.ts # 브라우저용 클라이언트
│           ├── server.ts # 서버 컴포넌트/API Routes용 클라이언트
│           └── middleware.ts # 미들웨어용 클라이언트
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 코드 규칙

- 경로 alias: `@/*` → `./src/*`
- 공유 컴포넌트는 `packages/ui`에서 가져온다 (`@todo-list/ui`)
- 공유 타입은 `packages/shared`에서 가져온다 (`@todo-list/shared`)
- `next.config.ts`에 `transpilePackages`로 내부 패키지를 등록한다
- 컴포넌트는 Atomic Design 계층(Atoms → Molecules → Organisms → Templates)을 따른다

## 반응형 기준

| 구분 | 기준 | 레이아웃 |
|------|------|----------|
| **Mobile** (기본) | ~430px | 단일 컬럼, 하단 탭 바 |
| **Tablet** | 431–768px | 단일 컬럼, 여백 확대 |
| **Desktop** | 769px~ | 최대 너비 480px 중앙 정렬 |

## 접근성

- 색 대비: WCAG 2.1 AA (본문 4.5:1, 대형 텍스트 3:1, UI 요소 3:1)
- 터치 타겟: 최소 44×44px
- 키보드 탐색: 모든 인터랙티브 요소 Tab 접근 가능
- ARIA 레이블 필수 (Radix Primitives 내장 지원 활용)
- 폰트 크기: rem 단위 사용 (시스템 폰트 크기 설정 존중)

## 환경 변수

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(public) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 (API Routes 서버 전용) |

## 실행 명령어

```bash
pnpm --filter @todo-list/web dev     # 개발 서버 (localhost:3000)
pnpm --filter @todo-list/web build   # 프로덕션 빌드
pnpm --filter @todo-list/web lint    # 린트
```

## 참고 문서

- `docs/client/design-system/` — 디자인 시스템 명세 (토큰, 컴포넌트, 접근성)
- `docs/client/20260501-01-design-system/detail-design-system.md` — 디자인 시스템 상세 요구사항
- `docs/shared/20260501-01-todo-list-initialize/API_CONTRACT.md` — API 계약서 (Supabase + API Routes)
