# TASK-05-01: 클라우드 Supabase 시드 데이터 준비 (분류 2 / Epic 3 / Sub 10 + 자동 이월용 어제 시드)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 01
- **상태**: 대기중
- **의존성**: (없음) — sub-01~04 의 마이그레이션·서비스 코드는 이미 머지된 상태가 전제

## 작업 목표

후속 시나리오 1~5 의 공통 전제인 시드 데이터를 클라우드 Supabase 프로젝트(preview 또는 production)에 1회 일괄 투입한다. 동시에 시나리오 2 (자동 이월) 가 사용할 "어제 미완료" sub 시드 SQL 도 함께 준비해 본 task 에서 모든 사전 데이터를 제공한다.

통과 기준 (정량):

- 분류 2 개 (`life`, `work` 영역 각 1 개씩) 가 `category` 테이블에 row 로 존재
- Epic 3 개 (분류별 1~2 개 분포 — 시나리오 3 디바운스 검증을 위해 동일 epic 에 sub 5 개 이상 묶일 수 있어야 함) 가 `epic` 테이블에 row 로 존재
- 일반 Sub 10 개 (오늘 / 미래 / 과거 status=done 혼합) 가 `sub_issue` 테이블에 row 로 존재
- 자동 이월 시뮬레이션용 sub 3 개 (`due_date = current_date - interval '1 day'`, `status = 'todo'`) 가 별도로 존재 — 시나리오 2 실행 직전에 다시 적재 가능한 SQL 스니펫을 본 task 산출물로 보존

## 상세 구현 내용

> 본 task 는 코드 작성이 아니라 **SQL 실행 + 결과 검증** 이 산출물. 실행은 Supabase Dashboard → SQL Editor 에서 직접 수행하거나 `psql` 로 클라우드 인스턴스에 접속해 수행한다.

### Step 1: 환경 준비

1. 클라우드 Supabase 프로젝트(preview 또는 production)에 web 으로 1 회 로그인 → `auth.users` 에 본 시드의 owner 가 될 사용자가 존재함을 보장
2. SQL Editor 에서 `select auth.uid();` 가 NULL 이 아님을 확인 (RLS context 가 잡혀야 함 — 주의사항 1 참조)
3. 본 task 의 산출물은 `docs/dev/20260502-02-todo-list-initialize/tasks/tasks-05-01-prepare-seed-data.md` (본 파일) 에 SQL 을 그대로 보존 — **별도 SQL 파일 신설 금지** (sub-prd-05 §주의사항 7 정합 — SoT 는 본 sub-prd 와 task 파일)

### Step 2: 분류·Epic·일반 Sub 시드 SQL

```sql
-- 1. 분류 2 개
insert into category (user_id, name, area, color)
values
  (auth.uid(), '개인 일상', 'life',  '#3B82F6'),
  (auth.uid(), '회사 업무', 'work',  '#10B981')
returning id, name, area;

-- 2. Epic 3 개 (분류별 분포 — 시나리오 3 검증용으로 1 개 epic 에 sub 5 개 묶임)
--    아래 ?life_id, ?work_id 는 Step 2 의 returning 결과를 변수로 치환
insert into epic (user_id, category_id, title, is_visible)
values
  (auth.uid(), '?life_id', '운동 습관',     true),
  (auth.uid(), '?life_id', '독서 습관',     true),
  (auth.uid(), '?work_id', 'Q2 OKR',       true)
returning id, title;

-- 3. 일반 Sub 10 개 (오늘 / 미래 / 과거 done 혼합 + 시나리오 3 의 5 개 동일 epic 묶음 포함)
--    ?epic_운동, ?epic_독서, ?epic_okr 는 Step 2 의 returning 결과를 변수로 치환
insert into sub_issue (user_id, epic_id, title, status, due_date)
values
  -- 시나리오 3 디바운스 검증용 (동일 epic '운동 습관' 에 5 개)
  (auth.uid(), '?epic_운동', '스쿼트 30 회',  'todo', current_date),
  (auth.uid(), '?epic_운동', '런닝 3km',      'todo', current_date),
  (auth.uid(), '?epic_운동', '플랭크 1 분',   'todo', current_date),
  (auth.uid(), '?epic_운동', '스트레칭 10 분','todo', current_date),
  (auth.uid(), '?epic_운동', '단백질 섭취',   'todo', current_date),
  -- 일반 분포
  (auth.uid(), '?epic_독서', '소설 30p',     'todo', current_date),
  (auth.uid(), '?epic_독서', '기술서 1 장',  'todo', current_date + interval '1 day'),
  (auth.uid(), '?epic_okr',  '주간 보고 작성','todo', current_date),
  (auth.uid(), '?epic_okr',  'OKR 회의 준비','done', current_date - interval '2 day'),
  (auth.uid(), '?epic_okr',  '코드 리뷰 3 건','todo', current_date + interval '2 day');
```

