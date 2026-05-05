# TASK-08-01: 디자인 시스템 SoT 등재 (`empty-state` / `spinner` / `toast`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 01
- **상태**: 미착수
- **의존성**: 없음 (sub-prd-08 의 가장 선행 작업)

## 작업 목표

`docs/base/design-system/components/` 에 prototype 미정의 영역인 Empty state · Spinner · Toast 의 디자인 명세 docs 를 신설한다. 본 task 는 컴포넌트 코드(TASK-08-02 / 03) 보다 먼저 머지되어야 SoT 일관성이 유지된다 (sub-prd-08 §주의사항 3).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `docs/base/design-system/components/empty-state.md` | 신설 | Empty state 디자인 명세 |
| `docs/base/design-system/components/spinner.md` | 신설 | Spinner 디자인 명세 |
| `docs/base/design-system/components/toast.md` | 신설 | Toast 디자인 명세 |
| `docs/base/design-system/components.md` | 수정 | Atoms · Molecules 분류표에 3건 링크 정합 |

### empty-state.md 명세 항목

- **사용 위치**: 빈 워크스페이스 / 빈 일자 / 검색 결과 없음 등
- **일러스트 vs 아이콘**: prototype 부재 → 잠정 lucide 아이콘 채택, 디자인 결정자 합류 시 일러스트로 갱신
- **문구 톤**: 명확·짧음·다정 (예: "아직 할 일이 없어요" / "새 투두를 만들어 시작해보세요")
- **CTA 정책**: 1개만 (`action.label` + `onClick`). 옵션 — 빈 일자에는 "새 투두 만들기" 버튼 노출
- **a11y**: `role="status"` 컨테이너, 색만으로 의미 전달 금지

### spinner.md 명세 항목

- **인라인 변형**: 섹션·리스트 로딩 (TanStack Query `isLoading`). size sm/md
- **풀스크린 변형**: 라우트 전환 / 초기 부트스트랩. size lg + 중앙 정렬
- **스켈레톤은 후속**: 본 sub 범위 외 — 명세에 "추후 도입" 한 줄 명시
- **a11y**: `aria-label` 기본 "로딩 중", `role="status"`
- **`prefers-reduced-motion` 폴백**: `motion-reduce:animate-none` — 정적 dot/원형 표시

### toast.md 명세 항목

- **4종**: success / error / info / warning + 각 색 토큰 매핑
- **위치**: top-right (sonner 기본값 채택). 사유 한 줄 — "기존 sonner 등록 정합 + 데스크탑 우선 사용 환경"
- **자동 닫힘 시간**: 4초 (sonner 기본값)
- **동시 노출 개수**: 3개 (sonner 기본값) — stacking 위→아래
- **닫기 버튼**: `closeButton` 활성 (이미 layout.tsx 에 등록)
- **호출 API**: `toast.success(message)` / `toast.error(message)` / `toast.info(message)` / `toast.warning(message)`
- **a11y**: sonner 가 `aria-live` 영역 자동 관리

### components.md 보강

- `## Atoms` / `## Molecules` 분류표에 위 3건 링크. EmptyState / Spinner = Molecules, Toast = Molecule 시스템 (sonner wrapping)

### 잠정안 선언

3개 docs 모두 상단에 "본 명세는 디자인 결정자 합류 전 잠정안. 색·간격·문구는 합류 후 갱신될 수 있음" 한 줄 명시.

## 검증 과정

- [ ] `docs/base/design-system/components/empty-state.md` 존재 + 5개 섹션(사용 위치 / 일러스트·아이콘 / 문구 톤 / CTA 정책 / a11y)
- [ ] `docs/base/design-system/components/spinner.md` 존재 + 변형 / a11y / reduced-motion 폴백 명세
- [ ] `docs/base/design-system/components/toast.md` 존재 + 4종 색 / 위치 / 시간 / 개수 / 호출 API
- [ ] `docs/base/design-system/components.md` 에 3건 링크 추가
- [ ] 디자인 토큰(`tokens.md` / Tailwind 토큰) 참조 정합 (하드코딩 hex 0건)
- [ ] 잠정안 선언 한 줄이 3 파일 상단에 모두 존재

## 주의사항

1. **컴포넌트 코드보다 우선 머지**: 본 task 는 TASK-08-02 / 03 / 04 의 SoT. 머지 순서가 어긋나면 코드와 docs 가 분기 → 회피.
2. **prototype 부재 영역**: 본 sub 의 3건은 prototype 에 정의가 없어 docs 가 단일 SoT. 향후 prototype 정합 작업 시 본 docs 를 기준으로.
3. **잠정안 선언 필수**: 디자인 결정자 합류 전 작성하는 docs 임을 명시. 합류 후 갱신될 수 있음을 독자에게 알림.
4. **하드코딩 색 금지**: 모든 색은 디자인 토큰(`docs/base/design-system/tokens.md` / Tailwind 토큰) 참조. 신규 토큰 필요 시 토큰 docs 도 함께 갱신.
5. **scope = docs**: 본 task 는 코드 변경 0건. PR scope 는 `docs`.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §1
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md)
- [`../../../base/design-system/tokens.md`](../../../base/design-system/tokens.md)
