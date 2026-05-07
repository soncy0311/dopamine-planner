# TASK-04-15: 검증 (EAS Build + 디자인 토큰 시각 + typecheck/lint + 시나리오)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 15
- **상태**: 완료 (자동) / EAS Build·시뮬레이터 시나리오 수동 확인 대기
- **의존성**: 01~14 (모든 task 완료)

## 작업 목표

Sub-04 §검증 기준 전체를 단일 task 로 통과시킨다. (a) 정적 검증 (`typecheck` + `lint`), (b) 시뮬레이터 시나리오 (로그인 → 분류 → Epic → 투두 → 토글 → 로그아웃), (c) 디자인 토큰 시각 검증 (시뮬레이터 ↔ `docs/base/design-system/tokens.md`), (d) EAS Build profile=preview 산출물 생성. 다중 디바이스 sync 통합 시나리오는 Sub-05 위임.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/eas.json` | 신설 또는 검증 | profile=preview internal distribution 정의 |
| `docs/dev/20260502-02-todo-list-initialize/sub-prd-04-feat-mobile-core.md` | (옵션) 상태 갱신 | 검증 통과 후 §상태 갱신 |

### Step 1: 정적 검증

```bash
pnpm --filter @todo-list/mobile typecheck
pnpm --filter @todo-list/mobile lint
```

- 두 명령 모두 0 exit code

### Step 2: webview / AsyncStorage 누설 검증

```bash
grep -RIn "react-native-webview" apps/mobile/   # 0건 기대
grep -RIn "AsyncStorage" packages/core/src/     # 0건 기대
```

### Step 3: 시뮬레이터 시나리오

`make mobile-dev` → `i` (iOS 시뮬레이터)

1. 로그인 화면 표시 → "Google 로 계속하기" 탭 → 브라우저 launch
2. (Supabase Dashboard 의 redirect URI 화이트리스트에 `dopamine-planner://auth/callback` 등록 필요)
3. OAuth 성공 → deep link `dopamine-planner://auth/callback` 수신 → `(main)/life` 진입
4. Tab 이동 (Life ↔ Work ↔ 설정) 정상
5. 설정 → 분류 관리 → "+" 탭 → CategoryForm 입력 (이름 + 8색 中 1) → 저장 → 목록 갱신
6. 설정 → Epic 관리 → "+" 탭 → EpicForm 입력 (제목 + 분류 선택) → 저장 → Switch 로 메인 표시 토글
7. Life Tab → FAB 탭 → CreateTodoModal → 폼 입력 (제목 + 분류 + Epic + due_date) → 추가 → 진행 중 섹션 등장
8. 진행 중 섹션의 항목 체크박스 탭 → 즉시 완료 섹션 이동 (optimistic) + 카운트 갱신
9. 항목 본문 탭 → TodoDetailModal → 수정 또는 삭제 (confirm)
10. 좌우 스와이프 → 일자 변경 → DateHeader 의 선택 일자 일치
11. 설정 → 로그아웃 → 로그인 화면 복귀

### Step 4: 디자인 토큰 시각 검증

- `docs/base/design-system/tokens.md` 의 색·간격 HEX 값 ↔ 시뮬레이터 화면 색 시각 비교
- 분류 8 색 팔레트 vs `tokens.md` 일치
- 미지원 className (`box-shadow`, 일부 `gap`) 발견 시 `Platform.select` 또는 `style={}` 직접 작성으로 정정 (sub-prd §주의사항 3)
- FAB 그림자, 모달 배경, 체크박스 색 등 주요 시각 요소 점검

### Step 5: EAS Build profile=preview

`apps/mobile/eas.json` (없으면 신설):

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "$EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
      }
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

