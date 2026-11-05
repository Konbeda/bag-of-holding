import { Link, Redirect, Stack, usePathname } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { AdminLoader } from '@/components/admin/AdminPage';
import { AdminSidebar, AdminTopBar } from '@/components/admin/AdminNav';
import { PageTitle } from '@/components/shop/PageTitle';
import { Button, EmptyState } from '@/components/ui';
import { useSession } from '@/features/auth/session';
import { useBreakpoint } from '@/lib/use-breakpoint';

export default function AdminLayout() {
  const pathname = usePathname();
  const { isWide } = useBreakpoint();
  const ready = useSession((state) => state.ready);
  const user = useSession((state) => state.user);

  if (!ready) return <AdminLoader />;

  if (!user) return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;

  if (user.role !== 'admin') {
    return (
      <View className="flex-1 justify-center bg-white">
        <PageTitle title="Acesso restrito | Bag of Holding" />
        <EmptyState icon={ShieldAlert} title="Acesso restrito" description="Esta área é só para a administração da loja.">
          <Link href="/" asChild replace>
            <Button className="self-center">Voltar para a loja</Button>
          </Link>
        </EmptyState>
      </View>
    );
  }

  return (
    <View className={isWide ? 'flex-1 flex-row bg-surface' : 'flex-1 bg-surface'}>
      {isWide ? <AdminSidebar /> : <AdminTopBar />}
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAFA' } }} />
      </View>
    </View>
  );
}
