# Task 05-01: 의존성 정리 (webview 제거 + auth-session/async-storage 추가)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**: Sub-02 완료 (`apps/mobile/package.json` 에 nativewind/tailwindcss 일부 포함 가능)
- **대상 파일**:
  - `apps/mobile/package.json` (수정)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/mobile/package.json` 에서 `react-native-webview` 제거 (Sub-02 처리됐다면 확인만)
- [x] `apps/mobile/package.json` 에 `expo-auth-session`, `expo-web-browser`, `@react-native-async-storage/async-storage` 추가
- [x] `apps/mobile/package.json` 에 `nativewind`, `tailwindcss` 확인 (Sub-02 처리분)

## 구현 세부사항

### 1. 기존 의존성 제거

`apps/mobile/package.json` 의 `dependencies` 에서 `react-native-webview` 항목을 삭제한다. 현재 v13.12.0 으로 명시되어 있음 (Sub-02 진행 중 미제거 시 본 단계에서 처리).

### 2. 신규 의존성 추가

다음 패키지를 `dependencies` 에 추가한다.

- `expo-auth-session` — Google OAuth 외부 브라우저 기동
- `expo-web-browser` — `expo-auth-session` 의 peer dependency
- `@react-native-async-storage/async-storage` — Supabase storage adapter

가급적 `pnpm --filter @todo-list/mobile exec expo install <pkg>` 로 설치하여 Expo SDK 52 매트릭스 호환 버전을 자동 선택한다.

### 3. Sub-02 처리분 확인 / 누락 시 추가

다음 항목이 누락되어 있으면 함께 추가한다.

- `nativewind@^4.0.0`
- `tailwindcss@^3.4.0`

### 4. lockfile 갱신

루트에서 `pnpm install` 실행 — 모노레포 lockfile 단일성을 유지한다.

## 주의사항

1. **버전 호환** — Expo SDK 52 와의 매트릭스 확인 (`expo install` 사용 권장). 임의 버전 지정 시 prebuild/EAS build 단계에서 비호환 에러 가능
2. **모노레포 lockfile** — 루트 `pnpm-lock.yaml` 만 단일 source of truth. 앱별 lockfile 생성 금지
3. **`react-native-webview` 잔존 import 0건 보장** — 본 task 범위 밖이지만, 05-04 에서 `index.tsx` 폐기 시 동시 정리됨

## 검증 체크리스트

- [x] `grep -n '"react-native-webview"' apps/mobile/package.json` 결과 0건
- [x] `grep -n '"expo-auth-session"' apps/mobile/package.json` 결과 1건
- [x] `grep -n '"expo-web-browser"' apps/mobile/package.json` 결과 1건
- [x] `grep -n '"@react-native-async-storage/async-storage"' apps/mobile/package.json` 결과 1건
- [x] `grep -n '"nativewind"' apps/mobile/package.json` 결과 1건
- [x] `grep -n '"tailwindcss"' apps/mobile/package.json` 결과 1건
- [ ] `pnpm install` exit code 0 *(사용자 환경)*
