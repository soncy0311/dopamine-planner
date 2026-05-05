# TASK-06-01: `tailwind.config.js` + `app/layout.tsx` 디자인 토큰 + Pretendard 셋업

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 01
- **상태**: 완료
- **의존성**: (없음 — sub-prd-06 의 가장 선행 task)

## 작업 목표

후속 task 들이 사용할 시각 토큰 (priority 색 + `fontFamily.sans`) 과 Pretendard Variable 폰트 번들을 한 곳에 셋업한다. 본 task 가 머지된 뒤에야 TASK-06-02 / TASK-06-04 / TASK-06-07 의 시각 작업이 가능하다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/fonts/PretendardVariable.woff2` | 신설 | 폰트 번들 (`next/font/local` 입력) |
| `apps/web/public/fonts/LICENSE` | 신설 | SIL Open Font License 텍스트 |
| `apps/web/src/app/layout.tsx` | 수정 | `next/font/local` import + `<html className={pretendard.variable}>` |
| `packages/config/tailwind.config.js` | 수정 | `theme.extend.fontFamily.sans` + `theme.extend.colors.priority.{high,medium,low}` |

### Pretendard 적용 (layout.tsx)

```tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

// <html lang="ko" className={pretendard.variable}>
```

### Tailwind 토큰 (tailwind.config.js)

```js
theme: {
  extend: {
    fontFamily: {
      sans: [
        'var(--font-pretendard)',
        'Pretendard Variable',
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'Roboto',
        'sans-serif',
      ],
    },
    colors: {
      priority: {
        high: { DEFAULT: '#ef4444', bg: '#fef2f2' },
        medium: { DEFAULT: '#f59e0b', bg: '#fffbeb' },
        low: { DEFAULT: '#3b82f6', bg: '#eff6ff' },
      },
    },
  },
}
```

> 정확한 hex 값은 `docs/base/design-system/tokens/` 의 priority 토큰을 우선 참조. 미정의 시 위 임시 값 사용 + design-system docs 갱신.

### 참조 코드

- sub-prd-06 §7 "Pretendard Variable 폰트"
- sub-prd-06 §주의사항 5 "Priority 색 토큰"
- prototype `docs/base/prototype/css/tokens.css:109-110`

## 검증 과정

- [x] `apps/web/src/app/fonts/PretendardVariable.woff2` 파일 존재 (woff2 매직 넘버 확인)
- [x] `apps/web/public/fonts/LICENSE` 에 SIL OFL 1.1 전문 포함
- [x] `apps/web/src/app/layout.tsx` 의 `<html>` element 에 `pretendard.variable` 클래스 부여
- [x] `packages/config/tailwind.config.js` 의 `fontFamily.sans` 첫 항목이 `var(--font-pretendard)`
- [x] `colors.priority.{high,medium,low}` 토큰 정의됨
- [x] `make build` 통과 (next/font/local 번들 성공)
- [x] 브라우저 DevTools Computed `font-family` 첫 항목이 `Pretendard Variable`

## 주의사항

1. **woff2 라이선스 의무** — Pretendard 는 SIL Open Font License. `apps/web/public/fonts/LICENSE` 동봉을 잊지 말 것. 누락 시 라이선스 위반.
2. **`next/font/local` 의 src 경로** — `app/layout.tsx` 기준 상대경로이므로 `./fonts/PretendardVariable.woff2`. `public/fonts/` 와 별개 (번들 경로 vs 정적 자산 경로).
3. **Tailwind v3 사용** — 본 프로젝트는 Tailwind v3 + `packages/config/tailwind.config.js` 단일 SoT. v4 의 `@theme` 구문 혼용 금지.
4. **priority 색 토큰의 design-system 정합** — sub-prd-06 §주의사항 5 — `docs/base/design-system/tokens/` 미정의 시 본 task 에서 임시 토큰 추가하고 후속 design-system docs PR 로 정합.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §7
- `docs/base/prototype/css/tokens.css`
- `docs/base/design-system/tokens/`
