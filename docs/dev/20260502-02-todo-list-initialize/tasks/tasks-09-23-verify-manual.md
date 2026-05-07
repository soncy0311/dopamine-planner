# TASK-09-23: 수동 검증 — sub-prd-09 §수동 시나리오 9건

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 23
- **상태**: 대기중
- **의존성**: TASK-09-22 (자동 검증 통과 후)

## 작업 목표

sub-prd-09 §검증 기준 §수동 의 9 시나리오 + §회귀 0건 항목을 web / mobile 양쪽에서 통과 확인한다. 본 task 는 코드 변경 0건 (검증 + 보고).

## 상세 구현 내용

### 수동 시나리오 (web)

| # | 시나리오 | 통과 기준 |
|---|---|---|
| 1 | 홈 FAB → `EpicFormModal` 진입 | sub_issue 직접 생성 진입점 부재 |
| 2 | EpicFormModal 분류 자유 입력 → 신규 분류 즉시 생성 → 저장 | list 갱신 + toast 정합 |
| 3 | Epic 카드 펼침 → "+ 서브 이슈 추가" → SubIssueFormModal → 저장 | 해당 epic 안에 sub 추가 |
| 4 | 등록일이 이전인 미완료 sub 가 다음 일자 진입 시 자동 이월 | `registered_date` 갱신 + `carry_over_count++` + sub-prd-06 `+N` 뱃지 |
| 5 | 마지막 분류 참조 sub / epic 삭제 | DB trigger 동작 → 분류 자동 삭제 |
| 6 | 다른 user 의 sub / epic 삭제 | 본인 분류에 영향 0 (RLS scoping) |
| 7 | 설정 페이지 — 4 섹션 prototype 정합 | 분류·Epic 관리 진입점 부재 |
| 8 | 분류 / Epic 관리 페이지 직접 URL 진입 | 404 또는 redirect (잔존 라우트 0) |

### 수동 시나리오 (mobile)

| # | 시나리오 | 통과 기준 |
|---|---|---|
| 9 | 위 1~7 시나리오 RN 환경 | 동등 통과 |
| 추가 | `create-todo` deep link → `epic-form` redirect | TASK-09-18 정합 |

### 회귀 0건 항목 (sub-prd-09 §회귀 0건)

| 영역 | 검증 항목 |
|---|---|
| sub-prd-06 | chip 필터 / DateNavigator 정상 |
| sub-prd-07 | Epic 카드 expand / cascade toggle 정상 |
| sub-prd-08 | EmptyState / Spinner / Toast 정상 |

### 보고 형식

- 각 시나리오 통과 / 실패 체크 + 실패 시 재현 단계 / 스크린샷
- 실패 항목 발견 시 책임 task 의 PR 로 환원 (본 task 안에서 코드 수정 X)

## 검증 과정

- [ ] 수동 9 시나리오 (web 8 + mobile 1) 통과
- [ ] mobile deep link redirect 통과
- [ ] sub-prd-06 회귀 0
- [ ] sub-prd-07 회귀 0
- [ ] sub-prd-08 회귀 0
- [ ] 보고 문서 생성 (또는 PR 본문 / 회의 노트)

## 주의사항

1. **선행 task 미머지 시 차단**: 22 통과 후 진행. 자동 검증 실패 상태에서 수동 검증 무의미.
2. **2 user 환경**: 시나리오 6 (RLS scoping) 는 supabase local 의 2 user 시드 필요 — 부재 시 시드 갱신 또는 본 시나리오 보류 사유 명시.
3. **시각 회귀**: 자동 테스트가 커버하지 못하는 시각 / UX 회귀가 본 task 의 핵심. prototype L578-590 / L822-880 와의 정합도 점검.
4. **scope = chore(verify)**: 코드 변경 0.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §검증 기준 §수동 / §회귀 0건
- [`./tasks-09-22-verify-auto.md`](./tasks-09-22-verify-auto.md)
- [`../../../base/prototype/pages/page-prototypes.html`](../../../base/prototype/pages/page-prototypes.html)
