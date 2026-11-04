import { Link } from 'expo-router';
import { View } from 'react-native';

import { Badge, Button, Logo, Text } from '@/components/ui';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-4">
      <Logo />
      <Text variant="body" tone="muted" className="text-center">
        Tudo para a sua próxima aventura.
      </Text>
      <Badge tone="primary" className="self-center">
        Em construção
      </Badge>
      {__DEV__ && (
        <Link href="/design" asChild>
          <Button variant="secondary" size="sm" className="self-center">
            Ver design system
          </Button>
        </Link>
      )}
    </View>
  );
}
