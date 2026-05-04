# Task 01-01: detail-todo-service-initialize.md Infra 항목 정리

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: 없음 (기반)
- **대상 파일**: `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md`
- **참조 파일**: `main-prd-stack-pivot.md`, `detail-stack-pivot.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` Infra 항목 정리 (도메인 제거 + 주석 보강)

## 구현 세부사항

### 1. 라인 357 Infra 항목에서 "기본 도메인" 표현 제거

- 현재 텍스트에서 "기본 도메인" 단어 / "도메인 발급" 표현이 있는 행을 정리한다
- v2 정렬 기준: Vercel 의 자체 도메인 발급 정책 표현은 사용하지 않는다 (커스텀 도메인 정책은 Sub-PRD 별 결정)

### 2. 라인 360 주석 보강

- Vercel 배포 시 기본 호스트 표현이 필요한 경우 `<slug>.vercel.app` 형태의 자동 생성 도메인을 사용한다는 점만 주석으로 명시
- 별도의 도메인 구매·연동은 v2 MVP 범위에 포함하지 않는다는 한 문장 추가

### 3. 변경 전/후 표현 (예시)

| 변경 전 | 변경 후 |
|---|---|
| `Vercel 기본 도메인 자동 발급` | `Vercel 호스팅 (`<slug>.vercel.app` 자동 호스트, 커스텀 도메인은 MVP 범위 밖)` |

> 실제 라인의 정확한 문장은 파일을 읽어 확인 후 위 의도에 맞게 수정한다.

## 주의사항

1. **본 단계는 코드 변경 0건** — 마이그레이션·패키지·앱 코드는 Sub-02 이후
2. **detail / main PRD 우선 정렬** — 본 문서가 main/detail 의 표현과 어긋나지 않도록 인용 일치
3. **Infra 외 다른 섹션은 건드리지 않는다** — 본 task 범위는 라인 357 / 360 주변에 한정

## 검증 체크리스트

- [x] `grep -n "기본 도메인" docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` 결과 0건 (legacy 인용 외)
- [x] 라인 360 주변에 Vercel `<slug>.vercel.app` 표현 주석이 추가되어 있다
- [x] 변경 외 섹션은 diff 가 발생하지 않는다 (`git diff` 로 확인)
