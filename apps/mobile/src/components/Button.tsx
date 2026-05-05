import { Pressable, Text, type PressableProps } from 'react-native';

type Props = PressableProps & {
  label: string;
};

export function Button({ label, ...rest }: Props) {
  return (
    <Pressable className="rounded-md bg-primary px-4 py-2 active:opacity-80" {...rest}>
      <Text className="text-center text-primary-foreground">{label}</Text>
    </Pressable>
  );
}
