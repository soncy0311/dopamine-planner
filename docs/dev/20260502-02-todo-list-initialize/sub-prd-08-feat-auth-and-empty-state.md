# SUB-PRD: Empty state · Loading · Toast

## 작업 정보

- **작업명**: `Empty state·Loading·Toast 디자인 SoT + 컴포넌트` `auth-and-empty-state`
- **작업 유형**: `feat` + `docs` (디자인 결정 SoT 등재 + 공유 컴포넌트 신설 + 호출 측 리팩터)
- **시작일**: TBD (디자인 결정자 합류 시 In Progress)
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05
- **상태**: Draft
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: 없음 (Sub-06 / Sub-07 와 독립적으로 진행 가능)

## 분리 안내

> Kakao OAuth 는 본 sub 에서 분리되어 후속 sub 로 진행 — main-prd §향후 개선 P3 참조. 본 문서는 Empty / Loading / Toast 단일 축만 다룬다.

## 사전 조건

본 sub 는 디자인 결정이 선행되지 않으면 머지가 불완전하다. 진입 전 합의 항목:

1. 빈 상태 일러스트 / 아이콘 / 문구 / CTA 정책
2. 로딩 스피너 종류 (인라인 / 풀스크린 / 스켈레톤은 후속) 가이드
3. 토스트 색·위치·노출 시간·동시 노출 개수 정책 (sonner 기본값 채택 가능)

## 배경 및 목적

본 sub 는 `docs/base/prototype/` 와 현 web 구현의 격차 중 **prototype 미정의 영역의 디자인 결정 + 공유 컴포넌트 신설** 을 묶는다.

Empty state · 로딩 · 토스트는 prototype 자체에 정의가 부재 → 디자인 시스템 SoT (`docs/base/design-system/`) 에 명세를 등재하고, 공유 컴포넌트(`packages/ui`) 를 신설하여 호출 측 리팩터를 일괄 진행한다.

코드 변경량은 적지만 (a) 디자인 결정자가 합류해야 완결 가능하고 (b) 컴포넌트 코드보다 docs SoT 가 먼저 머지되어야 일관성이 유지된다는 운영 특성을 가진다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 디자인 SoT | `docs/base/design-system/` (보강) |
| 신설 컴포넌트 | `packages/ui/src/{EmptyState,Spinner}.tsx` |
| 토스트 라이브러리 | `sonner` (이미 `apps/web/package.json` 에 설치, `apps/web/src/app/layout.tsx` 에 `<Toaster />` 등록 완료) |
| 단위 테스트 | `vitest` + `@testing-library/react` (sub-prd-06 / 07 의 셋업 재사용) |

## 핵심 요구 사항

### 1. 디자인 시스템 SoT 등재

`docs/base/design-system/components/` 신설 / 보강:

- `empty-state.md` — 사용 위치 / 일러스트 vs 아이콘 / 문구 톤 / CTA 정책
- `spinner.md` — 인라인 / 풀스크린 케이스. `prefers-reduced-motion` 폴백 명세 (스켈레톤은 후속)
- `toast.md` — success / error / info / warning 4종 색 토큰 / 위치(top-right) / 자동 닫힘 시간(4초) / 동시 노출(3개) / stacking — sonner 기본값 채택 사유 명시

`docs/base/design-system/components.md` 의 Atoms · Molecules 분류표에 위 3건 링크 정합.

### 2. `<EmptyState>` 컴포넌트

```ts
type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};
```

- `role="status"` (a11y)
- Tailwind 토큰 className — inline style 0

### 3. `<Spinner>` 컴포넌트

```ts
type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullscreen';
  label?: string;  // aria-label, 기본값 "로딩 중"
};
```

- `motion-reduce:animate-none` 으로 `prefers-reduced-motion` 폴백

### 4. `<Toast>` 시스템 정합 검증

- 라이브러리: `sonner` (이미 설치·등록됨 — 신규 도입 작업 없음)
- 호출 API: `toast.success(...)` / `toast.error(...)` 기존 사용처 6개 컴포넌트
- 본 sub 의 toast 작업은 SoT 명세 등재 + 색·위치 정합 검증만 (코드 변경 0)

### 5. 호출 측 리팩터

- `apps/web/src/components/TodoSection.tsx` — 빈 상태 → `<EmptyState>`
- `apps/web/src/components/DoneSection.tsx` — TodoSection 래퍼이면 간접 적용 / 직접 빈 상태 처리 시 동일 교체
- `apps/web/src/components/MainDailyView.tsx` — `isLoading` 분기 → `<Spinner variant="inline" />`

