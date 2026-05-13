# Task 02-06: core Epic 도메인 nullable category 반영

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-06 |
| 상태 | 완료 |
| 의존성 | 02-05 완료 필요 |

## 작업 목표

`packages/core` 의 Epic 도메인 모델과 mapper 에서 분류 없는 Epic 을 표현할 수 있게 `categoryId: string | null` 계약을 반영한다. 기존 `categoryId: string` 가정이 런타임 오류나 잘못된 UI 표시로 이어지지 않도록 도메인 계층을 먼저 정리한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/domain/epic.ts` | 수정 - Epic 타입과 mapper 의 `categoryId` nullable 반영 |
| `packages/core/src/domain/todo.ts` | 확인/필요 시 수정 - Todo/Sub 표시에서 Epic category 상속 가정 점검 |
| `packages/core/src/__tests__/domain.test.ts` | 수정 - null category Epic mapping 테스트 추가 |

### 구현 세부사항

1. **도메인 타입 변경**
   - Epic domain 타입의 `categoryId` 를 `string | null` 로 변경한다.
   - category 객체를 함께 들고 있는 타입이 있다면 null category 상태를 허용한다.
   - "분류 없음"은 category row 나 임의 id 가 아니라 null 로 표현한다.

2. **mapper 보정**
   - DB row 의 `category_id = null` 을 도메인 `categoryId: null` 로 매핑한다.
   - optional/nullable 필드가 undefined 와 null 사이에서 흔들리지 않도록 정책을 고정한다.

3. **Todo/Sub 영향 점검**
   - Sub 가 Epic category 를 상속해서 표시되는 코드에서 null category 접근 오류가 없는지 확인한다.
   - Todo domain 에 category 표시용 helper 가 있다면 null category label 처리를 후속 UI와 맞춘다.

### 참조 코드

- `packages/core/src/domain/epic.ts`: Epic 도메인 타입과 mapper
- `packages/core/src/domain/todo.ts`: Todo/Sub 도메인 타입과 category 참조
- `packages/core/src/__tests__/domain.test.ts`: 도메인 mapper 테스트 패턴

## 검증 과정

- [x] null category DB row 가 도메인 Epic 으로 정상 변환된다.
- [x] `categoryId: string` 만 가정하는 core domain 코드가 남아 있지 않다.
- [x] Sub/Todo 표시용 도메인 코드가 null category Epic 에서 예외를 던지지 않는다.
- [x] "분류 없음" row 생성 또는 sentinel id 추가 없이 null 로 표현한다.

## 주의사항

- UI 표시 문구는 후속 task 에서 다루되, 도메인 계약은 null 로 확정한다.
- categoryId optional 과 nullable 을 혼용하지 말고 저장 가능한 상태는 `null` 로 통일한다.
- 타입 오류를 any 로 우회하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
