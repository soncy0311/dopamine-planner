# TASK-06-06: `apps/web/components/ui/Combobox` 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 06
- **상태**: 완료 (구현 결정: 자체 구현 — cmdk 가 aria-expanded 를 내부적으로 강제 설정해 외부 prop 와 충돌. 자체 구현으로 WAI-ARIA 1.2 패턴 직접 정합)
- **의존성**: (없음 — TASK-06-01 ~ 05 와 병렬 가능)

## 작업 목표

CreateTodoModal / TodoDetailModal 의 분류 자동완성에 사용할 generic Combobox 컴포넌트를 신설한다. WAI-ARIA 1.2 combobox 패턴 + 키보드 + 외부 클릭 닫기를 모두 지원한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/ui/Combobox.tsx` | 신설 | generic Combobox 컴포넌트 |

### Props 시그니처

```tsx
type ComboboxProps<T> = {
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getId: (t: T) => string;
  getLabel: (t: T) => string;
  placeholder?: string;
  emptyText?: string;            // 매칭 없음 메시지 (기본 "결과 없음")
};

export function Combobox<T>(props: ComboboxProps<T>): JSX.Element;
```

### 동작 명세

- input value (filter 문자열) state
- `open` state (펼침 여부) + `activeIndex` state (highlight)
- 키보드:
  - ArrowDown / ArrowUp → activeIndex 이동 + open 강제 true
  - Enter → activeIndex 옵션 선택 + close
  - Esc → close (input focus 유지)
  - Tab → close (focus 다음 element 로 이동)
- input focus → open
- 외부 클릭 → close (`useEffect` + `document.addEventListener('mousedown', ...)`)
- 옵션 필터: `getLabel(opt).toLowerCase().includes(filter.toLowerCase())`
- WAI-ARIA 1.2 combobox 패턴:
  - input: `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-activedescendant`
  - listbox: `role="listbox"` + `id={listboxId}`
  - option: `role="option"` + `id={optionId}` + `aria-selected`

### 핵심 코드 (자체 구현 case)

```tsx
const [filter, setFilter] = useState('');
const [open, setOpen] = useState(false);
const [activeIndex, setActiveIndex] = useState(0);
const rootRef = useRef<HTMLDivElement>(null);
const listboxId = useId();

const filtered = options.filter((o) => getLabel(o).toLowerCase().includes(filter.toLowerCase()));

useEffect(() => {
  if (!open) return;
  const onClick = (e: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', onClick);
  return () => document.removeEventListener('mousedown', onClick);
}, [open]);

const onKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') { setOpen(true); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
  if (e.key === 'ArrowUp')   { setActiveIndex((i) => Math.max(i - 1, 0)); }
  if (e.key === 'Enter')     { const v = filtered[activeIndex]; if (v) { onChange(v); setOpen(false); } }
  if (e.key === 'Escape')    { setOpen(false); }
};
```

### 의존성 결정 (사전 결정 필요)

- **option A — `cmdk` 도입**: shadcn 호환, 검증된 a11y, 약 7KB minified. `pnpm --filter @todo-list/web add cmdk`.
- **option B — 자체 구현**: 추가 의존성 0. 위 핵심 코드 기반.
- 본 task 진입 전 사용자 결정. 결정 결과를 본 파일 상단 §상태 옆에 기록.

### 참조 코드

- sub-prd-06 §5 "CreateTodoModal / TodoDetailModal" 의 Combobox 명세
- sub-prd-06 §주의사항 6 "Combobox 의존성 결정"
- WAI-ARIA Authoring Practices: Combobox Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

## 검증 과정

- [x] Combobox 신설 + props 시그니처 일치
- [x] input 입력 시 옵션 필터링 동작
- [x] ArrowUp/Down + Enter + Esc 키보드 모두 동작
- [x] 외부 클릭 시 close
- [x] input 에 `role="combobox"` + `aria-expanded` + `aria-activedescendant` 부여
- [x] listbox 에 `role="listbox"` + 옵션에 `role="option"` + `aria-selected`
- [x] generic 타입 — `Combobox<Category>` 처럼 호출 측에서 타입 안전하게 사용 가능
- [x] 매칭 없을 때 `emptyText` 노출
- [x] `pnpm --filter @todo-list/web lint` 통과

## 주의사항

1. **사용자 결정 미해결** — `cmdk` vs 자체 구현. 본 task 진입 시 결정. 결정 누락 시 task 가 멈춤.
2. **WAI-ARIA 1.2 combobox 패턴 정확성** — 잘못된 ARIA 속성은 스크린리더에 혼란 유발. APG 명세 그대로 따를 것.
3. **외부 클릭 핸들러 cleanup** — `useEffect` cleanup 누락 시 메모리 누수. 명시적으로 `removeEventListener`.
4. **focus management** — Esc 닫힐 때 input focus 유지 (사용자 흐름 유지). Tab 닫힐 때는 다음 element 로 자연 focus 이동.
5. **mobile 영향 분리** — 본 컴포넌트는 web 전용 (`apps/web/`). mobile 자동완성은 후속 mobile sub.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §5
- WAI-ARIA Authoring Practices: Combobox
