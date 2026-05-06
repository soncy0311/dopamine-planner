import { Pressable, Text, View } from 'react-native';
import type { SubIssueWithJoins } from '@todo-list/core';
import { TodoItem } from './TodoItem';

export type EpicAccordionCardProps = {
  epicId: string;
  title: string;
  progressPercent: number;
  segments: { filled: boolean }[];
  category?: { name: string; color: string };
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;
  mainStatus: 'todo' | 'done';
  subIssues: SubIssueWithJoins[];
  onSubToggle: (todo: SubIssueWithJoins) => void;
  onSubPress: (todo: SubIssueWithJoins) => void;
  onAddSubIssue?: () => void;
};

export function EpicAccordionCard({
  title,
  progressPercent,
  segments,
  category,
  expanded,
  onToggleExpand,
  onMainToggle,
  mainStatus,
  subIssues,
  onSubToggle,
  onSubPress,
  onAddSubIssue,
}: EpicAccordionCardProps) {
  const done = mainStatus === 'done';

  return (
    <View className="mx-3 my-1 rounded-lg border border-border bg-background p-3">
      <View className="flex-row items-center">
        <Pressable
          onPress={onMainToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={done ? `${title} 일괄 해제` : `${title} 일괄 완료`}
          hitSlop={8}
          className="mr-2 h-11 w-11 items-center justify-center"
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded border ${
              done ? 'border-primary bg-primary' : 'border-border'
            }`}
          >
            {done && <Text className="text-xs text-primary-foreground">✓</Text>}
          </View>
        </Pressable>

        {category ? (
          <View className="mr-2 flex-row items-center">
            <View
              className="mr-1 h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color || '#9ca3af' }}
            />
            <Text className="text-xs text-muted-foreground">{category.name}</Text>
          </View>
        ) : null}

        <Text
          className="flex-1 text-sm font-medium text-foreground"
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text className="ml-2 text-xs text-muted-foreground">{progressPercent}%</Text>

        <Pressable
          onPress={onToggleExpand}
          accessibilityRole="button"
          accessibilityLabel={expanded ? '접기' : '펼치기'}
          accessibilityState={{ expanded }}
          hitSlop={8}
          className="ml-1 h-11 w-11 items-center justify-center"
        >
          <Text className="text-base text-muted-foreground">
            {expanded ? '▾' : '▸'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-2 flex-row gap-1">
        {segments.length === 0 ? (
          <View className="h-1 flex-1 rounded-sm bg-muted" />
        ) : (
          segments.map((seg, i) => (
            <View
              key={i}
              className={`h-1 flex-1 rounded-sm ${
                seg.filled ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))
        )}
      </View>

      {expanded ? (
        <View className="mt-2">
          {subIssues.map((s) => (
            <TodoItem
              key={s.id}
              todo={s}
              onToggle={onSubToggle}
              onPress={onSubPress}
            />
          ))}
          {onAddSubIssue ? (
            <Pressable
              onPress={onAddSubIssue}
              accessibilityRole="button"
              accessibilityLabel="서브 이슈 추가"
              className="mt-1 h-9 items-start justify-center px-2"
            >
              <Text className="text-xs font-medium text-primary">+ 서브 이슈 추가</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
