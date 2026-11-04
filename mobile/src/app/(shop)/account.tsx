import { Link } from 'expo-router';
import { LogOut, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { Footer } from '@/components/shop/Footer';
import { Button, Card, Container, D20Loader, EmptyState, Text } from '@/components/ui';
import { signOut } from '@/features/auth/actions';
import { useSession } from '@/features/auth/session';

export default function AccountScreen() {
  const user = useSession((state) => state.user);
  const ready = useSession((state) => state.ready);
  const [leaving, setLeaving] = useState(false);

  return (
    <ScrollView className="flex-1 bg-white">
      <PageTitle title="Minha conta | Bag of Holding" />
      <Container className="gap-6 pt-4 md:pt-8">
        <Text variant="h1">Minha conta</Text>
        {!ready && (
          <View className="items-center py-16">
            <D20Loader />
          </View>
        )}
        {ready && !user && (
          <EmptyState
            icon={UserRound}
            title="Entre na sua conta"
            description="Acompanhe os seus pedidos e finalize compras mais rápido."
          >
            <View className="flex-row flex-wrap justify-center gap-3">
              <Link href="/login" asChild>
                <Button>Entrar</Button>
              </Link>
              <Link href="/register" asChild>
                <Button variant="secondary">Criar conta</Button>
              </Link>
            </View>
          </EmptyState>
        )}
        {user && (
          <Card className="max-w-md gap-4 p-4">
            <View className="gap-1">
              <Text variant="h3">{user.name}</Text>
              <Text variant="small" tone="muted">
                {user.email}
              </Text>
            </View>
            <Button
              variant="secondary"
              icon={LogOut}
              loading={leaving}
              onPress={async () => {
                setLeaving(true);
                await signOut();
                setLeaving(false);
              }}
            >
              Sair
            </Button>
          </Card>
        )}
      </Container>
      <Footer />
    </ScrollView>
  );
}
