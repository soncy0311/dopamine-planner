import { Pressable, Text, View } from 'react-native';
import type { SubIssueWithJoins } from '@todo-list/core';

export type IssueCardAccordionProps = {
  epicId: string;
  title: string;
  totalSubCount: number;
  completedSubCount: number;
  category?: { name: string; color?: string };
  priority?: 'high' | 'medium' | 'low' | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;
  mainStatus: 'todo' | 'done';
  subIssues: SubIssueWithJoins[];
  onSubToggle: (todo: SubIssueWithJoins) => void;
  onSubPress: (todo: SubIssueWithJoins) => void;
  onAddSubIssue?: () => void;
  onTitlePress?: () => void;
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

export function IssueCardAccordion({
  title,
  totalSubCount,
  completedSubCount,
  category,
  priority,
  expanded,
  onToggleExpand,
  onMainToggle,
  mainStatus,
  subIssues,
  onSubToggle,
  onSubPress,
  onAddSubIssue,
  onTitlePress,
}: IssueCardAccordionProps) {
  const done = mainStatus === 'done';
  const showTags = !!priority || !!category;
  const safeTotal = Math.max(0, totalSubCount);
  const safeDone = Math.min(Math.max(0, completedSubCount), safeTotal);
  const progressPercent =
    safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;

  return (
    <View className="mx-3 my-1 overflow-hidden rounded-lg border border-periwinkle-200 bg-white">
      {/* 헤더: TodoItem grid 2-row 마크업 (RN 변환 — flex-col 으로 시뮬레이션) */}
      <Pressable
        onPress={onTitlePress}
        accessibilityRole="button"
        accessibilityLabel={`${title} 수정`}
        className="px-4 py-3"
      >
        {showTags ? (
          <View className="ml-7 mb-0.5 flex-row items-center gap-1">
            {priority ? (
              <View
                accessibilityLabel={`Epic 우선순위 ${PRIORITY_LABEL[priority]}`}
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
              onMainToggle();
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={done ? `${title} 일괄 해제` : `${title} 일괄 완료`}
            hitSlop={8}
            className="items-center justify-center"
          >
            <View
              className={`h-[18px] w-[18px] items-center justify-center rounded-sm ${
                done
                  ? 'border-2 border-purple-500 bg-purple-500'
                  : 'border-2 border-periwinkle-300'
              }`}
            >
              {done ? <Text className="text-[10px] text-white">✓</Text> : null}
            </View>
          </Pressable>

          <Text
            className={`flex-1 text-sm ${
              done
                ? 'text-periwinkle-400 line-through'
                : 'font-medium text-black-900'
            }`}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleExpand();
            }}
            accessibilityRole="button"
            accessibilityLabel={expanded ? '접기' : '펼치기'}
            accessibilityState={{ expanded }}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center"
          >
            <Text className="text-sm text-periwinkle-400">{expanded ? '▾' : '▸'}</Text>
          </Pressable>
        </View>
      </Pressable>

      {safeTotal > 0 ? (
        <View className="flex-row items-center gap-2 px-4 pb-3">
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: safeTotal,
              now: safeDone,
              text: `전체 ${safeTotal}개 중 ${safeDone}개 완료 (${progressPercent}%)`,
            }}
            className="h-2 flex-1 overflow-hidden rounded-full bg-periwinkle-100"
          >
            <View
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text
            accessible={false}
            className="text-xs font-medium text-periwinkle-500"
          >
            {progressPercent}%
          </Text>
        </View>
      ) : null}

      {/* 펼침 body — sub-issues (태그 없이 체크박스 + 제목만) */}
      {expanded ? (
        <View>
          {subIssues.map((s) => {
            const subDone = s.status === 'done';
            return (
              <Pressable
                key={s.id}
                onPress={() => onSubPress(s)}
                accessibilityRole="button"
                accessibilityLabel={`${s.title} 상세`}
                className="flex-row items-center gap-2 border-b border-periwinkle-100 py-1.5 pl-16 pr-4"
              >
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onSubToggle(s);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: subDone }}
                  accessibilityLabel={`${s.title} ${subDone ? '완료 해제' : '완료'}`}
                  hitSlop={8}
                  className="items-center justify-center"
                >
                  <View
                    className={`h-[14px] w-[14px] items-center justify-center rounded-sm ${
                      subDone
                        ? 'border-2 border-purple-500 bg-purple-500'
                        : 'border-2 border-periwinkle-300'
                    }`}
                  >
                    {subDone ? <Text className="text-[8px] text-white">✓</Text> : null}
                  </View>
                </Pressable>
                <Text
                  className={`flex-1 text-xs ${
                    subDone
                      ? 'text-periwinkle-400 line-through'
                      : 'text-periwinkle-500'
                  }`}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
              </Pressable>
            );
          })}
          {onAddSubIssue ? (
            <Pressable
              onPress={onAddSubIssue}
              accessibilityRole="button"
              accessibilityLabel="서브 이슈 추가"
              className="py-2 pl-16 pr-4"
            >
              <Text className="text-xs font-medium text-purple-500">+ 서브 이슈 추가</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
