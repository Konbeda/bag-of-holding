import { Platform, Switch, View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './Text';

// React Native Web paints the active thumb teal unless told otherwise, and this prop only exists there
const webThumb = Platform.OS === 'web' ? { activeThumbColor: '#FFFFFF' } : {};

type SwitchFieldProps = {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function SwitchField({ label, hint, value, onChange }: SwitchFieldProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Text variant="small" weight="medium">
          {label}
        </Text>
        {hint && (
          <Text variant="small" tone="muted">
            {hint}
          </Text>
        )}
      </View>
      <Switch
        aria-label={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary.DEFAULT, false: colors.line.strong }}
        thumbColor="#FFFFFF"
        {...webThumb}
      />
    </View>
  );
}
