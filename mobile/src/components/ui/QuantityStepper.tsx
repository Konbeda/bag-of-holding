import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false }: QuantityStepperProps) {
  return (
    <View className="flex-row items-center self-start rounded-md border border-line-strong">
      <IconButton
        icon={Minus}
        label="Diminuir quantidade"
        disabled={disabled || value <= min}
        onPress={() => onChange(value - 1)}
      />
      <Text aria-live="polite" aria-label={`Quantidade: ${value}`} weight="medium" className="w-8 text-center">
        {value}
      </Text>
      <IconButton
        icon={Plus}
        label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}
