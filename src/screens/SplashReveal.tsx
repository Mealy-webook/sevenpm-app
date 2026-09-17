import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";

import { Text } from "../theme/Text";
import { colors, motion, space } from "../theme/tokens";

/**
 * The app's own splash, which takes over the instant the OS one is dismissed.
 *
 * The two are drawn to be the same picture: the native splash is the brand
 * mark on `bgPrimary` at 200px, and this opens with the mark at that size in
 * that place on that ground. The handoff should look like nothing happened —
 * then the mark lifts and the wordmark arrives under it.
 *
 * It obeys reduced motion by rendering the settled state and holding it for
 * the same beat, which is the rule the design system states: show the end of
 * the animation, not nothing.
 */
export function SplashReveal({ onDone }: { onDone: () => void }) {
  const [reduced, setReduced] = useState<boolean | null>(null);

  const mark = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduced === null) return;

    const ease = Easing.bezier(...motion.ease);

    if (reduced) {
      mark.setValue(1);
      word.setValue(1);
      const hold = setTimeout(onDone, motion.slow);
      return () => clearTimeout(hold);
    }

    const run = Animated.sequence([
      Animated.timing(mark, {
        toValue: 1,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(word, {
        toValue: 1,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.delay(motion.fast),
      Animated.timing(fade, {
        toValue: 0,
        duration: motion.fast,
        easing: Easing.bezier(...motion.easeIn),
        useNativeDriver: true,
      }),
    ]);

    run.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => run.stop();
  }, [reduced, mark, word, fade, onDone]);

  /* Nothing is drawn until reduced motion is known, so the first frame is
     never the wrong one. The native splash is still up underneath. */
  if (reduced === null) return <View style={styles.page} />;

  return (
    <Animated.View style={[styles.page, { opacity: fade }]}>
      <Animated.View
        style={{
          transform: [
            {
              scale: mark.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.88],
              }),
            },
            {
              translateY: mark.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -space.l],
              }),
            },
          ],
        }}
      >
        {/* The mark itself: the brand square with the wordmark sitting in the
            bottom of it, the same lockup the launcher icon carries. */}
        <View style={styles.mark}>
          <Text variant="titleBody" color={colors.ink900} style={styles.markWord}>
            sevenpm
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: word,
          transform: [
            {
              translateY: word.interpolate({
                inputRange: [0, 1],
                outputRange: [space.m, 0],
              }),
            },
          ],
        }}
      >
        <Text variant="displayM" uppercase color={colors.white}>
          More music
        </Text>
        <Text variant="displayM" uppercase color={colors.brand}>
          More life
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xxl,
    backgroundColor: colors.bgPrimary,
  },
  mark: {
    width: 200,
    height: 200,
    justifyContent: "flex-end",
    padding: space.xl,
    backgroundColor: colors.brand,
  },
  markWord: { letterSpacing: -0.5 },
});
