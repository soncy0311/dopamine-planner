# Task 01-07: 잔존 표현 grep 검증 + 링크 점검

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: Task 01-01 ~ 01-06 모두 완료 후
- **대상 파일**: (검증 전용 — 신규/수정 파일 없음)
- **참조 파일**: `sub-prd-01-docs-revamp.md` §검증 기준, `main-prd-stack-pivot.md` §책임 경계 규칙·§데이터베이스 스키마

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] grep 으로 6개 문서 내 잔존 표현 0건 확인 (`react-native-webview`, `WebView 래퍼`, `Next.js API Routes (비즈니스 로직)`, `SERVICE_ROLE_KEY` 클라이언트 노출)

## 구현 세부사항

### 1. legacy 표현 grep 일괄 검증

다음 명령을 순서대로 실행하고 결과가 0건(또는 legacy 인용 외 0건) 인지 확인한다.

```bash
# 1) react-native-webview — 의존성 제거 안내 외 0건
grep -rn "react-native-webview" CLAUDE.md docs/CLAUDE.md apps/ docs/dev/20260502-02-todo-list-initialize/

# 2) WebView 래퍼 — 0건
grep -rn "WebView 래퍼" CLAUDE.md apps/

# 3) Next.js API Routes (API_CONTRACT 한정, legacy 인용 외 0건)
grep -rn "Next.js API Routes" docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md

# 4) SUPABASE_SERVICE_ROLE_KEY (클라이언트 노출 금지)
grep -rn "SUPABASE_SERVICE_ROLE_KEY" apps/web/CLAUDE.md apps/mobile/CLAUDE.md
```

### 2. API_CONTRACT.md §4 vs main PRD §데이터베이스 스키마 1:1 비교

- 함수명 / 인자명 / 반환 타입 비교
  - `carry_over_todos(target_date date) → { moved_count integer }`
  - `recalc_epic_progress(epic_id uuid) → { progress numeric }`
- main PRD 마이그레이션 4·5 의 시그니처와 정확히 일치하는지 수동 확인

### 3. docs/CLAUDE.md 책임 경계 표 vs main PRD 1:1 비교

- 행 수 / 영역명 / 책임 PRD 유형 / 비고 컬럼까지 동일한지 수동 확인
- 차이가 발견되면 main PRD 가 SoT 이므로 docs/CLAUDE.md 부터 갱신

### 4. 6개 문서 상대 경로 링크 유효성

다음 6개 문서 내 모든 markdown 상대 링크 (`](...)`) 가 실제 파일을 가리키는지 확인.

- 루트 `CLAUDE.md`
- `docs/CLAUDE.md`
- `apps/web/CLAUDE.md`
- `apps/mobile/CLAUDE.md`
- `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`
- `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md`

```bash
# 상대 링크 패턴 추출 후 파일 존재 확인 예시
grep -oE '\]\([^)]+\.md\)' <file> | sed -E 's/^\]\(([^)]+)\)$/\1/'
# 각 결과를 file 의 디렉토리 기준으로 resolve 하여 find 로 존재 검증
```

### 5. 루트 CLAUDE.md `packages/core` 항목 확인

```bash
grep -n "packages/core" CLAUDE.md
```

- 프로젝트 구조 표에 1건 이상 존재 확인

## 주의사항

1. **legacy 인용은 허용** — `(예전: Next.js API Routes)` 처럼 명시적 legacy 라벨은 0건 카운트에서 제외하되, 본 단계에서는 가능한 한 모두 제거 지향
2. **검증 실패 시 해당 task 로 회귀** — 실패 항목은 01-01 ~ 01-06 중 해당 task 를 다시 열어 수정
3. **본 task 는 코드/문서 신규 변경 없음** — 검증 전용. diff 가 발생하면 회귀 작업이다
4. **수동 비교 결과는 PR 본문에 캡처** — main PRD 와의 1:1 일치 여부를 사람이 확인했다는 흔적 남김

## 검증 체크리스트

- [x] `grep -rn "react-native-webview" CLAUDE.md docs/CLAUDE.md apps/ docs/dev/20260502-02-todo-list-initialize/` 결과 0건 (의존성 제거 안내 외)
- [x] `grep -rn "WebView 래퍼" CLAUDE.md apps/` 결과 0건
- [x] `grep -rn "Next.js API Routes" docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` 결과 0건 (legacy 인용 외)
- [x] `grep -rn "SUPABASE_SERVICE_ROLE_KEY" apps/web/CLAUDE.md apps/mobile/CLAUDE.md` 결과 0건
- [x] `API_CONTRACT.md` §4 의 RPC 함수 시그니처가 main PRD §데이터베이스 스키마 마이그레이션 4·5 와 동일 함수명·인자명 사용
- [x] `docs/CLAUDE.md` 책임 경계 표가 main PRD 와 1:1 일치 (행 수, 영역, 책임 PRD 유형)
- [x] 6개 문서의 상대 경로 링크가 모두 유효 (`find` 또는 수동 점검)
- [x] 루트 `CLAUDE.md` 프로젝트 구조 표에 `packages/core` 항목 존재 (`grep -n "packages/core" CLAUDE.md`)
