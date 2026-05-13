# MAIN-PRD: `UI 업데이트`

# `UI 업데이트` (`ui-update`) - MAIN PRD

> 작성일: 2026-05-12
> 상태: Draft
> 기반 문서: [`details-ui-update.md`](./details-ui-update.md)

## 프로젝트 정보

- **프로젝트명**: `UI 업데이트` `ui-update`
- **카테고리**: web/mobile UI·UX 개선 및 도메인 정책 정합
- **상태**: Draft
- **시작일**: 2026-05-12
- **완료일**: 2026-05-12
- **최신 업데이트**: 2026-05-12
- **대상 클라이언트**: web + mobile
- **기반 문서**: [`details-ui-update.md`](./details-ui-update.md)
- **선행 PRD**: [`../20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md`](../20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md)

## 개발 목적

기존 Dopamine Planner 의 서비스 구조와 v2 아키텍처는 유지하면서, Epic 진행률 표시·분류 관리·완료 Epic 회고 흐름을 web/mobile 양쪽에서 일관되게 개선한다.

본 PRD 의 핵심 목적은 다음 4가지다.

1. Epic 진행률 UI 를 Sub 개수 기반 분절형에서 단일 progress bar 로 통일한다.
2. 분류 수정/삭제를 사용자 제어 기능으로 제공하되, 분류 삭제가 Epic/Sub 삭제로 이어지지 않게 한다.
3. 완료된 Epic 을 분류와 날짜 기준으로 다시 볼 수 있게 하고, 달력에 완료량 indicator 를 표시한다.
4. web/mobile 동작·시각·접근성·회귀 테스트 기준을 함께 정의한다.

## 핵심 기능 요구사항

### 1. Epic 진행률 UI 단일화

- Epic 카드와 Epic 상세/편집 화면의 진행률 UI 는 Sub 개수 분절형이 아니라 단일 linear progress bar 를 사용한다.
- 진행률 산출식은 기존 정책을 유지한다: `completedSubCount / totalSubCount`.
- Sub 가 0개인 Epic 의 표시 정책은 기존 구현과 디자인 SoT 를 재검토해 하나로 고정한다. 기본안은 진행률 막대를 숨기거나 0% 로 표시하되, web/mobile 이 동일해야 한다.
- [`docs/base/design-system/components/progress-bar.md`](../../base/design-system/components/progress-bar.md) 의 기본 variant 정책은 본 PRD 결과에 맞춰 갱신 대상이다.
- 접근성은 `progressbar` role, 현재 값, 보조 텍스트를 유지한다. 시각적 막대 변경이 보조기기 의미 변경으로 이어지면 안 된다.

### 2. 분류 수정/삭제 기능

- 분류 목록에서 분류명과 색상을 수정할 수 있다.
- 분류 수정 시 연결된 Epic/Sub 목록은 같은 `category` row 를 참조하므로 별도 일괄 업데이트 없이 최신 분류명/색상으로 즉시 보인다.
- 분류 삭제 정책은 **분류만 해제**로 확정한다.
  - 분류 row 삭제 또는 해제 이후에도 Epic/Sub 자체는 삭제하지 않는다.
  - 연결 Epic 은 `category_id = null` 또는 동등한 "분류 없음" 상태로 남아야 한다.
  - Sub 는 Epic 을 통해 분류를 상속하므로 Epic 이 유지되면 Sub 도 유지된다.
- UI 는 "분류 없음" 상태를 필터, 카드, 편집 폼, 완료 Epic 모아보기에서 표시할 수 있어야 한다.
- 현재 DB 는 `epic_issue.category_id uuid not null references category(id) on delete cascade` 구조이므로 본 요구사항과 충돌한다. DB/타입/API 계약 변경이 필수다.

### 3. Epic 편집 내 분류 삭제/해제

- Epic 편집 화면에서 선택된 분류를 제거할 수 있다.
- 분류 제거는 Epic 의 `category_id` 만 비우는 동작이며, Epic 또는 하위 Sub 를 삭제하지 않는다.
- 분류가 없는 Epic 도 제목, 설명, 우선순위, 완료 상태, 진행률을 계속 수정할 수 있어야 한다.
- 신규 Epic 생성 시 분류 선택을 필수로 유지할지 선택으로 전환할지는 Sub-PRD 에서 확정한다. 단, 기존 Epic 의 "분류 없음" 상태 표현은 본 PRD 범위에 포함한다.

