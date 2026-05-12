import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  date: string;
  onDateChange: (next: string) => void;
  completedCounts?: Record<string, number>;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function dotCount(count: number): number {
  if (count <= 0) return 0;
  return count < 5 ? count : 0;
}

function starCount(count: number): number {
  return count >= 5 ? Math.floor(count / 5) : 0;
}

function completedLabel(base: string, count: number): string {
  return count > 0 ? `${base}, 완료 Epic ${count}개` : base;
}

function CompletedIndicator({ count }: { count: number }) {
  const dots = dotCount(count);
  const stars = starCount(count);
  if (dots === 0 && stars === 0) return <View className="h-2" />;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-2 flex-row items-center justify-center gap-0.5"
    >
      {stars > 0 ? (
        <Text className="text-[9px] leading-none text-primary">
          {'★'.repeat(stars)}
        </Text>
      ) : null}
      {Array.from({ length: dots }, (_, index) => (
        <View key={index} className="h-1 w-1 rounded-full bg-primary" />
      ))}
    </View>
  );
}

export function DateHeaderMobile({
  date,
  onDateChange,
  completedCounts = {},
}: Props) {
  const { monthLabel, weekDates } = useMemo(() => {
    const d = new Date(date + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    const week = Array.from({ length: 7 }, (_, i) => {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      return { iso: toIso(cur), day: cur.getDate(), wday: i };
    });
    return { monthLabel: `${year}년 ${month}월`, weekDates: week };
  }, [date]);

  return (
    <View className="border-b border-border bg-background py-3">
      <Text className="px-4 text-base font-semibold text-foreground">{monthLabel}</Text>
      <View className="mt-2 flex-row justify-between px-2">
        {weekDates.map((w) => {
          const selected = w.iso === date;
          const completedCount = completedCounts[w.iso] ?? 0;
          return (
            <Pressable
              key={w.iso}
              onPress={() => onDateChange(w.iso)}
              className={`h-14 w-12 items-center justify-center rounded-full ${
                selected ? 'bg-primary' : ''
              }`}
              accessibilityRole="button"
              accessibilityLabel={completedLabel(`${w.iso} 선택`, completedCount)}
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
              <CompletedIndicator count={completedCount} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
