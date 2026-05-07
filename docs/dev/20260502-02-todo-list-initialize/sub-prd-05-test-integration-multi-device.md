# SUB-PRD: `통합 다중 디바이스 검증`

## 작업 정보

- **작업명**: `통합 다중 디바이스 검증`
- **작업 유형**: `test` (검증·회귀 시나리오)
- **시작일**: 2026-05-05
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05
- **상태**: 진행전
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: [`sub-prd-02-feat-web-main-view.md`](./sub-prd-02-feat-web-main-view.md), [`sub-prd-03-feat-web-management.md`](./sub-prd-03-feat-web-management.md), [`sub-prd-04-feat-mobile-core.md`](./sub-prd-04-feat-mobile-core.md)

## 배경 및 목적

Sub-01~04 의 단일 환경 검증으로는 잡히지 않는 회귀가 있다:

- **다중 디바이스 sync** — web 변경이 iOS 앱에 1~2초 내 반영되는가
- **자동 이월 race** — 두 디바이스가 동시에 진입할 때 `carry_over_todos` 가 멱등하게 동작하는가
- **Epic 디바운스 검증** — 동일 epic 의 sub 5개를 빠르게 토글했을 때 `recalc_epic_progress` 가 1회로 합쳐지는가
- **CRUD 회귀** — 생성·수정·삭제·토글이 web ↔ mobile 양쪽에서 동일하게 동작하는가
- **EAS Build 산출물 동작** — preview 빌드 IPA 가 실 디바이스 또는 시뮬레이터에서 정상 동작하는가

본 sub 는 이를 **시나리오 5종 + EAS preview 산출물 검증** 으로 묶고, **회귀 시나리오 SoT 문서**를 본 파일로 기록한다. 발견된 회귀는 본 sub 에서 fix 하지 않고 sub-01~04 로 분기한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 환경 1 | 데스크톱 브라우저 (Chrome 또는 Safari) — `make web-up` |
| 환경 2 | iOS 시뮬레이터 (iPhone 15 Pro) — `expo start` 또는 EAS preview 빌드 |
| Supabase | 클라우드 인스턴스 (production 또는 preview Supabase 프로젝트) |
| 시간 시뮬레이션 | DB 직접 조작 — `due_date` 를 어제로 insert |
| 로그 모니터링 | Supabase Dashboard → Logs → Postgres / Realtime / Edge functions |

## 핵심 요구 사항

### 시나리오 1: 다중 디바이스 sync

- 환경 1 (web) + 환경 2 (iOS 시뮬레이터) 동시에 동일 계정 로그인
- 환경 1 에서 sub 생성 → 환경 2 에 1~2초 내 반영
- 환경 2 에서 토글 → 환경 1 에 1~2초 내 반영
- 환경 1 에서 분류 생성 → 환경 2 의 분류 selector 에 반영
- 측정: Realtime 지연 시간 (브라우저 console / RN debugger)

### 시나리오 2: 자동 이월

- 사전 조건: DB 에 `due_date = yesterday`, `status = 'todo'` 인 sub 3개 시드
- 환경 1 진입 → 자동 이월 RPC 호출 1회 → 3개가 today 로 이동
- 환경 2 진입 → `carry_over_todos` 호출이 추가로 발생해도 멱등 (003 마이그레이션 WHERE 절) → 추가 이동 0건
- Supabase Logs 에서 RPC 호출 횟수 ≤ 2 (각 환경 1회씩)
- 사용자에게 토스트·알림 노출 없음 (조용한 이월)

### 시나리오 3: Epic 디바운스 검증

- 동일 epic 의 sub 5개 시드
- 환경 1 에서 5개를 순차로 빠르게 (200ms 미만 간격) 토글
- Supabase Logs 에서 `recalc_epic_progress` 호출이 1~2회로 합쳐졌는지 확인
- Epic 진행률은 마지막 상태 기준으로 정확하게 갱신
- 환경 2 에 변경된 진행률이 1~2초 내 반영

### 시나리오 4: CRUD 회귀

- 환경 1 (web) 에서 분류 → Epic → Sub 생성 → 수정 → 삭제 전체 흐름
- 환경 2 (mobile) 에서 동일 흐름 (분류 → Epic → Sub)
- 환경 1 에서 만든 데이터를 환경 2 에서 수정 → 환경 1 에 반영
- 분류 삭제 시 FK 위반 (23503) 친화 토스트 양쪽에서 동일하게 노출
- 로그아웃 → 다른 계정 로그인 시 이전 캐시 잔존 없음

### 시나리오 5: EAS Build 산출물 빌드 검증

- Sub-04 에서 생성한 EAS preview 빌드 (iOS internal distribution) 가 시뮬레이터 또는 실 디바이스에서 정상 동작
- 산출물에서 시나리오 1~4 의 핵심 동작 (로그인 / 메인 뷰 / Realtime / 토글) 재현
- 산출물의 deep link OAuth 콜백 정상 수신

### 시나리오 6: 회귀 시나리오 SoT 문서화

- 본 sub-prd 파일이 향후 회귀 검증의 SoT 가 됨
- 발견된 회귀는 본 파일에 시나리오 추가 형태로 누적
- fix 는 sub-01~04 로 분기 (본 sub 는 fix 하지 않음)

## 핵심 구현 로직

