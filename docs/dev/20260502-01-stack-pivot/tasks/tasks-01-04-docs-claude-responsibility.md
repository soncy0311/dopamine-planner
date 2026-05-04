# Task 01-04: docs/CLAUDE.md 책임 경계 섹션 추가

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: Task 01-03 (루트 CLAUDE.md 정합 확인 후)
- **대상 파일**: `docs/CLAUDE.md`
- **참조 파일**: `docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md` §책임 경계 규칙

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `docs/CLAUDE.md` 신규 섹션 "책임 경계 규칙 (v2)" 추가 (main PRD 표 인용 + source of truth 명시)

## 구현 세부사항

### 1. 신규 섹션 위치

- 기존 섹션 흐름을 깨지 않도록 "디자인 시스템 문서" 섹션 직후, "네이밍 규칙" 섹션 직전에 삽입
- 섹션명: `## 책임 경계 규칙 (v2)`

### 2. 본문 골격

```markdown
## 책임 경계 규칙 (v2)

> 본 표는 `docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md` §책임 경계 규칙 의 single source of truth 사본이다. 변경 시 main PRD 부터 갱신한 뒤 본 문서로 전파한다.

| 영역 | 책임 PRD 유형 | 비고 |
|---|---|---|
| (main PRD §책임 경계 규칙 표를 그대로 옮긴다 — 행 수 / 영역 / 책임 PRD 유형 1:1 일치) | | |
```

> 실제 행은 main-prd-stack-pivot.md 의 §책임 경계 규칙 표를 읽어 그대로 인용한다. 임의 요약·축약 금지.

### 3. 인용 출처 명시

- 표 상단 인용 블록(`>`) 에 main PRD 경로와 SoT 문구를 반드시 포함
- 본 문서 변경 시 main PRD 가 먼저 갱신되어야 한다는 점을 명시

## 주의사항

1. **표는 main PRD 와 1:1 일치** — 행 수 / 영역명 / 책임 PRD 유형 / 비고까지 동일
2. **임의 행 추가·축약 금지** — 본 문서는 인용 사본, 편집 시 main PRD 부터 수정
3. **상대 링크 유효성** — main PRD 경로가 실제 파일 위치와 일치하는지 확인
4. **기존 섹션 순서 유지** — 신규 섹션 삽입으로 기존 항목의 의미가 흐트러지지 않도록 한다

## 검증 체크리스트

- [x] `docs/CLAUDE.md` 에 `## 책임 경계 규칙 (v2)` 섹션이 존재한다
- [x] 표가 main-prd-stack-pivot.md §책임 경계 규칙 의 표와 행 수 / 영역 / 책임 PRD 유형 1:1 일치
- [x] 인용 블록에 main PRD 의 상대 경로 (`docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md`) 가 포함되어 있다
- [x] 인용 블록에 "single source of truth" 문구가 포함되어 있다
- [x] 기존 다른 섹션(폴더 구조, 문서 유형, 작업 순서 등) 에 diff 가 발생하지 않는다
