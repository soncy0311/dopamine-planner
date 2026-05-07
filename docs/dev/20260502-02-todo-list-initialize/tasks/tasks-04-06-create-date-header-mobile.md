# TASK-04-06: `components/DateHeaderMobile.tsx` 신설 (월 + 주간)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 06
- **상태**: 완료
- **의존성**: 01 (deps), 사실상 sub-prd-01 의 date util 의존 (Sub-01 task 12·13 권장 선행)

## 작업 목표

Sub-04 §5 의 "상단 DateHeader (월 + 주간) — 탭으로 일자 선택" 컴포넌트를 신설한다. Web 의 `<DateNavigator>` (Sub-02 task 05) 와 동일 책임 — 현재 월 + 주간 7 일 셀, 탭 선택 시 `onDateChange` 콜백. 키보드 단축키는 모바일 미적용. 좌우 스와이프는 본 task 가 아니라 task 08 (MainDailyViewMobile) 책임.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/DateHeaderMobile.tsx` | 신설 | `<DateHeaderMobile date onDateChange />` |

### Props

```ts
type Props = {
  date: string;             // YYYY-MM-DD
  onDateChange: (next: string) => void;
};
```

### 구현 세부사항

```tsx
// apps/mobile/src/components/DateHeaderMobile.tsx
import { Pressable, Text, View } from 'react-native';
import { useMemo } from 'react';

type Props = {
  date: string;
  onDateChange: (next: string) => void;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function DateHeaderMobile({ date, onDateChange }: Props) {
  const { monthLabel, weekDates } = useMemo(() => {
    const d = new Date(date + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    // 주의 일요일 시작 7일
    const day = d.getDay(); // 0=Sun
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    const week = Array.from({ length: 7 }, (_, i) => {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      return { iso: `${yyyy}-${mm}-${dd}`, day: cur.getDate(), wday: i };
    });
    return {
      monthLabel: `${year}년 ${month}월`,
      weekDates: week,
    };
  }, [date]);

  return (
    <View className="border-b border-border bg-background py-3">
      <Text className="px-4 text-base font-semibold text-foreground">{monthLabel}</Text>
      <View className="mt-2 flex-row justify-between px-2">
        {weekDates.map((w) => {
          const selected = w.iso === date;
          return (
            <Pressable
              key={w.iso}
              onPress={() => onDateChange(w.iso)}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                selected ? 'bg-primary' : ''
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${w.iso} 선택`}
            >
              <Text
                className={`text-xs ${
                  selected ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {DAY_LABELS[w.wday]}
              </Text>
              <Text
                className={`text-base font-medium ${
                  selected ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {w.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
```

### 핵심 포인트

- 일요일 시작 주 7 셀 (`getDay() === 0` 기준)
- 선택된 날짜는 primary bg + primary-foreground text
- `accessibilityRole="button"` + `accessibilityLabel` (스크린리더)
- `useMemo` 로 date 계산 캐싱 (re-render 비용 최소)
- 키보드 단축키 X (모바일 미적용)
- 월/주간 동기화 — 주 시작일이 month boundary 를 넘으면 표시되는 month 와 다른 일자 포함 가능 (디자인은 sub-prd 미상세, MVP 는 단순 표기)

## 검증 과정

- [x] `apps/mobile/src/components/DateHeaderMobile.tsx` 파일 존재
- [x] Props (`date`, `onDateChange`) 정합
- [x] 일요일 시작 7 셀 렌더
- [x] 선택 셀 시각 강조 (primary bg)
- [x] 탭 시 `onDateChange(iso)` 호출
- [x] `accessibilityRole`/`accessibilityLabel` 속성
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건
- [ ] 시뮬레이터에서 7개 날짜 셀 + 월 라벨 시각 확인 — **수동 확인 필요**

## 주의사항

1. **date 포맷 일관** — `YYYY-MM-DD` ISO. timezone shift 방지 위해 `+ 'T00:00:00'` 로 로컬 자정 강제 (기존 web 의 `useDateQuery` 와 동일 패턴).
2. **주 시작 요일** — 일요일 (`day === 0`). 디자인 시스템 변경 시 본 컴포넌트도 함께 갱신.
3. **키보드 단축키 X** — sub-prd §5 명시. RN 은 키보드 입력 컨텍스트 다름 (외부 키보드 케이스 제외).
4. **좌우 스와이프 분리** — 본 task 는 헤더만. 스와이프는 task 08 (MainDailyViewMobile) 책임.
5. **Nativewind 색 토큰** — `bg-primary`, `text-foreground` 등은 `packages/config/tailwind.config.js` 의 토큰. 디자인 시스템 (`docs/base/design-system/tokens.md`) 와 일치 검증은 task 15 책임.
6. **hit area** — 셀 크기 `h-12 w-12` (48x48) 로 최소 hit area 44x44 충족 (sub-prd §6).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §5 메인 일자 뷰
- `apps/web/src/components/ui/DateNavigator.tsx` (Sub-02 task 05) — 웹 카운터파트
- `docs/base/design-system/tokens.md`
