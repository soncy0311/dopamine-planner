# Task 02-05: 앱 의존성 정리 (web / mobile package.json)

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 02-01 (`@todo-list/core` 워크스페이스 패키지 존재)
- **대상 파일**:
  - `apps/web/package.json`
  - `apps/mobile/package.json`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/web/package.json` 에 `@todo-list/core: workspace:*` 추가
- [ ] `apps/mobile/package.json` 에 `@todo-list/core: workspace:*`, `nativewind: ^4.0.0`, `tailwindcss: ^3.4.0` 추가
- [ ] `apps/mobile/package.json` 에서 `react-native-webview` 제거

## 구현 세부사항

### 1. `apps/web/package.json` 의존성 추가

`dependencies` 에 다음 추가:

```json
{
  "dependencies": {
    "@todo-list/core": "workspace:*"
  }
}
```

- 기존 항목 유지, 추가만
- 정렬 순서는 알파벳 순 (기존 컨벤션 따름)

### 2. `apps/mobile/package.json` 의존성 추가/제거

추가:

```json
{
  "dependencies": {
    "@todo-list/core": "workspace:*",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

제거:

- `"react-native-webview"` (WebView 래퍼 폐기 — RN 네이티브 화면으로 이동)

### 3. 버전 핀

| 의존성 | 버전 |
|---|---|
| `@todo-list/core` | `workspace:*` |
| `nativewind` | `^4.0.0` |
| `tailwindcss` | `^3.4.0` |

- 정확한 버전은 Sub-PRD §4 의존성 추가 표 기준
- caret(`^`) 사용 — minor 업데이트 허용

## 주의사항

1. **`react-native-webview` 완전 제거** — devDependencies / peerDependencies 에도 잔존하지 않도록 확인
2. **workspace 프로토콜** — `workspace:*` 형식 (CLAUDE.md §코드 규칙)
3. **버전 핀 임의 변경 금지** — Sub-PRD §4 표의 버전을 그대로 사용. 더 최신 major 도입 금지
4. **다른 의존성 건드리지 않기** — Sub-PRD §4 표에 명시된 변경 외 의존성 수정 금지
5. **lockfile 갱신은 02-06 에서** — 본 task 는 package.json 만 수정. `pnpm install` 은 02-06

## 검증 체크리스트

- [ ] `grep -n "@todo-list/core" apps/web/package.json` 매치 1건 이상
- [ ] `grep -n "@todo-list/core" apps/mobile/package.json` 매치 1건 이상
- [ ] `grep -n "nativewind" apps/mobile/package.json` 매치 1건 이상
- [ ] `grep -n "tailwindcss" apps/mobile/package.json` 매치 1건 이상
- [ ] `grep -n "react-native-webview" apps/mobile/package.json` 결과 0건
- [ ] `apps/web/package.json` 의 `@todo-list/core` 버전이 `workspace:*`
- [ ] `apps/mobile/package.json` 의 `@todo-list/core` 버전이 `workspace:*`
- [ ] JSON 문법 유효 (`node -e "require('./apps/web/package.json')"`, `node -e "require('./apps/mobile/package.json')"` 에러 없음)
