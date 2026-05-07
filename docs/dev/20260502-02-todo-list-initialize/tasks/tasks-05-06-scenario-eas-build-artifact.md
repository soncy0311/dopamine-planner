# TASK-05-06: 시나리오 5 — EAS Build profile=preview 산출물에서 시나리오 1~4 핵심 동작 재현 + deep link OAuth

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 06
- **상태**: 대기중
- **의존성**: 02 / 03 / 04 / 05 (시나리오 1~4 통과 후 산출물 재현) + sub-04 task 15 (`apps/mobile/eas.json` 의 preview profile + EAS Build 산출물 .ipa)

## 작업 목표

`sub-prd-04` 의 task 15 가 만든 EAS preview 빌드 산출물 (iOS internal distribution `.ipa`) 에서 시나리오 1~4 의 **핵심 동작** (로그인 → 메인 뷰 → Realtime → 토글 + CRUD 일부) 을 재현 + deep link OAuth 콜백이 정상 수신됨을 확인한다. Expo dev server 가 아닌 산출물 자체에서 동일 동작이 보장되는지 검증.

통과 기준 (정량):

- 산출물이 시뮬레이터 또는 실 디바이스에서 정상 부팅 (crash 없이 로그인 화면 도달)
- Google OAuth → `dopamine-planner://auth/callback` deep link 정상 수신 → `(main)/life` 진입
- 시나리오 1 핵심 (web ↔ 산출물 양방향 sync) 1 회 재현 통과 (지연 ≤ 2000ms)
- 시나리오 2 핵심 (자동 이월) 1 회 재현 통과 (어제 시드 → 오늘 이동, 멱등)
- 시나리오 3 핵심 (Epic 디바운스) 1 회 재현 통과 (5 토글 → 호출 1~2 회)
- 시나리오 4 핵심 (분류·Epic·Sub CRUD) 모바일 단독 흐름 통과

## 상세 구현 내용

### 사전 환경

| 항목 | 값 |
|---|---|
| EAS 산출물 | sub-04 task 15 의 EAS Build preview 산출물 (`.ipa`) |
| 설치 | iOS 시뮬레이터 (`xcrun simctl install booted <ipa>`) 또는 실 디바이스 (TestFlight / Apple Configurator / 직접 다운로드) |
| 환경 1 (web) | `make web-up` → Chrome → 동일 계정 로그인 (시나리오 1·5 의 cross-device sync 검증용) |
| Supabase | 클라우드 인스턴스 (시드 task 01 적재 완료) |
| Supabase Dashboard | redirect URI 화이트리스트에 `dopamine-planner://auth/callback` 등록 확인 |

### 재현 단계

#### 단계 1: 산출물 설치 + 부팅

1. EAS Build preview 산출물 (`.ipa`) 을 시뮬레이터 또는 실 디바이스에 설치
    - 시뮬레이터: `xcrun simctl install booted <path-to-ipa>` (또는 Expo dashboard 의 install 링크)
    - 실 디바이스: TestFlight / Apple Configurator / Diawi 링크 등
2. 앱 아이콘 탭 → 부팅 → **로그인 화면 도달** 확인 (crash 없음)

#### 단계 2: deep link OAuth 콜백

1. "Google 로 계속하기" 탭 → 외부 브라우저 launch
2. Google 계정 선택 → 콜백
3. `dopamine-planner://auth/callback` deep link 수신 → 앱 자동 복귀 → `(main)/life` 진입
4. 메인 뷰가 데이터로 채워짐 (시드 데이터 보임)

#### 단계 3: 시나리오 1 핵심 재현 (web ↔ 산출물 양방향)

| # | 환경 | 동작 | 기대 |
|---|---|---|---|
| 3.1 | 환경 1 (web) | Sub 생성 ("eas sync 1") | 산출물에 1~2 초 내 반영 |
| 3.2 | 산출물 | 위 sub 토글 | web 에 1~2 초 내 반영 |

#### 단계 4: 시나리오 2 핵심 재현

1. task 01 §Step 3 의 어제 시드 SQL 재실행 (3 row 추가)
2. 산출물 재진입 (백그라운드 → 포그라운드 또는 앱 재시작) → `carry_over_todos` 호출 → 어제 sub 가 오늘로 이동
3. SQL 검증: `select count(*) from sub_issue where due_date = current_date - interval '1 day' and status = 'todo'` → 0
4. (옵션) web 에서 추가 호출 시 멱등 (추가 이동 0)

#### 단계 5: 시나리오 3 핵심 재현

1. 산출물에서 동일 epic 의 sub 5 개를 빠르게 토글
2. Supabase Logs 확인 — `recalc_epic_progress` 호출 1~2 회로 합쳐짐
3. Epic 진행률 정확

