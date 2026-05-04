import { View, Text, Pressable } from 'react-native';

type Props = {
  title: string;
  done?: boolean;
  onToggle?: () => void;
};

export function TodoItem({ title, done = false, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3"
    >
      <View
        className={`h-5 w-5 rounded border ${done ? 'border-primary bg-primary' : 'border-border'}`}
      />
      <Text className={`flex-1 text-foreground ${done ? 'line-through opacity-60' : ''}`}>
        {title}
      </Text>
    </Pressable>
  );
}
