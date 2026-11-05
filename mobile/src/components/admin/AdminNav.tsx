import { Link, router, usePathname } from 'expo-router';
import { ClipboardList, LayoutDashboard, LogOut, type LucideIcon, Package, Store } from '@/lib/icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Logo, Text } from '@/components/ui';
import { signOut } from '@/features/auth/actions';
import { useSession } from '@/features/auth/session';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

const links: { href: '/admin' | '/admin/products' | '/admin/orders'; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: 'Painel', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
];

function NavLinks({ horizontal }: { horizontal: boolean }) {
  const pathname = usePathname();

  return (
    <View role="navigation" aria-label="Administração" className={horizontal ? 'flex-row gap-1' : 'gap-1'}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href);

        return (
          <Link key={href} href={href} asChild>
            <Pressable
              aria-current={active ? 'page' : undefined}
              className={cn(
                'min-h-11 flex-row items-center gap-2 rounded-md px-3',
                'web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-primary',
                horizontal && 'flex-1 justify-center',
                active ? 'bg-primary-soft' : 'hover:bg-surface active:bg-surface',
              )}
            >
              <Icon size={18} color={active ? colors.primary.DEFAULT : colors.ink.secondary} />
              <Text variant="small" weight="medium" tone={active ? 'primary' : 'secondary'}>
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

async function leave() {
  await signOut();
  router.replace('/');
}

export function AdminSidebar() {
  const name = useSession((state) => state.user?.name);

  return (
    <View className="w-60 justify-between gap-6 border-r border-line bg-white p-4">
      <View className="gap-6">
        <View className="gap-1 px-2 pt-2">
          <Logo />
          <Text variant="caption" tone="muted">
            Administração
          </Text>
        </View>
        <NavLinks horizontal={false} />
      </View>
      <View className="gap-1">
        <Link href="/" asChild>
          <Pressable className="min-h-11 flex-row items-center gap-2 rounded-md px-3 hover:bg-surface active:bg-surface">
            <Store size={18} color={colors.ink.secondary} />
            <Text variant="small" weight="medium" tone="secondary">
              Ver loja
            </Text>
          </Pressable>
        </Link>
        <View className="flex-row items-center justify-between gap-2 pl-3">
          <Text variant="small" tone="muted" numberOfLines={1} className="shrink">
            {name}
          </Text>
          <IconButton icon={LogOut} label="Sair" onPress={leave} />
        </View>
      </View>
    </View>
  );
}

export function AdminTopBar() {
  const insets = useSafeAreaInsets();

  return (
    <View className="gap-2 border-b border-line bg-white px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between">
        <Logo />
        <View className="flex-row">
          <Link href="/" asChild>
            <IconButton icon={Store} label="Ver loja" />
          </Link>
          <IconButton icon={LogOut} label="Sair" onPress={leave} />
        </View>
      </View>
      <NavLinks horizontal />
    </View>
  );
}
