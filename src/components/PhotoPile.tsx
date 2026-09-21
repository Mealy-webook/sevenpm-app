import { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";

import { image } from "../images";
import { tap } from "../theme/haptics";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, motion } from "../theme/tokens";

/**
 * A pile of polaroids, from the event page's gallery (Figma 410:6633).
 *
 * The comp draws three prints: one upright in front, two tucked behind it at
 * a tilt. It is a still life there, so the interaction is ours: the front
 * print can be flicked aside, and the pile turns over to show the next one.
 * Flick too little and it settles back. Reduced motion keeps the pile still
 * and turns it on a tap instead.
 *
 * Sizes are the comp's, measured against its 342-wide group: the front print
 * is 236 × 256 with a 9pt frame and the polaroid's deep bottom margin; the two
 * behind are smaller and sit where the comp puts them.
 */

const PILE_W = 342;
const PILE_H = 261;

/** Where each print in the pile sits, front first. */
const SLOTS = [
  { left: 52, top: 0, width: 236, height: 256, frame: 9, foot: 39, tilt: "0deg" },
  { left: 0, top: 50, width: 170, height: 186, frame: 7, foot: 30, tilt: "-7deg" },
  { left: 180, top: 30, width: 178, height: 190, frame: 7, foot: 30, tilt: "8deg" },
];

/** How far the front print has to travel before it is let go. */
const FLICK = 72;

export function PhotoPile({
  photos,
  style,
}: {
  photos: string[];
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const drag = useRef(new Animated.ValueXY()).current;
  /* The new front print arrives with a small pop, so the turn reads as a
     change of card rather than a texture swap. */
  const pop = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  const turn = (direction: 1 | -1) => {
    tap.tick();
    if (reduced) {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
      return;
    }
    busy.current = true;
    Animated.parallel([
      Animated.timing(drag.x, {
        toValue: direction * PILE_W,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(drag.y, {
        toValue: -40,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
      drag.setValue({ x: 0, y: 0 });
      pop.setValue(0.9);
      Animated.spring(pop, {
        toValue: 1,
        speed: 22,
        bounciness: 8,
        useNativeDriver: true,
      }).start(() => {
        busy.current = false;
      });
    });
  };

  const settle = () =>
    Animated.spring(drag, {
      toValue: { x: 0, y: 0 },
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !busy.current && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > FLICK || Math.abs(g.vx) > 0.8) {
          turn(g.dx >= 0 ? 1 : -1);
        } else {
          settle();
        }
      },
      onPanResponderTerminate: settle,
      /* Once the print is moving, the page's scroll view does not get it. */
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  const tilt = drag.x.interpolate({
    inputRange: [-PILE_W, 0, PILE_W],
    outputRange: ["-14deg", "0deg", "14deg"],
  });
  /* The prints behind lean toward the front as it leaves, so the turn is
     already under way before the state changes. */
  const pull = drag.x.interpolate({
    inputRange: [-PILE_W, 0, PILE_W],
    outputRange: [1, 0, 1],
    extrapolate: "clamp",
  });

  const onPress = reduced && !busy.current ? () => turn(1) : undefined;

  return (
    <View style={[styles.pile, style]}>
      {/* Back to front, so the DOM order is the z order. */}
      {[2, 1, 0].map((slotIndex) => {
        const slot = SLOTS[slotIndex];
        const photo = photos[order[slotIndex % order.length]];
        if (!photo) return null;
        const isFront = slotIndex === 0;

        const transform = isFront
          ? [
              { translateX: drag.x },
              { translateY: drag.y },
              { rotate: tilt },
              { scale: pop },
            ]
          : [
              { rotate: slot.tilt },
              {
                translateY: pull.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, slotIndex === 1 ? -10 : -6],
                }),
              },
              { scale: pull.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
            ];

        return (
          <Animated.View
            key={`${photo}-${slotIndex}`}
            {...(isFront && !reduced ? pan.panHandlers : {})}
            onTouchEnd={isFront ? onPress : undefined}
            accessible={isFront}
            accessibilityRole={isFront ? "imagebutton" : undefined}
            accessibilityLabel={isFront ? "Next photo" : undefined}
            style={[
              styles.print,
              {
                left: slot.left,
                top: slot.top,
                width: slot.width,
                height: slot.height,
                padding: slot.frame,
                paddingBottom: slot.foot,
                transform,
              },
            ]}
          >
            <Image
              source={image(photo)}
              style={styles.shot}
              contentFit="cover"
              transition={300}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pile: { width: PILE_W, height: PILE_H, alignSelf: "center" },
  print: {
    position: "absolute",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  shot: { flex: 1, backgroundColor: colors.bgSecondary },
});
