# API Contract

> 작성일: 2026-05-01
> 기반 문서: detail-todo-service-initialize.md
> 상태: Draft

---

## 1. 공통 규칙

### 1.1 접근 방식

이 프로젝트는 **Supabase + Next.js API Routes 하이브리드** 구조를 사용한다.

| 접근 방식 | 용도 |
|---|---|
| **Supabase SDK 직접 호출** | 단순 CRUD (Category, Epic, Sub Issue) — RLS로 보안 처리 |
| **Next.js API Routes** | 복합 비즈니스 로직 (이월, 집계 등 트랜잭션 필요 작업) |

### 1.2 인증

- Supabase Auth가 인증을 전담한다.
- 클라이언트는 `@supabase/ssr`을 통해 쿠키 기반 세션을 유지한다.
- Supabase SDK 호출 시 인증 헤더를 자동으로 포함한다 (별도 토큰 관리 불필요).
- Next.js API Routes에서는 `createClient`로 요청별 Supabase 클라이언트를 생성하여 사용자를 인증한다.

### 1.3 에러 형식

**Supabase SDK 에러**

```typescript
const { data, error } = await supabase.from('category').select('*');
if (error) {
  // error.message, error.code, error.details
}
```

**Next.js API Routes 에러**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이월 대상 날짜는 필수 항목입니다."
  }
}
```

| HTTP Status | code | 설명 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 요청 값 유효성 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증되지 않은 요청 |
| 403 | `FORBIDDEN` | 해당 리소스에 대한 접근 권한 없음 |
| 404 | `NOT_FOUND` | 리소스를 찾을 수 없음 |
| 409 | `CONFLICT` | 리소스 충돌 (중복, 하위 데이터 존재 등) |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 1.4 공통 Enum

```typescript
type Workspace = "life" | "work";

type Priority = "high" | "medium" | "low";

type TodoStatus = "todo" | "in_progress" | "done";

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
  category_id: string;
  title: string;
  description: string | null;
  status: EpicStatus;
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
    epic_issue!inner (
      id, title,
      category!inner (
        id, name, color, workspace
      )
    )
  `)
  .eq('scheduled_date', '2026-05-01')
  .eq('epic_issue.category.workspace', 'life');
```

> 클라이언트에서 `status`로 `done` / `inProgress` 섹션을 분리한다.

#### 투두 생성

```typescript
const { data, error } = await supabase
  .from('sub_issue')
  .insert({
    epic_issue_id: epicId,
    title: '장보기',
    description: '우유, 계란, 빵',
    priority: 'low',
    scheduled_date: '2026-05-01',
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

## 4. Next.js API Routes (복합 비즈니스 로직)

### 4.1 미완료 투두 일괄 이월

```
POST /api/todos/carry-over
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| fromDate | `string` | Y | 이월 대상 날짜 (`YYYY-MM-DD`) |
| toDate | `string` | Y | 이월 목표 날짜 (`YYYY-MM-DD`) |

```json
{
  "fromDate": "2026-04-30",
  "toDate": "2026-05-01"
}
```

**Response 200**

```json
{
  "carriedOverCount": 3
}
```

**동작**

1. 사용자 인증 확인 (`createClient`로 세션 검증)
2. `fromDate`에 `status`가 `todo` 또는 `in_progress`인 투두 조회 (RLS 적용)
3. 해당 투두들의 `scheduled_date`를 `toDate`로 변경, `carry_over_count`를 1 증가
4. 트랜잭션으로 일괄 처리

**구현 위치**: `apps/web/src/app/api/todos/carry-over/route.ts`

---

### 4.2 Epic 진행률 조회

```
GET /api/epics/{id}/progress
```

**Response 200**

```json
{
  "epicId": "uuid",
  "total": 10,
  "done": 3,
  "percentage": 30
}
```

**동작**

1. 사용자 인증 확인
2. Epic에 속한 Sub Issue의 총 개수와 `done` 상태 개수 집계
3. 백분율 계산

**구현 위치**: `apps/web/src/app/api/epics/[id]/progress/route.ts`

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
-- 본인 카테고리에 속한 Epic만 CRUD 가능
CREATE POLICY "Users can manage own epics"
  ON public.epic_issue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.category
      WHERE category.id = epic_issue.category_id
        AND category.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.category
      WHERE category.id = epic_issue.category_id
        AND category.user_id = auth.uid()
    )
  );
```

### 6.4 sub_issue

```sql
-- 본인 카테고리 → Epic에 속한 Sub Issue만 CRUD 가능
CREATE POLICY "Users can manage own sub issues"
  ON public.sub_issue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.epic_issue
      JOIN public.category ON category.id = epic_issue.category_id
      WHERE epic_issue.id = sub_issue.epic_issue_id
        AND category.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.epic_issue
      JOIN public.category ON category.id = epic_issue.category_id
      WHERE epic_issue.id = sub_issue.epic_issue_id
        AND category.user_id = auth.uid()
    )
  );
```

---

## 7. 공통 데이터 모델 (TypeScript)

클라이언트에서 사용하는 타입 정의이다. `packages/shared`에서 공유한다.
DB의 snake_case를 camelCase로 변환한 형태이다.

```typescript
// --- Enums ---

type Workspace = "life" | "work";
type Priority = "high" | "medium" | "low";
type TodoStatus = "todo" | "in_progress" | "done";
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
  workspace: Workspace;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface EpicIssue {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  status: EpicStatus;
  createdAt: string;
  updatedAt: string;
}

interface EpicIssueWithProgress extends EpicIssue {
  progress: {
    total: number;
    done: number;
  };
}

interface SubIssue {
  id: string;
  epicIssueId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TodoStatus;
  scheduledDate: string;
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
  inProgress: (SubIssue & {
    epic: Pick<EpicIssue, "id" | "title">;
    category: Pick<Category, "id" | "name" | "color">;
  })[];
}

// --- API Route Response ---

interface CarryOverResponse {
  carriedOverCount: number;
}

interface EpicProgressResponse {
  epicId: string;
  total: number;
  done: number;
  percentage: number;
}
```
