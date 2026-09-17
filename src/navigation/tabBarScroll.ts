import { useCallback, useRef } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { ease, useReducedMotion } from "../theme/motion";
import { motion } from "../theme/tokens";

/**
 * How far the tab bar has drawn itself in: 0 at rest, 1 while reading down.
 *
 * It is a module-level value rather than context because it has one writer at
 * a time — whichever tab is on screen — and one reader, the bar, which lives
 * outside the screen in the navigator. Passing it through context would mean
 * threading a provider around the whole tree for a single number.
 */
export const tabBarShrink = new Animated.Value(0);

/** How far down the page you must be before the bar starts getting out of the way. */
const ENGAGE_AT = 32;
/** Ignore the jitter of a finger resting on a list. */
const DEADZONE = 6;

/**
 * Wire this to a tab screen's scroll view: the bar shrinks as you read down
 * and comes back the moment you head up, so the content has the screen while
 * you are in it and the bar is never more than one gesture away.
 *
 * It returns to full size near the top of the page regardless of direction,
 * because at the top there is nothing to get out of the way of.
 *
 * Under reduced motion the bar simply stays put. The whole behaviour is
 * movement, and there is no settled state to show instead.
 */
export function useTabBarScroll() {
  const reduced = useReducedMotion();
  const last = useRef(0);
  const shrunk = useRef(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const dy = y - last.current;
      last.current = y;

      if (reduced) return;
      if (Math.abs(dy) < DEADZONE) return;

      const next = y > ENGAGE_AT && dy > 0;
      if (next === shrunk.current) return;
      shrunk.current = next;

      Animated.timing(tabBarShrink, {
        toValue: next ? 1 : 0,
        duration: motion.fast,
        easing: ease,
        useNativeDriver: true,
      }).start();
    },
    [reduced],
  );

  return { onScroll, scrollEventThrottle: 16 };
}
