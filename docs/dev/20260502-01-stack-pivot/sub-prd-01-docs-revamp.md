# SUB-PRD: `문서 정비`

## 작업 정보

- **작업명**: `문서 정비`
- **작업 유형**: `docs` (문서 변경)
- **시작일**: 2026-05-04
- **종료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **상태**: 완료

## 배경 및 목적

코드 변경 없이 v1 잔존 표현(WebView 래퍼 / Next.js API Routes / SERVICE_ROLE_KEY)을 6개 문서에서 제거하고 v2 책임 경계(SPA + RN 네이티브 + Postgres RPC)에 정렬한다. Sub-02 ~ Sub-05 의 코드 작업이 단일 진실 공급원(SoT)을 기준으로 진행될 수 있도록 사전 정비한다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 형식 | Markdown |
| 인용 기준 | `main-prd-stack-pivot.md`, `detail-stack-pivot.md` |
| 검증 도구 | `grep`, 상대 링크 수동 점검 |

## 핵심 요구 사항

본 단계의 변경 대상은 6개 문서이다. detail-stack-pivot.md / main-prd-stack-pivot.md 는 이미 v2 정렬 완료 — **본 Sub-PRD 의 기준 문서**이며 수정 대상이 아니다.

### 변경 액션 표

| 파일 | 삭제 | 갱신 (현재 → 목표) | 신규 |
|---|---|---|---|
| 루트 `CLAUDE.md` | — | 라인 31 web/mobile 설명 (WebView 표현 제거), 라인 44 Mobile 행 (`+WebView` 제거), 라인 46 API 행 (Next.js API Routes → Supabase RPC) | "프로젝트 구조" 표에 `packages/core` 추가, "기술 스택" 표에 Nativewind v4 |
| `docs/CLAUDE.md` | — | v2 미세 조정 (이미 대체로 정렬됨) | 신규 섹션 "책임 경계 규칙 (v2)" — main PRD §책임 경계 규칙 표 인용 |
| `apps/web/CLAUDE.md` | — | 라인 3~5 개요 ("모바일 WebView 로드" 제거 → SPA), 라인 31 `api/` 설명 (OAuth 콜백만) | `output: 'export'`, `transpilePackages` 명시, Realtime 훅 사용 |
| `apps/mobile/CLAUDE.md` | 라인 29~34 핵심 동작 (WebView 로직) | 라인 3~6 개요 (WebView 래퍼 → RN 네이티브), 라인 12~14 기술 스택 (`react-native-webview` 제거), 라인 20~26 디렉토리, 라인 71~72 주의사항 | OAuth (expo-auth-session) 섹션, Nativewind v4 설정 섹션 |
| `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` | §4 전체 (라인 383~448), §1.2 라인 25 | §1.1 표 ("Next.js API Routes" 행 → "Postgres RPC 함수") | 신규 §4 "Postgres RPC 함수" — `carry_over_todos(target_date date)`, `recalc_epic_progress(epic_id uuid)` 시그니처 + SECURITY DEFINER 원칙 |
| `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` | — | 라인 357 Infra ("기본 도메인" 제거), 라인 360 주석 보강 | — (이미 v2 정렬됨) |

### 처리 순서

상위 source 부터 하위 인용처로 전파한다.

1. `detail-todo-service-initialize.md` — Infra 항목 정리
2. `API_CONTRACT.md` — §4 RPC 섹션 정의 (이후 모든 PRD 가 인용)
3. 루트 `CLAUDE.md` — 프로젝트 구조 / 기술 스택
4. `docs/CLAUDE.md` — 책임 경계 섹션 추가
5. `apps/web/CLAUDE.md` — 웹 SPA 개요
6. `apps/mobile/CLAUDE.md` — RN 네이티브 개요

## 핵심 구현 로직

### API_CONTRACT §4 신규 섹션 골격

```markdown
## 4. Postgres RPC 함수

`SECURITY DEFINER` + `auth.uid()` null 체크로 본인 데이터만 조작.
모든 RPC 는 `grant execute … to authenticated`, `revoke … from anon, public`.

### 4.1 carry_over_todos(target_date date)

- 입력: `target_date date` (오늘 날짜 등)
- 처리: 미완료 sub_issue 의 due_date 를 target_date 로 일괄 이월. 단일 트랜잭션
- 반환: `{ moved_count integer }`

### 4.2 recalc_epic_progress(epic_id uuid)

- 입력: `epic_id uuid`
- 처리: 해당 epic 의 sub_issue 진행률 재계산 후 저장
- 반환: `{ progress numeric }`
```

> 정확한 컬럼/타입은 Sub-03 에서 SQL 정의 시 본 섹션과 1:1 정합되도록 갱신한다.

### docs/CLAUDE.md 신규 책임 경계 섹션

main-prd-stack-pivot.md §책임 경계 규칙 표를 그대로 인용하고 "본 표는 main-prd-stack-pivot.md §책임 경계 규칙 의 single source of truth 사본이다. 변경 시 main PRD 부터 갱신한다." 문구를 둔다.

## 구현 시 주의사항

