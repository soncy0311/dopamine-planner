# TASK-04-01: 의존성 추가 + `lib/supabase.ts` 정합 검증

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 01
- **상태**: 완료
- **의존성**: (없음 — Sub-04 의 모든 후속 task 의 기반)

## 작업 목표

Sub-04 §기술 스택·§핵심 구현 로직 은 `react-native-gesture-handler` (좌우 스와이프), `@react-native-community/datetimepicker` (TodoForm due_date), `react-hook-form` / `@hookform/resolvers` / `zod` (폼), `react-native-reanimated` (gesture-handler 의존) 의 사용을 전제하지만 현재 `apps/mobile/package.json` 에는 모두 미설치 상태이다. 본 task 는 누락 의존성을 일괄 추가하고, stack-pivot Sub-05 가 머지한 `apps/mobile/src/lib/supabase.ts` (createClient + AsyncStorage adapter) 가 sub-prd-04 §1·§핵심 구현 로직 코드와 정합한지 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/package.json` | 수정 | 5 종 dependencies 추가 |
| `apps/mobile/babel.config.js` | 수정 | `react-native-reanimated/plugin` 추가 (last plugin 규칙) |
| `apps/mobile/src/lib/supabase.ts` | 검증 (수정 없음 가정) | sub-prd §1 코드와 1:1 정합 확인 |
| `pnpm-lock.yaml` | 자동 갱신 | `pnpm install` 결과 |

### 구현 세부사항

#### Step 1: `apps/mobile/package.json` dependencies 추가

```json
{
  "dependencies": {
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "@react-native-community/datetimepicker": "8.2.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0"
  }
}
```

(버전은 install 시점 Expo SDK 52 호환 latest 로 고정. `expo install` 사용 권장 — `npx expo install react-native-gesture-handler react-native-reanimated @react-native-community/datetimepicker` 로 SDK 52 호환 버전 자동 결정. 그 외 RHF/zod 는 `pnpm add` 로 직접.)

#### Step 2: `apps/mobile/babel.config.js` 수정

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'], // 반드시 last plugin
  };
};
```

#### Step 3: 루트에서 install

```bash
pnpm install
```

#### Step 4: `apps/mobile/src/lib/supabase.ts` 정합 검증

기존 파일이 sub-prd-04 §핵심 구현 로직과 정확히 일치하는지 확인:

```ts
// apps/mobile/src/lib/supabase.ts (기대값 — 변경 없음)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});
```

- `createClient` 가 `@todo-list/core` 에서 export 되는지 (Sub-01 task 14 의존)
- `storage` 인자 시그니처가 `core` 의 `createClient` 와 일치하는지

#### Step 5: `packages/core/src/` 내부에 `AsyncStorage` 누설 없는지 확인

```bash
grep -RIn "AsyncStorage" packages/core/src/
# 결과 0건 이어야 함 (sub-prd §주의사항 1)
```

## 검증 과정

- [x] `apps/mobile/package.json` 에 6 종 dependencies 모두 존재
- [x] `apps/mobile/babel.config.js` plugins 에 `react-native-reanimated/plugin` 등록 (last)
- [x] `pnpm-lock.yaml` 갱신
- [x] `apps/mobile/src/lib/supabase.ts` 가 sub-prd-04 §핵심 구현 로직 코드와 1:1 정합
- [x] `grep -RIn "AsyncStorage" packages/core/src/` 결과 0건 (storage adapter 누설 금지)
- [x] `grep -RIn "react-native-webview" apps/mobile/` 결과 0건 (sub-prd §주의사항 2)
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과 — 후속 task 03·09 의 기존 회귀(AuthSession.startAsync, life wrapper 인자) 해결 후 통과
- [ ] `pnpm --filter @todo-list/mobile dev` 부팅 시 reanimated 워닝 없음 — **수동 확인 필요**

## 주의사항

1. **Sub-PRD 본문과 코드 현실 불일치** — sub-prd-04 §작업 1 "supabase.ts 신설" 은 사실과 다름 (이미 stack-pivot Sub-05 가 머지). 본 task 에서는 정합 검증으로 처리. 별도 docs PR 에서 sub-prd-04 본문을 "정합 검증" 으로 정정 권장.
2. **`expo install` 우선 사용** — RN 라이브러리는 SDK 버전 호환이 중요. `pnpm add` 보다 `npx expo install` 이 SDK 52 호환 버전 자동 결정.
3. **`react-native-reanimated/plugin` 위치** — babel plugins 의 **마지막** 위치 의무. 다른 plugin 이 추가될 때 항상 last 로 유지 (gesture-handler 의 worklet 처리 의존).
4. **`react-native-webview` 0건 유지** — stack-pivot 에서 제거됨 (sub-prd §주의사항 2). 본 task 의 install 결과로 transitive dep 으로 끌려오지 않는지 lockfile 확인.
5. **storage adapter 는 `apps/mobile` 에서만** — `AsyncStorage` import 는 절대 `packages/core/src/` 본문에 들어가면 안 됨 (sub-prd §주의사항 1, Sub-01 검증과 동일).
6. **EAS Build 영향** — `react-native-reanimated`, `react-native-gesture-handler`, `@react-native-community/datetimepicker` 모두 네이티브 모듈. EAS Build (task 15) 시 prebuild 자동 처리.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §기술 스택, §1 Supabase 클라이언트, §주의사항 1·2
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `createClient` 시그니처
