import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  date: string;
  onDateChange: (next: string) => void;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function DateHeaderMobile({ date, onDateChange }: Props) {
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
