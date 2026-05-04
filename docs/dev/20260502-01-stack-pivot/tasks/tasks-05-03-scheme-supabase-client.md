# Task 05-03: 앱 스킴 변경 + supabase 클라이언트 (AsyncStorage)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**:
  - 05-01 완료 (`@react-native-async-storage/async-storage` 설치)
  - Sub-02 완료 (`@todo-list/core/supabase/createClient` 존재)
  - Sub-03 완료 (`dopamine-planner://auth/callback` Dashboard 화이트리스트 등록)
- **대상 파일**:
  - `apps/mobile/app.json` (수정)
  - `apps/mobile/src/lib/supabase.ts` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-02-feat-core-package.md`, `sub-prd-03-feat-supabase-infra.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/mobile/app.json` `scheme` 을 `todo-list` → `dopamine-planner` 변경
- [x] `apps/mobile/src/lib/supabase.ts` (core 팩토리 + AsyncStorage)

## 구현 세부사항

### 1. `apps/mobile/app.json` scheme 변경

기존 `"scheme": "todo-list"` 값을 `"scheme": "dopamine-planner"` 로 갱신한다. main PRD 결정 #7 에 따라 Supabase Dashboard 의 redirect URI 화이트리스트와 정확히 일치해야 한다.

기타 필드는 유지하고 `scheme` 만 단일 변경.

### 2. `apps/mobile/src/lib/supabase.ts` 신설

Sub-PRD §6 코드 그대로 적용. core 팩토리에 `AsyncStorage` 를 주입한다.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});
```

> **Note**: `@todo-list/core` 의 `package.json` exports 가 `.` 단일 진입점만 제공하므로, subpath (`@todo-list/core/supabase/createClient`) 는 import 불가. 모든 mobile 코드는 `@todo-list/core` 단일 진입점에서 가져온다.

## 주의사항

1. **scheme 변경 후 prebuild / EAS build 재실행 필요** — Sub-PRD §주의사항 5. dev 서버 재시작만으로는 native binary 의 Info.plist 가 갱신되지 않음. 05-07 에서 prebuild 또는 EAS build 재실행 시 적용됨
2. **`EXPO_PUBLIC_` 접두사만 클라이언트 번들에 노출** — Sub-PRD §주의사항 6. 기타 prefix 는 빌드 타임에 사라짐
3. **`SUPABASE_SERVICE_ROLE_KEY` 절대 주입 금지** — 클라이언트 코드에 노출 시 RLS 우회 가능. 모바일 번들은 reverse engineering 가능
4. **AsyncStorage 시그니처** — Supabase storage adapter 와 호환 (`getItem/setItem/removeItem` 모두 Promise 반환). 별도 wrapper 불필요
5. **createClient 팩토리 시그니처 의존** — Sub-02 의 `createClient({ url, anonKey, storage })` 시그니처를 정확히 따른다

## 검증 체크리스트

- [x] `grep -n '"scheme"' apps/mobile/app.json` 결과가 `"scheme": "dopamine-planner"`
- [x] `grep -n '"todo-list"' apps/mobile/app.json` 결과에 scheme 항목이 포함되지 않음
- [x] `ls apps/mobile/src/lib/supabase.ts` 존재
- [x] `grep -n "AsyncStorage" apps/mobile/src/lib/supabase.ts` 1건
- [x] `grep -n "@todo-list/core" apps/mobile/src/lib/supabase.ts` 1건
- [x] `grep -n "EXPO_PUBLIC_SUPABASE_URL" apps/mobile/src/lib/supabase.ts` 1건
- [x] `grep -n "EXPO_PUBLIC_SUPABASE_ANON_KEY" apps/mobile/src/lib/supabase.ts` 1건
- [x] `grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/mobile/` 0건
