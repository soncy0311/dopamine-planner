# TASK-05-03: 시나리오 2 — 자동 이월 멱등성 (`carry_over_todos` RPC, 3 회 반복)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 03
- **상태**: 대기중
- **의존성**: 01 (시드 — Step 3 의 자동 이월용 어제 시드 SQL 포함)

## 작업 목표

`due_date = yesterday` + `status = 'todo'` 인 sub 3 개를 시드한 뒤, 두 환경(web + mobile) 진입 시 `carry_over_todos` RPC 가 **호출 횟수 ≤ 2 회** + **멱등** (두 번째 호출이 추가 이동 0건) 함을 검증한다. 3 회 반복으로 일관성 확보.

통과 기준 (정량):

- Supabase Logs 에 timestamp 범위 내 `carry_over_todos` 호출 row 수 ≤ 2 (각 환경 1 회씩 = 총 2 회)
- 시나리오 1 회 실행 후 `due_date = today` 로 이동된 sub 가 정확히 3 건 (어제 시드 row)
- 두 번째 환경 진입 시 추가 이동 = 0 건 (003 마이그레이션 WHERE 절 에 의해 멱등)
- 사용자 화면에 토스트·알림 노출 0 건 (조용한 이월)
- 3 회 반복 모두 동일 결과

## 상세 구현 내용

> 본 task 는 코드 작성이 아니라 **재현 단계 + 측정** 이 산출물.

### 사전 환경

| 항목 | 값 |
|---|---|
| 환경 1 (web) | `make web-up` → Chrome → 로그인 |
| 환경 2 (mobile) | `make mobile-dev` → iOS 시뮬레이터 → 로그인 |
| Supabase | 클라우드 인스턴스 |
| Logs | Supabase Dashboard → Logs → Postgres |

### 측정 방법 (Logs 호출 횟수)

```
Supabase Dashboard → Logs → Postgres
필터: query ilike '%carry_over_todos%'
시점: 시나리오 시작 직전 ~ 종료 직후 timestamp 범위
기대 호출 수: ≤ 2 (각 환경 진입 시 1 회씩 = 총 2 회)
```

### 재현 단계 (1 라운드)

1. **사전 정리** — 두 환경 모두 로그아웃 상태에서 시작 (또는 새로고침으로 클라이언트 캐시 초기화)
2. **시드 적재** — task 01 §Step 3 의 어제 시드 SQL 을 Supabase SQL Editor 에서 실행 → sub_issue 3 row 추가 (`due_date = current_date - interval '1 day'`, `status = 'todo'`)
3. **시드 검증** —
    ```sql
    select count(*) from sub_issue
     where user_id = auth.uid()
       and status = 'todo'
       and due_date = current_date - interval '1 day';
    -- 기대: 3
    ```
4. **시작 timestamp 기록** — Logs 검색용 시작 시점 메모
5. **환경 1 진입** — Chrome 에서 새 탭으로 web 접속 → 로그인 → Life Tab 진입
    - 기대: 진입 직후 `carry_over_todos` RPC 호출 1 회 → 어제 sub 3 개의 `due_date` 가 today 로 이동
    - 화면에 토스트·알림 노출 없음
6. **환경 1 검증 쿼리** —
    ```sql
    select count(*) from sub_issue
     where user_id = auth.uid()
       and status = 'todo'
       and due_date = current_date;
    -- 기대: 기존 today sub + 3 (어제→오늘 이동 분)
    ```
7. **환경 2 진입** — iOS 시뮬레이터에서 앱 부팅 → 로그인 → Life Tab 진입
    - 기대: `carry_over_todos` RPC 호출 1 회 (시도) — 그러나 003 마이그레이션 WHERE 절 (`due_date < current_date AND status = 'todo'`) 매치 row 가 0 이라 **추가 이동 0 건**
    - 토스트·알림 노출 없음
8. **종료 timestamp 기록** — Logs 검색용 종료 시점 메모
9. **Logs 검증** — 위 측정 방법 의 필터로 호출 row 수 확인. 기대: ≤ 2
10. **추가 이동 검증** —
    ```sql
    select count(*) from sub_issue
     where user_id = auth.uid()
       and status = 'todo'
       and due_date = current_date - interval '1 day';
    -- 기대: 0 (모두 이동 완료, 환경 2 가 추가 이동 안 함)
    ```

