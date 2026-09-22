import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";

import Close from "../icons/ic-close.svg";
import { Tap } from "./Tap";
import { image } from "../images";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, gutter } from "../theme/tokens";

/**
 * The cashless card, drawn out of its pocket and stood up.
 *
 * The card lives behind a sheet of leather and only its top edge shows, so
 * "take it out" has to look like it came out from *behind* that leather — not
 * like a new screen faded in over it. The pocket is therefore drawn here too,
 * at the place the page had it, and the card rises past it before it goes
 * anywhere else. The leather only fades once the card is clear of it.
 *
 * Then it turns. A card in a pocket lies on its side; a card you are holding
 * up to be read stands upright, so it rotates a quarter turn and grows into
 * the page as it does. Both are one movement: the turn starts while it is
 * still rising.
 *
 * Every offset comes from the caller measuring the two on screen, so this
 * works wherever on the page they sit.
 */

/** Rising clear of the pocket, then standing up. */
const RISE_MS = 520;
const STAND_AT = 260;
const STAND_MS = 720;
/** The leather goes once the card is past it. */
const LEATHER_AT = 240;
const LEATHER_MS = 320;

export type CardFrom = { x: number; y: number; width: number; height: number };

export function CardZoom({
  open,
  card,
  folder,
  onClose,
}: {
  open: boolean;
  /** Where the card sits on the page, measured in window coordinates. */
  card: CardFrom | null;
  /** And the pocket it is behind, so it can be drawn coming out of it. */
  folder: CardFrom | null;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const out = useRef(new Animated.Value(0)).current;
  const showing = open && card !== null && folder !== null;

  /* Wound back during render, so a second opening never shows a frame of the
     first one's ending. */
  const was = useRef(false);
  if (showing && !was.current) out.setValue(0);
  was.current = showing;

  useEffect(() => {
    if (!showing) return;
    if (reduced) return out.setValue(1);
    Animated.timing(out, {
      toValue: 1,
      duration: STAND_AT + STAND_MS,
      easing: ease,
      useNativeDriver: true,
    }).start();
  }, [showing, out, reduced]);

  const close = () => {
    if (reduced) return onClose();
    Animated.timing(out, {
      toValue: 0,
      duration: STAND_MS,
      easing: ease,
      useNativeDriver: true,
    }).start(({ finished }) => finished && onClose());
  };

  if (!showing || !card || !folder) return null;

  /**
   * Standing up swaps the card's sides: what was its height becomes its
   * width. So the size it grows to is set by fitting its *height* across the
   * page, and it is scaled about its own centre.
   */
  const stand = (width - gutter * 2) / card.height;
  const restX = card.x + card.width / 2;
  const restY = card.y + card.height / 2;
  const toX = width / 2;
  const toY = height / 2;

  const from = (a: number, b: number) =>
    out.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

  /* Clear of the leather before anything else happens to it. */
  const lift = out.interpolate({
    inputRange: [0, STAND_AT / (STAND_AT + STAND_MS), 1],
    outputRange: [0, -card.height, toY - restY],
    extrapolate: "clamp",
  });

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={close}>
      <Pressable style={styles.fill} onPress={close} accessibilityLabel="Close">
        <Animated.View
          style={[
            styles.fill,
            styles.page,
            {
              opacity: out.interpolate({
                inputRange: [0, 0.35, 1],
                outputRange: [0, 1, 1],
              }),
            },
          ]}
        />

        {/* The card, drawn before the leather so it comes out from behind. */}
        <Animated.View
          style={{
            position: "absolute",
            left: card.x,
            top: card.y,
            width: card.width,
            height: card.height,
            transform: [
              { translateX: from(0, toX - restX) },
              { translateY: lift },
              {
                rotate: out.interpolate({
                  inputRange: [STAND_AT / (STAND_AT + STAND_MS), 1],
                  outputRange: ["0deg", "90deg"],
                  extrapolate: "clamp",
                }),
              },
              { scale: from(1, stand) },
            ],
          }}
          pointerEvents="none"
        >
          <Image
            source={image("/assets/wallet-card.png")}
            style={StyleSheet.absoluteFill}
            contentFit="fill"
          />
        </Animated.View>

        {/* The pocket, exactly where the page had it, fading once it has been
            left behind. */}
        <Animated.View
          style={{
            position: "absolute",
            left: folder.x,
            top: folder.y,
            width: folder.width,
            height: folder.height,
            opacity: out.interpolate({
              inputRange: [
                LEATHER_AT / (STAND_AT + STAND_MS),
                (LEATHER_AT + LEATHER_MS) / (STAND_AT + STAND_MS),
              ],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          }}
          pointerEvents="none"
        >
          <Image
            source={image("/assets/wallet-folder.png")}
            style={StyleSheet.absoluteFill}
            contentFit="fill"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bar,
            {
              opacity: out.interpolate({
                inputRange: [0.7, 1],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          <Tap
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={close}
            style={styles.barButton}
          >
            <Close width={20} height={20} />
          </Tap>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  page: { backgroundColor: "#09090b" },
  bar: { position: "absolute", top: 60, left: gutter },
  barButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
});
