# TASK-05-05: 시나리오 4 — CRUD 회귀 (web ↔ mobile 양 갈래 + FK 친화 토스트 + 계정 격리)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md)
- **작업 번호**: 05
- **상태**: 대기중
- **의존성**: 01 (시드)

## 작업 목표

분류·Epic·Sub 의 생성·수정·삭제·토글 전 흐름을 web ↔ mobile 양 갈래로 회귀 검증한다. 분류 삭제 시 FK 위반(23503) 친화 토스트가 양 환경에서 동일하게 노출되고, 로그아웃 → 다른 계정 로그인 시 이전 캐시가 잔존하지 않음을 확인한다.

통과 기준 (정량):

- web/mobile 양쪽에서 분류·Epic·Sub CRUD 일관 동작 (한 쪽에서 만든 데이터를 다른 쪽에서 수정/삭제 가능)
- 분류 삭제 시 FK 친화 토스트 노출 (양 환경 동일 카피·동일 동작)
- 로그아웃 → 다른 계정 로그인 시 이전 데이터 잔존 row 0 건 (메인 뷰 / 분류 / Epic 모두)

## 상세 구현 내용

### 사전 환경

| 항목 | 값 |
|---|---|
| 환경 1 (web) | Chrome → 계정 A 로그인 |
| 환경 2 (mobile) | iOS 시뮬레이터 → 계정 A 로그인 |
| 계정 B | 단계 5·6 의 계정 격리 검증용 (별도 Google OAuth 계정 필요) |
| 시드 | task 01 결과물 (계정 A 의 분류 2 / Epic 3 / sub 10) |

### 재현 단계

#### 단계 1: web 단독 CRUD 회귀 (환경 1)

