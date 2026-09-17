import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

import { motion } from "./tokens";

/**
 * Motion helpers shared by everything that moves.
 *
 * Two rules from DESIGN-SYSTEM.md §5 are enforced here rather than remembered
 * at each call site: one easing curve does almost all the work, and reduced
 * motion gets the settled state rather than nothing.
 */

/** The system's curve, ready for `Animated`. */
export const ease = Easing.bezier(...motion.ease);
export const easeIn = Easing.bezier(...motion.easeIn);

/**
 * Whether the device asks for less motion.
 *
 * Returns `null` until the answer is known — a component that animates should
 * draw nothing rather than guess and then correct itself on the second frame.
 * It also subscribes: the setting can change while the app is open.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

/**
 * A value that travels from 0 to 1 once, when the thing it belongs to arrives.
 *
 * Under reduced motion it is 1 from the first frame, so a screen built on it
 * renders settled instead of blank — which is the rule, and also what makes it
 * safe to use for a whole screen's entrance.
 */
export function useEntrance(duration = motion.base, delay = 0) {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      value.setValue(1);
      return;
    }
    const run = Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: ease,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [reduced, value, duration, delay]);

  return value;
}

/**
 * Press feedback: a control dips slightly under the finger and comes back.
 *
 * Spring rather than timing, because a press has no duration — it lasts as
 * long as the finger does, and a curve with a fixed length either finishes
 * early or carries on after the finger has gone.
 *
 * One `Animated.Value` drives both the dip and the dim, so there is a single
 * spring to chase rather than two that can disagree. Under reduced motion the
 * dip is dropped and the dim stays: a control still has to answer the finger,
 * and dimming is not motion.
 *
 * Both properties run on the native driver, so a press never waits on JS.
 *
 * Spread the handlers onto a `Pressable` and put `style` on what should move —
 * which means the `Pressable` itself, wrapped with
 * `Animated.createAnimatedComponent`, so the control's own background dips
 * along with its label.
 */
export function usePressScale(to = 0.97) {
  const reduced = useReducedMotion();
  const held = useRef(new Animated.Value(0)).current;

  const spring = (toValue: number) =>
    Animated.spring(held, {
      toValue,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();

  return {
    style: {
      opacity: held.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
      transform: [
        {
          scale: reduced
            ? 1
            : held.interpolate({ inputRange: [0, 1], outputRange: [1, to] }),
        },
      ],
    },
    onPressIn: () => spring(1),
    onPressOut: () => spring(0),
  };
}
