import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

const variants = {
  display: { box: 'text-4xl tracking-tight md:text-5xl md:leading-[56px]', weight: 'bold', level: 1 },
  h1: { box: 'text-3xl tracking-tight', weight: 'semibold', level: 1 },
  h2: { box: 'text-2xl tracking-tight', weight: 'semibold', level: 2 },
  h3: { box: 'text-lg', weight: 'semibold', level: 3 },
  body: { box: 'text-base', weight: 'regular', level: undefined },
  small: { box: 'text-sm', weight: 'regular', level: undefined },
  caption: { box: 'text-xs', weight: 'regular', level: undefined },
} as const;

const weights = {
  regular: 'font-sans',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const tones = {
  default: 'text-ink',
  secondary: 'text-ink-secondary',
  muted: 'text-ink-muted',
  primary: 'text-primary',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
  inverse: 'text-white',
};

export type TextVariant = keyof typeof variants;
export type TextWeight = keyof typeof weights;
export type TextTone = keyof typeof tones;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  tone?: TextTone;
};

export function Text({ variant = 'body', weight, tone = 'default', className, ...props }: TextProps) {
  const { box, weight: defaultWeight, level } = variants[variant];

  return (
    <RNText
      role={level ? 'heading' : undefined}
      aria-level={level}
      className={cn(box, weights[weight ?? defaultWeight], tones[tone], className)}
      {...props}
    />
  );
}