### 4. 완료 Epic 모아보기

- 완료된 Epic 을 분류별로 모아볼 수 있는 화면 또는 섹션을 제공한다.
- 조회 기준은 `epic_issue.status = 'completed'` 와 `completed_date` 이다.
- 분류별 그룹에는 일반 분류와 "분류 없음" 그룹을 모두 포함한다.
- 날짜 필터 또는 월 단위 탐색을 제공해 사용자가 특정 기간에 완료한 Epic 을 회고할 수 있어야 한다.
- 완료 Epic row 는 제목, 분류, 우선순위, 완료일, 진행률 100% 상태를 표시한다.

### 5. 달력 완료 indicator

- 메인 달력의 날짜 아래에 해당 날짜의 완료 Epic 개수를 시각적으로 표시한다.
- 표시 기준은 `epic_issue.completed_date = 해당 날짜` 이고, `status = 'completed'` 인 Epic 만 집계한다.
- indicator 규칙:
  - 완료 Epic 0개: indicator 없음
  - 완료 Epic 1~5개: 작은 점 1개
  - 완료 Epic 5개 초과: 5개 단위당 큰 별표 1개
- indicator 는 장식 요소이므로 보조기기에는 날짜 버튼의 `aria-label` 또는 접근성 텍스트로 "완료 Epic N개"를 전달한다.
- web/mobile 에서 동일한 집계 규칙을 사용한다.

## 사용자 플로우

```
[메인 일자 뷰]
   │
   ├── [Epic 카드 확인]
   │      └─ 단일 progress bar 로 완료율 확인
   │
   ├── [달력 날짜 확인]
   │      └─ 날짜 아래 indicator 로 완료 Epic 존재 여부 확인
   │
   ├── [완료 Epic 모아보기 진입]
   │      ├─ 분류별 완료 Epic 목록 확인
   │      ├─ 날짜/월 단위로 완료 이력 탐색
   │      └─ "분류 없음" 완료 Epic 도 별도 그룹에서 확인
   │
   └── [분류 관리]
          ├─ 분류 수정 → 연결 Epic/Sub 표시 분류 즉시 갱신
          └─ 분류 삭제 → 연결 Epic/Sub 유지, Epic 은 "분류 없음" 상태로 전환

[Epic 편집]
   │
   ├── 분류 변경
   ├── 분류 제거 → Epic/Sub 유지 + "분류 없음" 표시
   └── 저장 후 메인/완료 모아보기/달력 집계 정합 확인
```

## 기술 아키텍처

### 시스템 구성

선행 v2 구조를 유지한다. 자체 서버 또는 신규 Next.js API Route 는 추가하지 않는다.

```
apps/web (Next.js SPA)        apps/mobile (Expo RN)
        │                              │
        └──────────────┬───────────────┘
                       ▼
              packages/core
        services / hooks / domain mapper
                       │
                       ▼
                  Supabase
      Postgres + RLS + Realtime + RPC(필요 시)
```

### 핵심 서비스 구현

| 영역 | 구현 위치 | 핵심 변경 |
|---|---|---|
| Category CRUD | `packages/core/src/services/category.ts`, `packages/core/src/hooks/use*Category.ts` | update/delete 정책 확장. 삭제는 연결 Epic 삭제가 아닌 분류 해제 흐름으로 처리 |
| Epic 서비스 | `packages/core/src/services/epic.ts`, `packages/core/src/hooks/use*Epic.ts` | `category_id = null` 허용, "분류 없음" 목록/필터 지원, 완료 Epic 조회 추가 |
| 도메인 매퍼 | `packages/core/src/domain/epic.ts` | `categoryId: string | null` 로 전환 또는 동등 표현 적용 |
| Query keys | `packages/core/src/queryKeys.ts` | 완료 Epic by category/date, 달력 완료 count 캐시 키 추가 |
| Realtime | `packages/core/src/realtime/subscribeTodos.ts` | category/epic 변경 시 완료 모아보기와 달력 count invalidate |
| web UI | `apps/web/src/components/**`, `apps/web/src/app/(main)/**` | progress bar 단일화, 분류 관리, 완료 Epic 모아보기, 달력 indicator |
| mobile UI | `apps/mobile/src/components/**`, `apps/mobile/src/app/**` | web 과 동일 동작·표시 정책 적용 |
| shared UI | `packages/ui/src/**` | web 공통 progress/calendar/category 표시 컴포넌트 정리 |

### 데이터베이스 스키마

