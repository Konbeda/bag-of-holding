import { Image } from 'expo-image';
import { View } from 'react-native';

import { D20Mark } from '@/components/ui';
import type { Product } from '@/features/catalog/queries';
import { colors } from '@/theme';

export function ProductImage({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[index];

  return (
    <View className="aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-surface">
      {image ? (
        <Image
          source={{ uri: image.url }}
          alt={image.alt}
          contentFit="contain"
          transition={150}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <D20Mark size={48} color={colors.line.strong} />
      )}
    </View>
  );
}
