# Task 05-02: Nativewind v4 셋업 (babel + metro + tailwind config + global.css)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**: 05-01 완료 (nativewind/tailwindcss 설치)
- **대상 파일**:
  - `apps/mobile/babel.config.js` (신설)
  - `apps/mobile/metro.config.js` (신설)
  - `apps/mobile/tailwind.config.js` (신설 — Sub-02 가 골격 둔 경우 갱신)
  - `apps/mobile/src/global.css` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/mobile/babel.config.js` Nativewind plugin 등록
- [x] `apps/mobile/metro.config.js` Nativewind metro 설정 (`withNativeWind`)
- [x] `apps/mobile/tailwind.config.js` content paths 채움 + Nativewind preset
- [x] `apps/mobile/src/global.css` 신설 (Tailwind directive)

## 구현 세부사항

### 1. `apps/mobile/babel.config.js` 신설

Sub-PRD §2 코드 그대로 적용.

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

### 2. `apps/mobile/metro.config.js` 신설

Nativewind v4 metro wrapper 적용. `global.css` 를 input 으로 지정.

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './src/global.css' });
```

### 3. `apps/mobile/tailwind.config.js` 신설/갱신

Sub-02 가 골격을 둔 경우 갱신, 미존재 시 신설.

```js
const shared = require('@todo-list/config/tailwind.config.js');

module.exports = {
  ...shared,
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
};
```

### 4. `apps/mobile/src/global.css` 신설

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 주의사항

1. **babel plugin 누락 시 className 무시** — Sub-PRD §주의사항 1. `nativewind/babel` 미등록 시 스타일 적용되지 않음
2. **dev 서버 캐시 클리어 필요** — babel/metro config 변경 후 `expo start -c` 또는 watchman 캐시 삭제 권장
3. **공유 config 의존** — `@todo-list/config/tailwind.config.js` 가 Sub-02 산출물로 존재해야 함. 미존재 시 Sub-02 선행 완료 확인
4. **Nativewind v4 preset 필수** — v3 → v4 마이그레이션 시 preset 누락 시 className 매핑 깨짐

## 검증 체크리스트

- [x] `grep -n "nativewind/babel" apps/mobile/babel.config.js` 1건
- [x] `grep -n "withNativeWind" apps/mobile/metro.config.js` 1건
- [x] `grep -n "./src/global.css" apps/mobile/metro.config.js` 1건
- [x] `grep -n "nativewind/preset" apps/mobile/tailwind.config.js` 1건
- [x] `grep -n "@todo-list/config/tailwind.config.js" apps/mobile/tailwind.config.js` 1건
- [x] `grep -n "@tailwind base" apps/mobile/src/global.css` 1건
- [x] `grep -n "@tailwind utilities" apps/mobile/src/global.css` 1건
