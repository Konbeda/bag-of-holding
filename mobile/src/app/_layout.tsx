import '@/global.css';

import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Toaster } from '@/components/ui';
import { expireSession } from '@/features/auth/actions';
import { restoreSession } from '@/features/auth/session';
import { setUnauthorizedHandler } from '@/lib/api';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'web') document.documentElement.lang = 'pt-BR';

setUnauthorizedHandler(expireSession);
restoreSession();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const ready = loaded || Boolean(error);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }} />
      <Toaster />
    </QueryClientProvider>
  );
}
