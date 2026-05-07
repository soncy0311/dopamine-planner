# TASK-06-03: `packages/ui/DateNavigator` 월간 토글 + Esc + prev/next 의미 단위

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 03
- **상태**: 완료
- **의존성**: (없음 — TASK-06-01 / 02 와 병렬 가능)

## 작업 목표

DateNavigator 헤더의 "YYYY년 M월" 텍스트를 토글 버튼으로 변경하고, 펼침 시 6주 × 7열 월간 그리드 + Esc 닫힘 + prev/next 의미 단위 (주/월) 인터랙션을 구현한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/DateNavigator.tsx` | 수정 | 토글 + 월간 그리드 추가 |

### 동작 명세

- 헤더 토글: 클릭 시 `expanded` state 반전 + `aria-expanded` / `aria-controls` 부여 + chevron 180deg 회전 (`data-expanded="true"` 셀렉터)
- 펼침 시: 6주 × 7열 그리드 (`role="grid"`, `aria-label="${year}년 ${month}월 달력"`). 이전·다음 달 셀은 dimmed (`opacity-40` 또는 `text-muted`).
- Esc 키: `expanded` → `false`
- prev/next 버튼 의미 단위:
  - 접힘 (주간 모드): ±7일
  - 펼침 (월간 모드): ±1개월
- 기존 ArrowLeft/Right 일자 이동 (input focus 외) 유지 — input 안에서는 발동 안 함

### 핵심 코드

```tsx
const [expanded, setExpanded] = useState(false);
const calId = useId();

useEffect(() => {
  if (!expanded) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setExpanded(false);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [expanded]);

function buildMonthGrid(anchor: Date): Date[] {
  // 해당 월 1일 기준 일요일까지 backfill, 6주 (42일) 채움
}
```

### 참조 코드

- sub-prd-06 §3 "DateNavigator 월간 토글"
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:56-84`
- prototype `docs/base/prototype/js/pages.js:272-275` (월간 그리드 빌드 로직)
- prototype `docs/base/prototype/css/molecules.css:251-260` (chevron 회전 셀렉터)

## 검증 과정

- [x] 헤더 클릭 시 월간 그리드 펼침 / 접힘
- [x] `aria-expanded` 가 state 와 동기화
- [x] chevron 이 펼침 시 180deg 회전
- [x] 6주 × 7열 = 42 셀, 이전·다음 달 셀 dimmed
- [x] 셀 클릭 시 해당 일자로 이동 (selectedDate 변경)
- [x] Esc 키로 닫힘
- [x] prev/next 버튼 의미 단위 (주간 ±7일, 월간 ±1개월)
- [x] 키보드 only 로 토글 + 셀 선택 + Esc 모두 가능
- [x] `pnpm --filter @todo-list/ui lint` 통과

## 주의사항

1. **호출 측 의존 검증** — sub-prd-06 §주의사항 4 — prev/next 의미 단위 변경 (일 → 주/월) 이 기존 호출 측 (mobile / web) 에 영향. mobile RN 에서 같은 컴포넌트 사용 시 별도 sub. 본 task 진입 시 `grep -rn DateNavigator apps/ packages/` 로 호출 측 확인 필수.
2. **input focus 회피** — ArrowLeft/Right 이동 핸들러는 `document.activeElement?.tagName === 'INPUT'` 가드.
3. **timezone** — 월간 그리드 빌드 시 사용자 로컬 timezone 기준. UTC 변환 금지.
4. **6주 고정** — 이전 prototype 처럼 6주 (42 셀) 고정. 5주짜리 월도 6주째 다음 달 dimmed 셀로 채움.
5. **mobile 영향 분리** — sub-prd-06 §주의사항 8 — mobile 정합은 본 sub 외부. 본 task 는 web 동작 변경 + 인터페이스만 검증.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §3
- [`./tasks-02-05-create-ui-date-navigator.md`](./tasks-02-05-create-ui-date-navigator.md) — 본 컴포넌트 신설 task
- `docs/base/prototype/pages/page-prototypes-desktop.html`
