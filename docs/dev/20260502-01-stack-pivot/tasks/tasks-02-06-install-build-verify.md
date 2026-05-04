# Task 02-06: pnpm install + build + grep 검증

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 02-01 ~ 02-05 모두 완료
- **대상 파일**:
  - 루트 `pnpm-lock.yaml` (자동 갱신)
  - 검증만 수행 — 코드 변경 없음
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] 루트에서 `pnpm install` 실행 → workspace 의존성 해소
- [ ] `pnpm -r build` 통과 확인
- [ ] grep 으로 `packages/core/src/` 내 `window` / `AsyncStorage` / `react-native` import 0건 확인

## 구현 세부사항

### 1. `pnpm install` 실행

- 루트 디렉토리에서 `pnpm install`
- workspace 의존성 (`@todo-list/core` ↔ `apps/web`, `apps/mobile`) 자동 해소
- `pnpm-lock.yaml` 갱신
- nativewind / tailwindcss 신규 설치 확인

### 2. 빌드 / 타입체크

- `pnpm -r build` — 모든 워크스페이스 빌드 통과 (`packages/core` 빈 export 라도 컴파일 성공)
- `pnpm --filter @todo-list/core typecheck` — 단독 typecheck 통과

### 3. grep 검증 (플랫폼 독립성)

다음 grep 명령들이 모두 0건이어야 한다:

```bash
# packages/core 내 플랫폼 의존 0건
grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/

# react-native-webview 완전 제거
grep -n "react-native-webview" apps/mobile/package.json
```

다음 grep 결과는 양쪽 모두 매치되어야 한다:

```bash
grep -n "@todo-list/core" apps/web/package.json apps/mobile/package.json
```

### 4. peerDependencies 검증

- `packages/core/package.json` 의 `peerDependencies` 에 `react` 명시
- (후속 RN 도입 시 `react-native` 도 추가될 예정)

## 주의사항

1. **lockfile 충돌 발생 시 즉시 보고** — `pnpm install` 중 충돌 발생 시 auto resolve 금지. 사용자에게 보고 후 지시 대기
2. **빌드 실패 시 02-01 ~ 02-05 의 어느 파일이 원인인지 식별** — 임의 수정 금지. 원인 파일 식별 후 보고
3. **본 task 는 검증만** — 코드/설정 변경 0건. 검증 결과만 수집
4. **`Database` 타입 미존재로 typecheck 실패 시** — 02-02 에서 안내한 placeholder (`packages/shared/src/database.ts` 에 `export type Database = any;`) 가 실제로 존재하는지 확인. 미존재 시 placeholder 추가 (Sub-03 가 덮어씀)

## 검증 체크리스트

- [ ] `pnpm install` 정상 종료 (exit code 0)
- [ ] `pnpm -r build` 정상 종료 (exit code 0)
- [ ] `pnpm --filter @todo-list/core typecheck` 정상 종료
- [ ] `grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/` 결과 0건
- [ ] `grep -n "react-native-webview" apps/mobile/package.json` 결과 0건
- [ ] `grep -n "@todo-list/core" apps/web/package.json` 매치 1건 이상
- [ ] `grep -n "@todo-list/core" apps/mobile/package.json` 매치 1건 이상
- [ ] `packages/core/package.json` 의 `peerDependencies` 에 `react` 명시 확인
- [ ] `pnpm-lock.yaml` 에 nativewind / tailwindcss / @todo-list/core 항목 존재
