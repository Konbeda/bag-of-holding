import { Link, router, useGlobalSearchParams } from 'expo-router';
import { ArrowLeft, ShoppingBag, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container, IconButton, Logo, Text } from '@/components/ui';
import { useSession } from '@/features/auth/session';
import { useCartCount } from '@/features/cart/use-cart';
import { useBreakpoint } from '@/lib/use-breakpoint';
import { colors } from '@/theme';

import { SearchField } from './SearchField';

export function ShopHeader({ canGoBack }: { canGoBack: boolean }) {
  const insets = useSafeAreaInsets();
  const { isWide } = useBreakpoint();
  const user = useSession((state) => state.user);
  const count = useCartCount();
  const { q } = useGlobalSearchParams<{ q?: string }>();

  return (
    <View className="border-b border-line bg-white" style={{ paddingTop: insets.top }}>
      <Container className="min-h-16 flex-row items-center gap-3 py-2 md:gap-6">
        {!isWide && canGoBack && <IconButton icon={ArrowLeft} label="Voltar" onPress={() => router.back()} />}
        <Link href="/" asChild>
          <Pressable role="link" aria-label="Bag of Holding, página inicial" className="web:outline-none">
            <Logo />
          </Pressable>
        </Link>

        {isWide && (
          <>
            <Link href="/catalog" asChild>
              <Pressable className="rounded-md px-2 py-2 hover:bg-surface">
                <Text variant="small" weight="medium">
                  Catálogo
                </Text>
              </Pressable>
            </Link>
            <SearchField
              key={q ?? ''}
              initialValue={q}
              onSubmit={(term) => router.navigate({ pathname: '/catalog', params: term ? { q: term } : {} })}
            />
            <View className="flex-row items-center gap-1">
              <Link href="/account" asChild>
                <Pressable
                  aria-label="Minha conta"
                  className="min-h-11 flex-row items-center gap-2 rounded-md px-2 hover:bg-surface"
                >
                  <UserRound size={20} color={colors.ink.DEFAULT} />
                  <Text variant="small" weight="medium" numberOfLines={1} className="max-w-32">
                    {user ? user.name.split(' ')[0] : 'Entrar'}
                  </Text>
                </Pressable>
              </Link>
              <Link href="/cart" asChild>
                <IconButton icon={ShoppingBag} label="Carrinho" badge={count} />
              </Link>
            </View>
          </>
        )}
      </Container>
    </View>
  );
}
