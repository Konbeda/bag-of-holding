import { View } from 'react-native';

import { Container, Logo, Text } from '@/components/ui';

export function Footer() {
  return (
    <View className="mt-12 border-t border-line bg-surface py-8">
      <Container className="gap-2">
        <Logo size="sm" />
        <Text variant="small" tone="muted">
          Projeto de portfólio: os produtos e as marcas são fictícios, e o pagamento é simulado.
        </Text>
      </Container>
    </View>
  );
}
