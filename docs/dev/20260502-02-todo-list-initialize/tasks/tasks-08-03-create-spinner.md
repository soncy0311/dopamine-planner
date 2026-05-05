# TASK-08-03: `<Spinner>` 컴포넌트 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 03
- **상태**: 미착수
- **의존성**: TASK-08-01 (디자인 시스템 SoT 머지 후), TASK-08-02 와 병렬 가능

## 작업 목표

isLoading 상태의 표준 스피너 `<Spinner>` 를 `packages/ui` 에 신설한다. props 시그니처는 sub-prd-08 §3 정합. `prefers-reduced-motion` 폴백 필수.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/Spinner.tsx` | 신설 | 본체 컴포넌트 |
| `packages/ui/src/index.ts` | 수정 | `Spinner` re-export |

### Props 시그니처 (sub-prd-08 §3 정합)

```ts
export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullscreen';
  label?: string; // aria-label, 기본값 "로딩 중"
};
```

### 구조 (요약)

```tsx
const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size ?? 'md'];
const motionClass = 'animate-spin motion-reduce:animate-none';

const spinnerEl = (
  <span
    role="status"
    aria-label={label ?? '로딩 중'}
    className={`${sizeClass} ${motionClass} ...`}
  >
    {/* SVG circle */}
  </span>
);

if (variant === 'fullscreen') {
  return <div className="flex min-h-[60vh] items-center justify-center">{spinnerEl}</div>;
}
return spinnerEl;
```

### 변형 정책

- **inline (기본)**: 섹션·리스트 로딩 위치에 그대로 삽입
- **fullscreen**: 라우트 전환 / 부트스트랩 — wrapper 가 화면 중앙 배치
- **size**: `sm` 16px / `md` 24px / `lg` 40px (디자인 토큰 정합)

### a11y / reduced-motion

- `role="status"` + `aria-label` 필수
- `motion-reduce:animate-none` 으로 `prefers-reduced-motion: reduce` 시 정적 표시
- 정적 표시 시에도 `role="status"` 가 보조기기에 로딩 중을 알림

### 참조

- sub-prd-08 §3 / §핵심 구현 로직
- TASK-08-01 의 `docs/base/design-system/components/spinner.md`

## 검증 과정

- [ ] `packages/ui/src/index.ts` 에서 `Spinner` export
- [ ] props 시그니처가 sub-prd-08 §3 과 일치
- [ ] `size` 미지정 시 `md` 기본값 (`h-6 w-6`)
- [ ] `size="sm"` → `h-4 w-4`, `size="lg"` → `h-10 w-10`
- [ ] `variant="fullscreen"` 시 중앙 정렬 wrapper 노출
- [ ] `variant` 미지정 / `inline` 시 wrapper 없이 spinner 만 노출
- [ ] `label` 미지정 시 `aria-label="로딩 중"` 적용
- [ ] `motion-reduce:animate-none` className 적용 (reduced-motion 폴백)
- [ ] `role="status"` 적용
- [ ] `pnpm --filter @todo-list/ui lint` / `typecheck` 통과
- [ ] 단위 테스트 (TASK-08-05) 통과

## 주의사항

1. **TASK-08-01 머지 우선**: 디자인 SoT 가 먼저 머지되지 않으면 본 컴포넌트의 size·색이 docs 와 분기될 수 있음.
2. **reduced-motion 폴백 필수**: `motion-reduce:animate-none` 누락 시 a11y 회귀. 검증 시 OS 설정 토글로 확인.
3. **스켈레톤 미포함**: 본 sub 의 spinner 는 회전형 1종만. 스켈레톤은 후속 sub.
4. **fullscreen wrapper 의 min-height**: 라우트 전환 시 점프 방지를 위해 `min-h-[60vh]` 등 충분한 높이 확보. host 가 추가 wrapping 시 충돌 주의.
5. **mobile RN 분리**: 본 task 는 web 전용. mobile 용 `Spinner` 는 후속 mobile sub.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §3
- [`./tasks-08-01-design-system-docs.md`](./tasks-08-01-design-system-docs.md)
- [`./tasks-08-04-refactor-callsites.md`](./tasks-08-04-refactor-callsites.md)
- [`./tasks-08-05-add-unit-tests.md`](./tasks-08-05-add-unit-tests.md)