1. **본 단계는 코드 변경 0건** — 마이그레이션·패키지·앱 코드는 Sub-02 이후
2. **Sub-PRD/main-PRD/detail 기준 문서 자체는 수정 금지** — 본 단계는 인용 일치 작업만
3. **상충 시 detail/main PRD 우선** — 6개 문서가 모두 main/detail 의 표현을 따르도록 정렬
4. **RPC 시그니처는 본 단계와 Sub-03 양쪽 갱신 시 동일하게 유지** — Sub-03 작성 후 본 문서의 §4 와 mismatch 가 생기면 즉시 동기화
5. **legacy 표현 grep 으로 잔존 점검** — `react-native-webview`, `WebView 래퍼`, `Next.js API Routes (비즈니스 로직)`, `SERVICE_ROLE_KEY` 키워드 잔존 0건 확인
6. **상대 링크 깨짐 검증** — 변경된 문서들 사이의 상대 경로 링크가 유효한지 수동 확인

## 작업

- [x] `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` Infra 항목 정리 (도메인 제거 + 주석 보강)
- [x] `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` §1.2 라인 25 갱신 (Next.js API Routes 표현 제거)
- [x] `API_CONTRACT.md` §1.1 표에서 "Next.js API Routes" 행을 "Postgres RPC 함수" 로 교체
- [x] `API_CONTRACT.md` §4 (라인 383~448) 전체 삭제
- [x] `API_CONTRACT.md` 신규 §4 "Postgres RPC 함수" 섹션 추가 (`carry_over_todos`, `recalc_epic_progress` 시그니처 + SECURITY DEFINER 원칙)
- [x] 루트 `CLAUDE.md` 라인 31 web/mobile 설명에서 WebView 표현 제거
- [x] 루트 `CLAUDE.md` "프로젝트 구조" 표에 `packages/core` 행 추가
- [x] 루트 `CLAUDE.md` "기술 스택" 표 Mobile 행 (`+WebView` 제거), API 행 (Next.js API Routes → Supabase RPC), Nativewind v4 행 추가
- [x] `docs/CLAUDE.md` 신규 섹션 "책임 경계 규칙 (v2)" 추가 (main PRD 표 인용 + source of truth 명시)
- [x] `apps/web/CLAUDE.md` 라인 3~5 개요 갱신 (모바일 WebView 로드 표현 제거 → 정적 SPA)
- [x] `apps/web/CLAUDE.md` 라인 31 `api/` 설명을 OAuth 콜백 전용으로 한정
- [x] `apps/web/CLAUDE.md` 에 `output: 'export'` 및 `transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared']` 명시
- [x] `apps/web/CLAUDE.md` 에 Realtime 구독 훅(`@todo-list/core/realtime/subscribeTodos`) 사용 안내 추가
- [x] `apps/mobile/CLAUDE.md` 라인 29~34 WebView 핵심 동작 블록 삭제
- [x] `apps/mobile/CLAUDE.md` 라인 3~6 개요 갱신 (WebView 래퍼 → RN 네이티브)
- [x] `apps/mobile/CLAUDE.md` 기술 스택에서 `react-native-webview` 제거, expo-auth-session / Nativewind v4 / @todo-list/core 추가
- [x] `apps/mobile/CLAUDE.md` 디렉토리 구조 항목을 expo-router `(auth)/`, `(main)/{life,work,settings}/` 로 갱신
- [x] `apps/mobile/CLAUDE.md` 신규 섹션 "OAuth (expo-auth-session)" 및 "Nativewind v4 설정" 추가
- [x] grep 으로 6개 문서 내 잔존 표현 0건 확인 (`react-native-webview`, `WebView 래퍼`, `Next.js API Routes (비즈니스 로직)`, `SERVICE_ROLE_KEY` 클라이언트 노출). `apps/mobile/package.json` / `apps/mobile/src/app/index.tsx` 의 `react-native-webview` 참조는 Sub-PRD 05 범위 (코드 변경 0건 원칙)

## 검증 기준

- [x] `grep -rn "react-native-webview" CLAUDE.md docs/CLAUDE.md apps/ docs/dev/20260502-02-todo-list-initialize/` 결과 0건 (의존성 제거 안내 외)
- [x] `grep -rn "WebView 래퍼" CLAUDE.md apps/` 결과 0건
- [x] `grep -rn "Next.js API Routes" docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` 결과 0건 (legacy 인용 외)
- [x] `grep -rn "SUPABASE_SERVICE_ROLE_KEY" apps/web/CLAUDE.md apps/mobile/CLAUDE.md` 결과 0건
- [x] `API_CONTRACT.md` §4 의 RPC 함수 시그니처가 main PRD §데이터베이스 스키마 의 마이그레이션 4·5와 동일 함수명·인자명 사용
- [x] `docs/CLAUDE.md` 의 책임 경계 표가 `main-prd-stack-pivot.md` §책임 경계 규칙 표와 1:1 일치 (행 수, 영역, 책임 PRD 유형)
- [x] 6개 문서의 상대 경로 링크가 유효 (수동 클릭 또는 `find` 로 대상 파일 존재 확인)
- [x] 루트 `CLAUDE.md` 프로젝트 구조 표에 `packages/core` 항목 존재 (`grep -n "packages/core" CLAUDE.md`)

---

*이 문서는 `스택 전환` 프로젝트의 Sub-PRD 입니다. 전체 범위는 `main-prd-stack-pivot.md` 를 참조하세요.*
