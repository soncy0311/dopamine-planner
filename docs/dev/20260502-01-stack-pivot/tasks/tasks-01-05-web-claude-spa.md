# Task 01-05: apps/web/CLAUDE.md SPA 정렬

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: Task 01-03 (루트 CLAUDE.md 정합 확인 후)
- **대상 파일**: `apps/web/CLAUDE.md`
- **참조 파일**: `docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md`, `detail-stack-pivot.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` §4

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/web/CLAUDE.md` 라인 3~5 개요 갱신 (모바일 WebView 로드 표현 제거 → 정적 SPA)
- [ ] `apps/web/CLAUDE.md` 라인 31 `api/` 설명을 OAuth 콜백 전용으로 한정
- [ ] `apps/web/CLAUDE.md` 에 `output: 'export'` 및 `transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared']` 명시
- [ ] `apps/web/CLAUDE.md` 에 Realtime 구독 훅(`@todo-list/core/realtime/subscribeTodos`) 사용 안내 추가

## 구현 세부사항

### 1. 라인 3~5 개요 갱신

| 변경 전 | 변경 후 |
|---|---|
| Next.js 15 메인 클라이언트. 모바일 WebView 로드 대상. API Routes 로 비즈니스 로직 처리 | Next.js 15 정적 SPA (`output: 'export'`). Supabase 직접 호출 + Postgres RPC 함수로 비즈니스 로직 처리. OAuth 콜백 라우트만 동적 |

### 2. 라인 31 `api/` 설명 한정

- 변경 전: 비즈니스 로직 전반에 사용되는 API Routes
- 변경 후: **OAuth 콜백 전용** (`src/app/api/auth/callback/route.ts`). 그 외 비즈니스 로직은 클라이언트에서 Supabase / RPC 직접 호출

### 3. `output: 'export'` + `transpilePackages` 명시

신규 또는 기존 "빌드 / 설정" 섹션에 다음을 명시한다.

```ts
// next.config.ts (요지)
const nextConfig = {
  output: 'export',
  transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared'],
};
```

- `output: 'export'` 로 정적 빌드 후 Vercel 정적 호스팅
- `transpilePackages` 로 monorepo 내부 패키지를 Next 가 직접 트랜스파일

### 4. Realtime 구독 훅 사용 안내 추가

`## Realtime` 섹션 또는 기존 데이터 호출 섹션에 다음을 명시한다.

```ts
import { subscribeTodos } from '@todo-list/core/realtime/subscribeTodos';

// 컴포넌트 mount 시 구독 시작, unmount 시 해제
useEffect(() => {
  const unsub = subscribeTodos({ userId, onChange: handleChange });
  return () => unsub();
}, [userId]);
```

- Realtime 구독 로직은 `@todo-list/core` 단일 위치에서 관리한다 (web/mobile 공유)
- 컴포넌트는 훅을 import 해서 사용만 한다

### 5. legacy 표현 제거

- `WebView` / `SUPABASE_SERVICE_ROLE_KEY` / `Next.js API Routes (비즈니스 로직)` 표현 일체 제거

## 주의사항

1. **API Routes 의 OAuth 한정 표현 명확화** — "비즈니스 로직은 클라이언트에서 Supabase 직접 호출 / RPC" 라는 문장 누락 금지
2. **SUPABASE_SERVICE_ROLE_KEY 클라이언트 노출 금지** — 본 문서에서 어떠한 형태로도 클라이언트 사용을 명시하지 않는다
3. **transpilePackages 목록은 monorepo workspace 와 정확히 일치** — `@todo-list/core`, `@todo-list/ui`, `@todo-list/shared`
4. **Realtime 훅은 import 경로 정확히 표기** — `@todo-list/core/realtime/subscribeTodos`

## 검증 체크리스트

- [ ] `grep -n "WebView" apps/web/CLAUDE.md` 결과 0건
- [ ] `grep -n "SUPABASE_SERVICE_ROLE_KEY" apps/web/CLAUDE.md` 결과 0건
- [ ] `grep -n "output: 'export'" apps/web/CLAUDE.md` 결과 1건 이상
- [ ] `grep -n "transpilePackages" apps/web/CLAUDE.md` 결과 1건 이상
- [ ] `grep -n "@todo-list/core/realtime/subscribeTodos" apps/web/CLAUDE.md` 결과 1건 이상
- [ ] `api/` 설명 단락에 "OAuth 콜백" 키워드가 명시되어 있다
