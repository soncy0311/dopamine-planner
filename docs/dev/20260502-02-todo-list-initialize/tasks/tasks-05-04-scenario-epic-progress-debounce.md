# TASK-05-04: 시나리오 3 — Epic 진행률 디바운스 (`recalc_epic_progress`, 5 토글 → 1~2 호출, 5 회 반복)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 04
- **상태**: 대기중
- **의존성**: 01 (시드 — 동일 epic 에 sub 5 개)

## 작업 목표

동일 epic 의 sub 5 개를 200ms 미만 간격으로 빠르게 토글했을 때, `recalc_epic_progress` RPC 호출이 **1~2 회로 합쳐짐** 을 검증한다. 5 회 반복으로 일관성 확보.

통과 기준 (정량):

- Supabase Logs 에 timestamp 범위 내 `recalc_epic_progress` 호출 row 수 **1~2** (5 회 토글 대비)
- Epic 진행률 최종값이 마지막 토글 상태와 정확히 일치 (예: 5 개 모두 done → 100%)
- 환경 2 (mobile) 에 변경된 진행률이 **1~2 초 내** 반영 (Realtime broadcast)
- 5 회 반복 모두 호출 수 1~2 + 진행률 정확

## 상세 구현 내용

### 사전 환경

| 항목 | 값 |
|---|---|
| 환경 1 (web) | `make web-up` → Chrome → 로그인 |
| 환경 2 (mobile) | `make mobile-dev` → iOS 시뮬레이터 → 로그인 (진행률 broadcast 수신용) |
| Supabase | 클라우드 인스턴스 |
| 시드 | task 01 §Step 2 의 `?epic_운동` epic + 5 개 sub (오늘 due_date) |
| Logs | Supabase Dashboard → Logs → Postgres |

### 측정 방법 (Logs 호출 횟수)

```
Supabase Dashboard → Logs → Postgres
필터: query ilike '%recalc_epic_progress%'
시점: 시나리오 시작 직전 ~ 종료 직후 timestamp 범위
기대 호출 수: 1~2 (5 회 토글이 디바운스로 1~2 회로 합쳐짐)
```

### 재현 단계 (1 라운드)

1. **사전 정리** — `?epic_운동` epic 의 5 개 sub 가 모두 `status = 'todo'` 로 시작 확인
    ```sql
    select id, title, status from sub_issue
     where user_id = auth.uid() and epic_id = '?epic_운동'
     order by created_at;
    -- 기대: 5 row, 모두 status = 'todo'
    ```
2. **시작 timestamp 기록**
3. **환경 1 빠른 토글** — Life Tab 에서 `?epic_운동` 의 5 개 sub 체크박스를 **200ms 미만 간격** 으로 순차 탭
    - 추천: 마우스 클릭으로 빠르게 5 회 (또는 키보드 단축 사용 가능 시)
    - 모든 sub 가 done 상태가 됨
4. **종료 timestamp 기록**
5. **Epic 진행률 검증** —
    ```sql
    select id, title, progress from epic
     where user_id = auth.uid() and id = '?epic_운동';
    -- 기대: progress = 100 (5/5 done)
    ```
    또는 web/mobile UI 의 EpicProgressBar 가 100% 표시
6. **Logs 검증** — `recalc_epic_progress` 호출 row 수 ≤ 2 확인
7. **환경 2 (mobile) 진행률 반영 확인** — iOS 시뮬레이터 의 EpicProgressBar 가 1~2 초 내 100% 로 갱신
8. **반대 토글로 복원** — 환경 1 에서 5 개 sub 를 다시 모두 todo 로 토글 (다음 라운드 사전 정리)

### 반복 정책

- 위 1 라운드를 **5 회 반복**
- 각 라운드 종료 시 단계 8 로 5 개 sub 모두 todo 로 복원
- 라운드별 호출 수 + 최종 progress 값 기록

### 결과 기록 형식 (task 07 인계용)

```
- 실행일: 2026-MM-DD
- 환경: web=Chrome XX, mobile=iPhone 15 Pro Sim
- 시나리오: 3
- 회차별 호출 수 (Logs 기준):
  - 1 회: ___ 회 (기대 1~2)
  - 2 회: ___ 회
  - 3 회: ___ 회
  - 4 회: ___ 회
  - 5 회: ___ 회
- 회차별 epic 진행률 최종값: 100 / 100 / 100 / 100 / 100 (기대)
- 회차별 환경 2 반영 지연: ___ ms / ___ ms / ___ ms / ___ ms / ___ ms (기대 ≤ 2000ms)
- 통과/실패: ___
- 비고 / 회귀 분기: ___
```

## 검증 과정

- [ ] 시드된 5 개 sub 가 동일 epic 묶음으로 존재 확인
- [ ] 5 회 빠른 토글 후 `recalc_epic_progress` 호출 1~2 회로 합쳐짐
- [ ] Epic 진행률 최종값이 정확 (5/5 → 100%)
- [ ] 환경 2 (mobile) 의 진행률 1~2 초 내 반영
- [ ] 5 회 반복 모두 통과
- [ ] 결과 기록 (위 형식) 을 task 07 인계용으로 준비

## 주의사항

1. **fix 는 sub-01~04 으로 분기** — 호출 수 > 2 (디바운스 불완전) 또는 진행률 부정확 등 회귀는 본 task 에서 fix 하지 않고 task 07 의 회귀 분기 책임으로 인계 (sub-prd-05 §주의사항 3). 후보 분기처: sub-01 (epic-progress service / 디바운스 hook 또는 trigger).
2. **클라우드 supabase 의무** — 로컬에서는 trigger / publication 동작이 다를 수 있음 (sub-prd-05 §주의사항 1).
3. **5 회 반복 의무** — 디바운스는 timing 의존이라 단일 실행으로 단정 금지 (sub-prd-05 §주의사항 2).
4. **200ms 미만 간격** — 마우스 클릭이 충분히 빠르지 않으면 디바운스 윈도우 밖으로 떨어져 호출이 분산될 수 있음. 가능한 한 빠르게 (또는 키보드 / 스크립트 보조).
5. **호출 1 회 vs 2 회 모두 통과** — 디바운스 윈도우와 토글 시점에 따라 1 회 (모두 합쳐짐) 또는 2 회 (마지막 1 개가 분리) 모두 정상. 3 회 이상은 회귀.
6. **Realtime echo 는 회귀 아님** — 자기 변경 echo 로 인한 추가 invalidate (sub-prd-05 §주의사항 6).
7. **단계 8 복원이 다음 라운드의 시드** — 복원 자체도 토글 → 호출이 발생하지만 Logs 측정 timestamp 범위 밖. 측정 시 시작/종료 timestamp 명확히 분리.
8. **별도 결과 파일 신설 금지** — 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 책임).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §시나리오 3, §핵심 구현 로직 §디바운스 검증, §주의사항 1·2·3·6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — Epic progress 디바운스 hook
- `supabase/migrations/004_recalc_epic_progress.sql` — Epic 진행률 RPC + 디바운스 trigger SoT
