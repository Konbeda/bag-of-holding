import type { LucideIcon } from '@/lib/icons';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './Text';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-4 py-12">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
        <Icon size={24} color={colors.ink.muted} />
      </View>
      <View className="max-w-sm items-center gap-1">
        <Text variant="h3" className="text-center">
          {title}
        </Text>
        {description && (
          <Text variant="small" tone="muted" className="text-center">
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