### 시간 시뮬레이션 (자동 이월용 시드)

```sql
-- Supabase SQL Editor 에서 직접 실행 (testing only)
insert into sub_issue (user_id, epic_id, title, status, due_date)
values
  (auth.uid(), '<epic-id>', '어제 미완료 1', 'todo', current_date - interval '1 day'),
  (auth.uid(), '<epic-id>', '어제 미완료 2', 'todo', current_date - interval '1 day'),
  (auth.uid(), '<epic-id>', '어제 미완료 3', 'todo', current_date - interval '1 day');
```

### 디바운스 검증 (Supabase Logs 호출 횟수)

- Supabase Dashboard → Logs → Postgres
- 필터: `query ilike '%recalc_epic_progress%'`
- 시나리오 3 실행 후 timestamp 범위 안의 호출 row 수가 1~2개인지 확인

### Realtime 지연 측정

- 환경 1 에서 변경 직전 timestamp 기록 (`performance.now()`)
- 환경 2 의 Realtime payload 도착 시점 timestamp 기록
- 차이가 2000ms 이하

## 구현 시 주의사항

1. **클라우드 supabase 인스턴스 사용** — 로컬 supabase 는 Realtime publication 동작이 다를 수 있음. preview 또는 production 클라우드 프로젝트로 검증
2. **시나리오 3~5회 반복** — Realtime 은 네트워크 의존이라 단일 실행으로 단정 금지. 동일 시나리오 3~5회 반복해 일관성 확인
3. **발견된 회귀는 본 sub 에서 fix 안 함** — sub-01~04 로 분기. 본 sub 는 SoT 기록 + 재현 단계 명시까지
4. **EAS Build 산출물은 internal distribution** — TestFlight / Play Store 업로드는 본 sub 범위 밖
5. **계정 간 데이터 격리 검증 필수** — 시나리오 4 의 로그아웃 → 재로그인 단계에서 이전 데이터 잔존 시 RLS / qc.clear 회귀
6. **Realtime echo 허용** — 자기 변경의 echo 로 인한 추가 invalidate 는 MVP 에서 회귀 아님 (main-prd §기술적 고려사항 정합)
7. **시나리오 결과는 본 파일에 row 추가** — 통과/실패/날짜/환경 기록. 향후 sprint 에서 동일 시나리오 재실행 시 비교

## 작업

- [ ] 클라우드 Supabase 프로젝트에 시드 데이터 준비 (분류 2개 / Epic 3개 / Sub 10개)
- [ ] 시나리오 1 (다중 디바이스 sync) 실행 — 3회 반복
- [ ] 시나리오 2 (자동 이월) 실행 — 3회 반복, 멱등성 검증
- [ ] 시나리오 3 (Epic 디바운스) 실행 — 5회 반복, Logs 호출 횟수 기록
- [ ] 시나리오 4 (CRUD 회귀) 실행 — web ↔ mobile 양 갈래
- [ ] EAS Build profile=preview 산출물에서 시나리오 1~4 재현 (시나리오 5)
- [ ] 발견된 회귀를 sub-01~04 의 작업 항목으로 분기 (본 파일에 분기 기록)
- [ ] 본 sub-prd 파일 하단에 "회귀 시나리오 결과" 섹션 추가 (실행일·환경·통과 여부)
- [ ] 향후 회귀 검증의 진입점으로 본 파일을 main-prd 에서 참조

## 검증 기준

- [ ] 시나리오 1 — Realtime 지연 ≤ 2000ms (3회 평균), 양 갈래 동기화 일관성 100%
- [ ] 시나리오 2 — `carry_over_todos` 호출이 환경별 1회 (각 1회 = 총 2회), 멱등 동작으로 추가 이동 0건, 토스트·알림 노출 0건
- [ ] 시나리오 3 — `recalc_epic_progress` 호출이 5회 토글 대비 1~2회로 합쳐짐, 진행률 최종 값 정확
- [ ] 시나리오 4 — web/mobile 양쪽에서 분류·Epic·Sub CRUD 일관 동작, FK 위반 친화 토스트 양쪽 동일
- [ ] 시나리오 4 — 로그아웃 후 다른 계정 로그인 시 이전 데이터 잔존 0건
- [ ] 시나리오 5 — EAS preview 빌드 IPA 가 시뮬레이터 또는 실 디바이스에서 정상 부팅 + OAuth deep link 정상 수신 + 시나리오 1~4 핵심 동작 재현
- [ ] 시나리오 6 — 본 sub-prd 파일이 회귀 SoT 로 기능 (실행 결과·날짜·환경 추가 가능한 형식)
- [ ] 발견된 회귀가 sub-01~04 의 작업 항목으로 모두 분기 (본 sub 는 fix 책임 없음)

## 회귀 시나리오 결과 (실행 시 추가)

| 실행일 | 환경 | 시나리오 | 통과/실패 | 비고 (분기 sub) |
|---|---|---|---|---|
| (TBD) | web=Chrome / mobile=iPhone 15 Pro Sim | 1 | — | — |
| (TBD) | 동일 | 2 | — | — |
| (TBD) | 동일 | 3 | — | — |
| (TBD) | 동일 | 4 | — | — |
| (TBD) | 동일 | 5 | — | — |

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 Sub-PRD 이자 회귀 시나리오 SoT 입니다. 전체 범위는 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
