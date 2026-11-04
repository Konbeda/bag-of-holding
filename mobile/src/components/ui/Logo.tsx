import { View } from 'react-native';

import { D20Mark } from './D20';
import { Text } from './Text';

const sizes = {
  sm: { mark: 22, text: 'body' },
  md: { mark: 28, text: 'h3' },
} as const;

export function Logo({ size = 'md' }: { size?: keyof typeof sizes }) {
  return (
    <View aria-label="Bag of Holding" className="flex-row items-center gap-2">
      <D20Mark size={sizes[size].mark} />
      <Text role="none" variant={sizes[size].text} weight="semibold">
        Bag of Holding
      </Text>
    </View>
  );
}
