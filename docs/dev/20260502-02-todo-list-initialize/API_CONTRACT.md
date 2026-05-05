# API Contract

> 작성일: 2026-05-01
> 기반 문서: detail-todo-service-initialize.md
> 상태: Draft

---

## 1. 공통 규칙

### 1.1 접근 방식

이 프로젝트는 **Supabase 직접 호출 + Postgres RPC 함수** 의 이중 채널 구조를 사용한다. 자체 서버(Node 백엔드 / API Routes 비즈니스 로직) 는 운영하지 않는다.

| 접근 방식 | 용도 |
|---|---|
| **Supabase SDK 직접 호출** | 단순 CRUD (Category, Epic, Sub Issue) — RLS로 보안 처리 |
| **Postgres RPC 함수** | 복합 비즈니스 로직 (이월, 집계 등 트랜잭션 필요 작업) — `supabase.rpc(<fn>)` 호출, `SECURITY DEFINER` 로 권한 한정 |

### 1.2 인증

- Supabase Auth가 인증을 전담한다.
- 클라이언트는 `@supabase/ssr`을 통해 쿠키 기반 세션을 유지한다 (웹 SPA — OAuth 콜백 Route Handler 한정).
- Supabase SDK 호출 시 인증 헤더를 자동으로 포함한다 (별도 토큰 관리 불필요).
- Postgres RPC 호출 시 SDK 가 세션 토큰을 자동 첨부한다. RPC 본문에서 `auth.uid()` null 체크로 본인 데이터만 조작한다.

### 1.3 에러 형식

**Supabase SDK 에러**

```typescript
const { data, error } = await supabase.from('category').select('*');
if (error) {
  // error.message, error.code, error.details
}
```

**Postgres RPC 에러**

```typescript
const { data, error } = await supabase.rpc('carry_over_todos', { target_date: '2026-05-01' });
if (error) {
  // error.message, error.code (PostgreSQL SQLSTATE), error.details
}
```

| SQLSTATE | 의미 |
|---|---|
| `42501` | 권한 부족 (`auth.uid()` null 또는 RLS 거부) |
| `23503` | FK 위반 |
| `23505` | UNIQUE 제약 위반 |
| `P0001` | RPC 본문 `raise exception` (사용자 정의 메시지) |

### 1.4 공통 Enum

```typescript
type Workspace = "life" | "work";

type Priority = "high" | "medium" | "low";

type TodoStatus = "todo" | "done";

type EpicStatus = "active" | "completed" | "archived";

type AuthProvider = "google" | "kakao";
```

### 1.5 날짜/시간 형식

- 날짜: `YYYY-MM-DD` (예: `2026-05-01`)
- 타임스탬프: ISO 8601 (예: `2026-05-01T09:00:00.000Z`)

### 1.6 데이터베이스 컬럼 네이밍

- Supabase PostgreSQL은 **snake_case** 컬럼명을 사용한다.
- 클라이언트 타입은 **camelCase**로 변환하여 사용한다 (`packages/shared`에서 정의).

---

## 2. 인증 (Supabase Auth)

### 2.1 소셜 로그인

```typescript
// Google 로그인
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});

// Kakao 로그인
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'kakao',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### 2.2 OAuth 콜백 처리

Next.js App Router에서 콜백을 처리한다.

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
```

### 2.3 인증 상태 구독

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | ...
  // session: { user, access_token, refresh_token, ... }
});
```

### 2.4 로그아웃

```typescript
await supabase.auth.signOut();
```

### 2.5 현재 사용자 조회

```typescript
const { data: { user } } = await supabase.auth.getUser();
// user.id, user.email, user.user_metadata.name
```

---

## 3. Supabase 직접 호출 (단순 CRUD)

### 3.1 Category

#### 분류 목록 조회

```typescript
const { data, error } = await supabase
  .from('category')
  .select('*')
  .eq('workspace', 'life')
  .order('sort_order');
