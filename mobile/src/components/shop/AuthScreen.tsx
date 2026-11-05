import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Logo, Text } from '@/components/ui';

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-surface">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow items-center justify-center gap-6 px-4 py-8"
        contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
      >
        <Link href="/" asChild>
          <Pressable role="link" aria-label="Bag of Holding, página inicial">
            <Logo />
          </Pressable>
        </Link>
        <Card className="w-full max-w-sm gap-5 p-6">
          <View className="gap-1">
            <Text variant="h2">{title}</Text>
            <Text variant="small" tone="muted">
              {subtitle}
            </Text>
          </View>
          {children}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