현재 스키마와 본 요구사항 사이의 핵심 충돌은 `epic_issue.category_id` 이다.

| 항목 | 현재 | 변경 필요 |
|---|---|---|
| `epic_issue.category_id` | `uuid not null references category(id) on delete cascade` | nullable 전환 또는 동등한 "분류 없음" 표현 지원 |
| 분류 삭제 | category 삭제 시 연결 Epic/Sub cascade 삭제 가능 | 연결 Epic 의 분류만 해제하고 Epic/Sub 유지 |
| 도메인 타입 | `categoryId: string` | `categoryId: string | null` 또는 명시적 uncategorized 모델 |
| 기존 orphan category trigger | 마지막 참조 issue 삭제 시 category 삭제 | 본 정책과 충돌 여부 검토 후 유지/수정/폐기 결정 |

권장 DB 정책:

```sql
-- 방향성 예시. 실제 migration 명과 rollback 전략은 Sub-PRD 에서 확정한다.
alter table public.epic_issue
  drop constraint if exists epic_issue_category_id_fkey;

alter table public.epic_issue
  alter column category_id drop not null;

alter table public.epic_issue
  add constraint epic_issue_category_id_fkey
  foreign key (category_id)
  references public.category(id)
  on delete set null;
```

완료 Epic 조회는 기존 `epic_issue.status`, `completed_date`, `category_id` 를 사용한다. 성능이 필요하면 다음 인덱스를 검토한다.

- `epic_issue(user_id, status, completed_date)`
- `epic_issue(user_id, category_id, status, completed_date)`

### API 엔드포인트

자체 REST API 는 추가하지 않는다.

| 채널 | 용도 |
|---|---|
| Supabase 직접 호출 | Category update/delete, Epic category null update, 완료 Epic 조회, 달력 count 조회 |
| Postgres RPC | 분류 삭제를 트랜잭션으로 보장해야 할 경우 `delete_category_detach_epics(category_id uuid)` 신설 검토 |
| Realtime | `category`, `epic_issue`, `sub_issue` 변경 후 관련 query invalidate |

분류 삭제는 다중 row 업데이트와 category 삭제가 함께 일어나므로, 클라이언트 다중 호출보다 RPC 한 번으로 묶는 방향을 우선 검토한다. RPC 를 신설하더라도 기존 원칙대로 `SECURITY DEFINER`, `auth.uid()` 체크, 본인 row 한정 조건을 적용한다.

### 기술적 고려사항

#### 분류 삭제 트랜잭션

- 목표 동작: `epic_issue.category_id = null` 업데이트 후 `category` row 삭제.
- 중간 실패 시 Epic 이 삭제되거나 고아 참조가 남으면 안 된다.
- Realtime 이벤트는 category delete 와 epic update 가 모두 발생할 수 있으므로, UI invalidate 는 두 테이블 모두에 반응해야 한다.

#### "분류 없음" UX

- 카드/목록에서는 "분류 없음" 텍스트 badge 또는 빈 상태 표시를 사용한다.
- 필터에서는 전체/분류별/분류 없음 옵션을 명확히 구분한다.
- "분류 없음"은 실제 category row 로 만들지 않는다. DB null 또는 도메인 레벨 sentinel 로만 표현한다.

#### ProgressBar 디자인 SoT

- 기존 design-system 은 `segmented` 를 EpicCard 기본으로 정의한다.
- 본 PRD 에서는 Epic 진행률 기본 표시를 `linear` 로 바꾸므로 design-system 문서를 함께 갱신해야 한다.
- 컴포넌트 prop 은 `variant="linear"` 기본값 전환 또는 Epic host 에서 명시 주입 중 하나로 정한다.

#### 완료 Epic 집계

- `recalc_epic_progress` 가 모든 Sub 완료 시 `epic_issue.status='completed'`, `completed_date=current_date` 로 갱신하는 기존 정책을 기준으로 한다.
- 사용자가 완료 Epic 을 다시 active 로 되돌리면 `completed_date=null` 이 되어 달력 indicator 와 완료 모아보기에서 제외된다.
- 완료 기준 변경은 회고 데이터에 영향을 주므로 본 PRD 범위에서는 기존 완료 상태 정책을 유지한다.

## Sub-PRD 구조

