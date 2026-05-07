# TASK-05-02: 시나리오 1 — 다중 디바이스 Realtime sync (web + iOS, 양방향, ≤2000ms × 3 회 반복)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 02
- **상태**: 대기중
- **의존성**: 01 (시드)

## 작업 목표

web 과 iOS 시뮬레이터에 동일 계정으로 동시 로그인한 상태에서 한 환경의 변경이 다른 환경에 **2000ms 이내** 반영됨을 양방향 모두 확인한다. 시나리오를 3 회 반복해 일관성을 확보한다.

통과 기준 (정량):

- 측정된 Realtime 지연이 3 회 평균 **≤ 2000ms** + 단일 회 최댓값 ≤ 3000ms
- 양 갈래(web→mobile, mobile→web) 동기화 일관성 100% (3 회 모두 양방향에서 데이터 일치)
- 분류 변경 시 mobile 의 분류 selector 에 반영 (서로 다른 테이블이라도 broadcast publication 정상 동작 확인)

## 상세 구현 내용

> 본 task 는 코드 작성이 아니라 **재현 단계 + 측정** 이 산출물. 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 합본의 책임이지만 본 task 실행 시 데이터 기록).

### 사전 환경

| 항목 | 값 |
|---|---|
| 환경 1 (web) | `make web-up` 으로 dev 서버 기동 → Chrome (또는 Safari) 으로 `http://localhost:3000` 접속 → Google OAuth 로그인 |
| 환경 2 (mobile) | `make mobile-dev` → `i` 로 iPhone 15 Pro 시뮬레이터 부팅 → Google OAuth 로그인 → `dopamine-planner://auth/callback` deep link 정상 수신 |
| Supabase | 클라우드 인스턴스 (시드 task 01 적재 완료) |
| 측정 도구 | 환경 1 = Chrome DevTools Console, 환경 2 = RN debugger / Expo dev tools console |

### 측정 방법 (Realtime 지연)

```ts
// 환경 1 (변경 송신측) — 변경 직전 timestamp 기록
const sendAt = performance.now();
console.log('[realtime-test] send', sendAt, payload);

// 환경 2 (수신측) — Realtime payload 도착 시점 기록
//   → packages/core 의 useTodos / useCategories 훅 내부 onPayload 콜백에 임시 측정 코드 추가 가능
//     단, 본 task 는 production 코드 변경이 아닌 console 만 보는 것으로 시작
//   → console 에서 payload 수신 직후 시각 기록
const recvAt = performance.now();
console.log('[realtime-test] recv', recvAt, payload);
// 두 환경의 시계는 동일하지 않으므로 두 환경의 NTP 시각을 양쪽 모두 console.log(Date.now()) 로 한번 찍어 offset 추정 가능
```

> 정확한 정량 측정이 어려우면 **육안 측정** (스톱워치 — 환경 1 클릭 시점 ↔ 환경 2 화면 갱신 시점) 으로 갈음한다. 단 3 회 평균 ≤ 2000ms 통과 기준은 동일하게 적용.

### 재현 단계 (1 라운드)

| # | 환경 | 동작 | 기대 |
|---|---|---|---|
| 1 | 환경 1 (web) | Life Tab → FAB → Sub 생성 (제목 "sync test 1") → 저장 | sub_issue insert + Realtime broadcast |
| 2 | 환경 2 (mobile) | Life Tab 화면 유지 | 1~2 초 내 새 sub "sync test 1" 가 진행 중 섹션에 등장 |
| 3 | 환경 2 (mobile) | 단계 2 의 sub 우측 체크박스 탭 (토글) | sub_issue update + Realtime broadcast |
| 4 | 환경 1 (web) | Life Tab 화면 유지 | 1~2 초 내 해당 항목이 완료 섹션으로 이동 |
| 5 | 환경 1 (web) | 설정 → 분류 관리 → "+" → 분류 "sync test cat" (color = #F59E0B) 생성 | category insert + Realtime broadcast |
| 6 | 환경 2 (mobile) | 설정 → Epic 관리 → Epic 생성 모달 진입 → 분류 selector 펼침 | "sync test cat" 가 selector 항목에 등장 |

### 반복 정책

- 위 1 라운드를 **3 회 반복**
- 각 회마다 단계 1 / 3 의 timestamp 측정값을 기록
- 라운드 간 시드 정리 불필요 — sub 제목에 회차 suffix (예: "sync test 1-1", "sync test 1-2") 만 다르게

### 결과 기록 형식 (task 07 가 sub-prd-05 §결과 표에 row 추가할 입력)

```
- 실행일: 2026-MM-DD
- 환경: web=Chrome XX, mobile=iPhone 15 Pro Sim (iOS 17.x)
- 시나리오: 1
- 회차별 지연 (web→mobile / mobile→web):
  - 1 회: XXX ms / XXX ms
  - 2 회: XXX ms / XXX ms
  - 3 회: XXX ms / XXX ms
- 평균 지연: XXX ms
- 통과/실패: ___
- 비고 / 회귀 분기: ___
```

## 검증 과정

- [ ] 환경 1 + 환경 2 모두 동일 계정으로 동시 로그인 성공
- [ ] 1 라운드의 6 단계 모두 통과 (web→mobile, mobile→web, 분류 selector 반영)
- [ ] 3 회 반복 모두 통과
- [ ] 측정된 평균 지연 ≤ 2000ms (단일 회 최댓값 ≤ 3000ms)
- [ ] 양 갈래 동기화 일관성 100% (한 쪽에만 보이는 row 0건)
- [ ] 결과 기록 (위 형식) 을 task 07 인계용으로 준비

## 주의사항

1. **fix 는 sub-01~04 으로 분기** — 본 task 는 시나리오 실행 + 결과 기록까지. 회귀 발견 시 (예: 지연 > 3 초, 한쪽만 반영) 본 task 에서 코드를 고치지 않고 task 07 의 회귀 분기 책임에 인계 (sub-prd-05 §주의사항 3).
2. **클라우드 supabase 의무** — 로컬 supabase 는 publication 동작이 다를 수 있어 본 시나리오의 검증 대상이 아님 (sub-prd-05 §주의사항 1).
3. **3 회 반복 의무** — Realtime 은 네트워크 의존이라 단일 실행으로 단정 금지 (sub-prd-05 §주의사항 2).
4. **Realtime echo 는 회귀 아님** — 자기 변경의 echo 로 인한 추가 invalidate 는 MVP 에서 회귀로 보지 않음 (sub-prd-05 §주의사항 6 + main-prd §기술적 고려사항). 측정 시 echo 로 인한 중복 갱신은 무시.
5. **시계 동기화 문제** — 두 환경의 `performance.now()` / `Date.now()` 는 절대 시각이 아님. 라운드 시작 시 양쪽에서 동일 시점에 `Date.now()` 를 찍어 offset 추정. 정확도가 안 나오면 육안 스톱워치로 갈음.
6. **production 코드 측정용 console.log 주입 금지** — 임시로 useTodos 훅에 `console.log` 를 넣고 측정한 경우 task 종료 전 반드시 제거. 본 task 는 코드 변경 산출물 없음이 원칙.
7. **별도 결과 파일 신설 금지** — 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 책임). 본 task 는 결과를 인계용 텍스트로만 보유.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §시나리오 1, §핵심 구현 로직 §Realtime 지연 측정, §주의사항 1·2·3·6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — Realtime 구독 훅 (`subscribeTodos`)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — web 메인 뷰
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) — mobile 메인 뷰
- `supabase/migrations/005_realtime_publication.sql` — Realtime publication SoT
