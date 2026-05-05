# SUB-PRD: `웹 메인 일자 뷰`

## 작업 정보

- **작업명**: `웹 메인 일자 뷰`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-05
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05
- **상태**: 진행중 (코드 산출물 12 task 완료. task 13 정적 검증 일부는 stack-pivot 사전 결함으로 미통과 — 후속 plan)
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: [`sub-prd-01-feat-core-services.md`](./sub-prd-01-feat-core-services.md)
- **선행 Sprint**: stack-pivot Sub-04 (`(auth)/login` + `auth/callback` 머지 완료)

## 배경 및 목적

선행 sprint(`stack-pivot`) Sub-04 가 `apps/web` 의 Next.js 15 (`output: 'export'`) SPA 골격, `(auth)/login` 라우트, `app/auth/callback/route.ts` 까지 머지했다. 본 sub 는 그 위에 **메인 일자 뷰(`(main)/life`, `(main)/work`)** 와 관련 컴포넌트를 완성한다 — 사용자가 로그인 후 가장 먼저 보는 화면이다.

핵심 작업:

- `(main)` 라우트 그룹의 클라이언트 가드 (export 모드 → RSC 가드 불가)
- 메인 일자 뷰 = 두 섹션 (완료 / 진행 중) + 날짜 탐색 + 자동 이월 진입 트리거
- Realtime 구독 (4 테이블 통합) + TanStack Query invalidate
- 워크스페이스 전환 (사이드 네비)

CRUD 모달 (생성·수정·삭제) 과 분류·Epic 관리 화면은 **Sub-03 의 책임** — 본 sub 는 메인 일자 뷰 렌더와 토글 인터랙션까지만 다룬다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (`output: 'export'` SPA), React 19 |
| 라우팅 | App Router — `(main)` 라우트 그룹 (`apps/web/src/app/(main)/`) |
| 상태 | TanStack Query v5 (Sub-01 의 훅 import) |
| 스타일 | Tailwind v4 + `packages/config/tailwind.config.js` 토큰 |
| 공유 컴포넌트 | `@todo-list/ui` (TodoItem / EpicProgressBar / DateNavigator / FAB) |
| Supabase | `@supabase/supabase-js` + `@supabase/ssr` (이미 stack-pivot 에서 추가) |

## 핵심 요구 사항

### 1. `(main)` 라우트 클라이언트 가드

- `apps/web/src/app/(main)/layout.tsx` — `'use client'`
- `useEffect` 에서 `supabase.auth.getSession()` 확인. 미로그인 시 `router.replace('/login')`
- `output: 'export'` 환경에서는 RSC 가드 불가 — 모든 가드는 클라이언트 useEffect

### 2. `/life` · `/work` 페이지

- `apps/web/src/app/(main)/life/page.tsx`, `apps/web/src/app/(main)/work/page.tsx`
- 각 페이지는 `<MainDailyView workspace="life" />` (또는 work) 만 렌더
- URL query `?date=YYYY-MM-DD` 동기화 — 없으면 today
- 날짜 변경 시 `router.replace` 로 query 갱신 (history push 없이)

### 3. `<DateHeader>` 컴포넌트

- 월 타이틀 + 좌우 화살표 + 주간 뷰 (7일)
- 키보드 단축키: `←` `→` 로 일자 이동
- `<DateNavigator>` 는 `@todo-list/ui` 에 분리 (web/mobile 공유)

### 4. 섹션 컴포넌트 (`<DoneSection>` / `<TodoSection>`)

- 동일 컴포넌트 (`<TodoSection title status="done|todo">`) 두 번 렌더
- 빈 상태 placeholder (`완료된 일이 없어요` / `진행 중인 일이 없어요`)
- 카운트 표시 — `완료 (2)` / `진행 중 (3)`

### 5. `<TodoItem>` 컴포넌트 (`@todo-list/ui`)

