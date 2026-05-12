# SUB-PRD: `완료 Epic 모아보기 및 달력 indicator`

## 작업 정보

- **작업명**: `완료 Epic 모아보기 및 달력 indicator`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-12
- **종료일**: TBD
- **최신 업데이트**: 2026-05-12
- **상태**: 진행전
- **Main PRD**: [`main-prd-ui-update.md`](./main-prd-ui-update.md)
- **선행 Sub-PRD**: [`sub-prd-02-feat-category-management.md`](./sub-prd-02-feat-category-management.md)

## 배경 및 목적

완료된 Epic 은 현재 일자 뷰에서 사라지거나 현재 상태 중심으로만 확인되기 쉽다. 이번 UI 업데이트에서는 사용자가 완료 Epic 을 분류와 날짜 기준으로 다시 볼 수 있는 회고 흐름을 제공하고, 메인 달력에는 해당 날짜의 완료량 indicator 를 표시한다.

본 Sub-PRD 는 완료 Epic archive 조회, 분류별 그룹, "분류 없음" 그룹, 월/날짜 탐색, 달력 완료 indicator 집계 규칙을 web/mobile 에 동일하게 적용하는 작업을 정의한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 데이터 | Supabase `epic_issue.status`, `completed_date`, `category_id` |
| 공통 클라이언트 | `packages/core` services/hooks/queryKeys/realtime |
| Web UI | Next.js 15, React 19, Tailwind v4 |
| Mobile UI | Expo 52, React Native, Nativewind v4 |
| 캐시 | TanStack Query v5 |

## 핵심 요구 사항

### 1. 완료 Epic archive 조회

- 조회 기준은 `epic_issue.status = 'completed'` 와 `completed_date` 이다.
- 사용자는 월 단위 또는 날짜 범위로 완료 Epic 을 탐색할 수 있다.
- 완료 Epic row 는 제목, 분류, 우선순위, 완료일, 진행률 100% 상태를 표시한다.
- 완료 상태에서 다시 active 로 변경되어 `completed_date = null` 이 된 Epic 은 archive 에서 제외한다.

### 2. 분류별 그룹

- 완료 Epic 은 category 기준으로 그룹핑한다.
- 일반 분류 그룹과 "분류 없음" 그룹을 모두 포함한다.
- "분류 없음"은 실제 category row 가 아니라 `category_id = null` 인 Epic 그룹이다.
- 그룹 정렬은 기존 category sort/order 정책을 우선 사용하고, "분류 없음"은 마지막에 배치한다.

### 3. 달력 완료 indicator

- 메인 달력 날짜 아래에 해당 날짜의 완료 Epic 개수를 시각적으로 표시한다.
- 집계 기준은 `status = 'completed'` 이고 `completed_date = 해당 날짜` 인 Epic 이다.
- indicator 규칙:
  - 완료 Epic 0개: indicator 없음
  - 완료 Epic 1~5개: 작은 점 1개
  - 완료 Epic 5개 초과: 5개 단위당 큰 별표 1개
- 5개 초과 기준은 `floor(count / 5)` 개의 별표로 표현한다. 예: 6~9개 = 별표 1개, 10~14개 = 별표 2개.

### 4. 접근성

- indicator 는 장식 요소이므로 직접 focus 대상이 아니다.
- 날짜 버튼의 `aria-label` 또는 mobile accessibility label 에 "완료 Epic N개"를 포함한다.
- 완료 Epic 0개인 날짜에는 불필요한 보조 텍스트를 넣지 않는다.

## 핵심 구현 로직

### Core service/hook

| 기능 | 설명 |
|---|---|
| 완료 Epic 목록 조회 | workspace, month/date range, optional category filter 로 completed Epic 조회 |
| 완료 Epic 그룹핑 | category row 정보와 null category 를 합쳐 그룹 모델 생성 |
| 달력 count 조회 | 월 단위로 `completed_date` 별 count 를 batch 조회 |
| queryKeys | archive 목록, category/date 필터, calendar monthly count 키 추가 |
| realtime invalidate | `epic_issue`, `category`, `sub_issue` 변경 시 archive/calendar count 갱신 |

### 화면 구성

| 영역 | Web | Mobile |
|---|---|---|
| Archive 진입 | 메인 내 섹션 또는 별도 route | 메인 탭/섹션 또는 stack screen |
| 기간 탐색 | 월 이동 + 날짜 필터 | 월 이동 + 날짜 필터 |
| 그룹 표시 | category group list | section list |
| row 표시 | 제목, 분류, 우선순위, 완료일, 100% progress | 동일 정보, 모바일 밀도 조정 |
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

## 작업

- [ ] 완료 Epic 목록 조회 service 를 `packages/core` 에 추가한다.
- [ ] 월/날짜 범위 기반 완료 Epic query key 를 추가한다.
- [ ] 완료 Epic 을 category 별로 그룹핑하는 도메인 헬퍼를 추가한다.
- [ ] `category_id = null` Epic 을 "분류 없음" 그룹으로 매핑한다.
- [ ] 월 단위 calendar completed count 조회 service/hook 을 추가한다.
- [ ] Realtime invalidate 에 완료 archive 및 calendar count query 를 포함한다.
- [ ] web 완료 Epic 모아보기 화면 또는 섹션을 구현한다.
- [ ] web archive 에 월 이동, 날짜 필터, 분류별 그룹 목록을 구현한다.
- [ ] web 달력 날짜 셀에 완료 indicator 를 추가한다.
- [ ] web 날짜 버튼 접근성 label 에 완료 Epic 개수를 반영한다.
- [ ] mobile 완료 Epic 모아보기 화면 또는 섹션을 구현한다.
- [ ] mobile archive 에 월 이동, 날짜 필터, 분류별 그룹 목록을 구현한다.
- [ ] mobile 달력 날짜 셀에 완료 indicator 를 추가한다.
- [ ] mobile accessibility label 에 완료 Epic 개수를 반영한다.
- [ ] 완료 Epic active 복귀 시 archive/count 에서 제외되는 테스트를 추가한다.

## 검증 기준

- [ ] 완료 Epic 모아보기에서 `status = completed` 이고 `completed_date` 가 있는 Epic 만 표시된다.
- [ ] 일반 분류와 "분류 없음" 그룹이 모두 표시된다.
- [ ] 월/날짜 필터 변경 시 해당 기간의 완료 Epic 만 표시된다.
- [ ] 완료 Epic row 에 제목, 분류, 우선순위, 완료일, 100% 진행률이 표시된다.
- [ ] 달력에서 완료 Epic 0개 날짜는 indicator 가 없다.
- [ ] 달력에서 완료 Epic 1~5개 날짜는 작은 점 1개가 표시된다.
- [ ] 달력에서 완료 Epic 6개 이상 날짜는 5개 단위 별표 규칙을 따른다.
- [ ] 날짜 버튼 접근성 텍스트에 완료 Epic 개수가 포함된다.
- [ ] 완료 Epic 을 active 로 되돌리면 archive 와 달력 indicator 에서 제외된다.
- [ ] `make lint` 통과.
- [ ] `make test` 통과.

---

*이 문서는 `UI 업데이트` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-ui-update.md`](./main-prd-ui-update.md) 를 참조하세요.*
