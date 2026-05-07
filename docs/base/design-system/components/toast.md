# Toast

> **본 명세는 디자인 결정자 합류 전 잠정안이다. 색 토큰 매핑·자동 닫힘 시간·동시 노출 개수는 sonner 기본값을 채택했으며 합류 후 갱신될 수 있다.**

저장 / 에러 / 정보 / 경고 등 비동기 결과를 사용자에게 한 줄로 알리는 시스템. 본 프로젝트는 [`sonner`](https://sonner.emilkowal.ski/) 라이브러리를 wrapping 하여 사용한다.

- 토큰 SoT: [`../tokens.md`](../tokens.md)
- 컴포넌트 분류: [`../components.md`](../components.md) §Molecules
- 등록 위치: `apps/web/src/app/layout.tsx` (`<Toaster />`)
- 호출 API: `import { toast } from 'sonner'`

---

## 1. 4종 (variant) 색 토큰

| variant | 호출 | 색 토큰 (Semantic) | 사용 케이스 |
|---|---|---|---|
| `success` | `toast.success(msg)` | `color-status-success` (`color-green-500`) | 저장 / 완료 / 발행 성공 |
| `error` | `toast.error(msg)` | `color-status-error` (`color-red-500`) | 저장 실패 / 네트워크 에러 / 권한 에러 |
| `info` | `toast.info(msg)` | `color-status-info` (`color-blue-500`) | 정보성 알림 / 동기화 알림 |
| `warning` | `toast.warning(msg)` | `color-status-warning` (`color-yellow-500`) | 비파괴 경고 / 사용자 확인 필요 |

> sonner 의 `richColors` prop 활성 시 위 4종이 토큰 정합 색으로 렌더된다. 색 매핑이 어긋나면 `tokens.md` Status 섹션 또는 sonner override 로 갱신.

## 2. 위치 (position)

- **`top-right`** 채택. (sonner 기본값 + 데스크탑 우선 사용 환경 — 본문·FAB 와 시각 충돌 회피)
- 모바일 뷰포트에서도 동일 위치 유지 (sonner 가 자동 반응형 처리).

## 3. 자동 닫힘 시간 (duration)

- 기본 4초 (sonner 기본값).
- 에러는 사용자 인지 시간 확보를 위해 호출 측에서 더 길게 지정 가능 (`toast.error(msg, { duration: 6000 })`).
- 영구 (사용자 닫기 전까지) 가 필요하면 `duration: Infinity`.

## 4. 동시 노출 개수 (visibleToasts)

- 기본 3개 (sonner 기본값). 4번째 호출 시 가장 오래된 것이 큐 → 화면 아래로 밀려 사라짐 (sonner stacking).
- 위→아래 stacking, 화면 외 큐는 화면에 표시 안 됨.

## 5. 닫기 버튼 (closeButton)

- `<Toaster closeButton />` 으로 활성. 키보드 only 사용자가 토스트를 명시적으로 닫을 수 있어야 한다 (a11y).
- focus-visible 가시성 보장 (Tab → 닫기 버튼 포커스 → Enter / Space 로 닫기).

## 6. 호출 API

```ts
import { toast } from 'sonner';

toast.success('투두를 저장했어요');
toast.error('저장에 실패했어요. 다시 시도해주세요.');
toast.info('동기화가 완료되었어요');
toast.warning('이 작업은 되돌릴 수 없어요');
```

## 7. 등록 (Toaster)

```tsx
// apps/web/src/app/layout.tsx
import { Toaster } from 'sonner';

<Toaster position="top-right" richColors closeButton />
```

| props | 값 | 의미 |
|---|---|---|
| `position` | `"top-right"` | §2 정합 |
| `richColors` | `true` | §1 4종 색 토큰 정합 |
| `closeButton` | `true` | §5 a11y |

## 8. 접근성 (a11y)

- sonner 가 `aria-live="polite"` 영역을 자동 관리. 토스트 호출 시 보조기기가 메시지를 읽음.
- 에러 토스트는 sonner 내부에서 `aria-live="assertive"` 처리.
- 닫기 버튼 `aria-label="닫기"` (sonner 기본 제공).
- 색만으로 의미 전달 금지 — 메시지 텍스트가 단일 SoT.

## 9. 호출 시 메시지 톤

- 명확·짧음·다정. title 1줄, description 사용 자제 (긴 메시지가 필요하면 inline alert / 모달 검토).
- 성공: "저장했어요" / "추가했어요" 같이 완료형 종결.
- 에러: 무엇이 실패했는지 + (가능하면) 사용자가 할 수 있는 다음 행동 한 줄.

## 10. 향후 갱신 항목

- 자동 닫힘 시간을 4종별로 분리할지 (예: error 6초)
- 모바일 뷰포트에서 위치 변경 (top-center 등)
- 다크 모드 색 매핑
- 토스트 내부 action 버튼 정책 (sonner `toast(msg, { action })`)
