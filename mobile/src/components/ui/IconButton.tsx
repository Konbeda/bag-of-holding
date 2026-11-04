import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { Text } from './Text';

const sizes = {
  sm: { box: 'h-9 w-9', icon: 18, hitSlop: 4 },
  md: { box: 'h-11 w-11', icon: 20, hitSlop: 0 },
};

const variants = {
  ghost: 'bg-transparent',
  secondary: 'border border-line-strong bg-white',
};

export type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: LucideIcon;
  label: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  badge?: number;
};

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  badge = 0,
  disabled = false,
  className,
  ...props
}: IconButtonProps) {
  const inactive = Boolean(disabled);

  return (
    <Pressable
      role="button"
      aria-label={badge > 0 ? `${label} (${badge})` : label}
      disabled={inactive}
      aria-disabled={inactive}
      hitSlop={sizes[size].hitSlop}
      className={cn(
        'items-center justify-center rounded-md',
        'web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary',
        sizes[size].box,
        variants[variant],
        inactive ? 'opacity-40 web:cursor-not-allowed' : 'hover:bg-surface active:bg-surface',
        className,
      )}
      {...props}
    >
      <Icon size={sizes[size].icon} color={colors.ink.DEFAULT} />
      {badge > 0 && (
        <View className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1">
          <Text variant="caption" weight="semibold" tone="inverse">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
