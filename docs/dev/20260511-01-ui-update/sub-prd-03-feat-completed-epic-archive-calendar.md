# SUB-PRD: `완료 Epic 모아보기 및 달력 indicator`

## 작업 정보

- **작업명**: `완료 Epic 모아보기 및 달력 indicator`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-12
- **종료일**: 2026-05-13
- **최신 업데이트**: 2026-05-13 00:44 KST
- **상태**: 완료 (lint 환경 이슈 기록)
- **Main PRD**: [`main-prd-ui-update.md`](./main-prd-ui-update.md)
- **선행 Sub-PRD**: [`sub-prd-02-feat-category-management.md`](./sub-prd-02-feat-category-management.md)

## 배경 및 목적

완료된 Epic 은 현재 일자 뷰에서 사라지거나 현재 상태 중심으로만 확인되기 쉽다. 이번 UI 업데이트에서는 사용자가 설정 화면의 분류 관리 영역에서 분류를 선택해 완료 Epic 을 월별/일별로 다시 볼 수 있는 회고 흐름을 제공하고, 메인 달력에는 해당 날짜의 완료량 indicator 를 표시한다.

본 Sub-PRD 는 완료 Epic 조회, 분류 클릭 진입, 월별/일별 조회, 달력 완료 indicator 집계 규칙을 web/mobile 에 동일하게 적용하는 작업을 정의한다. 설정의 분류 목록 자체는 분류 수정/삭제만 노출하고, 완료 Epic 목록은 선택한 분류의 조회 패널에서만 표시한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 데이터 | Supabase `epic_issue.status`, `completed_date`, `category_id` |
| 공통 클라이언트 | `packages/core` services/hooks/queryKeys/realtime |
| Web UI | Next.js 15, React 19, Tailwind v4 |
| Mobile UI | Expo 52, React Native, Nativewind v4 |
| 캐시 | TanStack Query v5 |

## 핵심 요구 사항

### 1. 분류 클릭 기반 완료 Epic 조회

- 조회 기준은 `epic_issue.status = 'completed'` 와 `completed_date` 이다.
- 조회는 선택한 category 단위로 수행하며 월별(`YYYY-MM`) 또는 일별(`YYYY-MM-DD`) 필터를 적용한다.
- 완료 Epic row 는 제목, 우선순위, 완료일, 진행률 100% 상태를 표시한다.
- 완료 상태에서 다시 active 로 변경되어 `completed_date = null` 이 된 Epic 은 목록에서 제외한다.
- web/mobile 모두 설정 화면의 분류 이름 영역을 눌러 조회 패널을 열며 별도 archive route/screen 은 만들지 않는다.

### 2. 설정 분류 목록

- 설정의 분류 목록에는 분류 이름, 색상, 수정, 삭제만 표시한다.
- 완료 Epic 목록은 분류 목록 행 안에 직접 노출하지 않는다.
- 분류 이름 영역을 누르면 해당 분류의 완료 Epic 조회 패널을 연다.
- 삭제된 분류를 보고 있던 경우 조회 패널을 닫는다.

### 3. 달력 완료 indicator

- 메인 달력 날짜 아래에 해당 날짜의 완료 Epic 개수를 시각적으로 표시한다.
- 집계 기준은 `status = 'completed'` 이고 `completed_date = 해당 날짜` 인 Epic 이다.
- indicator 규칙:
  - 완료 Epic 0개: indicator 없음
  - 완료 Epic 1~4개: 완료 Epic 1개당 작은 점 1개
  - 완료 Epic 5개 이상: 5개당 작은 별 1개만 표시하며 작은 점은 추가하지 않음
- 예: 4개 = 점 4개, 5개 = 별 1개, 6~9개 = 별 1개, 10개 = 별 2개.
- 날짜가 선택되어도 indicator 색상은 바뀌지 않는다.

### 4. 접근성

- indicator 는 장식 요소이므로 직접 focus 대상이 아니다.
- 날짜 버튼의 `aria-label` 또는 mobile accessibility label 에 "완료 Epic N개"를 포함한다.
- 완료 Epic 0개인 날짜에는 불필요한 보조 텍스트를 넣지 않는다.

## 핵심 구현 로직

### Core service/hook

| 기능 | 설명 |
|---|---|
| 완료 Epic 목록 조회 | workspace + category + 월/일 기간 기준 completed Epic 조회 |
| 완료 Epic 그룹핑 | category row 정보와 null category 를 합쳐 그룹 모델 생성 (테스트/확장용 유지) |
| 달력 count 조회 | 월 단위로 `completed_date` 별 count 를 batch 조회 |
| queryKeys | 완료 Epic 목록, category period 목록, calendar monthly count 키 추가 |
| realtime invalidate | `epic_issue`, `category`, `sub_issue` 변경 시 archive/calendar count 갱신 |

### 화면 구성

| 영역 | Web | Mobile |
|---|---|---|
| Archive 진입 | 설정 > 분류 이름 클릭 | 설정 > 분류 이름 탭 |
| 기간 탐색 | 월별/일별 segmented control + month/date input | 월별/일별 segmented control + text input |
| 그룹 표시 | 선택한 category 패널 | 선택한 category 패널 |
| row 표시 | 제목, 우선순위, 완료일, 100% progress | 동일 정보, 모바일 밀도 조정 |
| 달력 indicator | 날짜 셀 하단 점/별표 | 날짜 셀 하단 점/별표 |

### 데이터 모델

```ts
type CompletedEpicArchiveGroup = {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string | null;
  epics: CompletedEpicRow[];
};
```

`categoryId: null` 그룹의 표시명은 `"분류 없음"`으로 고정한다.

## 구현 시 주의사항

