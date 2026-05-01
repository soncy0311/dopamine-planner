# Todo List 문서 규칙

## 기본 원칙

- 브랜치 정책, 커밋 컨벤션, GitHub Projects 설정은 루트 `CLAUDE.md`를 따른다
- 커밋 메시지는 `/commit-message` 스킬을 사용하며, scope는 `docs`를 사용한다
- PR 생성은 `/create-pr` 스킬을 사용한다

## 폴더 구조

```
docs/
├── shared/          공통 문서 (detail, API_CONTRACT)
└── client/          클라이언트 구현 문서 (디자인 시스템, 프론트엔드 PRD)
```

- 각 영역 아래 **기능 단위 폴더**를 생성한다: `yyyymmdd-nn-{project-name}/`
- 같은 기능의 문서는 shared/client 모두 **동일한 `project-name`** 을 사용한다
- 날짜(`yyyymmdd`)는 문서를 최초 작성한 날짜이다

## 문서 유형

| 파일명 패턴 | 위치 | 설명 |
|---|---|---|
| `detail-{name}.md` | shared/ | 기능 명세서. 서비스 요구사항을 정의한다 |
| `API_CONTRACT.md` | shared/ | API 계약서. 엔드포인트, Request/Response 스펙을 정의한다 |
| `main-prd-{name}.md` | client/ | 메인 PRD. 구현 범위와 설계를 정의한다 |
| `sub-prd-{name}.md` | client/ | 서브 PRD. 메인 PRD를 세분화한 구현 가이드 |
| `simple-prd-{name}.md` | client/ | 단일 PRD. 소규모 기능의 구현 가이드 |
| `detail-{name}.md` | client/ | 클라이언트 요구사항 (디자인 시스템 등) |

## 작업 순서

하나의 기능을 문서화할 때 다음 순서를 따른다:

1. `shared/` — `detail-{name}.md` 작성 (기능 명세)
2. `shared/` — `API_CONTRACT.md` 작성 (API 계약)
3. `client/` — PRD 작성 (구현 설계)
4. 코드 구현 시작

**각 단계마다 커밋한다.**

## 문서 작성 규칙

- 모든 문서 상단에 작성일, 상태(Draft/Review/Final), 기반 문서를 명시한다
- API_CONTRACT 변경 시 변경 사유를 커밋 본문에 반드시 기술한다
- 같은 기능의 detail과 API_CONTRACT는 동일한 `shared/{yyyymmdd-nn-project-name}/` 폴더에 위치한다
- PRD 문서는 해당 영역(client/)의 기능 폴더에 위치한다
- 이미지, 참고 자료는 문서와 같은 폴더 내 하위 디렉토리에 보관한다

## 디자인 시스템 문서

- 요구사항: `client/20260501-01-design-system/detail-design-system.md`
- 구현 명세: `client/design-system/` (README, components, accessibility, tokens)
- 실제 구현은 `packages/ui/src/`에 위치하며, 이 문서는 설계 명세 역할을 한다

## 네이밍 규칙

- 폴더명: `yyyymmdd-nn-{project-name}` (kebab-case 영문, nn은 순번)
- 문서 파일명: `{type}-{project-name}.md` (kebab-case 영문)
- 한 폴더에 하나의 기능만 담는다
