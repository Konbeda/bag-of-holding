import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { colors } from '@/theme';

export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    opacity.set(withRepeat(withTiming(0.5, { duration: 800 }), -1, true));

    return () => cancelAnimation(opacity);
  }, [opacity, reducedMotion]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <View aria-hidden className={cn('overflow-hidden rounded-md', className)}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.line.DEFAULT }, pulse]} />
    </View>
  );
}
