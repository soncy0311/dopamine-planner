# Task 02-04: tailwind 공유 config + 앱별 config

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 02-01 (`packages/core` 워크스페이스 패키지 존재 — tsconfig base 등 공통 인프라 확인)
- **대상 파일**:
  - `packages/config/tailwind.config.js`
  - `apps/web/tailwind.config.ts`
  - `apps/mobile/tailwind.config.js`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`, `docs/base/design-system/tokens.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `packages/config/tailwind.config.js` 신설 — design-system tokens 매핑 (color/spacing/radius/motion)
- [x] `apps/web/tailwind.config.ts` 신설 (`packages/config/tailwind.config.js` import + content paths)
- [x] `apps/mobile/tailwind.config.js` 신설 (동일 import + content paths)

## 구현 세부사항

### 1. `packages/config/tailwind.config.js` (CommonJS)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [], // 각 앱이 채움
  theme: {
    extend: {
      colors: {
        // docs/base/design-system/tokens.md § Primitive 컬러 토큰 표의 토큰명·HEX 값과 1:1 매핑
        // 예시 (실제 값은 tokens.md 표에서 그대로 인용):
        // 'brand-primary-500': '#XXXXXX',
        // 'neutral-50': '#XXXXXX',
        // ...
      },
      spacing: {
        // --spacing-1 ~ --spacing-8
        // '1': '4px', '2': '8px', ... (tokens.md 값 그대로)
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
        // 또는 tokens.md 의 px 값 직접 매핑
      },
      transitionDuration: {
        // --duration-* 매핑
      },
      transitionTimingFunction: {
        // --easing-* 매핑
      },
    },
  },
  plugins: [],
};
```

- **token 값은 `docs/base/design-system/tokens.md` 표에서 그대로 인용** — 임의 값 사용 금지
- 색상 키 이름은 tokens.md 의 토큰명과 동일하게 유지 (kebab-case 가능)

### 2. `apps/web/tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';
import shared from '../../packages/config/tailwind.config.js';

const config: Config = {
  ...shared,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
```

- web 은 Next.js 가 ts-node 로 `.ts` config 처리 가능 — `.ts` 사용 OK

### 3. `apps/mobile/tailwind.config.js` (Nativewind v4)

```js
const shared = require('../../packages/config/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...shared,
  content: ['./src/**/*.{ts,tsx}'],
  presets: [
    // Nativewind v4 preset (실제 import 경로는 Nativewind v4 docs 기준)
    require('nativewind/preset'),
  ],
};
```

- mobile 은 반드시 `.js` (CommonJS) — Nativewind/Tailwind 가 require 로 로드. `.ts` 금지

## 주의사항

1. **tailwind config 는 CommonJS** — `module.exports` 사용. `packages/config/tailwind.config.js` 와 `apps/mobile/tailwind.config.js` 양쪽 (Sub-PRD §주의사항 3)
2. **token 값은 design-system tokens.md 표 그대로** — 임의 변경·신규 색 추가 금지. tokens.md 가 single source of truth
3. **content 비워둠 (공유 config)** — 공유 config 는 `content: []`, 각 앱 config 가 채움 (Sub-PRD §1)
4. **본 단계는 config 파일만** — Nativewind babel plugin 등록·className 사용은 Sub-04 / Sub-05 에서 (Sub-PRD §5)
5. **Nativewind preset import 경로** — Nativewind v4 공식 문서 기준. 잘못된 경로 시 mobile 빌드 실패 → 실패 시 즉시 보고
6. **web 의 `.ts` config 의 import 경로** — `../../packages/config/tailwind.config.js` 상대경로. workspace alias 사용 시 Tailwind 가 resolve 못 할 수 있음 → 상대경로 권장

## 검증 체크리스트

- [ ] `node -e "require('./packages/config/tailwind.config.js')"` 에러 없음 — 로컬에 node 미설치, 02-06 에서 사용자 환경에서 검증 필요
- [ ] `node -e "require('./apps/mobile/tailwind.config.js')"` 에러 없음 (Nativewind 미설치 상태에서는 02-06 의 install 후 검증)
- [x] `apps/web/tailwind.config.ts` 의 `content` 가 `./src/**/*.{ts,tsx}` 와 `packages/ui/src/**/*.{ts,tsx}` 양쪽 포함
- [x] `packages/config/tailwind.config.js` 의 color HEX 값이 `docs/base/design-system/tokens.md` § Primitive 컬러 토큰 표와 일치 (수동 비교)
- [x] `apps/mobile/tailwind.config.js` 가 CommonJS (`module.exports`) 형식
- [x] `packages/config/tailwind.config.js` 의 `content` 가 빈 배열