### 반복 정책

- 위 1 라운드를 **3 회 반복**
- 각 라운드 시작 시 단계 2 (시드 SQL) 재실행 — 직전 라운드에서 어제→오늘 이동된 row 는 다시 어제로 되돌릴 수 없으므로 **새 row 3 개** 추가 적재 (단계 3 검증 쿼리는 매번 3 만 확인)
- 단, 누적되는 today sub 개수는 라운드마다 +3 — 단계 6 의 검증 쿼리 기대값을 누적 반영

### 결과 기록 형식 (task 07 인계용)

```
- 실행일: 2026-MM-DD
- 환경: web=Chrome XX, mobile=iPhone 15 Pro Sim
- 시나리오: 2
- 회차별 RPC 호출 수 (Logs 기준):
  - 1 회: ___ 회 (기대 ≤ 2)
  - 2 회: ___ 회
  - 3 회: ___ 회
- 회차별 추가 이동 row 수 (단계 7 후): 0 / 0 / 0 (기대)
- 토스트·알림 노출: 없음 / 있음 (있으면 회귀)
- 통과/실패: ___
- 비고 / 회귀 분기: ___
```

## 검증 과정

- [ ] 단계 2 시드 SQL 실행 — `due_date = yesterday` row 3 개 적재 확인
- [ ] 환경 1 진입 → 어제 sub 3 개가 today 로 이동 (단계 6 쿼리)
- [ ] 환경 2 진입 → 추가 이동 0 건 (단계 10 쿼리)
- [ ] Supabase Logs `carry_over_todos` 호출 ≤ 2 회 (각 환경 1 회)
- [ ] 양 환경 모두 토스트·알림 노출 0 건
- [ ] 3 회 반복 모두 통과
- [ ] 결과 기록 (위 형식) 을 task 07 인계용으로 준비

## 주의사항

1. **fix 는 sub-01~04 으로 분기** — 멱등성 깨짐, 호출 수 > 2, 추가 이동 발생 등 회귀 발견 시 본 task 에서 fix 하지 않고 task 07 의 회귀 분기 책임으로 인계 (sub-prd-05 §주의사항 3). 후보 분기처: sub-01 (carry-over service / RPC 자체) 또는 sub-02·04 (호출 시점 hook).
2. **클라우드 supabase 의무** — 로컬에서는 003 마이그레이션 검증이 부정확할 수 있음 (sub-prd-05 §주의사항 1).
3. **3 회 반복 의무** — RPC 멱등성은 race condition 영향 받을 수 있음. 단일 실행으로 단정 금지 (sub-prd-05 §주의사항 2).
4. **시드 누적 — 매 라운드 +3** — 직전 라운드에서 어제→오늘 이동된 row 는 today 에 누적. 라운드별 시드를 다시 어제로 되돌리는 SQL 은 본 sub 범위 밖 (테스트 환경의 인위적 시간 시뮬레이션이므로 누적 OK).
5. **Logs 시점 정확도** — Supabase Logs 는 약간의 latency. 시작/종료 timestamp 는 1 분 가량 여유를 두고 검색.
6. **RLS context** — task 01 의 RLS 주의사항 동일 적용. 시드 SQL 은 web/mobile 로그인 후 SQL Editor 에서 `auth.uid()` 가 잡히는지 확인 후 실행.
7. **Realtime echo 는 회귀 아님** — 자기 변경 echo 로 인한 추가 invalidate (sub-prd-05 §주의사항 6).
8. **별도 결과 파일 신설 금지** — 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 책임).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §시나리오 2, §핵심 구현 로직 §시간 시뮬레이션, §주의사항 1·2·3·6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `carry_over_todos` 클라이언트 호출 hook
- `supabase/migrations/003_carry_over_todos.sql` — 자동 이월 RPC SoT (멱등성 WHERE 절)
- [`./tasks-05-01-prepare-seed-data.md`](./tasks-05-01-prepare-seed-data.md) §Step 3 — 어제 시드 SQL
