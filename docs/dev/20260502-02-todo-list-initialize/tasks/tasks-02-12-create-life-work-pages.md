# TASK-02-12: `/life`, `/work` 페이지 신설 (동일 패턴 묶음)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 12
- **상태**: 완료
- **의존성**: 08 (MainDailyView), 11 (main layout)

## 작업 목표

`(main)` 라우트 그룹 하위에 `life` / `work` 두 페이지를 신설한다. 두 페이지 모두 `<MainDailyView workspace="life|work" />` 한 줄만 렌더하는 동일 패턴이므로 단일 task 로 묶는다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/(main)/life/page.tsx` | 신설 | `<MainDailyView workspace="life" />` 렌더 |
| `apps/web/src/app/(main)/work/page.tsx` | 신설 | `<MainDailyView workspace="work" />` 렌더 |

### 구현 세부사항

- 파일 상단 `'use client'` (자체적으로 useDateQuery → useSearchParams 사용 → MainDailyView 가 client 컴포넌트)
- 본문은 `<MainDailyView workspace="life" />` 또는 `"work"` 한 줄
- `<Suspense>` 경계 — `useSearchParams` 사용 시 정적 export 단계에서 `<Suspense>` boundary 필요할 수 있음. 빌드 단계에서 에러가 나면 `<Suspense>` 로 wrap
- default export function 컴포넌트

### 참조 코드

```tsx
// apps/web/src/app/(main)/life/page.tsx
'use client';
import { MainDailyView } from '@/components/MainDailyView';

export default function LifePage() {
  return <MainDailyView workspace="life" />;
}
```

work 페이지는 `workspace="work"` 만 다른 동일 패턴.

## 검증 과정

- [x] `apps/web/src/app/(main)/life/page.tsx` 파일 존재 — 기존 스켈레톤 재작성
- [x] `apps/web/src/app/(main)/work/page.tsx` 파일 존재 — 기존 스켈레톤 재작성
- [x] 두 파일 모두 `'use client'` + `<Suspense fallback={null}><MainDailyView workspace="..." /></Suspense>` 렌더
- [x] CRUD 모달 import 0건 — `grep -RIn "import.*Modal" "apps/web/src/app/(main)/"` 결과 0
- [x] `tsc --noEmit` 본 파일 관련 에러 0건 (이전 life/page.tsx 의 `subscribeTodos` 3-arg 에러 해소). build 는 task 13 일괄 검증

## 주의사항

1. **CRUD 모달 import 금지** — 두 페이지 모두 `MainDailyView` 만 렌더. CRUD 모달 컴포넌트 import 시 sub-prd §검증 항목 위배.
2. **`<Suspense>` 경계** — `useSearchParams` 가 export build 단계에서 `<Suspense>` 요구할 수 있음. 빌드 에러 시 페이지에서 `<Suspense fallback={...}>` wrap.
3. **동일 패턴 묶음** — sub-prd §작업 2,3 을 본 task 로 묶음. 두 파일 작성 분량은 적지만 동일 패턴이므로 한 task 로 처리.
4. **워크스페이스 typo** — `workspace="life"` / `"work"` 만 허용. 추가 워크스페이스 신설 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §2