## 핵심 구현 로직

### EmptyState

```tsx
<div role="status" className="flex flex-col items-center gap-3 p-8 text-periwinkle-500">
  {Icon ? <Icon className="h-12 w-12" aria-hidden /> : null}
  <p className="text-base font-medium">{title}</p>
  {description ? <p className="text-sm">{description}</p> : null}
  {action ? (
    <button onClick={action.onClick} className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white">
      {action.label}
    </button>
  ) : null}
</div>
```

### Spinner

```tsx
const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size ?? 'md'];
const motion = 'animate-spin motion-reduce:animate-none';
return (
  <span role="status" aria-label={label ?? '로딩 중'} className={`${sizeClass} ${motion}`}>
    {/* svg circle */}
  </span>
);
```

### sonner 정합 (변경 없음, 참고용)

```tsx
// apps/web/src/app/layout.tsx (이미 존재)
import { Toaster } from 'sonner';
<Toaster position="top-right" richColors closeButton />
```

```ts
import { toast } from 'sonner';
toast.success('투두를 저장했어요');
toast.error('저장에 실패했어요. 다시 시도해주세요.');
```

## 구현 시 주의사항

1. **a11y 정합**: `<EmptyState role="status">`, `<Spinner aria-label>`, Toast 의 `aria-live` 정합.
2. **호출 측 리팩터 1차 범위 한정**: 본 sub 는 메인 뷰 (`TodoSection` / `DoneSection` / `MainDailyView`) 의 isLoading / 빈 상태만 적용. 모달 내부 alert 등은 별도 후속.
3. **디자인 결정 docs 우선 머지**: design-system/components/*.md 가 컴포넌트 코드보다 먼저 머지되어야 SoT 일관성 유지.
4. **sonner 기존 호출 변경 0**: 6개 컴포넌트의 기존 `toast.*` 호출은 변경 없음. 본 sub 의 toast 작업은 SoT 명세 등재 + 색·위치 정합 검증만.
5. **mobile 분리**: 본 sub 는 web 전용. mobile RN 의 EmptyState / Spinner 는 후속 mobile sub.

## 작업

### 디자인 시스템 SoT

- [ ] `docs/base/design-system/components/empty-state.md` 신설
- [ ] `docs/base/design-system/components/spinner.md` 신설
- [ ] `docs/base/design-system/components/toast.md` 신설
- [ ] `docs/base/design-system/components.md` 보강 — 3건 링크 정합

### 컴포넌트 신설

- [ ] `packages/ui/src/EmptyState.tsx` 신설 + `index.ts` re-export
- [ ] `packages/ui/src/Spinner.tsx` 신설 + `index.ts` re-export

### 호출 측 리팩터

- [ ] `apps/web/src/components/{TodoSection,DoneSection,MainDailyView}.tsx` — 신 컴포넌트로 리팩터

### 단위 테스트

- [ ] 단위 테스트 — EmptyState / Spinner 렌더 + a11y attr + variant 분기

## 검증 기준

### 자동

- `EmptyState` 단위 테스트: title 만 / + description / + action 케이스 + `role="status"` 노출
- `Spinner` 단위 테스트: variant 분기 + label + `prefers-reduced-motion` 폴백
- `make lint` / `make build` / `make test` 통과

### 수동

- 빈 워크스페이스 / 빈 일자에 `<EmptyState>` 노출 (CTA 클릭 시 새 투두 모달 진입)
- 데이터 페칭 중 `<Spinner variant="inline" />` 노출 → 결과 도착 후 사라짐
- 투두 저장 → `toast.success` / 네트워크 에러 → `toast.error`
- 키보드 only 로 토스트 닫기 가능 + Tab 포커스 이동
- `prefers-reduced-motion` 켠 상태에서 spinner 정적

## 미해결 / 사용자 결정 필요

- 빈 상태 일러스트 / 아이콘 / 문구 디자인 결정자 — TASK-08-01 docs 작성 시 잠정안으로 진행, 디자인 결정자 합류 시 docs 갱신
- 토스트 위치 / 자동 닫힘 시간 / 동시 노출 개수 — TASK-08-01 docs 에서 잠정안 명세 (sonner 기본값 채택, top-right / 4초 / 3개)
