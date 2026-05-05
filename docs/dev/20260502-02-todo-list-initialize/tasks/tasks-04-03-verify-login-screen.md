# TASK-04-03: `app/(auth)/login.tsx` 정합 검증 + 한글 라벨·에러 토스트 보강

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 03
- **상태**: 대기중
- **의존성**: 01 (deps), 02 (root deep link 폴백)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/app/(auth)/login.tsx` 는 OAuth 흐름 (`expo-auth-session` + `exchangeCodeForSession` + `router.replace('/(main)/life')`) 골격을 이미 갖췄다. 본 task 는 sub-prd-04 §2 와 정합한지 검증하고, MVP 사용 경험을 위해 (a) 버튼 라벨을 "Google 로 계속하기" 로 통일, (b) 실패 시 사용자가 인지 가능한 피드백 (Alert) 추가만 보강한다. (sub-prd §작업 2 "신설" 표기는 사실과 다름 — 정합 검증으로 대체.)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/(auth)/login.tsx` | 수정 | 라벨 정정 + 실패 Alert + try/catch |

### 구현 세부사항

```tsx
// apps/mobile/src/app/(auth)/login.tsx
import * as AuthSession from 'expo-auth-session';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'dopamine-planner',
        path: 'auth/callback',
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('로그인 URL 생성 실패');

      const result = await AuthSession.startAsync({ authUrl: data.url });
      if (result.type !== 'success' || !result.params.code) {
        if (result.type === 'cancel' || result.type === 'dismiss') return; // 사용자 취소
        throw new Error('OAuth 응답 오류');
      }

      const { error: exErr } = await supabase.auth.exchangeCodeForSession(result.params.code);
      if (exErr) throw exErr;

      router.replace('/(main)/life');
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.message ?? '다시 시도해 주세요.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-8 text-2xl font-bold text-foreground">투두 리스트</Text>
      <Pressable
        onPress={handleLogin}
        className="rounded-md bg-primary px-6 py-3 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Google 로 로그인"
      >
        <Text className="text-base font-medium text-primary-foreground">Google 로 계속하기</Text>
      </Pressable>
    </View>
  );
}
```

### 핵심 포인트

- 기존 흐름 (OAuth → deep link → exchange → navigate) 유지
- `try/catch` + `Alert` 만 추가 — 사용자 피드백
- 사용자 취소 (`cancel`/`dismiss`) 는 silent 처리 (에러 아님)
- 한글 라벨 + accessibility 속성 추가

## 검증 과정

- [ ] `(auth)/login.tsx` 에 try/catch + `Alert.alert` 존재
- [ ] 사용자 취소 시 silent (Alert 미표시)
- [ ] 버튼 라벨 "Google 로 계속하기"
- [ ] `router.replace('/(main)/life')` 유지
- [ ] `accessibilityRole="button"` + `accessibilityLabel`
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] iOS 시뮬레이터에서 로그인 버튼 탭 → 브라우저 launch (실제 OAuth 는 Supabase 콘솔 redirect URI 설정 필요)
- [ ] OAuth 거부 시 Alert 표시

## 주의사항

1. **Sub-PRD 본문과 코드 현실 불일치** — sub-prd-04 §작업 2 "login.tsx 신설" 은 사실과 다름 (이미 stack-pivot Sub-05 가 머지). 본 task 는 검증·보강. 별도 docs PR 에서 본문을 "정합 검증" 으로 정정 권장.
2. **`(auth)/callback.tsx` 미신설 정책 유지** — `apps/mobile/CLAUDE.md` 명시 정책. 콜백은 `(auth)/login.tsx` 의 `startAsync` 결과로 처리.
3. **`exchangeCodeForSession` idempotent 아님** — task 02 의 root deep link handler 와 본 화면이 동일 code 를 두 번 처리할 수 있음. 두 번째 호출은 에러 반환 — Alert 으로 노출되지 않도록 (또는 에러 메시지 silent 처리) 검토 필요. MVP 는 일단 Alert.
4. **Supabase Dashboard redirect URI** — `dopamine-planner://auth/callback` 가 화이트리스트에 등록되어야 OAuth 성공. 본 task 의 코드 변경 외 인프라 설정 의존.
5. **`accessibilityLabel` 한글** — 스크린리더 읽기 정확성을 위해 한글 라벨 명시. `accessibilityRole="button"` 은 RN 표준.
6. **`Alert` 사용 이유** — 모바일은 `sonner` 같은 toast 라이브러리 미사용 (web 과 다름). RN 표준 `Alert` 으로 충분 (MVP).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §2 로그인 화면, §3 OAuth deep link, §핵심 구현 로직 "OAuth deep link"
- `apps/mobile/CLAUDE.md` — `(auth)/callback.tsx` 미신설 정책
