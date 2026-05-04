# Task 01-03: 루트 CLAUDE.md v2 정렬

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: Task 01-02 (RPC 표현 SoT 확정 후)
- **대상 파일**: `CLAUDE.md` (저장소 루트)
- **참조 파일**: `docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md`, `detail-stack-pivot.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` §4

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] 루트 `CLAUDE.md` 라인 31 web/mobile 설명에서 WebView 표현 제거
- [x] 루트 `CLAUDE.md` "프로젝트 구조" 표에 `packages/core` 행 추가
- [x] 루트 `CLAUDE.md` "기술 스택" 표 Mobile 행 (`+WebView` 제거), API 행 (Next.js API Routes → Supabase RPC), Nativewind v4 행 추가

## 구현 세부사항

### 1. 라인 31 web/mobile 설명 갱신

| 변경 전 | 변경 후 |
|---|---|
| `apps/mobile` Expo 52 (React Native) — WebView 래퍼 | `apps/mobile` Expo 52 (React Native) — 네이티브 클라이언트 |
| `apps/web` Next.js 15 — 메인 클라이언트 + API Routes | `apps/web` Next.js 15 — 정적 SPA (`output: 'export'`) |

### 2. "프로젝트 구조" 표에 `packages/core` 추가

```
└── packages/
    ├── core/               Supabase 클라이언트·도메인 로직·Realtime 훅 (web/mobile 공유)
    ├── ui/                 공유 UI 컴포넌트 (shadcn/ui + Radix)
    ├── shared/             공유 타입·유틸
    └── config/             공유 설정
```

### 3. "기술 스택" 표 갱신

| 영역 | 변경 전 | 변경 후 |
|---|---|---|
| Mobile | `Expo 52 + WebView` | `Expo 52 (React Native 네이티브)` |
| API | `Next.js API Routes (Vercel Serverless)` | `Supabase 직접 호출 + Postgres RPC 함수` |
| 스타일 (신규) | — | `Tailwind v4 (web), Nativewind v4 (mobile)` |

> Mobile 행에서 `+ WebView` / `WebView` 표현 일체를 제거한다.

### 4. 그 외 표현 점검

- API Routes 가 OAuth 콜백에 한해 사용되는 점은 별도 줄로 명시 (`apps/web/src/app/api/auth/callback` 만 OAuth 용)

## 주의사항

1. **WebView 잔존 표현 0건** — Mobile 관련 행 / 본문 모두 grep
2. **Next.js API Routes 표현 0건** — OAuth 콜백 표현은 별도 줄로 명확히 분리
3. **packages/core 가 web/mobile 양쪽에 공유된다는 점 표현** — 단순 한 줄로 두지 말고 책임 명시
4. **표 형식 / 인덴트 유지** — 기존 markdown 표/코드블록 컨벤션을 깨지 않는다

## 검증 체크리스트

- [x] `grep -n "WebView" CLAUDE.md` 결과 0건
- [x] `grep -n "packages/core" CLAUDE.md` 결과 1건 이상 (프로젝트 구조 표)
- [x] `grep -n "Nativewind" CLAUDE.md` 결과 1건 이상 (기술 스택 표)
- [x] `grep -n "Next.js API Routes" CLAUDE.md` 결과 0건 (OAuth 콜백 등 명시적 한정 표현 외)
- [x] 기술 스택 Mobile 행에 `WebView` 단어가 없다
