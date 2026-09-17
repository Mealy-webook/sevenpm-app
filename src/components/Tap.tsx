import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { usePressScale } from "../theme/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A pressable that answers the finger.
 *
 * `Button`, `Chip` and `ListRow` each own their press feedback because they
 * own their shape. This is for everything else that is tappable but is not one
 * of those — a story ring, a festival card, a row in the newsroom — so that
 * pressing anything in this app feels the same rather than each screen
 * inventing its own opacity change.
 *
 * It exists as a component rather than a hook because these are drawn inside
 * `map`, and a hook cannot be called in a loop.
 */
export function Tap({
  children,
  style,
  scale,
  ...rest
}: PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** How far it dips. Larger things should dip less. */
  scale?: number;
}) {
  const press = usePressScale(scale);

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[style, !rest.disabled && press.style]}
    >
      {children}
    </AnimatedPressable>
  );
}
