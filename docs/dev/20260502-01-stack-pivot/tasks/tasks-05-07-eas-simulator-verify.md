# Task 05-07: EAS Build 설정 + iOS 시뮬레이터 부팅 + OAuth 플로우 검증

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**: 05-01 ~ 05-06 모두 완료
- **대상 파일**:
  - `apps/mobile/eas.json` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-03-feat-supabase-infra.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/mobile/eas.json` 신설 (preview / production profile)
- [ ] `pnpm --filter @todo-list/mobile dev` (`expo start --dev-client`) iOS 시뮬레이터 부팅 검증 *(사용자 환경)*
- [ ] iOS 시뮬레이터에서 `(auth)/login` → Google OAuth → `(main)/life` 진입 검증 *(사용자 환경)*

## 구현 세부사항

### 1. `apps/mobile/eas.json` 신설

Sub-PRD §9 코드 그대로.

```json
{
  "cli": { "version": ">=5.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 2. dev client 또는 EAS preview 빌드 준비

`expo-auth-session` + custom URI scheme 은 Expo Go 비호환. 다음 둘 중 하나로 시뮬레이터에 dev client 설치:

- `eas build --profile preview --platform ios` 후 결과 빌드를 시뮬레이터에 drag & drop
- 또는 `pnpm --filter @todo-list/mobile exec expo prebuild` + `pnpm --filter @todo-list/mobile exec expo run:ios` 로 native 프로젝트 직접 생성/빌드

scheme 변경 (05-03) 이후 첫 실행 시에는 반드시 prebuild 또는 EAS build 재실행 필요.

### 3. dev 서버 기동

```bash
pnpm --filter @todo-list/mobile dev
# = expo start --dev-client
```

dev client 가 시뮬레이터에서 metro 서버에 자동 연결됨.

### 4. OAuth 플로우 수동 검증

시뮬레이터에서 다음 순서를 따라간다.

1. 앱 진입 → 인증 가드가 `(auth)/login` 으로 redirect
2. Google 로그인 버튼 탭 → 외부 브라우저(Safari) 기동
3. 동의 화면 → 동의
4. `dopamine-planner://auth/callback?code=...` deep link 수신 → 앱 복귀
5. `exchangeCodeForSession` 성공 → `(main)/life` 진입
6. Tab 3개 (Life/Work/Settings) 모두 클릭 가능

deep link 직접 테스트:

```bash
xcrun simctl openurl booted "dopamine-planner://auth/callback?code=test"
```

### 5. Nativewind 토큰 매핑 시각 확인

`(main)/life` 화면의 색상/간격/타이포그래피가 web `/life` 와 동일한 design-system 토큰을 따르는지 시각 비교 (Sub-PRD §검증 기준 3).

## 주의사항

1. **Expo Go 비호환** — Sub-PRD §주의사항 2. dev client / EAS build 필수. Expo Go 로 시도 시 OAuth 콜백 수신 불가
2. **scheme 변경 후 prebuild 재실행** — 05-03 작업 후 본 task 첫 실행 시 native binary 의 Info.plist 가 갱신되어야 함
3. **`EXPO_PUBLIC_*` 환경 변수** — `env/.env.mobile.local` 에 정의된 값이 dev client 빌드 타임에 주입됨. dev 서버 재시작만으로 갱신 안 됨 (재빌드 필요)
4. **EAS 계정 / 프로젝트 ID** — 최초 `eas build` 시 `eas init` 또는 `app.json` 의 `extra.eas.projectId` 설정 필요. 본 task 에서는 빌드 자체는 옵션 (시뮬레이터 부팅 + OAuth 동작 확인이 핵심)
5. **SUPABASE_SERVICE_ROLE_KEY 주입 금지** — dev client 빌드 시에도 동일 원칙

## 검증 체크리스트

- [x] `ls apps/mobile/eas.json` 존재
- [x] `cat apps/mobile/eas.json | jq '.build.preview, .build.production'` 양쪽 존재 (null 아님)
- [x] `cat apps/mobile/eas.json | jq '.build.preview.ios.simulator'` 결과 `true`
- [ ] `pnpm --filter @todo-list/mobile dev` 실행 후 iOS 시뮬레이터 부팅 성공 *(사용자 환경 — 수동 확인)*
- [ ] `xcrun simctl openurl booted "dopamine-planner://auth/callback?code=test"` 시 앱이 deep link 수신 *(사용자 환경)*
- [ ] `(auth)/login` → Google OAuth → `(main)/life` 진입 *(사용자 환경 — 수동 확인)*
- [ ] `(main)/life` 화면의 Nativewind className 정상 매핑 *(사용자 환경 — 시각 확인)*
- [ ] Tab 3개 (Life/Work/Settings) 정상 동작 *(사용자 환경)*
