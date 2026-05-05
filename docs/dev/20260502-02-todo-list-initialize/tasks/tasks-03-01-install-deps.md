# TASK-03-01: 의존성 추가 + Toast Provider 등록

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 01
- **상태**: 대기중
- **의존성**: (없음 — Sub-03 의 모든 후속 task 의 기반)

## 작업 목표

Sub-03 §기술 스택 절은 `react-hook-form` / `zod` / `sonner` / `@radix-ui/react-dialog` 를 "이미 추가" 라고 가정하지만 현재 repo 는 미설치 상태이다 (apps/web/package.json 에 workspace 의존만 있고, packages/ui/package.json 에 radix dialog 없음). 본 task 는 Sub-03 의 모든 후속 task 가 정상 동작하도록 누락된 의존성을 설치하고 Toast Provider 를 root layout 에 등록한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/package.json` | 수정 | `react-hook-form` / `zod` / `@hookform/resolvers` / `sonner` 추가 |
| `packages/ui/package.json` | 수정 | `@radix-ui/react-dialog` 추가 |
| `apps/web/src/app/layout.tsx` | 수정 | `<Toaster />` (sonner) 등록 |
| `pnpm-lock.yaml` | 자동 갱신 | `pnpm install` 결과 |

### 구현 세부사항

#### Step 1: apps/web/package.json dependencies 추가

```json
{
  "dependencies": {
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "sonner": "^1.7.0"
  }
}
```

(버전은 install 시점의 latest stable 로 고정. 위는 예시.)

#### Step 2: packages/ui/package.json dependencies 추가

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.0"
  }
}
```

#### Step 3: 루트에서 install

```bash
pnpm install
```

#### Step 4: Toast Provider 등록

`apps/web/src/app/layout.tsx` 의 `<body>` 하위에 `<Toaster />` 추가:

```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

## 검증 과정

- [ ] `apps/web/package.json` 에 `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner` 모두 존재
- [ ] `packages/ui/package.json` 에 `@radix-ui/react-dialog` 존재
- [ ] `pnpm-lock.yaml` 갱신 (4 종 + 1 종 최소 5 개 버전 lock 추가)
- [ ] `apps/web/src/app/layout.tsx` 에 `<Toaster />` 등록 + `sonner` import
- [ ] `pnpm --filter @todo-list/web typecheck` 통과
- [ ] `pnpm --filter @todo-list/web build` 통과 (`output: 'export'` 정합)

## 주의사항

1. **Sub-PRD 본문과 코드 현실 불일치** — sub-prd-03 §기술 스택 의 "이미 `@todo-list/ui` 에 추가" 표기는 사실과 다름. 별도 docs PR 에서 sub-prd 본문을 "추가 필요" 로 정정 권장.
2. **버전 고정 정책** — `^` 사용. 단 `react`, `react-dom`, `next` 등 코어 패키지 버전과 충돌 없는지 install 직후 확인.
3. **Toaster 위치** — root layout 의 `<body>` 직속이어야 함. `(main)/layout.tsx` 에 두면 `/login` 등 인증 외 페이지에서 토스트 안 뜸.
4. **`output: 'export'` 호환** — sonner 와 react-hook-form 모두 client-only 컴포넌트. RSC 에서 쓰지 말 것 (모달 컴포넌트엔 모두 `'use client'` 디렉티브 의무).
5. **Radix Dialog 위치** — `packages/ui` 에 두는 이유는 ui-mobile 미신설 + 웹 전용이라도 ui 레이어의 일관성 유지. 본 task 는 설치만, wrapper 컴포넌트는 task 04~08 에서 모달별로 신설.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §기술 스택
