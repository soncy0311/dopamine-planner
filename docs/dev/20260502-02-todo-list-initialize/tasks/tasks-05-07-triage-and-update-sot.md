# TASK-05-07: 회귀 분기 + sub-prd-05 결과 표 row 추가 + main-prd 회귀 SoT 진입점 참조

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 07
- **상태**: 대기중
- **의존성**: 02 / 03 / 04 / 05 / 06 (시나리오 1~5 결과 모두 수집 완료 후)

## 작업 목표

시나리오 1~5 task 들이 수집한 결과를 (a) sub-01~04 의 적절한 task 로 회귀 분기, (b) sub-prd-05 §회귀 시나리오 결과 표에 row 누적, (c) main-prd 의 적절한 위치에 본 sub-prd 가 회귀 SoT 임을 한 줄 참조 — 세 가지 "사후 정리" 책임을 단일 task 로 합본 수행.

본 task 가 종료되면 본 sub-05 의 §작업 9 개가 모두 닫힘 + 본 sub 의 통과 / 미통과가 SoT 형태로 보존됨.

통과 기준 (정량):

- 발견된 회귀가 sub-01~04 의 적절한 task 파일(또는 새 task 신설) 로 모두 분기 — 본 task 에서 직접 fix 하지 않음
- sub-prd-05 §회귀 시나리오 결과 표에 시나리오 1~5 의 결과 row 5 개 (또는 라운드별 분리 시 더 많이) 추가 — 기존 빈 표의 (TBD) row 들을 실데이터로 채움
- main-prd 의 적절한 섹션 (§Sub-PRD 구조 또는 §검증 섹션) 에 "회귀 SoT 진입점은 sub-prd-05" 한 줄 참조 추가 (이미 §Sub-PRD 구조 표 282 행에 sub-05 가 등장하므로 새 추가 위치는 하단 §검증 또는 §리스크 섹션)

## 상세 구현 내용

### 사전 입력

- task 02 의 결과 기록 (시나리오 1, 3 회 평균 지연 + 양 갈래 일관성)
- task 03 의 결과 기록 (시나리오 2, 호출 ≤ 2 + 추가 이동 0)
- task 04 의 결과 기록 (시나리오 3, 호출 1~2 회 + 진행률 정확)
- task 05 의 결과 기록 (시나리오 4, web/mobile/cross/FK/계정 격리)
- task 06 의 결과 기록 (시나리오 5, 산출물 부팅 + deep link + 시나리오 1~4 핵심 재현)

### Step 1: 회귀 분기 (§작업 7)

#### 분기 매핑 가이드

| 발견 회귀 유형 | 책임 sub | 후보 task 파일 |
|---|---|---|
| 시나리오 1 — Realtime 지연 > 3 초 | sub-01 (services) | tasks-01-13-implement-subscribe-todos.md |
| 시나리오 1 — 한쪽만 반영 / publication 누락 | sub-01 또는 DB | supabase/migrations/005 + sub-01 services |
| 시나리오 2 — 호출 > 2 회 | sub-02·04 (메인 뷰의 호출 시점) 또는 sub-01 (carry-over hook) | tasks-01-06-implement-carry-over-service.md / tasks-02-08 / tasks-04-* |
| 시나리오 2 — 멱등 깨짐 (추가 이동 발생) | DB 003 마이그레이션 WHERE 절 | supabase/migrations/003 (DB PRD 책임) |
| 시나리오 2 — 토스트·알림 노출 | sub-02·04 (조용한 이월 정책 어긋남) | tasks-02-08 / tasks-04-* |
| 시나리오 3 — 호출 > 2 회 | sub-01 (디바운스 hook) 또는 DB 004 | tasks-01-07-implement-epic-progress-service.md / supabase/migrations/004 |
| 시나리오 3 — 진행률 부정확 | DB 004 RPC 또는 sub-01 mapping | tasks-01-02-implement-domain-mappers.md / migrations/004 |
| 시나리오 4 — web CRUD 누락 | sub-02·03 | tasks-02-* / tasks-03-* |
| 시나리오 4 — mobile CRUD 누락 | sub-04 | tasks-04-* |
| 시나리오 4 — FK 토스트 누락 | sub-03 (web) / sub-04 (mobile) | tasks-03-03-create-fk-error-toast.md / tasks-04-* |
| 시나리오 4 — 계정 격리 깨짐 (캐시 잔존) | sub-01 (queryClient.clear) / sub-03·04 (logout helper) | tasks-01-* / tasks-03-11 / tasks-04-04 |
| 시나리오 5 — 산출물 부팅 실패 | sub-04 (Expo / EAS 설정) | tasks-04-15-verify-build-and-eas.md |
| 시나리오 5 — deep link 미수신 | sub-04 (`app.json` scheme + Supabase redirect URI) | tasks-04-* |

