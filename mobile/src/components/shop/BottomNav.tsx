import { Link, usePathname } from 'expo-router';
import { Home, LayoutGrid, type LucideIcon, ShoppingBag, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useCartCount } from '@/features/cart/use-cart';
import { colors } from '@/theme';

const tabs: { href: '/' | '/catalog' | '/cart' | '/account'; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/catalog', label: 'Catálogo', icon: LayoutGrid },
  { href: '/cart', label: 'Carrinho', icon: ShoppingBag },
  { href: '/account', label: 'Conta', icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const count = useCartCount();

  return (
    <View
      role="navigation"
      className="flex-row border-t border-line bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === '/account' && /^\/(orders|addresses)/.test(pathname));
        const badge = href === '/cart' ? count : 0;

        return (
          <Link key={href} href={href} replace asChild>
            <Pressable
              aria-label={badge > 0 ? `${label} (${badge})` : label}
              aria-current={active ? 'page' : undefined}
              className="min-h-14 flex-1 items-center justify-center gap-0.5 py-1.5"
            >
              <View>
                <Icon size={22} color={active ? colors.primary.DEFAULT : colors.ink.muted} />
                {badge > 0 && (
                  <View className="absolute -right-2.5 -top-1.5 min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
                    <Text variant="caption" weight="semibold" tone="inverse" className="text-[10px] leading-3">
                      {badge > 99 ? '99+' : badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="caption" weight="medium" tone={active ? 'primary' : 'muted'}>
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
