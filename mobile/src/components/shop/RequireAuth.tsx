import { Redirect, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { D20Loader } from '@/components/ui';
import { useSession } from '@/features/auth/session';

export function RequireAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ready = useSession((state) => state.ready);
  const signedIn = useSession((state) => Boolean(state.user));

  if (!ready) {
    return (
      <View className="items-center py-16">
        <D20Loader />
      </View>
    );
  }

  if (!signedIn) return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;

  return children;
}