#### 단계 6: 시나리오 4 핵심 재현 (산출물 단독 CRUD)

1. 산출물에서 분류 → Epic → Sub 생성 → 수정 → 삭제 흐름 1 회 통과
2. FK 위반 친화 토스트 노출 확인 (분류에 epic 묶어 둔 채 분류 삭제 시도)
3. 로그아웃 → 다른 계정 로그인 → 잔존 0 건

### 결과 기록 형식 (task 07 인계용)

```
- 실행일: 2026-MM-DD
- 환경: 산출물=preview .ipa (build id ___), 디바이스=iPhone 15 Pro Sim 또는 실 디바이스 (모델 ___)
- 시나리오: 5
- 단계별 통과/실패:
  - 단계 1 부팅: ___
  - 단계 2 deep link OAuth: ___
  - 단계 3 시나리오 1 핵심: ___
  - 단계 4 시나리오 2 핵심: ___
  - 단계 5 시나리오 3 핵심: ___
  - 단계 6 시나리오 4 핵심: ___
- 통과/실패: ___
- 비고 / 회귀 분기: ___
```

## 검증 과정

- [ ] EAS preview 산출물 설치 + 부팅 (crash 없이 로그인 화면 도달)
- [ ] deep link OAuth `dopamine-planner://auth/callback` 정상 수신
- [ ] 시나리오 1 핵심 재현 통과 (web ↔ 산출물 양방향, 지연 ≤ 2000ms)
- [ ] 시나리오 2 핵심 재현 통과 (자동 이월 + 멱등)
- [ ] 시나리오 3 핵심 재현 통과 (Epic 디바운스 1~2 회)
- [ ] 시나리오 4 핵심 재현 통과 (CRUD + FK 토스트 + 계정 격리)
- [ ] 결과 기록 (위 형식) 을 task 07 인계용으로 준비

## 주의사항

1. **fix 는 sub-01~04 으로 분기** — 산출물 부팅 실패, deep link 미수신, 시나리오 재현 실패 등 회귀는 본 task 에서 fix 하지 않고 task 07 의 회귀 분기 책임으로 인계 (sub-prd-05 §주의사항 3). 후보 분기처: sub-04 (Expo 설정 / `app.json` scheme / EAS env / RN 의존성).
2. **EAS Build 산출물 의존** — sub-04 task 15 가 EAS Build 를 성공시켜야 본 task 실행 가능. task 15 미완료 시 본 task 도 대기.
3. **internal distribution 한계** — TestFlight / App Store 는 본 sub 범위 밖 (sub-prd-05 §주의사항 4). internal distribution `.ipa` 만 검증.
4. **EAS env 주입 확인** — 산출물에 `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` 가 정상 주입되어야 Supabase 호출 가능. 부팅 실패 시 EAS secret 등록부터 점검.
5. **deep link scheme** — `dopamine-planner://` scheme 이 `app.json` 에 등록 + EAS Build 시 반영되어야 함. Supabase Dashboard 의 redirect URI 화이트리스트에도 동일 등록.
6. **clean build 시드 영향** — 단계 4 자동 이월 시드는 task 03 의 시드와 동일 SQL. 라운드 사이에 매번 재적재.
7. **반복 횟수 — 1 회로 한정** — 본 task 는 산출물 검증이 본질이라 1 회 통과로 충분. 다회 반복은 시나리오 1~4 의 task 가 이미 수행.
8. **클라우드 supabase 의무** — 산출물도 클라우드 supabase 를 바라봐야 함. 로컬 supabase 빌드는 본 검증 대상이 아님.
9. **별도 결과 파일 신설 금지** — 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 책임).
10. **Android 검증 — 옵션** — sub-04 task 15 가 `.apk` 도 산출했다면 동일 단계를 Android 시뮬레이터에서 1 회 재현. 단, 본 task 의 통과 조건은 iOS 만으로 충분 (sub-prd-05 §시나리오 5 가 iOS 명시).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §시나리오 5, §주의사항 4
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §10 EAS Build
- [`./tasks-04-15-verify-build-and-eas.md`](./tasks-04-15-verify-build-and-eas.md) — EAS preview 빌드 산출물 SoT
- [`./tasks-05-02-scenario-realtime-sync.md`](./tasks-05-02-scenario-realtime-sync.md) — 시나리오 1 본판
- [`./tasks-05-03-scenario-carry-over-idempotency.md`](./tasks-05-03-scenario-carry-over-idempotency.md) — 시나리오 2 본판
- [`./tasks-05-04-scenario-epic-progress-debounce.md`](./tasks-05-04-scenario-epic-progress-debounce.md) — 시나리오 3 본판
- [`./tasks-05-05-scenario-crud-regression.md`](./tasks-05-05-scenario-crud-regression.md) — 시나리오 4 본판
