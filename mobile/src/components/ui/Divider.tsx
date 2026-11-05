import { View } from 'react-native';

import { cn } from '@/lib/cn';

export function Divider({ className }: { className?: string }) {
  return <View role="separator" className={cn('h-px w-full bg-line', className)} />;
}
