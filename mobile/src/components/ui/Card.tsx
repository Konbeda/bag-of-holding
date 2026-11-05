import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ViewProps) {
  return <View className={cn('rounded-lg border border-line bg-white', className)} {...props} />;
}
