# Task 01-02: API_CONTRACT.md RPC 섹션 재작성

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: 없음 (Sub-03 SQL 정의보다 본 단계의 인용 기준을 먼저 확정)
- **대상 파일**: `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`
- **참조 파일**: `main-prd-stack-pivot.md` (§데이터베이스 스키마 마이그레이션 4·5), `detail-stack-pivot.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` §1.2 라인 25 갱신 (Next.js API Routes 표현 제거)
- [ ] `API_CONTRACT.md` §1.1 표에서 "Next.js API Routes" 행을 "Postgres RPC 함수" 로 교체
- [ ] `API_CONTRACT.md` §4 (라인 383~448) 전체 삭제
- [ ] `API_CONTRACT.md` 신규 §4 "Postgres RPC 함수" 섹션 추가 (`carry_over_todos`, `recalc_epic_progress` 시그니처 + SECURITY DEFINER 원칙)

## 구현 세부사항

### 1. §1.2 라인 25 — Next.js API Routes 표현 제거

- "Next.js API Routes" 가 비즈니스 로직 호스트로 언급된 문구를 제거하고, Supabase 직접 호출 + Postgres RPC 의 이중 채널만 남긴다

### 2. §1.1 표 행 교체

| 변경 전 행 | 변경 후 행 |
|---|---|
| Next.js API Routes — `/api/*` 비즈니스 로직 | Postgres RPC 함수 — `supabase.rpc(<fn>)` 호출 (SECURITY DEFINER) |

### 3. §4 (라인 383~448) 전체 삭제

- 기존 Next.js API Routes 명세 블록 전체 제거
- 본문, 표, 코드 블록 포함 일괄 삭제

### 4. 신규 §4 "Postgres RPC 함수" 추가

아래 골격을 그대로 적용한다.

```markdown
## 4. Postgres RPC 함수

`SECURITY DEFINER` + `auth.uid()` null 체크로 본인 데이터만 조작한다.
모든 RPC 는 `grant execute … to authenticated`, `revoke … from anon, public` 을 적용한다.

### 4.1 carry_over_todos(target_date date) → { moved_count integer }

- **입력**: `target_date date` (오늘 날짜 등 일괄 이월할 기준일)
- **처리**: 미완료 sub_issue 의 due_date 를 target_date 로 일괄 갱신. 단일 트랜잭션 내에서 처리
- **반환**: `{ moved_count integer }` (이월된 행 수)
- **권한**: `authenticated` 만 실행 가능

### 4.2 recalc_epic_progress(epic_id uuid) → { progress numeric }

- **입력**: `epic_id uuid`
- **처리**: 해당 epic 의 sub_issue 진행률(완료/전체) 을 재계산해 epic.progress 컬럼에 저장
- **반환**: `{ progress numeric }` (0~1 범위)
- **권한**: `authenticated` 만 실행 가능
```

> 정확한 컬럼/타입은 Sub-03 의 SQL 정의 시 본 섹션과 1:1 정합되도록 갱신한다.

## 주의사항

1. **§4 본문은 main PRD §데이터베이스 스키마 마이그레이션 4·5 와 함수명·인자명을 동일하게 유지** — 명세 mismatch 시 main PRD 우선
2. **legacy `Next.js API Routes` 표현 0건** — `grep` 으로 잔존 검증
3. **§4 외 다른 섹션 (§1.1, §1.2 갱신 외) 변경 금지** — diff 범위 최소화
4. **SECURITY DEFINER + auth.uid() null 체크 표현 누락 금지** — Sub-03 에서 SQL 작성 시 본 표현이 SoT 가 된다

## 검증 체크리스트

- [ ] `grep -n "Next.js API Routes" docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` 결과 0건 (legacy 인용 외)
- [ ] §4 첫 문단에 `SECURITY DEFINER` + `auth.uid()` null 체크 + `grant execute … to authenticated` 문구 모두 존재
- [ ] §4.1 / §4.2 함수 시그니처가 main-prd-stack-pivot.md §데이터베이스 스키마 와 1:1 일치 (함수명, 인자명, 반환 타입)
- [ ] §1.1 표에 "Postgres RPC 함수" 행이 추가되었고, "Next.js API Routes" 행이 제거되었다
