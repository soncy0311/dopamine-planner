# TASK-04-09: `(main)/{life,work}/index.tsx` 보강 (`<MainDailyViewMobile>` wrapper)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 09
- **상태**: 완료
- **의존성**: 08 (MainDailyViewMobile)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/app/(main)/life/index.tsx` 와 `(main)/work/index.tsx` 는 stub 상태이다. 두 페이지를 `<MainDailyViewMobile workspace="life" />` / `workspace="work"` 의 얇은 wrapper 로 보강한다. 비즈니스 로직은 모두 task 08 의 컴포넌트가 보유 — 본 task 는 라우트 진입점만.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(main)/life/index.tsx` | 수정 | `<MainDailyViewMobile workspace="life" />` |
| `apps/mobile/src/app/(main)/work/index.tsx` | 수정 | `<MainDailyViewMobile workspace="work" />` |

### 구현 세부사항

```tsx
// apps/mobile/src/app/(main)/life/index.tsx
import { MainDailyViewMobile } from '@/components/MainDailyViewMobile';

export default function LifePage() {
  return <MainDailyViewMobile workspace="life" />;
}
```

```tsx
// apps/mobile/src/app/(main)/work/index.tsx
import { MainDailyViewMobile } from '@/components/MainDailyViewMobile';

export default function WorkPage() {
  return <MainDailyViewMobile workspace="work" />;
}
```

## 검증 과정

- [x] `(main)/life/index.tsx` 가 `<MainDailyViewMobile workspace="life" />` 만 렌더
- [x] `(main)/work/index.tsx` 가 `<MainDailyViewMobile workspace="work" />` 만 렌더
- [x] 두 파일 모두 default export
- [x] 두 페이지 외 추가 로직 없음 (얇은 wrapper)
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 전체 0 에러
- [ ] iOS 시뮬레이터에서 Tab Life ↔ Tab Work 전환 시 데이터 분리 — **수동 확인 필요**

## 주의사항

1. **얇은 wrapper 정책** — life/work 페이지는 비즈니스 로직 보유 X. 모두 컴포넌트 (task 08) 책임. 페이지에 로직이 추가되면 컴포넌트로 격상.
2. **workspace 인자 단방향** — 부모 (page) → 자식 (컴포넌트) prop 으로만 전달. 컴포넌트가 useRouter 등으로 역추적 안 함.
3. **default export 의무** — expo-router 는 default export 만 라우트 인식.
4. **두 페이지 동일 코드** — 중복 보이지만 expo-router 의 file-based routing 제약. 추상화 X.
5. **Tab title** — `(main)/_layout.tsx` 의 Tabs.Screen options 에서 정의 (이미 머지). 본 task 는 페이지 본문만.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §4 탭 라우트, §5 메인 일자 뷰
- `apps/web/src/app/(main)/life/page.tsx` (Sub-02 task 12) — 웹 카운터파트
