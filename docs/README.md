# Todo List 문서 규칙

## 기본 원칙

- 브랜치 정책, 커밋 컨벤션, GitHub Projects 설정은 루트 운영 지침을 따른다
- 커밋 메시지는 `commit-message` 스킬을 사용하며, scope는 `docs`를 사용한다
- PR 생성은 `create-pr` 스킬을 사용한다

## 폴더 구조

```
docs/
├── base/            디자인 자산 — design-system / prototype (개발 PRD 의 기반 자료)
└── dev/             개발 문서 — 개발 순서대로 정렬된 기능 단위 PRD 폴더
```

- `base/` 하위에는 폴더명에 날짜를 붙이지 않는다 (`design-system/`, `prototype/` 등 의미 단위)
- `dev/` 하위에는 **기능 단위 폴더**를 생성한다: `yyyymmdd-nn-{project-name}/`
- 폴더 정렬 순서가 곧 **개발 순서**다. 새 기능 추가 시 가장 마지막 일자·순번을 사용한다
- 동일 기능의 모든 문서(detail / API_CONTRACT / PRD) 는 같은 `dev/<yyyymmdd-nn-project-name>/` 폴더에 모은다
- 날짜(`yyyymmdd`)는 문서를 최초 작성한 날짜이다

## 문서 유형

| 파일명 패턴 | 위치 | 설명 |
|---|---|---|
| `detail-{name}.md` | dev/ 또는 base/ | 기능 명세서(dev) 또는 디자인 자산 명세(base) |
| `API_CONTRACT.md` | dev/ | API 계약서. 엔드포인트, Request/Response 스펙을 정의한다 |
| `main-prd-{name}.md` | dev/ | 메인 PRD. 구현 범위·설계 전체를 정의한다 |
| `sub-prd-{name}.md` | dev/ | 서브 PRD. 메인 PRD 를 세분화한 구현 가이드 |
| `simple-prd-{name}.md` | dev/ | 단일 PRD. 소규모 기능의 구현 가이드 |

## 작업 순서

하나의 기능을 문서화할 때 다음 순서를 따른다:

1. `dev/<폴더>/detail-{name}.md` 작성 (기능 명세)
2. `dev/<폴더>/API_CONTRACT.md` 작성 (API 계약 — Supabase 직접 호출 + RPC 함수 시그니처)
3. `dev/<폴더>/main-prd-{name}.md` 작성 (구현 범위·설계)
4. `dev/<폴더>/sub-prd-{name}.md` 작성 (필요 시)
5. 코드 구현 시작

**각 단계마다 커밋한다.**

## 문서 작성 규칙

- 모든 문서 상단에 작성일, 상태(Draft/Review/Final), 기반 문서를 명시한다
- API_CONTRACT 변경 시 변경 사유를 커밋 본문에 반드시 기술한다
- 같은 기능의 모든 문서는 동일한 `dev/<yyyymmdd-nn-project-name>/` 폴더에 위치한다
- 이미지, 참고 자료는 문서와 같은 폴더 내 하위 디렉토리에 보관한다

## 디자인 시스템 문서

- 요구사항: `dev/20260501-01-design-system/detail-design-system.md`
- 구현 명세: `base/design-system/` (README, components, accessibility, tokens)
- 실제 구현은 `packages/ui/src/`에 위치하며, 이 문서는 설계 명세 역할을 한다

## 책임 경계 규칙 (v2)

> 본 표는 [`docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md`](dev/20260502-01-stack-pivot/main-prd-stack-pivot.md) §책임 경계 규칙 의 single source of truth 사본이다. 변경 시 main PRD 부터 갱신한 뒤 본 문서로 전파한다.

| 영역 | 책임 PRD 유형 |
|---|---|
| `supabase/migrations/**`, `supabase/**` | DB PRD (이전 "서버 PRD" 의 후신) |
| `packages/shared/**` (타입·enum) | DB PRD (스키마 변경의 결과물) |
| `packages/core/**` (비즈니스 로직) | 공통 클라이언트 PRD |
| `packages/ui/**` (`packages/ui-mobile/**` 미신설 — 모바일 RN 컴포넌트는 `apps/mobile/src/components/**`) | UI PRD 또는 공통 클라이언트 PRD |
| `apps/web/**` | 웹 PRD |
| `apps/mobile/**` | 모바일 PRD |
| `apps/desktop/**` 🔮 후속 | 데스크탑 PRD (MVP 범위 밖) |

→ "Vercel Serverless 백엔드" 가 사라지므로 기존 "서버 vs 클라이언트" 경계가 무의미. **DB / 공통 클라이언트 / 플랫폼별 클라이언트** 3계층으로 재정립.

## 네이밍 규칙

- 폴더명: `yyyymmdd-nn-{project-name}` (kebab-case 영문, nn은 순번)
- 문서 파일명: `{type}-{project-name}.md` (kebab-case 영문)
- 한 폴더에 하나의 기능만 담는다
