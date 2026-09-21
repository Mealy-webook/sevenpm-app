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

/** How far a drag must travel before the card is let go (the web original's). */
const THRESHOLD = 120;
const TILT = 25;
const TILT_RANGE = 200;

/**
 * The fan, from the comp (Moodboard 182:1630) rather than the web component:
 * the two cards behind splay to opposite sides at the same tilt and size, so
 * the stack reads as a hand rather than a one-way cascade. Anything deeper
 * than those two waits out of sight behind them.
 */
const FAN_ROTATION = 10;
const FAN_SCALE = 0.9106;
const FAN_SHIFT = 22;

/**
 * Where a card sits for a given depth. The comp stacks the next card to the
 * left and the one after it to the right (199:1779 sits above 199:1764), so
 * odd depths lean left.
 */
function slot(depth: number) {
  if (depth <= 0) return { rotate: 0, shift: 0, scale: 1, opacity: 1 };
  const side = depth % 2 === 1 ? -1 : 1;
  return {
    rotate: side * FAN_ROTATION,
    shift: side * FAN_SHIFT,
    scale: FAN_SCALE,
    opacity: depth <= 2 ? 1 : 0,
  };
}

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
  /* Put the stack back the way it was, without turning it. */
  const reset = () => {
    drag.setValue({ x: 0, y: 0 });
    turn.setValue(0);
    busy.current = false;
  };

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
      /* An interrupted flight must not leave the stack half-turned: the top
         card would stay invisible and every other card stuck a place
         forward, with nothing able to move again. */
      if (finished) commit();
      else reset();
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
        const here = slot(depth);
        const next = slot(depth - 1);
        const between = (from: number, to: number) =>
          turn.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

        const reflow = {
          opacity: between(here.opacity, next.opacity),
          transform: [
            {
              rotate: turn.interpolate({
                inputRange: [0, 1],
                outputRange: [`${here.rotate}deg`, `${next.rotate}deg`],
              }),
            },
            { translateX: between(here.shift, next.shift) },
            { scale: between(here.scale, next.scale) },
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
  /* The comp turns each card about its own centre, so the two behind splay
     evenly either side of the front one. */
  card: { position: "absolute", left: 0, top: 0 },
});