- 체크박스 + 제목 + 분류 라벨 (color chip)
- 메인 체크박스 토글 → `useToggleTodo({ id, epicId, nextStatus })` (Sub-01)
- 클릭 (체크박스 외 영역) → 상세 모달 open (모달 자체는 Sub-03)
- WCAG 44x44 hit area 보장

### 6. Realtime 구독

- `<MainDailyView>` 마운트 시 `subscribeTodos(client, qc)` (Sub-01) 호출
- unmount 시 unsubscribe
- 다른 디바이스에서의 변경이 1~2초 내 UI 에 반영

### 7. 워크스페이스 전환

- 사이드 네비 (데스크톱 240px) — `Life` / `Work` / `설정` 항목
- 하단 탭 바 (모바일 뷰포트) — 동일 항목
- 활성 워크스페이스는 URL pathname 기준 (`/life` 또는 `/work`)

### 8. 자동 이월 진입 트리거 위임

- `useTodos(workspace, today)` 마운트 effect 가 `carryOverTodos(client, today)` 1회 호출 (Sub-01)
- 본 sub 에서는 별도 호출 코드 작성 금지 — 훅 내부 effect 가 처리
- 사용자에게 노출 없음 (토스트 없음)

## 핵심 구현 로직

### `<MainDailyView>` 골격

```tsx
'use client';

export function MainDailyView({ workspace }: { workspace: Workspace }) {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  const [date, setDate] = useDateQuery(); // ?date=YYYY-MM-DD ↔ today

  useEffect(() => subscribeTodos(client, qc), [client, qc]);

  const { data, isLoading } = useTodos(workspace, date);

  return (
    <div className="flex flex-col h-full">
      <DateHeader date={date} onChange={setDate} />
      <DoneSection items={data?.done ?? []} />
      <TodoSection items={data?.todo ?? []} />
      <FAB onClick={openCreateModal} />
    </div>
  );
}
```

### Supabase 클라이언트 인스턴스화 (web)

```tsx
// apps/web/src/lib/supabase/client.ts
'use client';
export const supabase = createClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});
```

### URL query 동기화

```tsx
function useDateQuery(): [string, (d: string) => void] {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get('date') ?? todayISO();
  const set = (d: string) => router.replace(`?date=${d}`, { scroll: false });
  return [date, set];
}
```

## 구현 시 주의사항

1. **`output: 'export'` 제약** — 동적 라우트 / RSC fetch 사용 금지. 모든 데이터는 클라이언트 useQuery
2. **디자인 토큰 className 만 사용** — 색·간격은 Tailwind 토큰 (`bg-purple-500`, `p-4` 등) 으로만. 인라인 색 코드 금지 (`docs/base/design-system/` 정합)
3. **WCAG 44x44 hit area** — TodoItem 체크박스, FAB, 사이드 네비 항목 모두 44px 이상
4. **자동 이월 토스트 안 함** — `moved_count > 0` 이어도 사용자 알림 없음 (조용한 이월)
5. **Realtime echo 허용** — 자기 변경의 echo 로 인한 불필요한 invalidate 는 MVP 에서 허용. payload commit_timestamp 비교 미적용
6. **모달 컴포넌트 import 금지** — 본 sub 의 코드에서 CRUD 모달 (생성·수정 등) import 금지. Sub-03 가 추가
7. **세션 가드는 클라이언트** — `(main)/layout.tsx` 의 useEffect 만 사용. middleware 사용 금지 (export 모드 미지원)
8. **워크스페이스 캐시 분리** — `queryKeys.todos(workspace, date)` 가 워크스페이스 별로 캐시 분리. life ↔ work 전환 시 데이터 섞이지 않음

## 작업

