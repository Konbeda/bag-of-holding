import { CircleAlert, CircleCheck, Info } from '@/lib/icons';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Text } from './Text';

const DURATION_MS = 3500;

const icons = { info: Info, success: CircleCheck, error: CircleAlert };

type ToastTone = keyof typeof icons;

type ToastData = { id: number; message: string; tone: ToastTone };

const useToastStore = create<{ current: ToastData | null }>(() => ({ current: null }));

let timer: ReturnType<typeof setTimeout> | undefined;
let nextId = 0;

export function showToast(message: string, tone: ToastTone = 'info') {
  clearTimeout(timer);
  nextId += 1;
  useToastStore.setState({ current: { id: nextId, message, tone } });
  timer = setTimeout(() => useToastStore.setState({ current: null }), DURATION_MS);
}

function ToastCard({ message, tone }: ToastData) {
  const progress = useSharedValue(0);
  const Icon = icons[tone];

  const enter = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * 8 }],
  }));

  useEffect(() => {
    progress.set(withTiming(1, { duration: 200 }));
  }, [progress]);

  return (
    <Animated.View style={enter}>
      <View role="alert" className="max-w-md flex-row items-center gap-2.5 rounded-lg bg-ink px-4 py-3">
        <Icon size={18} color="#FFFFFF" />
        <Text variant="small" weight="medium" tone="inverse" className="shrink">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function Toaster() {
  const current = useToastStore((state) => state.current);
  const insets = useSafeAreaInsets();

  if (!current) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center px-4"
      style={{ bottom: insets.bottom + 16 }}
    >
      <ToastCard key={current.id} {...current} />
    </View>
  );
}
