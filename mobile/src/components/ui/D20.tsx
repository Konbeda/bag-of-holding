import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';

import { colors } from '@/theme';

import { Text } from './Text';

type D20MarkProps = {
  size?: number;
  color?: string;
};

export function D20Mark({ size = 24, color = colors.primary.DEFAULT }: D20MarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
      <Polygon points="12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7" />
      <Polygon points="12,7.5 16.2,14.8 7.8,14.8" />
      <Path d="M3.34 7 12 7.5 20.66 7M12 2v5.5M20.66 7l-4.46 7.8M20.66 17l-4.46-2.2M12 22l4.2-7.2M12 22l-4.2-7.2M3.34 17l4.46-2.2M3.34 7l4.46 7.8" />
    </Svg>
  );
}

type D20LoaderProps = {
  size?: number;
  label?: string;
};

export function D20Loader({ size = 40, label = 'Carregando' }: D20LoaderProps) {
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    rotation.set(withRepeat(withTiming(360, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), -1, false));

    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <View role="progressbar" aria-label={label} className="items-center gap-2">
      <Animated.View style={spin}>
        <D20Mark size={size} />
      </Animated.View>
      <Text variant="small" tone="muted">
        {label}
      </Text>
    </View>
  );
}
