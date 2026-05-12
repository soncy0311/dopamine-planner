# SUB-PRD: `분류 관리 및 Epic 분류 해제`

## 작업 정보

- **작업명**: `분류 관리 및 Epic 분류 해제`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-12
- **종료일**: TBD
- **최신 업데이트**: 2026-05-12
- **상태**: 진행전
- **Main PRD**: [`main-prd-ui-update.md`](./main-prd-ui-update.md)
- **선행 Sub-PRD**: 없음 (Sub-01 과 독립)

## 배경 및 목적

현재 DB 정책은 `epic_issue.category_id` 가 `not null` 이고 category 삭제 시 연결 Epic 이 cascade 삭제될 수 있는 구조다. UI 업데이트 요구사항은 분류 삭제가 Epic/Sub 삭제로 이어지지 않아야 하며, 연결 Epic 은 "분류 없음" 상태로 남아야 한다.

본 Sub-PRD 는 분류명/색상 수정, 분류 삭제 시 Epic 분류 해제, Epic 편집 화면의 분류 제거 기능, 그리고 `category_id = null` 도메인 표현을 web/mobile 전체에 반영하는 작업을 정의한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| DB | Supabase PostgreSQL migration, RLS, RPC 필요 시 `SECURITY DEFINER` |
| 타입 | `packages/shared` 의 Supabase generated type 및 도메인 타입 |
| 공통 클라이언트 | `packages/core` services/hooks/domain mapper/queryKeys |
| Web UI | Next.js 15, React 19, Tailwind v4 |
| Mobile UI | Expo 52, React Native, Nativewind v4 |

## 핵심 요구 사항

### 1. DB 정책 전환

- `epic_issue.category_id` 는 nullable 이어야 한다.
- category FK 는 `on delete cascade` 가 아니라 `on delete set null` 또는 동등한 detach 정책이어야 한다.
- 분류 삭제 후 연결 Epic/Sub 는 삭제되지 않는다.
- Sub 는 Epic 을 통해 분류를 상속하므로 Epic 이 유지되면 Sub 도 유지된다.
- 기존 orphan category trigger 가 새 정책과 충돌하는지 검토하고 필요하면 수정 또는 폐기한다.

### 2. 분류 수정

- 분류 목록에서 분류명과 색상을 수정할 수 있다.
- 수정된 category row 를 참조하는 Epic/Sub 표시가 별도 일괄 업데이트 없이 최신 값으로 보인다.
- web/mobile 모두 같은 입력 검증을 적용한다.

### 3. 분류 삭제

- 삭제 액션은 "분류만 삭제하고 연결 Epic 은 분류 없음으로 전환"하는 의미다.
- UI 는 삭제 전 연결 Epic 유지 정책을 사용자에게 명확히 보여준다.
- 다중 row update 와 category delete 의 원자성이 필요하면 RPC 를 우선 사용한다.
- RPC 를 만들 경우 본인 row 만 변경되도록 `auth.uid()` 조건과 RLS 정합을 보장한다.

### 4. Epic 편집 내 분류 제거

- Epic 편집 화면에서 선택된 분류를 제거할 수 있다.
- 저장 결과는 해당 Epic 의 `category_id = null` 이다.
- 분류가 없는 Epic 도 제목, 설명, 우선순위, 완료 상태, 진행률을 계속 수정할 수 있어야 한다.
- 신규 Epic 생성 시 분류 선택은 선택 항목으로 전환한다. 사용자가 분류를 고르지 않으면 "분류 없음" Epic 으로 생성한다.

### 5. "분류 없음" 표현

- "분류 없음"은 실제 category row 로 만들지 않는다.
- DB 에서는 `category_id = null`, 도메인에서는 `categoryId: string | null` 또는 명시적 equivalent 로 표현한다.
- 필터, 카드, 편집 폼, 완료 Epic 모아보기에서 "분류 없음" 상태를 표시할 수 있어야 한다.

## 핵심 구현 로직

### DB migration 방향

