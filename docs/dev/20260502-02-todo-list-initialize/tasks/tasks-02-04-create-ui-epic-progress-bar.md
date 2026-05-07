# TASK-02-04: `packages/ui/EpicProgressBar` 컴포넌트

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 04
- **상태**: 완료
- **의존성**: (없음)

## 작업 목표

Epic 의 sub_issue 진행 상태를 시각화하는 세그먼트 프로그레스 바를 `@todo-list/ui` 에 신설한다. 본 sub 의 메인 일자 뷰에서는 직접 사용하지 않으나 Sub-03 (Epic 관리 화면) 에서 재사용되므로 본 sub 의 작업 범위로 분리한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EpicProgressBar.tsx` | 신설 | `<EpicProgressBar />` 컴포넌트 |
| `packages/ui/src/index.ts` | 갱신 | EpicProgressBar 재-export |

### Props 시그니처

```tsx
type EpicProgressBarProps = {
  total: number;          // 전체 sub_issue 개수
  done: number;           // 완료된 sub_issue 개수
  segments?: boolean;     // true 면 세그먼트 분할 (default: true)
};
```

### 구현 세부사항

- `segments=true` (default) — 전체 개수만큼 막대를 균등 분할하여 done 개수만큼 채움 (`flex` + 균등 너비 + gap)
- `segments=false` — 단일 막대에 비율 (`done / total`) 만큼 채움
- 진행률 0% 시 빈 트랙만 표시. `total=0` 인 경우 전부 빈 막대
- 색은 디자인 토큰 className 만 사용 (`bg-primary` / `bg-muted` 등)
- 접근성 — `role="progressbar"`, `aria-valuenow={done}`, `aria-valuemin={0}`, `aria-valuemax={total}`

### 참조 코드

`docs/base/design-system/` 의 progress 컴포넌트 명세 정합 (있는 경우). 없으면 sub-prd-02 §4 의 일반 명세를 따름.

## 검증 과정

- [x] `packages/ui/src/EpicProgressBar.tsx` 파일 존재
- [x] `packages/ui/src/index.ts` 재-export 추가
- [x] `total=0` 케이스에서 div by zero 없이 정상 렌더 (segments 분기에서 0 totals 시 fall-through)
- [x] `done > total` 방어 (clamp) 처리 — `Math.min(Math.max(0, done), safeTotal)`
- [x] aria-* 속성 4개 (`role`, `valuenow`, `valuemin`, `valuemax`) 부여
- [x] `pnpm --filter @todo-list/ui lint` (=`tsc --noEmit`) 통과

## 주의사항

1. **본 sub 미사용** — 메인 일자 뷰는 EpicProgressBar 직접 미렌더. 본 task 는 Sub-03 선행 자산으로 신설.
2. **인라인 색 금지** — 디자인 토큰 className 만. inline `style` 사용 금지 (TodoItem 의 color chip 예외와 다름).
3. **react 외 의존성 금지** — `packages/ui` peerDependencies 0건 유지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §작업
- `docs/base/design-system/` — progress 토큰