- [x] `apps/web/src/app/(main)/layout.tsx` 신설 (클라이언트 가드 + 사이드 네비 + 모바일 탭 바) ✅ 2026-05-05
- [x] `apps/web/src/app/(main)/life/page.tsx` 신설 (`<Suspense><MainDailyView workspace="life" /></Suspense>`) ✅ 2026-05-05
- [x] `apps/web/src/app/(main)/work/page.tsx` 신설 (`<Suspense><MainDailyView workspace="work" /></Suspense>`) ✅ 2026-05-05
- [x] `apps/web/src/lib/supabase/client.ts` 정합 검증 (`'use client'` 디렉티브 보정) ✅ 2026-05-05
- [x] `apps/web/src/components/MainDailyView.tsx` 신설 (`useTodos` + `subscribeTodos` + 섹션) ✅ 2026-05-05
- [x] `apps/web/src/components/DoneSection.tsx` / `TodoSection.tsx` 신설 ✅ 2026-05-05
- [x] `apps/web/src/components/SideNav.tsx` 신설 (사이드 네비 — 데스크톱) ✅ 2026-05-05
- [x] `apps/web/src/components/MobileTabBar.tsx` 신설 (하단 탭 바 — 모바일 뷰포트) ✅ 2026-05-05
- [x] `apps/web/src/hooks/useDateQuery.ts` 신설 (URL ?date 동기화) ✅ 2026-05-05
- [x] `packages/ui/src/TodoItem.tsx` 신설 (체크박스 + 제목 + 분류 라벨) ✅ 2026-05-05
- [x] `packages/ui/src/EpicProgressBar.tsx` 신설 (세그먼트 프로그레스바) ✅ 2026-05-05
- [x] `packages/ui/src/DateNavigator.tsx` 신설 (월 타이틀 + 주간 뷰 + ←/→ 단축키) ✅ 2026-05-05
- [x] `packages/ui/src/FAB.tsx` 신설 (모바일 + 버튼) ✅ 2026-05-05
- [x] 키보드 단축키 (`←` `→`) 핸들러 추가 — DateNavigator 에 흡수 ✅ 2026-05-05
- [ ] `pnpm --filter @todo-list/web build` 통과 — ❌ stack-pivot Sub-04 산출물(`auth/callback/route.ts`)이 `output: 'export'` 와 비호환. 본 sub 의 신규 산출물 자체는 export 호환. 후속 plan 으로 분리
- [x] `apps/web` 의 `tsc --noEmit` 통과 (`auth/callback` implicit-any 4건 보정 포함) — `package.json` 에 `typecheck` 스크립트 추가는 후속 plan 으로 분리
- [ ] `pnpm --filter @todo-list/web lint` 통과 — ❌ `next lint` ESLint 초기 설정 인터랙티브 요구. ESLint config 부재. 후속 plan 으로 분리

## 검증 기준

- [ ] `pnpm --filter @todo-list/web build` 통과 (`output: 'export'` 정합)
- [ ] `pnpm --filter @todo-list/web typecheck` 통과
- [ ] `make web-up` 실행 → 브라우저에서 `/login` → Google OAuth → `/life` 로 redirect 성공
- [ ] DB 에 sub_issue 시드 후 `/life` 진입 시 일자 뷰 렌더 (완료/진행 중 두 섹션, 카운트 정확)
- [ ] DB Studio 에서 sub_issue.status 직접 변경 시 1~2초 내 UI 반영 (Realtime 구독 동작)
- [ ] 키보드 `←` `→` 로 일자 이동, URL `?date=` 갱신
- [ ] life ↔ work 워크스페이스 전환 시 데이터 분리 (life 의 todo 가 work 에 보이지 않음)
- [ ] 자동 이월 — `due_date` 가 어제이고 `status='todo'` 인 sub_issue 가 있는 상태로 `/life` 진입 시 오늘 뷰에 자동 이동
- [ ] 자동 이월 시 토스트·알림 없음 (조용한 이월)
- [ ] 미로그인 상태로 `/life` 직접 접근 시 `/login` 으로 redirect
- [ ] `grep -RIn "import.*Modal" apps/web/src/app/(main)/(life|work)/` 결과 0건 (CRUD 모달은 Sub-03)

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
