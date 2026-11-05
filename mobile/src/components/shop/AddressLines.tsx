import { View } from 'react-native';

import { Text } from '@/components/ui';
import type { PostalAddress } from '@/features/addresses/queries';
import { formatZipCode } from '@/lib/format';

export function AddressLines({ address }: { address: PostalAddress }) {
  const { recipient, street, number, complement, district, city, state, zip_code: zipCode } = address;

  return (
    <View className="gap-0.5">
      <Text variant="small" weight="medium">
        {recipient}
      </Text>
      <Text variant="small" tone="secondary">
        {`${street}, ${number}${complement ? ` - ${complement}` : ''}`}
      </Text>
      <Text variant="small" tone="secondary">
        {`${district}, ${city} - ${state}`}
      </Text>
      <Text variant="small" tone="secondary">
        {`CEP ${formatZipCode(zipCode)}`}
      </Text>
    </View>
  );
}