| Sub-PRD | 범위 | 주요 산출물 | 의존성 |
|---|---|---|---|
| **Sub-01: `progress-ui-unification`** | Epic 진행률 UI 단일화 | design-system progress 정책 갱신, `EpicProgressBar` linear 기본화, web/mobile Epic 카드 정합 | 기존 progress 계산 로직 |
| **Sub-02: `category-management`** | 분류 수정/삭제 및 Epic 분류 해제 | DB migration, 타입 갱신, category delete detach 정책, web/mobile 분류 관리 UI, Epic 편집 내 분류 제거 | Sub-01 과 독립, DB 변경 선행 |
| **Sub-03: `completed-epic-archive-calendar`** | 완료 Epic 모아보기 + 달력 indicator | 완료 Epic 조회 hook/service, 분류별 archive UI, calendar count/indicator, "분류 없음" 그룹 | Sub-02 의 nullable category 정책 |
| **Sub-04: `cross-client-qa`** | web/mobile 정합·회귀·접근성 검증 | 단위 테스트, 수동 QA 시나리오, 접근성 체크리스트, 회귀 검증 | Sub-01~03 완료 |

## 리스크 및 완화 방안

| 리스크 | 영향 | 완화 |
|---|---|---|
| `category_id not null` + cascade 삭제 구조 | 분류 삭제 시 Epic/Sub 데이터 손실 가능 | migration 으로 nullable/set null 정책 전환 후 UI 삭제 기능 활성화 |
| 기존 타입이 `categoryId: string` 가정 | web/mobile 빌드 오류 또는 런타임 null 처리 누락 | shared/core/domain/form schema 를 한 번에 갱신하고 "분류 없음" 테스트 추가 |
| 완료 Epic count 쿼리 증가 | 달력 탐색 시 Supabase 호출 증가 | 월 단위 batch 조회와 TanStack Query 캐시 사용 |
| web/mobile 시각 정책 불일치 | 사용자 경험 분리 | Sub-04 에 동일 fixture 기반 검증과 수동 QA 체크리스트 포함 |
| design-system 문서와 구현 불일치 | 후속 작업 혼선 | Sub-01 에 progress-bar 문서 갱신을 필수 산출물로 포함 |

## 검증 계획

공통 명령:

- `make lint`
- `make test`

web 단위 테스트:

- progress bar 가 단일 linear 형태로 렌더링된다.
- 분류 수정 후 연결 Epic/Sub 표시 분류가 갱신된다.
- 분류 삭제 후 Epic/Sub 가 삭제되지 않고 "분류 없음"으로 표시된다.
- 달력 완료 indicator 가 완료 Epic 개수 규칙대로 렌더링된다.

mobile 단위/수동 테스트:

- web 과 동일한 progress/category/calendar 동작을 수행한다.
- 분류 삭제 후 관련 Epic/Sub 가 유지된다.
- "분류 없음" Epic 을 편집하고 다시 분류를 지정할 수 있다.

회귀 시나리오:

- 분류 수정 시 연결된 Epic 목록의 표시 분류가 즉시 갱신된다.
- 분류 삭제 후 기존 Epic/Sub 가 사라지지 않는다.
- 완료 Epic 모아보기와 메인 일자 뷰의 완료 상태가 일치한다.
- 완료 Epic 을 다시 active 로 되돌리면 완료 모아보기와 달력 indicator 에서 제외된다.

## 향후 개선 계획 (Future Scope)

- 완료 Epic archive 의 통계 요약(분류별 완료 추이, 주/월 단위 회고).
- "분류 없음" Epic 을 일괄 분류 지정하는 bulk action.
- 달력 indicator 의 밀도 표현 고도화(tooltip, count badge, 상세 popover).
- Epic 완료 상태를 Sub 완료 외에 수동 완료로도 처리할지 정책 검토.

## 관련 문서

- 요구사항 문서: [`details-ui-update.md`](./details-ui-update.md)
- 선행 Main PRD: [`../20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md`](../20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md)
- API 계약: [`../20260502-02-todo-list-initialize/API_CONTRACT.md`](../20260502-02-todo-list-initialize/API_CONTRACT.md)
- Progress Bar 디자인 명세: [`../../base/design-system/components/progress-bar.md`](../../base/design-system/components/progress-bar.md)
- Category Combobox 디자인 명세: [`../../base/design-system/components/category-combobox-create.md`](../../base/design-system/components/category-combobox-create.md)

---

*이 문서는 `UI 업데이트` 프로젝트의 메인 PRD입니다. 상세 구현 사항은 각 Sub-PRD를 참조하세요.*
