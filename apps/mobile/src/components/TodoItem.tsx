import { Pressable, Text, View, type ViewStyle } from 'react-native';
import type { SubIssueWithJoins } from '@todo-list/core';

type Props = {
  todo: SubIssueWithJoins;
  category?: { name: string; color?: string };
  priority?: 'high' | 'medium' | 'low' | null;
  carryOverCount?: number;
  onToggle: (todo: SubIssueWithJoins) => void;
  onPress: (todo: SubIssueWithJoins) => void;
};

const PRIORITY_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function priorityBadgeColors(p: 'high' | 'medium' | 'low'): {
  bg: string;
  text: string;
} {
  if (p === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
  if (p === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
  return { bg: '#F2F2F2', text: '#6B7280' };
}

export function TodoItem({
  todo,
  category,
  priority,
  carryOverCount,
  onToggle,
  onPress,
}: Props) {
  const done = todo.status === 'done';
  const showTags = !!priority || !!category;
  const hasCarryOver = !!(carryOverCount && carryOverCount > 0);

  // grid 2-row 시뮬레이션: flex-col 안에 tags row + 가운데 row (체크박스 + 제목 + trailing)
  return (
    <Pressable
      onPress={() => onPress(todo)}
      accessibilityRole="button"
      accessibilityLabel={`${todo.title} 상세 보기`}
      className="border-b border-border bg-background px-4 py-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      } as ViewStyle)}
    >
      {showTags ? (
        <View className="ml-7 mb-0.5 flex-row items-center gap-1">
          {priority ? (
            <View
              accessibilityLabel={`우선순위 ${PRIORITY_LABEL[priority]}`}
              className="rounded-sm px-1"
              style={{
                backgroundColor: priorityBadgeColors(priority).bg,
                opacity: done ? 0.5 : 1,
              }}
            >
              <Text
                className="text-[9px] font-medium"
                style={{ color: priorityBadgeColors(priority).text, lineHeight: 12 }}
              >
                {PRIORITY_LABEL[priority]}
              </Text>
            </View>
          ) : null}
          {category ? (
            <View
              className="rounded-sm bg-purple-100 px-1"
              style={{ opacity: done ? 0.5 : 1 }}
            >
              <Text
                className="text-[9px] font-medium text-purple-700"
                style={{ lineHeight: 12 }}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onToggle(todo);
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`${todo.title} ${done ? '완료 해제' : '완료'}`}
          hitSlop={8}
          className="items-center justify-center"
        >
          <View
            className={`h-[18px] w-[18px] items-center justify-center rounded-sm ${
              done ? 'border-2 border-purple-500 bg-purple-500' : 'border-2 border-periwinkle-300'
            }`}
          >
            {done ? <Text className="text-[10px] text-white">✓</Text> : null}
          </View>
        </Pressable>

        <Text
          className={`flex-1 text-sm ${
            done ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
          numberOfLines={1}
        >
          {todo.title}
        </Text>

        {hasCarryOver ? (
          <View className="rounded-sm bg-gray-50 px-1">
            <Text
              className="text-[9px] font-medium text-periwinkle-500"
              style={{ lineHeight: 12 }}
            >
              +{carryOverCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
