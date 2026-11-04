import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

const tones = {
  neutral: { box: 'bg-surface border border-line', text: 'secondary' },
  primary: { box: 'bg-primary-soft', text: 'primary' },
  accent: { box: 'bg-primary', text: 'inverse' },
  success: { box: 'bg-success-soft', text: 'success' },
  warning: { box: 'bg-warning-soft', text: 'warning' },
  danger: { box: 'bg-danger-soft', text: 'danger' },
} as const;

export type BadgeTone = keyof typeof tones;

type BadgeProps = {
  children: string;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <View className={cn('self-start rounded px-2 py-0.5', tones[tone].box, className)}>
      <Text variant="caption" weight="medium" tone={tones[tone].text}>
        {children}
      </Text>
    </View>
  );
}
