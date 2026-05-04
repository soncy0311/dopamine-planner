# Task 04-07: 빌드 검증 (api 단일성 + build 통과)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: 04-01 ~ 04-06 모두 완료
- **대상 파일**: 없음 (검증 task)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/web/src/app/api/**` 디렉토리 부재 확인 (auth/callback 은 `apps/web/src/app/auth/callback/` 에 위치, api 디렉토리 자체 없음)
- [ ] **(사용자 환경)** `pnpm --filter @todo-list/web build` 통과 (정적 export 성공)

## 구현 세부사항

### 1. legacy `apps/web/src/app/api/**` 단일성 확인

Sub-PRD §10 종료 게이트: `auth/callback` 외 API 라우트 0건. `auth/callback/route.ts` 는 `apps/web/src/app/auth/callback/` 에 위치 (`api/` 디렉토리 아님). `apps/web/src/app/api/` 가 존재한다면 그 안에 파일 0건이어야 한다.

```bash
# 1. api 디렉토리가 아예 없거나 (정상)
[ ! -d apps/web/src/app/api ] && echo "OK: api 디렉토리 부재"

# 2. 존재한다면 파일 0건
find apps/web/src/app/api -type f 2>/dev/null | wc -l   # 결과: 0
```

### 2. `pnpm --filter @todo-list/web build` 통과

```bash
pnpm --filter @todo-list/web build
```

기대 결과:

- exit code 0
- `apps/web/out/` 디렉토리 생성 (export 산출물)
- 빌드 로그에 정적 export 메시지 (예: `Generating static pages`, `Exporting`)
- `auth/callback/route.ts` 는 함수로 빌드 (export 모드라도 route handler 는 별도 처리)

빌드 실패 시 처리:

- `@todo-list/core` import 경로 오류 → `transpilePackages` 확인 (04-01 검증)
- `useState`/`useEffect` 가 RSC 에서 호출 → `'use client'` 누락 확인
- Tailwind directive 미인식 → `globals.css` import 경로 확인

### 3. service_role key 미주입 재확인

```bash
grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/web/   # 결과: 0건
```

## 주의사항

1. **`auth/callback` 위치** — `apps/web/src/app/auth/callback/route.ts` (api 디렉토리 아님). Sub-PRD §10 의미는 `apps/web/src/app/api/**` 신규 추가 0건
2. **export 모드 산출물 위치** — `apps/web/out/` (Next.js 기본). Vercel 배포 시 Output Directory 설정과 일치 (04-08)
3. **route handler 빌드** — export 모드에서도 `route.ts` 는 빌드 통과해야 함. Next.js 가 함수로 분리 배포
4. **monorepo 빌드** — `pnpm --filter @todo-list/web build` 는 `@todo-list/core`, `@todo-list/ui`, `@todo-list/shared` 의존성도 함께 빌드 (turborepo 의존성 그래프). 의존 패키지 typecheck 통과 필수

## 검증 체크리스트

- [x] `find apps/web/src/app/api -type f 2>/dev/null | wc -l` 결과 0 (디렉토리 자체 부재 확인)
- [ ] **(사용자 환경)** `pnpm install` 후 `pnpm --filter @todo-list/web build` exit code 0
- [ ] **(사용자 환경)** `ls -d apps/web/out` 디렉토리 존재
- [x] `grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/web/` 결과 0건
- [ ] **(사용자 환경)** 빌드 로그에 정적 export 메시지 (`Generating static pages` 또는 `Exporting (static)`) 확인
- [ ] **(사용자 환경)** `find apps/web/out -name 'index.html' | head -1` 1건 이상 (정적 페이지 export 결과)
