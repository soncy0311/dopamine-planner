# Task 01-09: Progress fixture 및 최종 검증

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-09 |
| 상태 | 대기중 |
| 의존성 | tasks-01-08 완료 필요 |

## 작업 목표

Sub 0개, 일부 완료, 전체 완료 fixture 로 web/mobile progress 정책을 최종 검증한다. 문서 SoT, web 공유 UI, web/mobile host, 접근성 테스트가 모두 `linear` 기본 및 Sub 0개 미표기 정책과 일치하는지 확인하고 `make lint`, `make test` 로 회귀를 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/__tests__/IssueCardAccordion.test.tsx` | 확인/필요 시 수정 - 0개/일부/전체 완료 fixture 포함 여부 검증 |
| `packages/ui/src/EpicProgressBar.tsx` | 확인 - linear 기본 및 접근성 속성 최종 점검 |
| `packages/ui/src/IssueCardAccordion.tsx` | 확인 - web Sub 0개 미표기 및 linear 표시 점검 |
| `apps/web/src/components/MainDailyView.tsx` | 확인 - web count 전달 및 `epic.progress` fallback 제거 점검 |
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 확인 - mobile linear/Sub 0개/접근성 props 점검 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 확인 - mobile count 전달 및 `epic.progress` fallback 제거 점검 |
| `docs/base/design-system/components/progress-bar.md` | 확인 - 구현과 문서 SoT 정합 점검 |

### 구현 세부사항

1. **fixture 3종 검증**
   - Sub 0개: progress bar 와 percent 텍스트가 web/mobile 모두 미표기된다.
   - 일부 완료: `completedSubCount / totalSubCount` 기준 percent 와 linear fill 이 표시된다.
   - 전체 완료: 100% linear bar 로 표시되고 main status 와 충돌하지 않는다.

2. **문서/구현 정합 검증**
   - 디자인 시스템 문서의 Epic 기본 variant 가 `linear` 인지 확인한다.
   - 구현에서 Epic 기본 progress 가 segmented 로 돌아가는 prop 기본값 또는 강제 전달이 없는지 검색한다.
   - `totalSubCount = 0` 에서 `epic.progress` fallback 을 표시하지 않는지 확인한다.

3. **명령 검증**
   - `make lint` 를 실행한다.
   - `make test` 를 실행한다.
   - mobile package 에 별도 test script 가 없으면 `make test` 결과와 별개로 mobile 수동 QA 항목을 기록한다.

4. **수동 QA 항목**
   - web/mobile 에서 Sub 0개 Epic, 일부 완료 Epic, 전체 완료 Epic 을 각각 확인한다.
   - 카드 펼침/접힘, main checkbox 일괄 완료, sub checkbox 토글이 기존처럼 동작하는지 확인한다.
   - 보조기기 또는 devtools 로 progress role/value 의미를 확인한다.

### 참조 코드

- `packages/ui/__tests__/IssueCardAccordion.test.tsx`: fixture 기반 web 자동 테스트
- `apps/web/src/components/MainDailyView.tsx`: web runtime fixture 생성 지점
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile runtime fixture 생성 지점
- `docs/base/design-system/components/progress-bar.md`: 최종 정책 SoT

## 검증 과정

- [ ] Sub 0개 fixture 에서 progress bar 미표기 정책이 web/mobile 모두 확인됐다.
- [ ] 일부 완료 fixture 에서 percent 와 접근성 값이 `completedSubCount / totalSubCount` 와 일치한다.
- [ ] 전체 완료 fixture 에서 100% linear bar 가 표시된다.
- [ ] `rg -n "segments|segmented" packages/ui/src apps/web/src apps/mobile/src` 결과에 Epic 기본 segmented 강제 사용이 남아 있지 않다.
- [ ] `make lint` 가 통과한다.
- [ ] `make test` 가 통과한다.

## 주의사항

- 최종 검증 task 는 기능 구현을 새로 확장하는 단계가 아니라 앞선 작업들의 정합을 확인하는 단계다.
- 검증 중 정책 변경이 필요하면 Sub-PRD 또는 선행 task 문서를 먼저 업데이트한다.
- mobile 자동 테스트가 없는 제약은 실패로 간주하지 말고 typecheck/수동 QA로 보완한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
