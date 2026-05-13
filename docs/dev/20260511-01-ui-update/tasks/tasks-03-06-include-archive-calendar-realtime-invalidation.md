# Task 03-06: 완료 archive/calendar realtime invalidate 반영

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-06 |
| 상태 | 완료 |
| 의존성 | 03-01부터 03-05까지 완료 필요 |

## 작업 목표

Realtime 변경 이벤트가 완료 Epic archive 목록과 calendar completed count query 를 invalidate 하도록 범위를 확장한다. `epic_issue`, `category`, `sub_issue` 변경 후 완료 상태, 분류명, 진행률, count 가 stale 상태로 남지 않게 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/realtime/subscribeTodos.ts` | 수정 - archive/count query invalidate 추가 |
| `packages/core/src/queryKeys.ts` | 확인 - invalidate 대상 key helper 사용 |
| `packages/core/src/hooks/**` | 확인 - hook 이 추가된 key 를 사용하도록 정합 확인 |

### 구현 세부사항

1. **epic_issue 변경 처리**
   - Epic 완료/active 복귀, `completed_date`, category 변경 시 archive/count key 를 invalidate 한다.
   - 현재 daily Epic 목록 invalidate 와 중복되어도 누락보다 정합을 우선한다.

2. **category 변경 처리**
   - category rename/color/delete 가 archive group 표시를 바꾸므로 archive key 를 invalidate 한다.
   - null category 자체는 row 가 없지만 category delete 후 Epic detach 이벤트와 함께 처리한다.

3. **sub_issue 변경 처리**
   - Sub cascade 로 Epic completed 상태와 `completed_date` 가 바뀔 수 있으므로 archive/count 를 invalidate 한다.

### 참조 코드

- `packages/core/src/realtime/subscribeTodos.ts`: 기존 realtime subscription 및 query invalidation 패턴
- `packages/core/src/queryKeys.ts`: 완료 archive/calendar count key
- `packages/core/src/__tests__/cascadeToggleEpic.test.ts`: Sub 완료 cascade 정책

## 검증 과정

- [x] Epic 완료 처리 후 archive 목록과 calendar count 가 갱신된다.
- [x] Epic active 복귀 후 archive 목록과 calendar count 에서 제외된다.
- [x] category 수정/삭제 후 archive group 이름과 "분류 없음" 표시가 갱신된다.
- [x] Sub 완료 cascade 로 인한 Epic 상태 변경이 archive/count invalidate 대상이다.

## 실행 기록

- **일시**: 2026-05-12 23:58 KST
- **결과**: `epic_issue`, `category`, `sub_issue` invalidate 대상에 완료 목록/count key 추가 및 테스트 통과.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 batch 조회하며 날짜 셀별 Supabase 호출 금지다.
- indicator 규칙은 0개 없음, 1~4개는 완료 Epic 1개당 점 1개, 5개 이상은 5개당 별 1개만 표시하며 점은 추가하지 않는다. 주간 UI에서는 선택된 날짜에서도 indicator 색상은 변하지 않고, 월간 UI에서는 선택된 날짜 indicator 색상을 흰색으로 바꾼다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
