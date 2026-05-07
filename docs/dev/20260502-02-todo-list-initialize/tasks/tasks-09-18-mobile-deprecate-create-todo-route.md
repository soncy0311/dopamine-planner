# TASK-09-18: mobile — `create-todo` 라우트 폐기 + redirect alias

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 18
- **상태**: 대기중
- **의존성**: 없음 (mobile 블록의 가장 선행)

## 작업 목표

sub-prd-09 §7 — mobile 의 `apps/mobile/src/app/create-todo.tsx` 를 폐기. deep link 회귀 방지를 위해 1 release cycle 동안 `epic-form` 으로 redirect alias 단기 유지.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/create-todo.tsx` | 갱신 | redirect 컴포넌트로 변경 (본문 폐기) |

### redirect 본문 (Expo Router)

```tsx
import { Redirect } from 'expo-router';

export default function CreateTodoRedirect() {
  return <Redirect href="/epic-form" />;
}
```

> 1 release cycle 후 본 파일 자체 제거. 본 task 의 §관련 문서 / sub-prd-09 §미해결 §5 에 제거 시점 기록.

### 호출 측 정합

- 기존 mobile 안에서 `create-todo` 라우트로 `router.push` 하던 호출은 본 task 와 동시 (또는 직후) `epic-form` 으로 교체 — 별도 task (TASK-09-19) 에서 처리
- deep link (앱 외부 진입) 만 redirect 로 흡수

### 빌드 검증

- `pnpm --filter @todo-list/mobile typecheck` 통과
- Expo dev — `create-todo` 진입 시 즉시 `epic-form` 으로 이동

## 검증 과정

- [ ] `create-todo.tsx` 본문이 `<Redirect href="/epic-form" />` 만 포함
- [ ] 기존 create-todo 폼 본문 잔존 0건
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 수동: deep link `app://create-todo` → `epic-form` 으로 이동
- [ ] 본 task 의 §관련 문서 에 1 cycle 후 제거 의도 기록

## 주의사항

1. **단기 alias**: 영구 유지 X (sub-prd-09 §미해결 §5). 1 release cycle 후 별도 cleanup task 에서 파일 자체 제거.
2. **머지 순서**: 본 task 는 19 (epic-form / sub-issue-form 신설) 보다 먼저 또는 동시 — 19 가 미머지 상태에서는 redirect 대상 (`/epic-form`) 부재로 404.
3. **호출 측 교체**: mobile 안의 `router.push('create-todo')` 는 별도 task 에서 처리. 본 task 는 redirect 로 회귀 방지만 담당.
4. **scope = chore(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §7 / §미해결 §5 / §주의사항 9
- [`./tasks-09-19-mobile-epic-and-sub-form-routes.md`](./tasks-09-19-mobile-epic-and-sub-form-routes.md)
