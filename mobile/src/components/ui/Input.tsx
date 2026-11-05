import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
};

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  secureTextEntry = false,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="small" weight="medium">
        {label}
      </Text>
      <View
        className={cn(
          'min-h-11 flex-row items-center gap-2 rounded-md border pl-3',
          secureTextEntry ? 'pr-0' : 'pr-3',
          props.editable === false ? 'bg-surface' : 'bg-white',
          error
            ? 'border-danger'
            : focused
              ? 'border-primary'
              : props.editable === false
                ? 'border-line'
                : 'border-line-strong',
        )}
      >
        {Icon && <Icon size={18} color={colors.ink.muted} />}
        <TextInput
          aria-label={label}
          aria-invalid={Boolean(error)}
          placeholderTextColor={colors.ink.muted}
          secureTextEntry={secureTextEntry && !revealed}
          className="min-w-0 flex-1 py-2.5 font-sans text-base leading-5 text-ink web:outline-none"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {secureTextEntry && (
          <IconButton
            icon={revealed ? EyeOff : Eye}
            label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setRevealed(!revealed)}
          />
        )}
      </View>
      {error ? (
        <Text role="alert" variant="small" tone="danger">
          {error}
        </Text>
      ) : (
        hint && (
          <Text variant="small" tone="muted">
            {hint}
          </Text>
        )
      )}
    </View>
  );
}
