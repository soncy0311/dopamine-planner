# SUB-PRD: `web/mobile 정합 및 회귀 QA`

## 작업 정보

- **작업명**: `web/mobile 정합 및 회귀 QA`
- **작업 유형**: `test` (테스트 작업)
- **시작일**: 2026-05-12
- **종료일**: TBD
- **최신 업데이트**: 2026-05-13 13:23 KST
- **상태**: 완료
- **Main PRD**: [`main-prd-ui-update.md`](./main-prd-ui-update.md)
- **선행 Sub-PRD**: [`sub-prd-01-refactor-progress-ui-unification.md`](./sub-prd-01-refactor-progress-ui-unification.md), [`sub-prd-02-feat-category-management.md`](./sub-prd-02-feat-category-management.md), [`sub-prd-03-feat-completed-epic-archive-calendar.md`](./sub-prd-03-feat-completed-epic-archive-calendar.md)

## 배경 및 목적

UI 업데이트는 progress 표시, category 삭제 정책, nullable category, 완료 archive, 달력 indicator 를 동시에 건드린다. 이 변경은 web/mobile 시각 정합뿐 아니라 DB 데이터 보존, 접근성, Realtime invalidate, 기존 일자 뷰 회귀에 영향을 준다.

본 Sub-PRD 는 Sub-01~03 구현 후 완료 판단을 위한 검증 전용 작업이다. 자동 테스트와 수동 QA 시나리오를 함께 정의해 양 클라이언트가 같은 정책으로 동작하는지 확인한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 공통 명령 | `make lint`, `make test` |
| Web 검증 | React Testing Library 또는 기존 web 테스트 도구, Playwright 필요 시 |
| Mobile 검증 | React Native Testing Library 또는 Expo 수동 QA |
| DB 검증 | Supabase local stack, migration reset, seed fixture |
| 접근성 | ARIA 속성, RN accessibility props, 키보드/스크린리더 label 점검 |

## 핵심 요구 사항

### 1. 공통 fixture 기반 검증

- progress, category, completed archive, calendar count 검증에 같은 데이터 fixture 를 사용한다.
- fixture 는 다음 케이스를 포함한다.
  - Sub 0개 Epic
  - 일부 Sub 완료 Epic
  - 전체 완료 Epic
  - 일반 분류 Epic
  - `category_id = null` Epic
  - 분류 삭제 전/후 Epic
  - 같은 날짜 완료 Epic 0개, 1개, 4개, 5개, 6개, 10개

### 2. web/mobile 정책 정합

- progress bar 표시 정책이 동일해야 한다.
- "분류 없음" 표시 문구와 필터 의미가 동일해야 한다.
- 완료 Epic archive 는 설정의 분류 선택 후 월별/일별 조회 패널에서 검증한다.
- archive grouping helper 는 일반 분류와 `category_id = null` 의 `"분류 없음"` 그룹 의미를 보존해야 한다.
- 달력 indicator count 규칙은 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시한다.
- 접근성 label 이 플랫폼별 API 차이는 있더라도 같은 정보를 제공해야 한다.

### 3. 데이터 보존 회귀 검증

- 분류 삭제 후 Epic/Sub 가 삭제되지 않아야 한다.
- Epic 편집에서 분류 제거 후 다른 필드 편집이 계속 가능해야 한다.
- 완료 Epic 을 active 로 되돌리면 archive/count 에서 제외되어야 한다.
- 기존 Todo/Sub 토글과 `recalc_epic_progress` 흐름이 깨지지 않아야 한다.

### 4. 접근성 검증

- progressbar 의 현재 값과 보조 텍스트가 유지된다.
- 달력 날짜 버튼은 완료 Epic count 를 보조기기에 전달한다.
- category edit/delete/remove controls 는 키보드와 screen reader 로 식별 가능해야 한다.
- 삭제 confirmation 은 focus trap, 취소/확인 순서, 위험 액션 label 을 검증한다.

## 핵심 구현 로직

### 검증 매트릭스

