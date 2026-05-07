import { ActivityIndicator, View } from 'react-native';

export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullscreen';
  label?: string;
};

const SIZE_MAP: Record<NonNullable<SpinnerProps['size']>, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

export function Spinner({ size = 'md', variant = 'inline', label = '로딩 중' }: SpinnerProps) {
  const indicator = (
    <ActivityIndicator
      size={SIZE_MAP[size]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    />
  );

  if (variant === 'fullscreen') {
    return (
      <View className="min-h-[60vh] flex-1 items-center justify-center">{indicator}</View>
    );
  }
  return indicator;
}
