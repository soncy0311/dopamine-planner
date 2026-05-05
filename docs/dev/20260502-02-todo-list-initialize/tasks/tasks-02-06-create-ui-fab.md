# TASK-02-06: `packages/ui/FAB` 컴포넌트

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 06
- **상태**: 대기중
- **의존성**: (없음)

## 작업 목표

모바일 뷰포트에서 우하단 고정 + 버튼 (Floating Action Button) 을 `@todo-list/ui` 에 신설한다. 클릭 시 호출자가 주입한 `onClick` 콜백을 실행 — 본 sub 에서는 콜백을 빈 함수로 두고, Sub-03 가 CRUD 모달 open 핸들러로 대체한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/FAB.tsx` | 신설 | `<FAB />` 컴포넌트 |
| `packages/ui/src/index.ts` | 갱신 | FAB 재-export |

### Props 시그니처

```tsx
type FABProps = {
  onClick: () => void;
  ariaLabel: string;             // 접근성 라벨 (e.g. "새 일 추가")
  className?: string;            // 외부에서 위치/오프셋 추가 조정용
};
```

### 구현 세부사항

- 기본 크기 56x56 (또는 디자인 시스템 토큰 따름) — WCAG 44x44 hit area 충족
- 위치 — `fixed bottom-6 right-6` 기본. 모바일 탭 바와 겹치지 않도록 `bottom-*` 토큰 조정
- 아이콘 — `+` (lucide-react 또는 inline SVG; `packages/ui` 외부 의존성 추가 시 peerDependency 검토)
- `onClick` 호출, `aria-label` 부여
- 데스크톱 뷰포트에서는 호스트 (apps/web) 가 `className` 으로 hidden 처리하거나 조건부 렌더 — FAB 자체는 반응형 hidden 분기 미포함

### 참조 코드

sub-prd-02 §핵심 구현 로직 `<MainDailyView>` 골격 中 `<FAB onClick={openCreateModal} />` 라인.

## 검증 과정

- [ ] `packages/ui/src/FAB.tsx` 파일 존재
- [ ] `packages/ui/src/index.ts` 재-export 추가
- [ ] `aria-label` prop 필수
- [ ] 44x44 hit area 보장
- [ ] 외부 아이콘 라이브러리 추가 시 `packages/ui/package.json` peerDependency 명시
- [ ] `pnpm --filter @todo-list/ui typecheck` 통과

## 주의사항

1. **반응형 hidden 미내장** — FAB 자체는 항상 렌더. 데스크톱에서 숨김 처리는 호스트 책임 (`className="md:hidden"`).
2. **모바일 탭 바와 겹침 방지** — 호스트가 탭 바 높이만큼 `bottom` 오프셋 조정.
3. **react 외 의존성** — 가급적 inline SVG 로 처리. 라이브러리 추가 시 peerDependency 등록 + 모바일/웹 양쪽 사용 가능 여부 검증.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §핵심 구현 로직
- `docs/base/design-system/` — FAB 토큰