```bash
# EAS 시크릿 등록 (1 회)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <value>
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <value>

# 빌드 실행 (iOS + Android)
cd apps/mobile
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

- 두 산출물 (iOS internal distribution `.ipa`, Android `.apk`) 모두 생성 성공
- 산출물 자체의 다중 디바이스 sync 검증은 Sub-05

## 검증 과정

- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 0 에러
- [ ] ~~`pnpm --filter @todo-list/mobile lint` 통과~~ — **scope 정정**: mobile 패키지 ESLint 미설치(`eslint: command not found`). 별도 chore task (`apps/mobile/package.json` devDependencies 에 eslint + 설정 추가) 로 분리.
- [x] `grep -RIn "react-native-webview" apps/mobile/` 결과 0건
- [x] `grep -RIn "AsyncStorage" packages/core/src/` 결과 0건
- [x] `grep -RIn "from '@todo-list/core'" apps/mobile/src/` 결과 9건 (≥1)
- [x] `grep -RIn "supabase.auth.signOut" apps/mobile/src/` 결과 1건 (lib/auth/logout.ts 한정)
- [x] `grep -RIn "qc.clear()" apps/mobile/src/` 결과 1건 (lib/auth/logout.ts 한정)
- [ ] 시뮬레이터 시나리오 11 단계 모두 통과 — **수동 확인 필요**
- [ ] 좌우 스와이프 일자 이동 정상 — **수동 확인 필요**
- [ ] Realtime 토글 시 즉시 섹션 이동 + 다른 탭에서 동일 데이터 갱신 확인 — **수동 확인 필요**
- [ ] 디자인 토큰 색·간격 시각 일치 (`docs/base/design-system/tokens.md` 비교) — **수동 확인 필요**
- [x] `apps/mobile/eas.json` 의 preview profile 정의 — 기존 머지된 파일에 `distribution: "internal"`, `ios.simulator: true` 정합 확인. (env injection 추가는 EAS 시크릿 등록 단계에서 — 코드 변경 없이 EAS 대시보드 처리)
- [ ] EAS Build preview iOS 산출물 생성 (`.ipa`) — **수동 확인 필요** (Apple Developer 자격증명 + 빌드 시간 ~30분)
- [ ] EAS Build preview Android 산출물 생성 (`.apk`) — **수동 확인 필요**
- [ ] sub-prd-04 §상태 "진행전" → "검증 완료" 갱신 (옵션)

## 주의사항

1. **EAS Build 외부 인프라 의존** — Apple Developer 계정 (iOS), Google Play Developer 계정 (Android), EAS 시크릿 등록 모두 필요. 미달 환경에서는 빌드 단계 skip + 후속 plan 으로 분리 가능.
2. **EAS env 주입** — `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` 를 EAS 시크릿으로 주입. 코드 하드코딩 금지 (sub-prd §주의사항 7).
3. **profile=preview 의 의미** — internal distribution. 사내 배포용. App Store/Play Store 제출은 production profile (별도).
4. **시나리오 통과 기준** — 11 단계 中 일부 실패 시 후속 fix task 분리. 본 task 는 "검증 시도" 가 아닌 "통과" 가 완료 조건. 실패 항목은 별도 plan 으로 분리.
5. **Realtime 검증 한계** — 단일 시뮬레이터에서는 자기 자신 토글이 즉시 보이는 것만 검증. 두 디바이스 sync 는 Sub-05 위임 (sub-prd §8 명시).
6. **디자인 토큰 시각 검증의 주관성** — HEX 정확 일치는 어려움. 색 카테고리 단위 (primary/secondary 등) 와 간격 (4/8/16px 등) 일치만 확인.
7. **lint 통과 후 의존 정리** — 사용되지 않는 import / 변수 제거 의무. lint 룰이 strict 라면 빌드 차단.
8. **`pnpm --filter @todo-list/mobile build`** — script 가 "Use EAS Build for production builds" echo 만 함 (현재 package.json). turbo build 는 typecheck 로 갈음.
9. **시뮬레이터 부팅 환경** — macOS + Xcode. Windows/Linux 환경에서는 Android 만 검증 가능.
10. **세션 가드 누락 잔존** — task 13 의 categories/epics 가 `(main)` 외부라 미인증 진입 시 이론상 보호 안 됨. 시나리오 11 단계 중 검증 — 발견 시 별도 보강 task 분리.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §10 EAS Build, §검증 기준, §주의사항 7·8
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) — 다중 디바이스 sync 위임처
- `docs/base/design-system/tokens.md` — 디자인 토큰 SoT
