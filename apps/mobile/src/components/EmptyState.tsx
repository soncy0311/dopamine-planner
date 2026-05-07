import type { ComponentType, ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

export type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }> | ReactElement;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  let iconNode: ReactElement | null = null;
  if (icon) {
    if (typeof icon === 'function') {
      const Icon = icon;
      iconNode = <Icon className="h-12 w-12" />;
    } else {
      iconNode = icon;
    }
  }

  return (
    <View
      accessibilityRole="summary"
      className="flex-col items-center gap-3 p-8"
    >
      {iconNode ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {iconNode}
        </View>
      ) : null}
      <Text className="text-base font-medium text-foreground">{title}</Text>
      {description ? (
        <Text className="text-center text-sm text-muted-foreground">{description}</Text>
      ) : null}
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onClick}
          className="mt-2 rounded-md bg-primary px-4 py-2"
        >
          <Text className="text-sm font-medium text-primary-foreground">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
