# TASK-10-30: 수동 검증 — 시각 / prototype 시각 정합 / 회귀 시나리오

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-30
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-29 (자동 검증 통과)

## 작업 목표

sub-prd-10 §검증 기준 §수동(시각) + §수동(prototype 시각 정합) + §회귀 시나리오 전체 통과. 본 task 는 코드 변경 0 (수동 검증 + 보고).

## 상세 구현 내용

### 검증 환경

- **web**: dev 서버 (`make dev`) — 로컬 브라우저
- **mobile**: 시뮬레이터 (`make mobile-ios` / `make mobile-android`)
- **DB**: 로컬 supabase (`make sb-start`) — 마이그레이션 013 까지 적용 상태

### §수동(시각) — sub-prd-10 §검증 §수동

- [x] web 메인: `+ 추가` 버튼이 텍스트 단독 (SVG 미존재)
- [x] web 메인: Epic 카드 헤더에 priority badge / Sub 행에 priority 미노출
- [x] web Sub 추가 모달: 상위 Epic 이 readonly input (회색 배경) + priority 입력 부재 / 저장 후 sub 정상 생성
- [x] web Epic 추가 모달: priority 라디오 정상 동작 + DB 에 priority 저장
- [x] web Epic 편집 모달: priority 필드 노출 + 변경 후 저장 시 DB 반영
- [x] web Settings: "테마" 섹션, 라벨 "화면 모드 — 시스템", disabled
- [x] mobile 동일 항목 검증 (시뮬레이터)
- [x] mobile Sub 폼: description multiline + 상위 Epic readonly + priority 부재
- [x] mobile Epic 폼: priority radiogroup + 편집 모드 default 채움
- [x] mobile Settings: "테마" / "화면 모드 — 시스템" / disabled

### §수동(prototype 시각 정합 — 격차 #9~#13)

- [x] 메인 stand-alone TodoItem: tags 영역 (category 배지) 가 title 위 (grid row 1) — priority 미노출
- [x] EpicAccordion 안 sub 행: title + checkbox 만 — priority/category 모두 미노출
- [x] FilterChips: 비활성 = border + bg-elevated + text-secondary, 활성 = badge-bg/badge-text + 동일 border 색
- [x] DateNavigator: 좌/우 = ChevronLeft/Right 아이콘, week strip day-num = 32px circle, today = ring (border) 만, selected = filled circle
- [x] DateNavigator 확장: calendar cell radius-full (원형) 36px
- [x] SegmentedProgressBar: segment gap 2px + radius-full + height 8px / percent text 가로 정렬
- [x] (사용자 결정 §A 잠정안 채택 시) `IssueCardAccordion` 명명으로 코드 / docs 정합

### §회귀

- [x] Realtime: 다른 디바이스에서 Epic priority 변경 시 즉시 반영
- [x] carry-over RPC: priority 컬럼 의존 없는지 (`registered_date` 만 사용) — `007_carry_over_semantic_change.sql` 본문 확인
- [x] 기존 sub_issue priority drop 시 데이터 손실 0 (모든 Epic 기본 medium 부여 — 사용자 결정 §1)
- [x] sub-prd-09 산출물 회귀 0 (모달 분리 / 분류 Combobox / Settings 프로필)
- [x] sub-prd-08 산출물 회귀 0 (EmptyState / Spinner / Toast)
- [x] sub-prd-07 산출물 회귀 0 (Epic 카드 expand / cascade toggle)

### 보고 형식

- 체크리스트 통과 / 실패 + 실패 시 스크린샷 / 재현 절차
- 실패 항목 발견 시 책임 task 식별 + 회귀 PR 트리거

## 검증 과정

- [x] §수동(시각) 모든 항목 통과
- [x] §수동(prototype 시각 정합) 모든 항목 통과
- [x] §회귀 모든 항목 통과
- [x] 보고 (스크린샷 + 결과) PR 본문 또는 별도 docs 첨부

## 주의사항

1. **시뮬레이터 / 디바이스 양쪽 검증**: mobile RN 시뮬레이터만으로 충분치 않을 시 실 디바이스 검증 (특히 Nativewind priority 토큰 — sub-prd-10 §주의사항 6).
2. **Realtime 검증 환경**: 두 브라우저 / 두 디바이스 동시 열기 — Epic priority 변경 후 즉시 반영 확인.
3. **carry-over RPC priority 의존 0**: SQL 본문 grep 으로 직접 확인 (코드 동작이 아닌 SoT 검증).
4. **scope = chore(verify-manual)**: 본 task 는 코드 변경 0. 보고만.
5. **실패 발견 시 회귀 PR**: 본 task 안에서 코드 수정 X — 책임 task 의 회귀 PR 로 분리.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §검증 기준 §수동 / §회귀
- [`./tasks-10-29-verify-auto.md`](./tasks-10-29-verify-auto.md)
- `supabase/migrations/007_carry_over_semantic_change.sql` (carry-over RPC priority 의존 검증 대상)
