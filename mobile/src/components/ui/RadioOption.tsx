import { Pressable, type PressableProps, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

type RadioOptionProps = Omit<PressableProps, 'children'> & {
  label: string;
  description?: string;
  selected: boolean;
};

export function RadioOption({ label, description, selected, className, ...props }: RadioOptionProps) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex-row items-center gap-3 rounded-lg border p-4',
        'web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary web:focus-visible:ring-offset-2',
        selected ? 'border-primary bg-primary-soft' : 'border-line bg-white hover:bg-surface active:bg-surface',
        className,
      )}
      {...props}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2 bg-white',
          selected ? 'border-primary' : 'border-line-strong',
        )}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="small" weight="medium">
          {label}
        </Text>
        {description && (
          <Text variant="small" tone="muted">
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
