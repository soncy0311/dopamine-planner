# Task 05-08: 다중 디바이스 Realtime sync 검증 게이트

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**:
  - 05-07 완료 (mobile OAuth 정상 동작)
  - Sub-04 task 04-07 완료 (web build 통과)
- **대상 파일**: 없음 (검증 task — main PRD §종료 게이트)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-03-feat-supabase-infra.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] **검증 게이트**: 웹 `/life` + iOS `(main)/life` 동시 접속 → todo 추가 시 양쪽 즉시 반영 *(사용자 환경)*

## 구현 세부사항

본 task 는 코드 변경 없는 **검증 게이트**. main PRD §종료 게이트 충족을 확인한다.

### 1. 사전 준비

- 동일 Supabase 프로젝트 사용 (web/mobile 양쪽의 `EXPO_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` 일치)
- 동일 Google 계정으로 양쪽 로그인 (RLS workspace 필터가 동일 user_id 기준)

### 2. 양쪽 클라이언트 부팅

**Terminal A — 웹**
```bash
pnpm --filter @todo-list/web dev
# 브라우저에서 http://localhost:3000/life 진입 + Google 로그인
```

**Terminal B — 모바일**
```bash
pnpm --filter @todo-list/mobile dev
# iOS 시뮬레이터에서 (auth)/login → Google 로그인 → (main)/life 진입
```

### 3. INSERT 동기화 검증

Supabase SQL Studio (또는 한 쪽 클라이언트의 todo 추가 UI) 에서 다음 INSERT 실행. `sub_issue` 에는 `workspace` 칼럼이 없으므로, `epic_issue → category` 를 JOIN 하여 `workspace='life'` 인 epic 의 id 를 사용한다.

```sql
-- life workspace 의 epic 한 개에 todo 추가
INSERT INTO sub_issue (user_id, epic_id, title, due_date)
SELECT auth.uid(), e.id, '테스트 todo', current_date
  FROM epic_issue e
  JOIN category c ON c.id = e.category_id
 WHERE c.user_id = auth.uid() AND c.workspace = 'life'
 LIMIT 1;
```

**기대 동작**: 웹 `/life` + iOS `(main)/life` 양쪽에 1초 이내 반영 (Realtime publication → channel → invalidateQueries → refetch).

### 4. UPDATE / DELETE 동기화 검증

- 한 쪽에서 todo 의 `done` 토글 → 다른 쪽 즉시 반영 (양방향)
- 한 쪽에서 todo 삭제 → 다른 쪽 화면에서 사라짐

### 5. workspace 필터 검증

`workspace='work'` 인 epic 에 todo 를 INSERT → `(main)/life` 화면에는 반영되지 않아야 함.

> **구현 의미**: Sub-PRD-04 결정에 따라 `subscribeTodos` 자체는 `sub_issue` 테이블 전체를 광역 구독한 뒤 callback 으로 invalidate 만 한다. 따라서 work workspace INSERT 도 mobile life 화면의 invalidate 는 트리거하지만, `useTodos` 의 query 가 자체적으로 `epic.category.workspace='life'` 필터를 걸기 때문에 refetch 결과에 work todo 는 포함되지 않아 화면 변동이 발생하지 않는다.

## 주의사항

1. **본 task 가 main PRD §종료 게이트** — 실패 시 `subscribeTodos` 본문 (Sub-04 task 04-06) 또는 RLS workspace 필터 (Sub-03 task 03-02/03-03) 문제 의심
2. **"즉시 반영" 정의** — 1초 이내. 5초 이상 지연 시 channel 구독 실패로 간주하고 `supabase.realtime` 연결 상태 점검
3. **동일 계정 필수** — 다른 계정 시 RLS 가 차단하여 sync 실패. 디버깅 시 SQL Studio 에서 `auth.uid()` 일치 확인
4. **publication 누락 점검** — Sub-03 task 03-03 에서 `supabase_realtime` publication 에 `sub_issue` 가 추가되었는지 확인
5. **시뮬레이터 백그라운드 진입 시 channel 끊김 가능** — RN 의 background mode 에서 WebSocket 이 종료될 수 있음. 본 검증은 foreground 상태로 수행
6. **네트워크 격리 환경** — 회사 VPN / 방화벽이 Supabase realtime WebSocket 을 차단할 수 있음. 검증 실패 시 모바일 hotspot 으로 재시도

## 검증 체크리스트 (수동)

- [ ] 웹 + iOS 동시 접속 가능 (세션 충돌 없음)
- [ ] `workspace='life'` INSERT 시 양쪽 즉시 반영 (1초 이내)
- [ ] `workspace='life'` UPDATE 시 양쪽 즉시 반영
- [ ] `workspace='life'` DELETE 시 양쪽 즉시 반영
- [ ] `workspace='work'` 인 epic 에 INSERT 시 `(main)/life` 화면에는 반영되지 않음 (useTodos 의 자체 workspace 필터 검증)
- [ ] 양쪽 클라이언트 모두 `auth.uid()` 동일 (SQL Studio 에서 `select auth.uid()` 확인)
- [ ] main PRD §종료 게이트 (다중 디바이스 sync) 충족 → Sub-PRD 05 종료
