---
name: commit-message
description: 변경 사항을 분석하여 커밋 컨벤션에 맞는 커밋 메시지를 생성하고 커밋합니다.
---

# Commit Message

변경 사항을 분석하여 프로젝트 커밋 컨벤션에 맞는 메시지를 생성하고 커밋하는 스킬입니다.

## 사용법

```
/commit-message
```

## Instructions

### Step 1: 변경 사항 분석

다음 명령어를 **병렬로** 실행합니다:

1. `git status` — 변경된 파일 목록
2. `git diff --staged` — 스테이징된 변경 내용
3. `git diff` — 스테이징되지 않은 변경 내용

스테이징된 변경이 없으면 모든 변경 사항을 스테이징할지 사용자에게 확인합니다.

### Step 2: 커밋 메시지 작성

**컨벤션: Conventional Commits (한글)**

**형식:**
```
<type>(<scope>): <subject>

<body>
```

**type 종류:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링 (기능 변경 없음)
- `chore`: 빌드, 설정 등 기타 변경
- `docs`: 문서 변경
- `test`: 테스트 추가/수정
- `style`: 코드 스타일 변경 (포맷팅 등)
- `perf`: 성능 개선
- `ci`: CI 설정 변경

**scope 종류:**
- `client`: 웹/모바일 클라이언트 (apps/web, apps/mobile)
- `ui`: 공유 UI 컴포넌트 (packages/ui)
- `shared`: 공유 타입/유틸 (packages/shared)
- `config`: 공유 설정 (packages/config)
- `docs`: 문서 (docs/)
- `root`: 루트 설정 (turbo, pnpm, tsconfig 등)

**규칙:**
- subject는 50자 이내, 한글로 작성
- body는 업데이트 노트로 참고할 수 있을 정도의 자세한 설명을 작성한다
- body에는 **왜** 변경했는지, **무엇이** 달라지는지를 포함한다
- body의 각 항목은 `- `로 시작하는 리스트 형식을 사용한다
- breaking change가 있으면 `!`를 type 뒤에 추가하고 body에 상세 기술

**예시:**
```
feat(client): 투두 아이템 완료 체크 기능 구현

- TodoItem 컴포넌트에 체크박스 토글 기능 추가
- 완료 시 텍스트에 취소선 + 색상 변경 적용
- 체크 애니메이션 100ms (--duration-fast) 적용
- 완료된 아이템은 '완료' 섹션으로 자동 이동
```

### Step 3: 커밋 실행

1. 작성한 메시지를 사용자에게 보여주고 확인
2. 확인 후 `git commit` 실행
3. 커밋 결과를 사용자에게 전달
