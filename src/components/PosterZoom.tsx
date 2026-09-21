import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { image } from "../images";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, motion } from "../theme/tokens";

/**
 * The poster on its own, from Figma 182:1724: 342 square, centred on the base
 * surface, with the same out-of-focus copy of itself behind it.
 *
 * It arrives by growing out of the card that was tapped rather than cutting,
 * so the poster you pressed is the poster you get. The caller measures that
 * card's poster on screen and hands the rectangle over; everything here
 * animates from it.
 *
 * The move is scale and translate rather than width and height so it can run
 * on the native driver and not on the JS thread.
 */

/** The comp's poster, and the glow behind it. */
const SIZE = 342;
const GLOW = 340;

export type ZoomFrom = { x: number; y: number; width: number; height: number };

export function PosterZoom({
  source,
  from,
  onClose,
}: {
  /** The asset path, or null when nothing is open. */
  source: string | null;
  from: ZoomFrom | null;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const open = source !== null && from !== null;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open) return;
    progress.setValue(reduced ? 1 : 0);
    if (reduced) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.base,
      easing: ease,
      useNativeDriver: true,
    }).start();
  }, [open, progress, reduced]);

  const close = () => {
    if (reduced) return onClose();
    Animated.timing(progress, {
      toValue: 0,
      duration: motion.base,
      easing: ease,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  if (!open || !from) return null;

  /* Where the poster is going, and how far it is from where it started. */
  const toX = (width - SIZE) / 2;
  const toY = (height - SIZE) / 2;
  const startScale = from.width / SIZE;
  const startX = from.x + from.width / 2 - (toX + SIZE / 2);
  const startY = from.y + from.height / 2 - (toY + SIZE / 2);

  const between = (a: number, b: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={close}>
      <Pressable style={styles.fill} onPress={close} accessibilityLabel="Close">
        <Animated.View
          style={[
            styles.fill,
            styles.page,
            { opacity: progress },
          ]}
        />

        {/* The same poster, far out of focus, as the page behind it uses. */}
        <Animated.View
          style={[styles.glow, { top: 247, left: 25, opacity: between(0, 0.4) }]}
          pointerEvents="none"
        >
          <Image
            source={image(source)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={60}
          />
          <LinearGradient
            colors={[colors.bgPrimary, "transparent", "transparent", colors.bgPrimary]}
            locations={[0, 0.28, 0.72, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.poster,
            {
              left: toX,
              top: toY,
              transform: [
                { translateX: between(startX, 0) },
                { translateY: between(startY, 0) },
                { scale: between(startScale, 1) },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={image(source)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  /* The detail page sits on the base surface, a shade below the app's own. */
  page: { backgroundColor: "#09090b" },
  glow: { position: "absolute", width: GLOW, height: GLOW },
  poster: { position: "absolute", width: SIZE, height: SIZE },
});
