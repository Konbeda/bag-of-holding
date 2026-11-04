import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { Text } from './Text';

const variants = {
  primary: {
    box: 'bg-primary',
    interactive: 'hover:bg-primary-hover active:bg-primary-hover',
    tone: 'inverse',
    color: '#FFFFFF',
  },
  secondary: {
    box: 'border border-line-strong bg-white',
    interactive: 'hover:bg-surface active:bg-surface',
    tone: 'default',
    color: colors.ink.DEFAULT,
  },
  ghost: {
    box: 'bg-transparent',
    interactive: 'hover:bg-surface active:bg-surface',
    tone: 'default',
    color: colors.ink.DEFAULT,
  },
  danger: {
    box: 'bg-danger',
    interactive: 'hover:bg-danger-hover active:bg-danger-hover',
    tone: 'inverse',
    color: '#FFFFFF',
  },
} as const;

const sizes = {
  sm: { box: 'min-h-9 px-3', text: 'small', icon: 16 },
  md: { box: 'min-h-11 px-4', text: 'small', icon: 18 },
  lg: { box: 'min-h-[52px] px-6', text: 'body', icon: 20 },
} as const;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const inactive = Boolean(disabled) || loading;
  const style = variants[variant];
  const scale = sizes[size];

  return (
    <Pressable
      role="button"
      disabled={inactive}
      aria-disabled={inactive}
      aria-busy={loading}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-md',
        'web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary web:focus-visible:ring-offset-2',
        style.box,
        scale.box,
        fullWidth ? 'w-full' : 'self-start',
        inactive ? 'opacity-50 web:cursor-not-allowed' : style.interactive,
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={style.color} />
      ) : (
        Icon && <Icon size={scale.icon} color={style.color} />
      )}
      <Text variant={scale.text} weight="medium" tone={style.tone}>
        {children}
      </Text>
    </Pressable>
  );
}
