import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, motion, space } from "../../theme/tokens";
import { splashCopy } from "../../data/onboarding";

/**
 * The splash, from Figma 320:50535.
 *
 * The comp is very quiet: the page colour, the brand mark at 104px dead
 * centre, and one line of credit at the foot. That is the whole screen, so
 * that is the whole screen here.
 *
 * It exists as an app screen at all because the OS splash cannot wait for
 * anything — it goes as soon as React has a frame to draw, which is before
 * the fonts are in. The native splash is configured with this same mark at
 * this same size on this same ground, so when it is dismissed and this takes
 * over, the only thing that should change is that the credit line appears.
 *
 * The one piece of motion is the exit. It obeys reduced motion by holding the
 * settled screen for the same beat instead, per DESIGN-SYSTEM.md §5.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [reduced, setReduced] = useState<boolean | null>(null);
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

    if (reduced) {
      const hold = setTimeout(onDone, motion.slow);
      return () => clearTimeout(hold);
    }

    const run = Animated.sequence([
      Animated.delay(motion.slow),
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
  }, [reduced, fade, onDone]);

  return (
    <Animated.View style={[styles.page, { opacity: fade }]}>
      <View style={styles.middle}>
        <Image
          source={image("/assets/logo-mark.png")}
          style={styles.mark}
          contentFit="contain"
          accessibilityLabel="SEVENPM"
        />
      </View>

      <View style={[styles.foot, { paddingBottom: insets.bottom + space.xl }]}>
        <Text
          variant="body"
          color={colors.contentSecondary}
          style={styles.credit}
        >
          {splashCopy.poweredBy}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bgPrimary },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl },
  mark: { width: 104, height: 104 },
  foot: { alignItems: "center", paddingHorizontal: space.xl, paddingTop: space.xl },
  credit: { textAlign: "center" },
});
