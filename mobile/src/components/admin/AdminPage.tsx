import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { PageTitle } from '@/components/shop/PageTitle';
import { D20Loader, Text } from '@/components/ui';

type AdminPageProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function AdminPage({ title, action, children }: AdminPageProps) {
  return (
    <ScrollView className="flex-1 bg-surface" keyboardShouldPersistTaps="handled">
      <PageTitle title={`${title} | Admin | Bag of Holding`} />
      <View className="w-full max-w-5xl gap-6 self-center p-4 md:p-8">
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <Text variant="h1" className="shrink">
            {title}
          </Text>
          {action}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function AdminLoader() {
  return (
    <View className="items-center py-16">
      <D20Loader />
    </View>
  );
}
