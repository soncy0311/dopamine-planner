# Task 03-05: env example 갱신 (web / mobile)

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 없음 (병렬 가능 — 단, 03-04 완료 후 권장)
- **대상 파일**:
  - `env/.env.web.example`
  - `env/.env.mobile.example`
- **참조 파일**: `main-prd-stack-pivot.md` (§1 — 자체 서버 0 / WebView 폐기), `sub-prd-03-feat-supabase-infra.md` (§4 환경 변수 갱신)

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `env/.env.web.example` 갱신 (SERVICE_ROLE_KEY 제거)
- [ ] `env/.env.mobile.example` 갱신 (EXPO_PUBLIC_SUPABASE_URL/ANON_KEY 추가, WEBVIEW_URL 제거)

## 구현 세부사항

### 1. `env/.env.web.example`

**현재 상태** (Sub-PRD 작성 시점):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**변경 후**:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- `SUPABASE_SERVICE_ROLE_KEY=` 줄 제거
- 사유:
  - 본 프로젝트는 자체 서버 0 구조 (main PRD §1) — Vercel 서버리스 호출도 클라이언트 anon key + RLS 만으로 충분
  - service_role key 는 어떤 클라이언트에도 주입 금지 (Sub-PRD §주의사항 6)

### 2. `env/.env.mobile.example`

**현재 상태**:

```
EXPO_PUBLIC_WEBVIEW_URL=http://localhost:3000
```

**변경 후**:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- `EXPO_PUBLIC_WEBVIEW_URL=` 줄 제거
- `EXPO_PUBLIC_SUPABASE_URL=`, `EXPO_PUBLIC_SUPABASE_ANON_KEY=` 추가
- 사유:
  - WebView 래퍼 폐기 → RN 네이티브 화면 + Supabase 직접 호출 (main PRD §1)
  - Expo 는 `EXPO_PUBLIC_` 접두사 변수만 클라이언트 번들에 포함 (루트 CLAUDE.md §환경 변수 관리)

### 3. `.env.*.local` 미수정

- `.env.web.local`, `.env.mobile.local` 은 `.gitignore` 처리된 사용자 본인 값 — 본 task 에서 건드리지 않는다
- 사용자가 본인 Supabase 프로젝트 URL/anon key 로 별도 채워 사용 (03-06 원격 적용 후 Dashboard 에서 복사)

## 주의사항

1. **`.env.*.local` 미수정** — gitignore 처리된 사용자 본인 값. 본 task 는 example 만 갱신
2. **service_role key 노출 금지** — `.env.web.example` 에 `SUPABASE_SERVICE_ROLE_KEY=` 줄을 다시 넣지 않는다. 어떤 클라이언트(웹/모바일/팩토리)에도 주입 금지 (Sub-PRD §주의사항 6)
3. **`EXPO_PUBLIC_` 접두사 필수** — 모바일 변수는 반드시 `EXPO_PUBLIC_` 접두사. 누락 시 RN 번들에 포함되지 않음
4. **빈 값으로 둔다** — example 파일은 `KEY=` 형태로 값 없이 둔다. 실제 값은 `.local` 파일에서 채움

## 검증 체크리스트

- [ ] `grep -n "SUPABASE_SERVICE_ROLE_KEY" env/.env.web.example` 결과 0건
- [ ] `grep -n "NEXT_PUBLIC_SUPABASE_URL" env/.env.web.example` 결과 1건
- [ ] `grep -n "NEXT_PUBLIC_SUPABASE_ANON_KEY" env/.env.web.example` 결과 1건
- [ ] `grep -n "EXPO_PUBLIC_WEBVIEW_URL" env/.env.mobile.example` 결과 0건
- [ ] `grep -n "EXPO_PUBLIC_SUPABASE_URL" env/.env.mobile.example` 결과 1건
- [ ] `grep -n "EXPO_PUBLIC_SUPABASE_ANON_KEY" env/.env.mobile.example` 결과 1건
- [ ] `wc -l env/.env.web.example` — 2줄 (또는 trailing newline 포함 3줄)
- [ ] `wc -l env/.env.mobile.example` — 2줄 (또는 trailing newline 포함 3줄)
