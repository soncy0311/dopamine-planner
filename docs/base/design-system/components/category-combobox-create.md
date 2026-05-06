# CategoryComboboxCreate

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색·간격·문구는 합류 후 갱신될 수 있다.**

분류(Category) 자유 입력 + 검색 + 즉시 생성을 단일 입력 필드로 제공하는 Combobox. 기존 `apps/web/src/components/ui/Combobox.tsx` 는 generic / WAI-ARIA 1.2 정합이지만 자유 입력 불가 — 본 컴포넌트는 신규 분류 즉시 생성 진입점을 포함한 별도 분자(Molecules) 로 신설된다.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Molecules
- 구현체 (web/mobile 공유): `packages/ui/src/CategoryComboboxCreate.tsx`

---

## 1. 사용 위치

| 위치 | 역할 |
|---|---|
| `EpicFormModal` 의 분류 입력 필드 | 분류 선택 + 신규 분류 즉시 생성 진입점 (분류 직접 관리 UI 가 폐기되므로 본 컴포넌트가 분류 생성의 유일 경로) |

prototype 인용: `docs/base/prototype/pages/page-prototypes.html` L578-590 (분류 Combobox 패턴 — 자유 입력 + 검색 + "+ '<입력>' 분류 만들기" 옵션).

## 2. 분류

Molecules (Atoms — Input + Listbox + Button — 의 조합).

## 3. Props

```ts
type CategoryComboboxCreateProps = {
  workspace: 'life' | 'work';
  value: { id: string; name: string; color?: string } | null;
  onChange: (category: { id: string; name: string; color?: string }) => void;
  placeholder?: string;
};
```

- `workspace` — 옵션 목록 필터 (`category.workspace` 일치) + 신규 생성 시 RPC 인자로 전달
- `value` — 현재 선택된 분류 (없으면 `null`)
- `onChange` — 선택 / 신규 생성 모두 동일 콜백으로 통지 (host 가 form state 보유)
- `placeholder` — 입력 placeholder 문구. 미주입 시 잠정안 "분류 검색 또는 생성"

## 4. 동작 흐름 (5단계)

1. 마운트 시 자체적으로 `useCategories(workspace)` 호출 — host 가 옵션을 매번 주입할 필요 없음
2. 사용자 입력 텍스트로 옵션 실시간 필터 (대소문자 무시 / 부분 일치)
3. 매칭 옵션이 존재하면 옵션 리스트 노출 → 선택 시 `onChange` 호출
4. 매칭 0건일 때 "+ '<입력>' 분류 만들기" 옵션 노출 → 선택 시 `categoryService.create` (RPC `category_create`) 호출
5. RPC 성공 응답으로 받은 신규 row 를 `onChange` 로 통지 + 입력 필드를 신규 분류 표시 상태로 전환. 실패 시 `toast.error` (unique 위반 등)

## 5. 접근성 (a11y)

- 입력 필드: `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-autocomplete="list"`
- 옵션 리스트: `role="listbox"`, 각 옵션 `role="option"` + `aria-selected`
- 키보드: `↑/↓` 옵션 이동, `Enter` 선택 / 신규 생성, `Escape` 닫기, `Tab` 으로 포커스 이탈 시 닫힘
- 신규 생성 옵션도 `role="option"` 으로 동일 접근 — 별도 분기 0
- `aria-activedescendant` 로 현재 하이라이트된 옵션을 보조기기에 알림
- 색만으로 의미 전달 금지 — 분류 색 chip 옆에 분류 이름 텍스트 병행

## 6. 시각 (토큰 정합)

| 요소 | 토큰 |
|---|---|
| 입력 필드 높이 / 패딩 | `spacing-3` (12px) 수직, `spacing-4` (16px) 수평 |
| 입력 필드 border | `color-border-subtle` / focus 시 `color-border-focus` |
| 입력 필드 radius | `radius-md` |
| 옵션 리스트 background | `color-bg-elevated` |
| 옵션 hover / active background | `color-bg-subtle` |
| 옵션 이름 타이포 | `font-size-md`, `font-weight-regular` |
| "+ 분류 만들기" 옵션 색 | `color-interactive-primary` (시각 구분) |
| 분류 색 chip | 8px 원형, 분류 row 의 `color` 값 — 분류 자체 색은 동적 (토큰 외) 지만 컨테이너 / 텍스트 색은 토큰 |

> 하드코딩 hex 0건. 분류 자체 색은 DB row 에서 받은 값을 inline `style.background` 로만 적용하고, 그 외 시각 요소는 모두 Tailwind 토큰 className 사용.

## 7. 에러 / 로딩

- 옵션 fetch 로딩: 입력 필드 내부 우측에 `Spinner` (`size="sm"`) 노출
- 옵션 fetch 실패: 옵션 리스트 자리에 "분류를 불러올 수 없어요" 한 줄 + retry 버튼 (잠정안)
- 신규 생성 RPC 로딩: "+ 분류 만들기" 옵션 우측에 `Spinner` (`size="sm"`) + 옵션 disabled
- 신규 생성 실패 (`23505` unique 위반 등): `toast.error` 로 통지 + 입력 텍스트 / 옵션 리스트 유지 (사용자 재시도 가능 상태)

## 8. 향후 갱신 항목

- 분류 색 inline 편집 (현재 sub 미제공)
- 옵션 리스트 가상 스크롤 (분류 수 증가 시)
- 다크 모드 시 색 매핑
- 신규 생성 시 색 자동 할당 정책 (현재는 `color` 미주입 → DB default)
