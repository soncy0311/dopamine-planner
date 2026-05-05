# TASK-02-02: `useDateQuery` URL `?date` 동기화 훅

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 02
- **상태**: 대기중
- **의존성**: (없음)

## 작업 목표

URL query string `?date=YYYY-MM-DD` 를 메인 일자 뷰의 SoT 로 사용하기 위한 React 훅 `useDateQuery` 를 신설한다. `[date, setDate]` 튜플을 반환하여 `MainDailyView` (task 08) 가 단일 진입점으로 일자 상태를 다룰 수 있게 한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/hooks/useDateQuery.ts` | 신설 | `useDateQuery(): [string, (d: string) => void]` |

### 구현 세부사항

- query string 에 `date` 가 없으면 `todayISO()` (KST 기준 `YYYY-MM-DD`) 반환
- `setDate(d)` 호출 → `router.replace(\`?date=${d}\`, { scroll: false })` 로 history push 없이 query 만 갱신
- `useSearchParams()` + `useRouter()` (next/navigation) 사용
- `todayISO()` 헬퍼는 본 파일 내부에 두거나 `packages/shared` 또는 `packages/core` 의 기존 date util 이 있으면 재사용

### 참조 코드

sub-prd-02 §3 "URL query 동기화" 그대로:

```tsx
function useDateQuery(): [string, (d: string) => void] {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get('date') ?? todayISO();
  const set = (d: string) => router.replace(`?date=${d}`, { scroll: false });
  return [date, set];
}
```

## 검증 과정

- [ ] `apps/web/src/hooks/useDateQuery.ts` 파일 존재
- [ ] 반환 시그니처 `[string, (d: string) => void]` 준수
- [ ] `router.replace` 호출 — `router.push` 아님 (history 누적 금지)
- [ ] `{ scroll: false }` 옵션 포함
- [ ] 파일 상단 `'use client'` 디렉티브 (next/navigation 훅 사용)
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **`output: 'export'` 제약** — `useSearchParams` 는 클라이언트 훅이며 정적 export 호환. 단 `<Suspense>` 경계 필요 여부는 페이지 (task 12) 단에서 검토.
2. **history push 금지** — `router.replace` 가 의무. `router.push` 사용 시 좌우 화살표 일자 이동마다 뒤로가기 스택이 누적된다.
3. **timezone** — `todayISO()` 는 사용자 로컬 (KST 가정) 이 아닌 UTC 자정 기준 ISO 가 되지 않도록 주의. `Date` 객체의 `toISOString()` 을 그대로 쓰면 UTC 가 되어 한국 시간 기준 어제 날짜가 나오는 케이스 존재.
4. **재호출 시 안정성** — `setDate` 는 매 렌더마다 새 함수 참조이지만 `useDateQuery` 호출자가 effect 의존성에 두지 않도록 (또는 `useCallback` 적용) 검토.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §2, §3