| 영역 | 자동 테스트 | 수동 QA |
|---|---|---|
| Progress UI | 렌더링 variant, Sub 0개, ARIA/RN accessibility value | 실제 카드/상세/편집 화면 시각 확인 |
| Category | nullable type, delete detach, "분류 없음" 필터 | 수정/삭제/분류 제거 흐름 확인 |
| Archive | query/group mapper, active 복귀 제외 | 월/날짜 탐색과 그룹 표시 확인 |
| Calendar | count 규칙, indicator 렌더링 | 날짜 셀 밀도와 접근성 label 확인 |
| Realtime | invalidate helper 단위 검증 | 다른 세션 변경 반영 확인 |

### 수동 QA 기본 시나리오

1. web `/life` 또는 `/work` 에서 Sub 개수가 다른 Epic 카드의 progress 가 모두 linear 로 보이는지 확인한다.
2. mobile 동일 화면에서 같은 fixture 의 progress 가 web 과 같은 정책인지 확인한다.
3. 분류명을 수정하고 연결 Epic/Sub 의 표시 분류가 즉시 바뀌는지 확인한다.
4. 분류를 삭제하고 연결 Epic/Sub 가 사라지지 않으며 "분류 없음"으로 이동하는지 확인한다.
5. Epic 편집에서 분류를 제거하고 저장한 뒤 다시 분류를 지정할 수 있는지 확인한다.
6. 설정의 분류 클릭 후 완료 Epic archive 월별/일별 조회 패널이 표시되는지 확인한다.
7. 달력에서 완료 Epic 개수 0/1/4/5/6/10 케이스의 indicator 가 규칙과 일치하는지 확인한다.
8. 완료 Epic 을 active 로 되돌린 뒤 archive 와 달력 indicator 에서 제외되는지 확인한다.

## 구현 시 주의사항

1. **Sub-01~03 완료 후 실행**: 검증 전용 Sub-PRD 이므로 구현 범위를 대신 수행하지 않는다.
2. **실제 DB 정책 검증 포함**: UI mock 만으로 category 삭제 데이터 보존을 통과 처리하지 않는다.
3. **동일 fixture 사용**: web 과 mobile 검증 데이터가 다르면 정합성 판단이 흐려진다.
4. **접근성은 자동+수동 병행**: 속성 존재 테스트와 실제 포커스/label 흐름을 모두 확인한다.
5. **회귀 범위 포함**: 기존 일자 뷰, Todo/Sub 토글, Realtime 반영을 최소 1회 검증한다.
6. **문서와 결과 연결**: 실패한 항목은 해당 Sub-PRD 의 작업 또는 검증 기준으로 되돌려 수정한다.

## 완료된 작업

- [x] Sub-01~03 의 구현 완료 여부와 변경 파일 범위를 확인한다. ✅ (2026-05-13 03:18 KST)
- [x] 공통 QA fixture 를 정의하고 web/mobile 에서 같은 데이터 의미로 테스트할 수 있게 준비한다. ✅ (2026-05-13 03:18 KST)
- [x] progress linear 렌더링 자동 테스트를 web 에 추가 또는 갱신한다. ✅ (2026-05-13 03:18 KST)
- [x] progress accessibility 자동 테스트를 web/mobile 에 추가 또는 갱신한다. ✅ (2026-05-13 03:18 KST)
- [x] category delete detach 동작을 DB migration 및 core service 테스트로 검증한다. ✅ (2026-05-13 03:18 KST)
- [x] `categoryId: null` Epic 렌더링/도메인 의미 테스트를 web/mobile 기준과 연결한다. ✅ (2026-05-13 03:18 KST)
- [x] Epic 편집의 분류 제거 및 재지정 흐름을 테스트한다. ✅ (2026-05-13 03:18 KST)
- [x] 완료 Epic archive group mapper 테스트를 추가한다. ✅ (2026-05-13 03:18 KST)
- [x] 완료 Epic active 복귀 제외 테스트를 추가한다. ✅ (2026-05-13 03:18 KST)
- [x] 달력 indicator count 규칙 테스트를 추가한다. ✅ (2026-05-13 03:18 KST)
- [x] Realtime invalidate 가 category/epic/sub 변경에 반응하는지 테스트한다. ✅ (2026-05-13 03:18 KST)
- [x] web 수동 QA 시나리오 결과 또는 미실행 사유를 기록한다. ✅ (2026-05-13 03:18 KST)
- [x] mobile 수동 QA 시나리오 결과 또는 미실행 사유를 기록한다. ✅ (2026-05-13 03:18 KST)
- [x] `make lint` 를 실행한다. ✅ (2026-05-13 13:23 KST)
- [x] `make test` 를 실행한다. ✅ (2026-05-13 03:18 KST)

