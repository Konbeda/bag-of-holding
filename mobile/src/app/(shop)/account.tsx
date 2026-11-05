import { Link } from 'expo-router';
import { ChevronRight, LogOut, type LucideIcon, MapPin, Package, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { Footer } from '@/components/shop/Footer';
import { Button, Container, D20Loader, EmptyState, Text } from '@/components/ui';
import { signOut } from '@/features/auth/actions';
import { useSession } from '@/features/auth/session';
import { colors } from '@/theme';

type AccountLinkProps = {
  href: '/orders' | '/addresses';
  icon: LucideIcon;
  title: string;
  description: string;
};

function AccountLink({ href, icon: Icon, title, description }: AccountLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        role="link"
        className="flex-row items-center gap-3 rounded-lg border border-line bg-white p-4 hover:bg-surface active:bg-surface web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary"
      >
        <Icon size={20} color={colors.ink.secondary} />
        <View className="flex-1 gap-0.5">
          <Text variant="small" weight="medium">
            {title}
          </Text>
          <Text variant="small" tone="muted">
            {description}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.ink.muted} />
      </Pressable>
    </Link>
  );
}

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
          <View className="max-w-md gap-4">
            <View className="gap-1">
              <Text variant="h3">{user.name}</Text>
              <Text variant="small" tone="muted">
                {user.email}
              </Text>
            </View>
            <AccountLink href="/orders" icon={Package} title="Meus pedidos" description="Acompanhe as suas compras." />
            <AccountLink href="/addresses" icon={MapPin} title="Endereços" description="Gerencie onde receber os pedidos." />
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
          </View>
        )}
      </Container>
      <Footer />
    </ScrollView>
  );
}