1. **Sub-02 선행 필요**: `category_id = null` 정책과 타입 전환이 완료된 뒤 구현한다.
2. **월 단위 batch 조회**: 달력 셀마다 개별 Supabase 호출을 만들지 않는다.
3. **완료 기준 유지**: Sub 완료 cascade 또는 기존 완료 상태 정책을 바꾸지 않는다.
4. **날짜 경계 명확화**: `completed_date` 는 date 기준으로 비교하고 client timezone 변환으로 날짜가 밀리지 않게 한다.
5. **"분류 없음" 그룹 포함**: null category Epic 이 archive 에서 누락되지 않아야 한다.
6. **카운트와 목록 정합**: 같은 기간에 대해 archive row 수와 calendar count 합계가 맞아야 한다.
7. **접근성 텍스트 중복 방지**: indicator 자체에는 별도 label 을 붙이지 않고 날짜 버튼 label 에 합친다.

## 완료된 작업

- [x] 완료 Epic active 복귀 시 archive/count 에서 제외되는 테스트를 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] 분류 클릭 시 해당 분류의 완료 Epic 을 월별/일별로 조회하는 UI를 구현한다. ✅ (2026-05-13 00:39 KST)
- [x] 설정 분류 목록에서 완료 Epic 직접 노출을 제거하고 분류 수정/삭제 중심으로 되돌린다. ✅ (2026-05-13 00:39 KST)
- [x] mobile accessibility label 에 완료 Epic 개수를 반영한다. ✅ (2026-05-12 23:58 KST)
- [x] mobile 달력 날짜 셀에 완료 indicator 를 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] mobile archive 는 분류 클릭 후 월별/일별 조회 패널로 구현한다. ✅ (2026-05-13 00:39 KST)
- [x] mobile 완료 Epic 모아보기는 설정 분류 행 내부 직접 노출이 아니라 선택 분류 조회 패널로 구현한다. ✅ (2026-05-13 00:39 KST)
- [x] web 날짜 버튼 접근성 label 에 완료 Epic 개수를 반영한다. ✅ (2026-05-12 23:58 KST)
- [x] web 달력 날짜 셀에 완료 indicator 를 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] web archive 는 분류 클릭 후 월별/일별 조회 패널로 구현한다. ✅ (2026-05-13 00:39 KST)
- [x] web 완료 Epic 모아보기는 설정 분류 행 내부 직접 노출이 아니라 선택 분류 조회 패널로 구현한다. ✅ (2026-05-13 00:39 KST)
- [x] Realtime invalidate 에 완료 archive 및 calendar count query 를 포함한다. ✅ (2026-05-12 23:58 KST)
- [x] 월 단위 calendar completed count 조회 service/hook 을 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] `category_id = null` Epic 을 "분류 없음" 그룹으로 매핑한다. ✅ (2026-05-12 23:58 KST)
- [x] 완료 Epic 을 category 별로 그룹핑하는 도메인 헬퍼를 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] 완료 Epic 목록 및 calendar count query key 를 추가한다. ✅ (2026-05-12 23:58 KST)
- [x] 완료 Epic 목록 조회 service 를 `packages/core` 에 추가한다. ✅ (2026-05-12 23:58 KST)

## 남은 작업

- [ ] `make lint` 환경 보완: `apps/mobile`의 `eslint` 실행 파일 부재로 전체 lint 가 실패한다.

## 검증 기준

- [x] 선택 분류 조회 패널에서 `status = completed` 이고 `completed_date` 가 있는 Epic 만 표시된다.
- [x] 설정 분류 목록에는 완료 Epic 목록을 직접 표시하지 않는다.
- [x] 월별/일별 필터 변경 시 해당 분류와 기간의 완료 Epic 만 표시된다.
- [x] 완료 Epic row 에 제목, 우선순위, 완료일, 100% 진행률이 표시된다.
- [x] 달력에서 완료 Epic 0개 날짜는 indicator 가 없다.
- [x] 달력에서 완료 Epic 1~4개 날짜는 완료 Epic 개수만큼 작은 점이 표시된다.
- [x] 달력에서 완료 Epic 5개 이상 날짜는 5개당 별 1개만 표시하고 점은 추가하지 않는다.
- [x] 주간 UI에서는 선택된 날짜에서도 indicator 색상은 변하지 않고, 월간 UI에서는 선택된 날짜 indicator 색상을 흰색으로 바꾼다.
- [x] 날짜 버튼 접근성 텍스트에 완료 Epic 개수가 포함된다.
- [x] 완료 Epic 을 active 로 되돌리면 archive 와 달력 indicator 에서 제외된다.
- [ ] `make lint` 통과.
- [x] `make test` 통과.

## 검증 기록

- `make typecheck` 통과 (2026-05-12 23:58 KST)
- `make test` 통과 (2026-05-12 23:58 KST)
- `make lint` 실패: `@todo-list/mobile`에서 `eslint: command not found` (2026-05-12 23:58 KST)
- `make typecheck` 통과 (2026-05-13 00:39 KST)
- `make test` 통과 (2026-05-13 00:39 KST)
- `make lint` 실패: `@todo-list/mobile`에서 `eslint: command not found` (2026-05-13 00:39 KST)
- indicator 정책 변경 후 `make typecheck` 통과 (2026-05-13 00:44 KST)
- indicator 정책 변경 후 `make test` 통과 (2026-05-13 00:44 KST)
- indicator 정책 변경 후 `make lint` 실패: `@todo-list/mobile`에서 `eslint: command not found` (2026-05-13 00:44 KST)

---

*이 문서는 `UI 업데이트` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-ui-update.md`](./main-prd-ui-update.md) 를 참조하세요.*