```

**Response 타입**

```typescript
interface Category {
  id: string;
  user_id: string;
  workspace: Workspace;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

#### 분류 생성

```typescript
const { data, error } = await supabase
  .from('category')
  .insert({
    workspace: 'life',
    name: '건강',
    color: '#4CAF50',
    sort_order: 0,
  })
  .select()
  .single();
```

> `user_id`는 RLS 정책에 의해 `auth.uid()`로 자동 설정된다 (DB default 또는 trigger).

#### 분류 수정

```typescript
const { data, error } = await supabase
  .from('category')
  .update({
    name: '건강관리',
    color: '#66BB6A',
  })
  .eq('id', categoryId)
  .select()
  .single();
```

#### 분류 삭제

```typescript
const { error } = await supabase
  .from('category')
  .delete()
  .eq('id', categoryId);
```

> 하위 Epic이 존재할 경우 FK 제약에 의해 에러가 발생한다.

---

### 3.2 Epic Issue

#### Epic 목록 조회

```typescript
const { data, error } = await supabase
  .from('epic_issue')
  .select(`
    *,
    sub_issue(count)
  `)
  .eq('category_id', categoryId);
```

**Response 타입**

```typescript
interface EpicIssue {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  status: EpicStatus;
  registered_date: string | null;
  completed_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}
```

#### Epic 생성

```typescript
const { data, error } = await supabase
  .from('epic_issue')
  .insert({
    category_id: categoryId,
    title: '3월 운동 루틴',
    description: '매일 아침 운동 실천하기',
  })
  .select()
  .single();
```

#### Epic 수정

```typescript
const { data, error } = await supabase
  .from('epic_issue')
  .update({
    title: '5월 운동 루틴',
    status: 'completed',
  })
  .eq('id', epicId)
  .select()
  .single();
```

#### Epic 삭제

```typescript
const { error } = await supabase
  .from('epic_issue')
  .delete()
  .eq('id', epicId);
```

> 하위 Sub Issue가 존재할 경우 FK 제약에 의해 에러가 발생한다.

---

### 3.3 Sub Issue (Todo)

#### 일자별 투두 조회

```typescript
const { data, error } = await supabase
  .from('sub_issue')
  .select(`
    *,
    epic:epic_issue!inner (
      id, title,
      category:category!inner (
        id, name, color, workspace
      )
    )
  `)
  .eq('due_date', '2026-05-01')
  .eq('epic.category.workspace', 'life');
```

> 클라이언트에서 `status`로 `done` / `todo` 섹션을 분리한다.

#### 투두 생성

```typescript
const { data, error } = await supabase
  .from('sub_issue')
  .insert({
    epic_id: epicId,
    title: '장보기',
    description: '우유, 계란, 빵',
    priority: 'low',
    due_date: '2026-05-01',
  })
  .select()
  .single();
```

#### 투두 수정

```typescript
const { data, error } = await supabase
  .from('sub_issue')
  .update({
    title: '장보기 (마트)',
    priority: 'medium',
  })
  .eq('id', todoId)
  .select()
  .single();
```

#### 투두 상태 변경

```typescript
// 완료 처리
const { data, error } = await supabase
  .from('sub_issue')
  .update({
    status: 'done',
    completed_date: new Date().toISOString().split('T')[0],
  })
  .eq('id', todoId)
  .select()
  .single();

// 완료 취소
const { data, error } = await supabase
  .from('sub_issue')
  .update({
    status: 'todo',
    completed_date: null,
  })
  .eq('id', todoId)
  .select()
  .single();
```

#### 투두 삭제

```typescript
const { error } = await supabase
  .from('sub_issue')
  .delete()
  .eq('id', todoId);
```

---

## 4. Postgres RPC 함수

`SECURITY DEFINER` + `auth.uid()` null 체크로 본인 데이터만 조작한다.
모든 RPC 는 `grant execute … to authenticated`, `revoke … from anon, public` 을 적용한다.

### 4.1 carry_over_todos(target_date date) → { moved_count integer }

- **입력**: `target_date date` (오늘 날짜 등 일괄 이월할 기준일)
- **처리**: 미완료 sub_issue (`status <> 'done'` — 즉 `todo`) 의 `due_date` 를 `target_date` 로 일괄 갱신, `carry_over_count` +1. 단일 트랜잭션 내에서 처리
- **반환**: `{ moved_count integer }` (이월된 행 수)
- **권한**: `authenticated` 만 실행 가능 (`SECURITY DEFINER` + `auth.uid()` null 체크)

```typescript
const { data, error } = await supabase.rpc('carry_over_todos', {
  target_date: '2026-05-01',
});
// data: { moved_count: 3 }
```

### 4.2 recalc_epic_progress(epic_id uuid) → { progress numeric }

- **입력**: `epic_id uuid`
- **처리**: 해당 epic 의 sub_issue 진행률 (완료/전체) 을 재계산해 `epic_issue.progress` 컬럼에 저장
- **반환**: `{ progress numeric }` (0~1 범위)
- **권한**: `authenticated` 만 실행 가능 (`SECURITY DEFINER` + `auth.uid()` null 체크)

```typescript
const { data, error } = await supabase.rpc('recalc_epic_progress', {
  epic_id: epicId,
});
// data: { progress: 0.3 }
```

> 정확한 컬럼/타입은 Sub-03 의 SQL 정의 시 본 섹션과 1:1 정합되도록 갱신한다. 함수명·인자명·반환 타입은 `main-prd-stack-pivot.md` §데이터베이스 스키마 마이그레이션 4·5 와 동일하게 유지한다.

---

## 5. Realtime 구독

### 5.1 투두 변경 구독

```typescript
const channel = supabase
  .channel('sub_issue_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sub_issue',
    },
    (payload) => {
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: 변경 후 데이터
      // payload.old: 변경 전 데이터 (UPDATE, DELETE 시)
    },
  )
  .subscribe();

// 구독 해제
supabase.removeChannel(channel);
```

### 5.2 카테고리/Epic 변경 구독

```typescript
const channel = supabase
  .channel('category_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'category',
  }, handleChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'epic_issue',
  }, handleChange)
  .subscribe();
```

---

## 6. Row Level Security (RLS) 정책

### 6.1 profile

```sql
-- 본인 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON public.profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profile FOR UPDATE
  USING (auth.uid() = id);
```

### 6.2 category

```sql
-- 본인 카테고리만 CRUD 가능
CREATE POLICY "Users can manage own categories"
  ON public.category FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 6.3 epic_issue

```sql
-- 본인 epic 만 CRUD 가능 (user_id 비정규화 기반 — 002 마이그레이션 참고)
CREATE POLICY "Users can manage own epics"
  ON public.epic_issue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 6.4 sub_issue

```sql
-- 본인 sub_issue 만 CRUD 가능 (user_id 비정규화 기반 — 002 마이그레이션 참고)
CREATE POLICY "Users can manage own sub issues"
  ON public.sub_issue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 7. 공통 데이터 모델 (TypeScript)

클라이언트에서 사용하는 타입 정의이다. `packages/shared`에서 공유한다.
DB의 snake_case를 camelCase로 변환한 형태이다.

```typescript
// --- Enums ---

type Workspace = "life" | "work";
type Priority = "high" | "medium" | "low";
type TodoStatus = "todo" | "done";
type EpicStatus = "active" | "completed" | "archived";
type AuthProvider = "google" | "kakao";

// --- Entities ---

interface User {
  id: string;
  email: string;
  name: string;
}

interface Profile {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  userId: string;
  workspace: Workspace;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface EpicIssue {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  status: EpicStatus;
  registeredDate: string | null;
  completedDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface SubIssue {
  id: string;
  userId: string;
  epicId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TodoStatus;
  dueDate: string | null;
  completedDate: string | null;
  carryOverCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- Todo 일자별 조회 View ---

interface TodoDailyView {
  date: string;
  done: (SubIssue & {
    epic: Pick<EpicIssue, "id" | "title">;
    category: Pick<Category, "id" | "name" | "color">;
  })[];
  todo: (SubIssue & {
    epic: Pick<EpicIssue, "id" | "title">;
    category: Pick<Category, "id" | "name" | "color">;
  })[];
}

// --- Postgres RPC Response ---

interface CarryOverTodosResult {
  moved_count: number;
}

interface RecalcEpicProgressResult {
  progress: number;
}
```
