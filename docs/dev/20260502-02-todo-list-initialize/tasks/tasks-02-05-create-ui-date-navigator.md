# TASK-02-05: `packages/ui/DateNavigator` 컴포넌트 (← → 단축키 포함)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 05
- **상태**: 완료
- **의존성**: (없음)

## 작업 목표

월 타이틀 + 좌우 화살표 + 주간 뷰(7일) 를 한 컴포넌트로 묶은 날짜 네비게이터를 `@todo-list/ui` 에 신설한다. **키보드 단축키 (`←` / `→`) 핸들러는 본 컴포넌트 내부에 흡수** (sub-prd-02 §작업 14 → 본 task 로 통합).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/DateNavigator.tsx` | 신설 | `<DateNavigator />` 컴포넌트 |
| `packages/ui/src/index.ts` | 갱신 | DateNavigator 재-export |

### Props 시그니처

```tsx
type DateNavigatorProps = {
  date: string;                    // YYYY-MM-DD
  onChange: (date: string) => void;
};
```

### 구현 세부사항

- 월 타이틀 — `date` 의 연/월 (`2026년 5월`) 표시
- 좌/우 화살표 버튼 — 클릭 시 `onChange(prev/next day ISO)` 호출
- 주간 뷰 — `date` 가 속한 주 (월~일 또는 일~토) 의 7일 칩. 활성 일자는 시각적 강조
- 키보드 단축키
  - `←` → `onChange(prev day)`
  - `→` → `onChange(next day)`
  - `useEffect` 에서 `window.addEventListener('keydown', ...)` 등록, unmount 시 제거
  - `<input>` / `<textarea>` 에 포커스가 있을 때는 단축키 비활성 (event.target tag 체크)
- 날짜 산술은 dayjs/date-fns 등 외부 의존 없이 `Date` 객체로 처리 (또는 `packages/shared` 의 기존 util 재사용)

### 참조 코드

sub-prd-02 §3 "`<DateHeader>` 컴포넌트" 명세 + §작업 14 키보드 단축키 통합.

## 검증 과정

- [x] `packages/ui/src/DateNavigator.tsx` 파일 존재
- [x] `packages/ui/src/index.ts` 재-export 추가
- [x] `←` `→` keydown 리스너 등록·해제 (`useEffect` cleanup)
- [x] input/textarea/contentEditable focus 시 단축키 비활성 + meta/ctrl/alt 모디파이어 가드
- [x] 월 타이틀 / 7일 주간 뷰 / 좌우 화살표 3요소 모두 렌더
- [x] 외부 date 라이브러리 의존 0건 — 자체 `Date` 산술
- [x] `pnpm --filter @todo-list/ui lint` (=`tsc --noEmit`) 통과

## 주의사항

1. **키보드 단축키 흡수** — sub-prd-02 §작업 14 의 단축키 작업을 본 컴포넌트 내부 로직으로 흡수. 별도 task 로 분리하지 않음.
2. **모달 열린 상태 충돌** — Sub-03 의 CRUD 모달이 열려있을 때 단축키가 일자를 바꾸지 않도록 input/textarea 포커스 가드. 모달 자체의 portal 충돌은 Sub-03 가 다룸.
3. **react 외 의존성 금지** — date 라이브러리도 추가하지 않음 (일자 +1/-1 만 필요).
4. **첫 주/마지막 주 시작요일** — 주간 뷰 기준 요일 (월/일) 은 디자인 시스템 명세 따름. 명세 없으면 일요일 시작.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §3, §작업 14
- `docs/base/design-system/` — 일자/주간 컴포넌트 토큰
