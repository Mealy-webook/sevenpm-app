import { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Tap } from "./Tap";
import { tap as haptic } from "../theme/haptics";
import { useReducedMotion } from "../theme/motion";

/**
 * A stack of cards you swipe through, ported from the 21st.dev "Image Stack
 * Carousel" (ayushmxxn). The web original is framer-motion; the behaviour is
 * kept and the implementation is React Native's own PanResponder and
 * Animated, since this project has no reanimated.
 *
 * What carries over exactly: the cards behind fan by 5° and shrink by 3.5%
 * each, turning about a point near their bottom-right; the front card tilts
 * in 3D as you drag it; and a drag past 120pt in any direction sends the
 * front card to the **back** rather than discarding it, so the stack loops.
 * Anything short of that springs home.
 *
 * Reduced motion drops the drag and the tilt — the stack still turns, on a
 * tap, because the interaction is the only way to reach the other cards.
 */

/** The web component's own numbers, kept so the feel matches. */
const THRESHOLD = 120;
const STACK_ROTATION = 5;
const STACK_SCALE = 0.035;
const TILT = 25;
const TILT_RANGE = 200;

export function CardStack<T>({
  items,
  keyOf,
  render,
  width,
  height,
  style,
  label = "Next card",
  onFrontChange,
}: {
  items: T[];
  keyOf: (item: T) => string;
  render: (item: T, isFront: boolean) => React.ReactNode;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** What a screen reader calls the tap that turns the stack. */
  label?: string;
  /** Fired with whichever card is at the front, on mount and on every turn. */
  onFrontChange?: (item: T) => void;
}) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const drag = useRef(new Animated.ValueXY()).current;
  /* 0 while the stack is at rest, 1 at the moment the turn completes. The
     cards behind read it to move up a place, so the fan reflows with the
     card that is leaving rather than snapping once it has gone. */
  const turn = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);

  const front = items[order[0]];
  useEffect(() => {
    if (front) onFrontChange?.(front);
    /* Only the identity of the front card matters, not the callback's. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  /* The front card goes to the back, which is what makes this a carousel
     rather than a pile you can empty. */
  const commit = () => {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    drag.setValue({ x: 0, y: 0 });
    turn.setValue(0);
    busy.current = false;
  };

  const fling = (dx: number, dy: number) => {
    busy.current = true;
    haptic.tick();
    const reach = Math.max(width, height) * 1.4;
    const norm = Math.hypot(dx, dy) || 1;
    Animated.parallel([
      Animated.timing(drag, {
        toValue: { x: (dx / norm) * reach, y: (dy / norm) * reach },
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(turn, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) commit();
    });
  };

  /* Reduced motion turns the stack on a tap, with no flight. */
  const step = () => {
    haptic.tick();
    commit();
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
      /* The web original claims any drag. On a phone the stack fills most of
         the screen, so claiming vertical drags would stop the page scrolling
         under your thumb. Only a mostly-sideways drag is taken; the rest is
         left to the scroll view. */
      onMoveShouldSetPanResponder: (_, g) =>
        !busy.current && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > THRESHOLD || Math.abs(g.dy) > THRESHOLD) {
          fling(g.dx, g.dy);
        } else {
          settle();
        }
      },
      onPanResponderTerminate: settle,
      /* Once a card is moving, the page's scroll view does not get it. */
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  /* Dragging leans the card away from you, as the web original does. */
  const rotateY = drag.x.interpolate({
    inputRange: [-TILT_RANGE, TILT_RANGE],
    outputRange: [`-${TILT}deg`, `${TILT}deg`],
    extrapolate: "clamp",
  });
  const rotateX = drag.y.interpolate({
    inputRange: [-TILT_RANGE, TILT_RANGE],
    outputRange: [`${TILT}deg`, `-${TILT}deg`],
    extrapolate: "clamp",
  });

  return (
    <View style={[{ width, height }, style]}>
      {/* Drawn back to front so the front card is last and sits on top. */}
      {[...order].reverse().map((index) => {
        const depth = order.indexOf(index);
        const isFront = depth === 0;
        const item = items[index];

        /* The front card sits on top. Sibling order alone is not enough
           once the cards are transformed, so the depth is stated. */
        const layer = { zIndex: items.length - depth };
        /* Each card behind eases from its own place to the one in front of
           it while the top card flies off. */
        const reflow = {
          transform: [
            {
              rotate: turn.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  `${depth * STACK_ROTATION}deg`,
                  `${Math.max(depth - 1, 0) * STACK_ROTATION}deg`,
                ],
              }),
            },
            {
              scale: turn.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  1 - depth * STACK_SCALE,
                  1 - Math.max(depth - 1, 0) * STACK_SCALE,
                ],
              }),
            },
          ],
        };

        if (!isFront) {
          return (
            <Animated.View
              key={keyOf(item)}
              style={[styles.card, { width, height }, layer, reflow]}
              pointerEvents="none"
            >
              {render(item, false)}
            </Animated.View>
          );
        }

        if (reduced) {
          return (
            <Tap
              key={keyOf(item)}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={step}
              style={[styles.card, { width, height }, layer]}
            >
              {render(item, true)}
            </Tap>
          );
        }

        return (
          <Animated.View
            key={keyOf(item)}
            {...pan.panHandlers}
            accessibilityLabel={label}
            style={[
              styles.card,
              { width, height },
              layer,
              {
                opacity: turn.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  { perspective: 1200 },
                  { translateX: drag.x },
                  { translateY: drag.y },
                  { rotateX },
                  { rotateY },
                ],
              },
            ]}
          >
            {render(item, true)}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  /* The fan turns about a point near the bottom-right, as the original sets
     its transform origin, so the cards splay from one corner. */
  card: { position: "absolute", left: 0, top: 0, transformOrigin: "85% 85%" },
});