#### 분기 실행

- 위 매핑에 따라 발견된 회귀 한 건당 1 row 분기 기록 (본 task 파일 §회귀 분기 기록 섹션 또는 sub-prd-05 §회귀 시나리오 결과 표의 "비고 (분기 sub)" 컬럼에 분기처 명시)
- 분기 시 처리:
  1. 후보 task 파일이 이미 존재 + 해당 회귀가 그 task 의 검증 항목 일부라면 → 해당 task 의 "검증 과정" 체크박스 보강 + 본 sub-prd 의 결과 표에 분기처 기록
  2. 후보 task 파일에 없는 새로운 변경 필요 → sub-XX 폴더 (또는 동일 tasks/ 폴더) 에 새 task 파일 신설 (`tasks-XX-NN-fix-{name}.md`)
  3. fix 자체는 본 task 책임 아님 — 분기 기록까지만

### Step 2: sub-prd-05 결과 표 row 추가 (§작업 8)

`docs/dev/20260502-02-todo-list-initialize/sub-prd-05-test-integration-multi-device.md` 의 §회귀 시나리오 결과 표 (140~148 행) 의 (TBD) row 5 개를 실측 데이터로 갱신 + 회차별 분리가 필요하면 row 추가:

```md
| 실행일 | 환경 | 시나리오 | 통과/실패 | 비고 (분기 sub) |
|---|---|---|---|---|
| 2026-MM-DD | web=Chrome XX / mobile=iPhone 15 Pro Sim | 1 | 통과 / 실패 | (분기처 또는 — ) |
| 2026-MM-DD | 동일 | 2 | 통과 / 실패 | ... |
| 2026-MM-DD | 동일 | 3 | 통과 / 실패 | ... |
| 2026-MM-DD | 동일 | 4 | 통과 / 실패 | ... |
| 2026-MM-DD | 산출물=preview .ipa / 디바이스=iPhone 15 Pro Sim | 5 | 통과 / 실패 | ... |
```

- 시나리오 1·3 처럼 다회 반복 결과를 별도 row 로 보존하고 싶으면 row 5 → 5 + (반복 회차) 만큼 늘림
- 통과/실패 판정 기준은 각 시나리오 task 의 §검증 과정 체크박스가 모두 체크되었는지로
- 본 sub-prd 파일이 SoT 이므로 **별도 결과 파일 신설 금지** (sub-prd-05 §주의사항 7 정합)

### Step 3: main-prd 의 회귀 SoT 진입점 참조 추가 (§작업 9)

`docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md` 의 적절한 섹션에 다음 한 줄 추가:

> 회귀 시나리오 SoT — [`sub-prd-05-test-integration-multi-device.md`](./sub-prd-05-test-integration-multi-device.md) §회귀 시나리오 결과. 향후 sprint 에서 동일 시나리오 재실행 시 row 누적.

- 위치 후보: §검증 섹션 (있다면) 또는 §리스크 섹션 또는 §Sub-PRD 구조 표 직후 1 행 인용
- 추가 후 main-prd 의 다른 섹션과 충돌·중복 없는지 확인 (이미 282 행에 sub-05 한 줄 등장하므로 본 추가는 그와 별개로 "회귀 검증 진입점" 으로 명시)

