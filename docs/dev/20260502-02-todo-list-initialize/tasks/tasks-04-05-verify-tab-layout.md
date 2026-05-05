# TASK-04-05: `app/(main)/_layout.tsx` 정합 검증 (Tab Navigator + 세션 가드)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 05
- **상태**: 대기중
- **의존성**: (없음 — 이미 머지된 골격 검증)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/app/(main)/_layout.tsx` 는 Tab Navigator (Life / Work / 설정) + 세션 가드 (`supabase.auth.getSession()` + `onAuthStateChange`) 가 이미 구현 완료되어 있다. 본 task 는 sub-prd-04 §4 (탭 라우트) 와 정합한지 검증하고, sub-prd 본문의 `(tabs)/...` 표기와 코드 현실의 `(main)/...` 표기 차이를 docs 정정 권장 메모로 남긴다. (sub-prd §작업 4 "신설" 표기는 사실과 다름 — 정합 검증으로 대체.)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(main)/_layout.tsx` | 검증 (수정 없음 가정) | sub-prd §4 와 정합 확인 |

### 기존 코드 (변경 없음)

```tsx
// apps/mobile/src/app/(main)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MainLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (authed === null) return null;
  if (!authed) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs>
      <Tabs.Screen name="life/index" options={{ title: 'Life' }} />
      <Tabs.Screen name="work/index" options={{ title: 'Work' }} />
      <Tabs.Screen name="settings/index" options={{ title: '설정' }} />
    </Tabs>
  );
}
```

### 검증 항목

- 세션 가드 — `getSession` 초기 + `onAuthStateChange` 구독 + cleanup
- 미인증 시 `<Redirect href="/(auth)/login" />`
- 로딩 상태 (`authed === null`) → null 렌더 (스플래시)
- Tab.Screen 3 종 (life / work / settings) 모두 등록
- Tab title 한글 ("Life" / "Work" / "설정") — sub-prd §4 와 정합

### 라우트 표기 정정 권장 메모

sub-prd-04 본문은 `(tabs)/_layout.tsx`, `(tabs)/life.tsx` 등으로 표기하지만 실제 코드는 stack-pivot Sub-05 결과 `(main)/_layout.tsx`, `(main)/life/index.tsx` 사용. 별도 docs PR 에서 sub-prd-04 §4·§작업·§기술 스택 본문 표기를 `(main)` + `index.tsx` 로 정정 권장:

| sub-prd-04 본문 | 코드 현실 |
|---|---|
| `(tabs)/_layout.tsx` | `(main)/_layout.tsx` |
| `(tabs)/life.tsx` | `(main)/life/index.tsx` |
| `(tabs)/work.tsx` | `(main)/work/index.tsx` |
| `(tabs)/settings.tsx` | `(main)/settings/index.tsx` |

## 검증 과정

- [ ] `(main)/_layout.tsx` 의 Tab.Screen 3 종 (life/work/settings) 정합
- [ ] 세션 가드 cleanup 누수 없음 (`subscription.unsubscribe()`)
- [ ] 미인증 진입 시 `/(auth)/login` redirect
- [ ] iOS 시뮬레이터에서 인증 후 하단 탭 3개 표시 + 전환 동작
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] (옵션) 별도 docs PR 로 sub-prd-04 본문의 `(tabs)` 표기 정정 issue 등록

## 주의사항

1. **Sub-PRD 본문과 코드 현실 불일치** — sub-prd-04 §작업 4·5·6·7 의 `(tabs)/...` 표기 정정은 별도 docs PR. 본 task 는 코드 변경 없음.
2. **세션 가드 의존 범위** — 본 task 의 세션 가드는 `(main)` 그룹 전체 보호. `(auth)/login` 은 미보호. 새 보호 페이지 (categories, epics 등 root) 는 별도 가드 필요 — 본 plan 의 task 12·13 에서 검토.
3. **Tab title 한글** — "설정" 만 한글, "Life"/"Work" 는 영문. 디자인 시스템 (`docs/base/design-system/`) 정책 확인 후 일관 (현재 sub-prd §4 도 동일 표기).
4. **새 탭 추가 금지** — MVP 는 3 탭 고정. 분류/Epic/투두 생성은 modal route (task 12·13) 또는 settings 진입 (task 14).
5. **Tab icon 미정** — sub-prd §4 에 icon 명시 없음. MVP 는 텍스트만. 후속 sprint 에서 icon 추가.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §4 탭 라우트, §작업 4·5·6·7
- `docs/dev/20260502-01-stack-pivot/` — Sub-05 머지 컨텍스트
