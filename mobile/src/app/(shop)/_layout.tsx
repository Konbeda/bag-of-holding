import { Stack } from 'expo-router';
import { View } from 'react-native';

import { BottomNav } from '@/components/shop/BottomNav';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { useBreakpoint } from '@/lib/use-breakpoint';

export default function ShopLayout() {
  const { isWide } = useBreakpoint();

  return (
    <View className="flex-1 bg-white">
      <Stack
        screenOptions={{
          header: ({ back }) => <ShopHeader canGoBack={Boolean(back)} />,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      {!isWide && <BottomNav />}
    </View>
  );
}