### Step 4: 본 task 자체에 회귀 분기 기록 보존

본 task 파일 하단 (또는 별도 §회귀 분기 기록 섹션) 에 분기 결과를 짧게 기록:

```md
## 회귀 분기 기록 (실행 시 채움)

| # | 시나리오 | 발견 회귀 (요약) | 분기처 (sub / task) | 후속 처리 상태 |
|---|---|---|---|---|
| 1 | 1 | (예: web→mobile 지연 4 초) | sub-01 / tasks-01-13 | 새 fix task 작성 필요 |
| ... | ... | ... | ... | ... |
```

- 발견 회귀가 0 건이면 row 0 + "발견 회귀 없음" 단문 보존

## 검증 과정

- [ ] 시나리오 1~5 의 결과 기록 5 종을 모두 수집
- [ ] 각 시나리오에서 발견된 회귀를 sub-01~04 의 적절한 task / DB 마이그레이션 으로 분기 (Step 1 매핑 가이드 사용)
- [ ] sub-prd-05 §회귀 시나리오 결과 표의 (TBD) row 5 개를 실측 데이터로 갱신
- [ ] main-prd 에 회귀 SoT 진입점 한 줄 참조 추가
- [ ] 본 task 파일 §회귀 분기 기록 섹션에 분기 결과 표 채움
- [ ] 본 task 가 fix 를 직접 수행하지 않았음 (sub-prd-05 §주의사항 3 준수) — fix 는 모두 분기처 task 에서 별도 plan 으로 수행

## 주의사항

1. **회귀 분기 — fix 는 본 task 책임 없음** — 본 task 는 회귀를 적절한 위치로 옮기는 것까지 (sub-prd-05 §주의사항 3 정합). 분기처에서의 fix 는 별도 plan + 별도 task.
2. **결과 표 — 본 sub-prd 가 SoT** — 별도 결과 파일 / 별도 디렉토리 신설 금지 (sub-prd-05 §주의사항 7).
3. **main-prd 추가는 1 줄로 한정** — main-prd 본문 구조를 흐트리지 않도록 단일 줄 인용. 위치는 §검증 또는 §리스크 직후 1 줄.
4. **반복 결과 보존 정책** — 시나리오 1·3 의 회차별 결과를 모두 row 로 보존할지, 평균만 보존할지는 본 task 시점에 사용자 합의. 평균만 보존 시 §회귀 분기 기록 표에 회차별 raw 값 보관.
5. **클라우드 supabase 의무** — 결과 표 row 의 환경 컬럼에 "클라우드 인스턴스 (preview / production 명시)" 도 함께 기록 — 향후 재실행 시 비교 가능하게.
6. **분기처 task 가 없는 경우** — Step 1 매핑 가이드의 후보가 모두 부재 (예: 새로운 회귀 유형) → 새 task 파일 신설 (`tasks-XX-NN-fix-{name}.md`). 본 task 는 그 신설까지 포함.
7. **본 task 종료 = sub-05 §작업 9 개 모두 닫힘** — 본 task 통과 후 sub-prd-05 §작업 체크리스트 9 개 항목을 모두 [x] 로 갱신 (옵션 — 사용자 합의 시).
8. **별도 결과 파일 신설 금지** — Step 2 의 row 추가는 sub-prd-05 본문 인-place 갱신.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md) — Step 3 갱신 대상
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) — Step 2 갱신 대상 (§회귀 시나리오 결과 표)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — 회귀 분기 후보
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — 회귀 분기 후보
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) — 회귀 분기 후보
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) — 회귀 분기 후보
- [`./tasks-05-02-scenario-realtime-sync.md`](./tasks-05-02-scenario-realtime-sync.md) ~ [`./tasks-05-06-scenario-eas-build-artifact.md`](./tasks-05-06-scenario-eas-build-artifact.md) — 입력