```sql
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

실제 migration 에서는 현재 constraint 명과 trigger 명을 확인한 뒤 idempotent 하게 작성한다.

### 분류 삭제 처리

| 단계 | 처리 |
|---|---|
| 1 | 삭제 대상 category 가 현재 사용자 소유인지 확인 |
| 2 | 연결 `epic_issue.category_id` 를 `null` 로 변경 |
| 3 | category row 삭제 |
| 4 | category/epic query invalidate |
| 5 | UI 에서 연결 Epic 을 "분류 없음"으로 표시 |

### 적용 범위

| 영역 | 대상 |
|---|---|
| DB | `supabase/migrations/**`, 필요 시 RPC |
| 타입 | `packages/shared/src/database.ts`, category/epic 도메인 타입 |
| Core | `packages/core/src/services/category.ts`, `packages/core/src/services/epic.ts`, hooks, mapper, queryKeys |
| Web | 분류 관리 UI, Epic 생성/편집 폼, 카드/필터의 "분류 없음" 표시 |
| Mobile | 분류 관리 UI, Epic 생성/편집 폼, 카드/필터의 "분류 없음" 표시 |

## 구현 시 주의사항

1. **데이터 손실 금지**: category 삭제가 Epic/Sub 삭제로 이어지면 안 된다.
2. **"분류 없음" row 생성 금지**: null 또는 도메인 sentinel 로만 표현한다.
3. **타입 전환 일괄 적용**: `categoryId: string` 가정이 남으면 null 런타임 오류가 발생할 수 있다.
4. **RPC 권한 검증**: RPC 를 만들 경우 `SECURITY DEFINER` 와 `auth.uid()` 조건을 함께 적용한다.
5. **Realtime invalidate**: category delete 와 epic update 가 모두 발생할 수 있으므로 두 테이블 변경에 반응해야 한다.
6. **폼 기본값 주의**: 기존 Epic 편집 폼이 category 선택을 required 로 가정하면 null 저장이 막힌다.
7. **필터 의미 분리**: "전체"와 "분류 없음"은 다른 필터 옵션이다.

## 작업

- [ ] 현재 `epic_issue.category_id` constraint, trigger, index, RLS 정책을 확인한다.
- [ ] `category_id` nullable 및 `on delete set null` 전환 migration 을 작성한다.
- [ ] 기존 orphan category trigger 가 새 정책과 충돌하는지 검토하고 수정한다.
- [ ] 필요 시 `delete_category_detach_epics(category_id uuid)` RPC 를 작성한다.
- [ ] Supabase generated type 및 `packages/shared` 타입을 갱신한다.
- [ ] `packages/core` Epic 도메인 타입을 `categoryId: string | null` 로 갱신한다.
- [ ] category service 에 update/delete detach 흐름을 구현한다.
- [ ] epic service/update payload 가 `category_id = null` 을 허용하도록 보정한다.
- [ ] queryKeys 및 invalidate 범위에 category 삭제 후 epic 목록 갱신을 반영한다.
- [ ] web 분류 관리 화면에 분류명/색상 수정 기능을 추가한다.
- [ ] web 분류 관리 화면에 삭제 confirmation 과 detach 정책 안내를 추가한다.
- [ ] web Epic 생성/편집 폼에서 분류 선택을 선택 항목으로 전환하고 분류 제거 UI 를 추가한다.
- [ ] mobile 분류 관리 화면에 분류명/색상 수정 기능을 추가한다.
- [ ] mobile 분류 관리 화면에 삭제 confirmation 과 detach 정책 안내를 추가한다.
- [ ] mobile Epic 생성/편집 폼에서 분류 선택을 선택 항목으로 전환하고 분류 제거 UI 를 추가한다.
- [ ] 카드, 목록, 필터에서 "분류 없음" 표시를 추가한다.
- [ ] 분류 삭제 후 Epic/Sub 유지 테스트를 추가한다.

## 검증 기준

- [ ] category 삭제 후 연결 Epic row 가 삭제되지 않고 `category_id = null` 이 된다.
- [ ] category 삭제 후 연결 Sub row 가 삭제되지 않는다.
- [ ] 분류 수정 후 연결 Epic/Sub 표시 이름과 색상이 최신 값으로 보인다.
- [ ] Epic 편집에서 분류 제거 후 저장하면 해당 Epic 이 "분류 없음"으로 표시된다.
- [ ] 신규 Epic 을 분류 없이 생성할 수 있다.
- [ ] "전체" 필터와 "분류 없음" 필터가 서로 다른 결과를 반환한다.
- [ ] web/mobile 모두 null category Epic 을 렌더링할 때 오류가 없다.
- [ ] `make lint` 통과.
- [ ] `make test` 통과.

---

*이 문서는 `UI 업데이트` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-ui-update.md`](./main-prd-ui-update.md) 를 참조하세요.*
