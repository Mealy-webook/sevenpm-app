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

/** The comp's poster, the glow behind it, and the record it holds. */
const SIZE = 342;
const GLOW = 340;
const VINYL = 322;
/**
 * Pulling the record out settles the sleeve 58 lower and leaves the record
 * standing 136 above its top edge (182:1052 against 182:1724).
 */
const SLEEVE_DROP = 58;
const VINYL_RISE = 136;

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
  /* One full turn about the vertical axis once the poster has landed. */
  const flip = useRef(new Animated.Value(0)).current;
  /* Then the record slides up out of the sleeve. */
  const pull = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open) return;
    progress.setValue(reduced ? 1 : 0);
    flip.setValue(reduced ? 1 : 0);
    pull.setValue(reduced ? 1 : 0);
    if (reduced) return;
    /* It arrives, then turns over once — the flourish waits for the zoom so
       the two reads as one movement rather than a scramble. */
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(flip, {
        toValue: 1,
        duration: motion.slow,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(pull, {
        toValue: 1,
        duration: motion.slow,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, progress, flip, pull, reduced]);

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
  const between2 = (value: Animated.Value, a: number, b: number) =>
    value.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

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

        {/* Behind the sleeve, and drawn before it so it stays there. */}
        <Animated.View
          style={[
            styles.vinyl,
            {
              left: (width - VINYL) / 2,
              /* It rests 136 clear of the sleeve's top edge; it starts that
                 same distance lower, which is inside the sleeve. */
              top: toY + SLEEVE_DROP - VINYL_RISE,
              opacity: pull.interpolate({
                inputRange: [0, 0.01, 1],
                outputRange: [0, 1, 1],
              }),
              transform: [{ translateY: between2(pull, VINYL_RISE, 0) }],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={image("/assets/vinyl.webp")}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.poster,
            {
              left: toX,
              top: toY,
              transform: [
                /* Perspective first, so the turn has depth rather than
                   squashing flat. */
                { perspective: 1200 },
                { translateX: between(startX, 0) },
                { translateY: between(startY, 0) },
                { translateY: between2(pull, 0, SLEEVE_DROP) },
                { scale: between(startScale, 1) },
                {
                  rotateY: flip.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
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
  vinyl: { position: "absolute", width: VINYL, height: VINYL },
  poster: { position: "absolute", width: SIZE, height: SIZE },
});
