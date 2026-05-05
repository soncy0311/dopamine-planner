import { Pressable, Text, View } from 'react-native';
import type { SubIssueWithJoins } from '@todo-list/core';

type Props = {
  todo: SubIssueWithJoins;
  onToggle: (todo: SubIssueWithJoins) => void;
  onPress: (todo: SubIssueWithJoins) => void;
};

export function TodoItem({ todo, onToggle, onPress }: Props) {
  const done = todo.status === 'done';
  return (
    <View className="flex-row items-center border-b border-border bg-background">
      <Pressable
        onPress={() => onToggle(todo)}
        className="min-h-11 min-w-11 items-center justify-center px-4 py-3"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`${todo.title} ${done ? '완료 해제' : '완료'}`}
        hitSlop={8}
      >
        <View
          className={`h-6 w-6 items-center justify-center rounded border ${
            done ? 'border-primary bg-primary' : 'border-border'
          }`}
        >
          {done && <Text className="text-xs text-primary-foreground">✓</Text>}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onPress(todo)}
        className="min-h-11 flex-1 py-3 pr-4"
        accessibilityRole="button"
        accessibilityLabel={`${todo.title} 상세 보기`}
      >
        <View className="flex-row items-center">
          {todo.category?.name ? (
            <View className="mr-2 flex-row items-center">
              <View
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: todo.category.color || '#9ca3af' }}
              />
              <Text className="text-xs text-muted-foreground">{todo.category.name}</Text>
            </View>
          ) : null}
          {todo.priority === 'high' && (
            <Text className="mr-2 text-xs font-semibold text-red-600">높음</Text>
          )}
        </View>
        <Text
          className={`text-base ${
            done ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
      </Pressable>
    </View>
  );
}