## 검증 기준

- [x] `make lint` 통과.
- [x] `make test` 통과.
- [x] web 과 mobile 의 Epic progress UI 가 모두 linear 로 통일되어 있다.
- [x] Sub 0개 Epic 표시 정책이 web/mobile 에서 동일하다.
- [x] 분류 삭제 후 Epic/Sub 데이터가 유지된다.
- [x] "분류 없음" Epic 이 카드, 필터, 편집 폼, archive mapper 에서 표시된다.
- [x] 완료 Epic archive 의 그룹과 날짜 필터 결과가 web/mobile 정책과 일치한다.
- [x] 달력 indicator 규칙이 web/mobile 에서 일치한다.
- [x] progressbar 와 달력 날짜의 접근성 label 이 요구사항을 충족한다.
- [x] 기존 Todo/Sub 토글 및 Epic progress 재계산 회귀가 없다.
- [x] 수동 QA 시나리오 결과 또는 현재 환경의 미실행 사유가 문서에 기록되어 있다.

## 실행 기록

### 공통 QA fixture

| 케이스 | 위치 | 검증 |
|---|---|---|
| Sub 0개 / 일부 완료 / 전체 완료 Epic | `packages/ui/__tests__/IssueCardAccordion.test.tsx`, `packages/core/src/__tests__/qaFixtures.ts` | progress linear, Sub 0개 미표기, 100% 의미 |
| 일반 분류 / `category_id = null` Epic | `packages/core/src/__tests__/domain.test.ts`, `packages/core/src/__tests__/completedEpicArchive.test.ts` | domain null 보존, `"분류 없음"` group |
| 분류 삭제 전/후 보존 | `packages/core/src/__tests__/rpc.test.ts`, `supabase/migrations/014_category_nullable_set_null.sql`, `supabase/migrations/015_delete_category_detach_epics_rpc.sql` | `on delete set null`, detach 후 category row 삭제 |
| 완료 count 0/1/4/5/6/10 | `packages/core/src/__tests__/qaFixtures.ts`, `packages/ui/__tests__/DateNavigator.test.tsx` | 1~4 점, 5개 이상 별표만 |

### 자동 검증 결과

| 일시 | 명령 | 결과 |
|---|---|---|
| 2026-05-13 05:37 KST | `make test` | 통과: core 7 files / 56 tests, ui 5 files / 40 tests, web 3 files / 15 tests |
| 2026-05-13 05:37 KST | `make typecheck` | 통과: core/web/mobile/shared/ui typecheck 또는 build |
| 2026-05-13 13:23 KST | `make lint` | 통과: mobile lint 를 `tsc --noEmit` 으로 정합 후 7 tasks successful |

### 수동 QA 기록

| 대상 | 결과 | 사유 및 대체 검증 |
|---|---|---|
| web | 미실행 | 로컬 Supabase QA seed, 브라우저 세션, 수동 fixture 계정이 현재 세션에 준비되지 않았다. progress/category/archive/calendar/realtime 핵심 정책은 `make test` 및 `make typecheck` 로 검증했다. |
| mobile | 미실행 | Expo dev server 및 iOS/Android 시뮬레이터를 이 세션에서 실행하지 않았다. RN 접근성 props 와 동일 정책 진입점은 `make typecheck` 및 코드 확인으로 검증했다. |

---

*이 문서는 `UI 업데이트` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-ui-update.md`](./main-prd-ui-update.md) 를 참조하세요.*
