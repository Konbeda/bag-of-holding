import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export function Container({ className, ...props }: ViewProps) {
  return <View className={cn('w-full max-w-6xl self-center px-4 md:px-8', className)} {...props} />;
}