### Step 3: 자동 이월 시뮬레이션용 시드 SQL (시나리오 2 직전에 재실행)

```sql
-- 시나리오 2 (자동 이월) 직전 1 회 실행 — 시나리오 1 회 반복마다 다시 적재
-- ?epic_운동 자리에는 Step 2 의 epic id 를 치환 (또는 임의 epic)
insert into sub_issue (user_id, epic_id, title, status, due_date)
values
  (auth.uid(), '?epic_운동', '어제 미완료 1', 'todo', current_date - interval '1 day'),
  (auth.uid(), '?epic_운동', '어제 미완료 2', 'todo', current_date - interval '1 day'),
  (auth.uid(), '?epic_운동', '어제 미완료 3', 'todo', current_date - interval '1 day');
```

### Step 4: 시드 검증 쿼리

```sql
-- 카운트 확인
select 'category' as t, count(*) from category where user_id = auth.uid()
union all
select 'epic',    count(*) from epic    where user_id = auth.uid()
union all
select 'sub_issue', count(*) from sub_issue where user_id = auth.uid();
-- 기대: category 2 / epic 3 / sub_issue 10 (자동 이월 SQL 미실행 기준)
```

### Step 5: clean-up 정책

- 시드 데이터는 시나리오 5종 종료까지 **유지**한다 (시나리오 4 회귀를 위해 보존 필요)
- 시나리오 종료 후 정리는 본 task 가 아닌 **시나리오 7 (task 07 합본)** 의 책임 영역. 본 task 는 정리 SQL 까지 책임지지 않음

## 검증 과정

- [ ] 클라우드 Supabase SQL Editor 에서 Step 2 SQL 3 블록 모두 성공 실행 (returning row 3 / 3 / 10)
- [ ] Step 3 의 자동 이월용 SQL 도 성공 실행 — sub_issue 13 row 로 증가 확인
- [ ] Step 4 검증 쿼리 결과가 기대치와 일치 (category 2 / epic 3 / sub_issue 13 — 어제 시드 포함 시)
- [ ] 본 task 파일이 SQL 의 SoT — 사용자가 다시 실행 가능한 형태로 보존
- [ ] RLS 정책 위반 없이 모든 insert 성공 (`auth.uid()` 컨텍스트 정상)

## 주의사항

1. **RLS context 의무** — Supabase SQL Editor 의 기본 사용자는 `service_role` 일 수 있어 `auth.uid()` 가 NULL. 이 경우 web 이나 mobile 에서 1 회 로그인 후 `Authenticated` SQL Editor 모드 또는 `set local request.jwt.claims = ...` 로 컨텍스트 주입 필요. 또는 web/mobile 클라이언트의 폼을 통해 시드를 만드는 우회 가능 — 단, returning id 수집이 어려움.
2. **클라우드 인스턴스 의무** — 로컬 supabase 는 본 sub 의 검증 대상이 아님 (sub-prd-05 §주의사항 1). 본 task 의 SQL 은 반드시 클라우드(preview/production)에서 실행.
3. **자동 이월 시드는 매 반복마다 재적재** — 시나리오 2 가 3 회 반복인데 매 회 RPC 가 어제→오늘 이동을 수행하므로 다음 반복 전 Step 3 SQL 재실행 필요. task 03 본문에서 본 task 의 Step 3 를 참조.
4. **id 치환 자동화 안 함** — Step 2 의 returning id 를 Step 3 SQL 의 `?epic_*` 자리에 수동 치환. 본 검증 단계에서는 자동화 가치 < 단순성.
5. **시드 정리는 task 07 책임** — 본 task 는 적재만. 정리는 시나리오 종료 후 task 07 합본에서 수행하거나 차기 sprint 로 위임.
6. **Sub-prd-05 §시간 시뮬레이션 정합** — Step 3 SQL 은 sub-prd-05 §핵심 구현 로직 §시간 시뮬레이션 의 SQL 과 동일 의도. 시점이 바뀌어도 본 task 의 SQL 이 SoT.
7. **본 sub 는 fix 책임 없음** — 시드 SQL 자체에 회귀가 발견되면 (예: RLS 정책 누락) sub-01 의 task 로 분기 (sub-prd-05 §주의사항 3 정합).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §핵심 구현 로직 §시간 시뮬레이션, §주의사항 1·3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — 시드의 RLS 정책 SoT
- `supabase/migrations/` — `001_initial_schema.sql` (테이블 정의), `003_carry_over_todos.sql` (자동 이월 RPC), `004_recalc_epic_progress.sql` (디바운스 RPC)
