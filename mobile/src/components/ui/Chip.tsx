import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

type ChipProps = Omit<PressableProps, 'children'> & {
  children: string;
  selected?: boolean;
};

export function Chip({ children, selected = false, className, ...props }: ChipProps) {
  return (
    <Pressable
      role="button"
      aria-pressed={selected}
      className={cn(
        'min-h-9 items-center justify-center self-start rounded-full border px-3.5',
        'web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary web:focus-visible:ring-offset-2',
        selected ? 'border-primary bg-primary-soft' : 'border-line bg-white hover:bg-surface active:bg-surface',
        className,
      )}
      {...props}
    >
      <Text variant="small" weight="medium" tone={selected ? 'primary' : 'secondary'}>
        {children}
      </Text>
    </Pressable>
  );
}