| # | 동작 | 기대 |
|---|---|---|
| 1.1 | 설정 → 분류 관리 → "+" → "테스트 분류 W" 생성 (color = #EF4444) | category insert + 목록 갱신 |
| 1.2 | 위 분류의 더보기 → 수정 → 이름 변경 → 저장 | category update + 목록 갱신 |
| 1.3 | 설정 → Epic 관리 → "+" → "테스트 Epic W" 생성 (분류 = "테스트 분류 W") | epic insert + 목록 갱신 |
| 1.4 | Epic 상세 더보기 → 수정 → 분류 변경 → 저장 | epic update |
| 1.5 | Life Tab → FAB → Sub 생성 ("테스트 Sub W", 분류·epic 위 항목 선택) | sub insert + 메인 갱신 |
| 1.6 | Sub 본문 탭 → 수정 모달 → 제목 변경 → 저장 | sub update |
| 1.7 | Sub 체크박스 토글 → 완료/진행중 이동 (즉시 optimistic) | sub status toggle |
| 1.8 | Sub 삭제 (TodoDetailModal 삭제 → confirm) | sub delete |
| 1.9 | Epic 삭제 (Epic 관리 → 더보기 → 삭제 → confirm) | epic delete |
| 1.10 | 분류 삭제 (분류 관리 → 더보기 → 삭제 → confirm) | category delete (해당 분류에 epic 없으므로 성공) |

#### 단계 2: mobile 단독 CRUD 회귀 (환경 2)

위 1.1 ~ 1.10 동일 흐름을 mobile UI 에서 반복 (분류명 suffix 를 "M" 으로 구분: "테스트 분류 M", "테스트 Epic M", "테스트 Sub M")

#### 단계 3: 양 갈래 cross-device 수정

| # | 동작 | 기대 |
|---|---|---|
| 3.1 | 환경 1 (web) 에서 "cross 분류" 생성 | category insert |
| 3.2 | 환경 2 (mobile) 에서 1~2 초 후 "cross 분류" 등장 확인 | Realtime 반영 |
| 3.3 | 환경 2 (mobile) 에서 "cross 분류" 이름 수정 → 저장 | category update |
| 3.4 | 환경 1 (web) 에서 1~2 초 후 변경 반영 확인 | Realtime 반영 |
| 3.5 | 환경 1 에서 "cross 분류" 삭제 (epic 없음) → 환경 2 에서도 1~2 초 후 사라짐 | Realtime 반영 |

#### 단계 4: FK 위반 친화 토스트

| # | 동작 | 기대 |
|---|---|---|
| 4.1 | 환경 1 에서 "fk 분류" 생성 | category insert |
| 4.2 | 환경 1 에서 "fk Epic" 생성 (분류 = "fk 분류") | epic insert |
| 4.3 | 환경 1 에서 "fk 분류" 삭제 시도 | FK 위반 (23503) → "이 분류에 연결된 Epic 이 있어 삭제할 수 없습니다" 류 친화 토스트 노출 |
| 4.4 | 환경 2 에서 동일 시도 | 동일 카피·동일 동작 (작은 디자인 차이는 허용, 메시지·차단은 동일) |
| 4.5 | 정리: "fk Epic" 먼저 삭제 → "fk 분류" 삭제 가능 확인 | 모두 삭제 |

#### 단계 5: 로그아웃 → 다른 계정 로그인 (계정 격리)

| # | 환경 | 동작 | 기대 |
|---|---|---|---|
| 5.1 | 환경 1 | 설정 → 로그아웃 | 로그인 화면 복귀 |
| 5.2 | 환경 1 | 계정 B 로 로그인 | 빈 메인 뷰 (계정 B 의 데이터 — 시드 안 됨이라 0 건이 정상) |
| 5.3 | 환경 1 | 분류 관리 / Epic 관리 / Life·Work Tab 모두 진입 | 어느 곳에서도 계정 A 의 시드 데이터가 보이지 않음 (잔존 0 건) |
| 5.4 | 환경 1 | DevTools → Application → IndexedDB / LocalStorage 확인 | 이전 계정의 query cache key 가 남아 있더라도 화면에 노출은 없음. 노출되면 회귀. |

#### 단계 6: mobile 계정 격리

| # | 동작 | 기대 |
|---|---|---|
| 6.1 | 환경 2 → 설정 → 로그아웃 | 로그인 화면 복귀 |
| 6.2 | 환경 2 → 계정 B 로 로그인 | 빈 메인 뷰 |
| 6.3 | Life Tab / Work Tab / 설정 진입 | 계정 A 의 데이터 잔존 0 건 |

### 결과 기록 형식 (task 07 인계용)

```
- 실행일: 2026-MM-DD
- 환경: web=Chrome XX, mobile=iPhone 15 Pro Sim
- 시나리오: 4
- 단계별 통과/실패:
  - 단계 1 web 단독 CRUD: ___ (1.1~1.10 항목별 표시)
  - 단계 2 mobile 단독 CRUD: ___
  - 단계 3 cross-device: ___
  - 단계 4 FK 친화 토스트 (web): ___
  - 단계 4 FK 친화 토스트 (mobile): ___
  - 단계 5 web 계정 격리: ___
  - 단계 6 mobile 계정 격리: ___
- 통과/실패: ___
- 비고 / 회귀 분기: ___
```

## 검증 과정

- [ ] web 단독 CRUD 10 개 단계 모두 통과
- [ ] mobile 단독 CRUD 10 개 단계 모두 통과
- [ ] cross-device 양방향 5 개 단계 모두 통과
- [ ] 분류 FK 위반 친화 토스트가 양 환경 동일 노출
- [ ] 로그아웃 → 계정 B 로그인 시 web 잔존 0 건
- [ ] 로그아웃 → 계정 B 로그인 시 mobile 잔존 0 건
- [ ] 결과 기록 (위 형식) 을 task 07 인계용으로 준비

## 주의사항

1. **fix 는 sub-01~04 으로 분기** — CRUD 한쪽 동작 누락, FK 토스트 미노출, 캐시 잔존 등 회귀는 본 task 에서 fix 하지 않고 task 07 의 회귀 분기 책임으로 인계 (sub-prd-05 §주의사항 3). 후보 분기처: sub-02·03 (web 폼·토스트), sub-04 (mobile 폼·토스트), sub-01 (services).
2. **클라우드 supabase 의무** — 계정 격리는 RLS 가 클라우드에서 정확히 적용되어야 검증 가능 (sub-prd-05 §주의사항 1).
3. **양 갈래 동시 동작 — 정성 측정** — "양 갈래 동기화 일관성 100%" 는 정성 부분이 있어 관찰자 편향 가능. 단계 3 의 5 개 항목을 명확히 체크.
4. **계정 B 사전 준비** — 별도 Google 계정 + Supabase Dashboard redirect URI 화이트리스트 등록 필요. 미준비 시 단계 5·6 skip + 별도 plan 으로 분리 (단, 본 task 의 통과 조건 미달).
5. **계정 격리 회귀의 위험** — 잔존 발생 시 RLS 누락이거나 `queryClient.clear()` 누락 — 즉시 task 07 분기 후 sub-01·02·04 의 logout helper / queryClient 수명 부분 보강.
6. **Realtime echo 는 회귀 아님** — 자기 변경 echo 로 인한 추가 invalidate (sub-prd-05 §주의사항 6).
7. **3 회 반복 비대상** — 본 시나리오는 functional 회귀가 본질이라 1 회 통과로 충분 (sub-prd-05 §작업 5 명시 — "양 갈래" 만 명시, 반복 횟수 무관).
8. **별도 결과 파일 신설 금지** — 결과는 sub-prd-05 §회귀 시나리오 결과 표에 row 추가 (task 07 책임).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-05-test-integration-multi-device.md`](../sub-prd-05-test-integration-multi-device.md) §시나리오 4, §주의사항 1·3·5·6
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — web 메인 뷰
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) — web 분류·Epic 관리 + FK 토스트
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) — mobile CRUD
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — services / queryClient 수명
