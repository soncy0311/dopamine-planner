# TASK-04-14: `(main)/settings/index.tsx` 보강 (계정 + 분류·Epic 진입 + 로그아웃)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 14
- **상태**: 완료
- **의존성**: 04 (`useLogout`), 13 (categories/epics 페이지)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/app/(main)/settings/index.tsx` 의 stub 을 보강한다. 계정 정보 (이메일), 분류 관리 / Epic 관리 진입 링크, 로그아웃 버튼 (`useLogout`) 까지 구성. Sub-04 §8 의 "설정 화면" 책임 구현.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(main)/settings/index.tsx` | 수정 | 계정 정보 + 진입 링크 + 로그아웃 |

### 구현 세부사항

```tsx
// apps/mobile/src/app/(main)/settings/index.tsx
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLogout } from '@/lib/auth/logout';

export default function SettingsPage() {
  const router = useRouter();
  const logout = useLogout();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {/* 계정 */}
      <View className="border-b border-border bg-card px-4 py-4">
        <Text className="text-xs text-muted-foreground">계정</Text>
        <Text className="mt-1 text-base text-foreground">{email ?? '-'}</Text>
      </View>

      {/* 메뉴 */}
      <View className="mt-6">
        <Pressable
          onPress={() => router.push('/categories')}
          className="flex-row items-center justify-between border-b border-border bg-card px-4 py-4"
          accessibilityRole="button"
          accessibilityLabel="분류 관리"
        >
          <Text className="text-base text-foreground">분류 관리</Text>
          <Text className="text-muted-foreground">›</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/epics')}
          className="flex-row items-center justify-between border-b border-border bg-card px-4 py-4"
          accessibilityRole="button"
          accessibilityLabel="Epic 관리"
        >
          <Text className="text-base text-foreground">Epic 관리</Text>
          <Text className="text-muted-foreground">›</Text>
        </Pressable>
      </View>

      {/* 로그아웃 */}
      <Pressable
        onPress={handleLogout}
        className="mx-4 mt-10 items-center rounded-md border border-red-600 py-3"
        accessibilityRole="button"
        accessibilityLabel="로그아웃"
      >
        <Text className="text-red-600">로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}
```

### 핵심 포인트

- `useLogout` 훅 (task 04) 단일 진입점
- 로그아웃 confirm 은 `Alert.alert` (RN 표준)
- `supabase.auth.getUser()` 로 이메일 표시 — `onAuthStateChange` 까진 불필요 (settings 진입 시점 1회)
- 분류·Epic 진입은 `router.push('/categories')` / `'/epics'` — task 13 의 라우트
- 디자인 시스템 list-item 패턴 (좌측 라벨 + 우측 chevron)

## 검증 과정

- [x] `(main)/settings/index.tsx` 가 stub 에서 보강됨
- [x] 계정 이메일 표시 (`supabase.auth.getUser()`)
- [x] 분류 관리 / Epic 관리 두 메뉴 — push 동작
- [x] 로그아웃 버튼 → Alert confirm → `useLogout()` 호출
- [x] 로그아웃 후 `/(auth)/login` 으로 redirect (helper 책임)
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건
- [ ] 시뮬레이터에서 설정 탭 진입 + 로그아웃 → 로그인 화면 복귀 — **수동 확인 필요**

## 주의사항

1. **로그아웃 confirm** — `Alert.alert` 사용. `destructive` style 로 위험 강조.
2. **이메일 fetch 시점** — settings 마운트 1 회. 계정 정보 변경은 MVP 미고려.
3. **chevron 표시 (`›`)** — 단순 문자. 디자인 시스템에 icon 정의 시 교체.
4. **categories/epics 가 (main) 외부** — task 13 의 페이지가 `(main)` 그룹 밖이라 settings 에서 외부 라우트 push. tab bar 가 사라진 풀스크린 진입 — sub-prd §8 의 "풀스크린 라우트" 와 정합.
5. **로그아웃 helper 단일 의존** — `useLogout` 만 사용. signOut/clear/replace 를 본 페이지에 재구현 금지.
6. **계정 0 개 케이스** — getUser 가 null 반환 시 (`-` 표시). 정상 흐름엔 발생 안 함 ((main) 가드).
7. **destructive Alert button 색** — iOS 만 빨강. Android 는 같은 색. 디자인 시스템 일관 위해 추후 커스텀 dialog 검토.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §8 관리·설정
- `apps/web/src/app/(main)/settings/page.tsx` (Sub-03 task 12) — web 카운터파트
