import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme';

import { RadioOption } from './RadioOption';
import { Sheet } from './Sheet';
import { Text } from './Text';

type SelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function Select({ label, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        role="button"
        aria-haspopup="dialog"
        aria-label={`${label}: ${current?.label ?? ''}`}
        onPress={() => setOpen(true)}
        className="min-h-11 flex-row items-center gap-2 rounded-md border border-line-strong bg-white px-3 hover:bg-surface active:bg-surface web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary"
      >
        <Text variant="small" tone="muted">
          {label}:
        </Text>
        <Text variant="small" weight="medium">
          {current?.label}
        </Text>
        <ChevronDown size={16} color={colors.ink.muted} />
      </Pressable>
      <Sheet visible={open} title={label} onClose={() => setOpen(false)}>
        <View role="radiogroup" aria-label={label} className="gap-2">
          {options.map((option) => (
            <RadioOption
              key={option.value}
              label={option.label}
              selected={option.value === value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </>
  );
}
