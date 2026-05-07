# EmptyState

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·간격·문구·아이콘 / 일러스트 선택은 합류 후 갱신될 수 있다.**

prototype 미정의 영역. 데이터가 0건인 화면에서 "비어 있음 + 다음 행동 제안" 을 일관된 형태로 표현한다.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Molecules
- 구현체 (web): `packages/ui/src/EmptyState.tsx`
- 구현체 (mobile RN): `apps/mobile/src/components/EmptyState.tsx`

---

## 1. 사용 위치

| 위치 | 케이스 | CTA |
|---|---|---|
| 빈 워크스페이스 (life / work) | 카테고리·Epic·Todo 모두 0건 | "새 투두 만들기" |
| 빈 일자 (특정 날짜에 진행 중 0건) | `MainDailyView` 의 진행 중 섹션 | "새 투두 만들기" |
| 완료 섹션 빈 상태 | `MainDailyView` 의 완료 섹션 | 없음 (CTA 미주입 — 완료 섹션에 신규 생성 부적절) |
| 검색 / 필터 결과 0건 | (후속 — 검색 기능 도입 시) | 필터 초기화 |

## 2. 일러스트 vs 아이콘

- **잠정안**: Lucide 아이콘 채택 (`Inbox`, `ListTodo` 등). 디자인 결정자 합류 시 일러스트로 갱신 가능.
- 아이콘 크기: `h-12 w-12` (48px). `aria-hidden="true"` (의미 전달은 텍스트로).
- 색: `color-text-secondary` 계열 (Tailwind 토큰 `text-periwinkle-500`).

## 3. 문구 톤

- **명확·짧음·다정**. 사용자에게 부담을 주지 않는다.
- title: 한 줄 (예: "아직 할 일이 없어요").
- description: 한 줄 보조 설명 (예: "새 투두를 만들어 시작해보세요"). 선택.
- 모두 본문 톤. 느낌표 / 이모지 금지 (디자인 결정자 합류 전).

## 4. CTA 정책

- CTA 는 **단수** (`action.label` + `onClick`). 다중 CTA 가 필요해지면 별도 컴포넌트로 분기.
- 버튼 스타일: Primary CTA 토큰 정합 (`button-primary-bg` / `button-primary-text`).
- `onClick` 은 host 책임. 컴포넌트 내부 데이터 fetch 0건.

## 5. 접근성 (a11y)

- 컨테이너에 `role="status"` 적용 (보조기기에 "비어 있음" 상태 알림).
- 아이콘은 `aria-hidden="true"` — 의미 전달은 title / description 텍스트로.
- 색만으로 의미 전달 금지 (텍스트 병행).
- CTA 버튼: 최소 터치 타겟 44×44px, `focus-visible` 가시성.

## 6. 토큰 정합

| 요소 | 토큰 |
|---|---|
| 컨테이너 패딩 | `spacing-8` (32px) |
| icon-title 간격 | `spacing-3` (12px) |
| title 타이포 | `font-size-md`, `font-weight-medium` |
| description 타이포 | `font-size-sm` |
| 아이콘 색 | `color-text-secondary` |
| description 색 | `color-text-secondary` |
| CTA 버튼 | Button Primary 토큰 (`button-primary-bg` 등) |

> 하드코딩 hex 0건. Tailwind 토큰 className 만 사용 (inline style 0).

## 7. 향후 갱신 항목

- 일러스트 채택 여부 + 사이즈
- description 최대 줄 수
- 빈 카테고리 / 빈 Epic 등 추가 케이스의 메시지 패턴
- 다크 모드 시 색 매핑
