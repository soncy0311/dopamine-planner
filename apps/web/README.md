# Todo List — Web (Next.js)

## 개요

Next.js 15 + React 19 기반 **정적 SPA** (`output: 'export'`). 비즈니스 로직은 클라이언트에서 **Supabase 직접 호출 + Postgres RPC 함수** 로 처리한다 (자체 서버 운영 안 함). OAuth 콜백 라우트(`src/app/auth/callback/route.ts`) 만 동적으로 동작한다 (api 디렉토리 밖). **모바일 우선 설계**를 따른다.

## 기술 스택

- Next.js 15 (App Router, `output: 'export'` 정적 SPA)
- React 19
- Tailwind CSS v3 (`packages/config/tailwind.config.js` 공유 preset)
- shadcn/ui + Radix Primitives (UI 컴포넌트)
- Lucide Icons (아이콘)
- Pretendard (폰트)
- @supabase/supabase-js (Supabase SDK)
- @supabase/ssr (OAuth 콜백 Route Handler 한정)
- @tanstack/react-query (데이터 페칭·캐시)
- `@todo-list/core` (Supabase 클라이언트·서비스·Realtime 훅 공유)

## 디자인 시스템

- 디자인 토큰·컴포넌트 명세는 `docs/base/design-system/`을 따른다
- 컬러는 3단계 토큰 계층(Primitive → Semantic → Component)을 사용한다
- 60-30-10 컬러 규칙: 60% White/Gray, 30% Periwinkle, 10% Purple 500
- WCAG 2.1 AA 접근성 기준을 준수한다

## 디렉토리 구조

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router (페이지·레이아웃)
│   │   ├── (auth)/       # 인증 라우트 그룹 (`login/`)
│   │   ├── (main)/       # 메인 라우트 그룹 (`life/`, `work/`) — client-side 인증 가드
│   │   ├── auth/         # OAuth 콜백 Route Handler (`auth/callback/route.ts`) — Vercel 함수로 분리 배포
│   │   ├── globals.css   # Tailwind directive
│   │   └── providers.tsx # QueryClientProvider 등 클라이언트 Provider 컴포넌트
│   └── lib/
│       └── supabase/     # 브라우저 SDK 래퍼 (필요 시) — 핵심은 `@todo-list/core` 사용
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 코드 규칙

- 경로 alias: `@/*` → `./src/*`
- 공유 컴포넌트는 `packages/ui`에서 가져온다 (`@todo-list/ui`)
- 공유 타입은 `packages/shared`에서 가져온다 (`@todo-list/shared`)
- 비즈니스 로직(Supabase 클라이언트, 서비스, RPC 호출, Realtime 훅) 은 `packages/core`에서 가져온다 (`@todo-list/core`)
- `next.config.ts`에 `transpilePackages`로 내부 패키지를 등록한다
- 컴포넌트는 Atomic Design 계층(Atoms → Molecules → Organisms → Templates)을 따른다

## 빌드 / 설정

`next.config.ts` 요지:

```ts
const nextConfig = {
  output: 'export',
  transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared'],
  images: { unoptimized: true },
};
```

- `output: 'export'` 로 정적 빌드 후 Vercel 정적 호스팅
- `transpilePackages` 로 monorepo 내부 패키지를 Next 가 직접 트랜스파일
- `images.unoptimized` 로 export 모드와 `next/image` 호환

## Realtime

Realtime 구독 로직은 `@todo-list/core` 단일 위치에서 관리한다 (web/mobile 공유). 컴포넌트는 훅을 import 해서 사용만 한다.

```ts
import { subscribeTodos } from '@todo-list/core';
import { supabase } from '@/lib/supabase/client';

useEffect(() => {
  const unsub = subscribeTodos(supabase, 'life', () => qc.invalidateQueries({ queryKey: ['todos'] }));
  return unsub;
}, [qc]);
```

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

`env/.env.web.local`에서 관리한다. `dev` 스크립트가 `dotenv-cli`로 자동 로드한다. 변수 목록은 `env/.env.web.example` 참조.

## 실행 명령어

루트 `Makefile` 을 단일 진입점으로 사용한다. web dev 는 호스트에서 직접 turbo dev 로 동작한다 (Supabase 로컬 스택은 별도로 `make sb-start` 로 기동).

```bash
make sb-start     # Supabase 로컬 스택 기동 (Studio: http://localhost:54323)
make dev          # turbo dev (web + packages watch, http://localhost:3000)
make sb-stop      # Supabase 로컬 스택 중지

make build        # turbo build (정적 export)
make lint         # turbo lint
```

## 참고 문서

- `docs/base/design-system/` — 디자인 시스템 명세 (토큰, 컴포넌트, 접근성)
- `docs/base/prototype/` — HTML/CSS 프로토타입
