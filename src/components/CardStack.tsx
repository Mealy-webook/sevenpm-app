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
 * The important part of the original is what a swipe *does*: the card is not
 * thrown away. The moment it passes the threshold it becomes the back of the
 * pile, and then springs from wherever your finger left it into that back
 * slot. So the card you pushed visibly travels around the stack. Every card
 * therefore carries its own offset and its own depth, both sprung, exactly as
 * each `SwipeCard` there owns its own motion values.
 *
 * The **arrangement** is neither's. The comp fans the two cards behind out to
 * opposite sides at the same tilt and size, with anything deeper hidden, and
 * that reads as a front card with some decoration behind it rather than as a
 * pile of four things you can get to. Ahmed asked for 1, 2, 3, 4. So they
 * recede instead: each one a little smaller than the one in front of it and
 * raised a little further, so every card in the stack shows its own top edge
 * and you can see both how many there are and which order they are in.
 */

/** The web original's numbers. */
const THRESHOLD = 120;
const ELASTIC = 0.5;
const TILT = 25;
const TILT_RANGE = 200;
/** Its two springs: one for the card, a gentler one for the stack reflowing. */
const CARD_SPRING = { stiffness: 300, damping: 30, mass: 1 };
const STACK_SPRING = { stiffness: 260, damping: 24, mass: 1 };

/** The pile, by depth: each one behind the last, and each one still visible. */
const DEPTHS = [0, 1, 2, 3];
const ROTATE = ["0deg", "0deg", "0deg", "0deg"];
const SHIFT = [0, 0, 0, 0];
/** How far back each one sits, and how far its top edge rides above. */
const SCALE = [1, 0.94, 0.88, 0.82];
const RISE = [0, -16, -30, -42];
const FADE = [1, 1, 1, 1];

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

  /* Each card owns its offset and its depth, as each card in the original
     owns its own motion values. */
  const cards = useRef(
    new Map<number, { drag: Animated.ValueXY; depth: Animated.Value }>(),
  ).current;
  const valuesFor = (index: number) => {
    let found = cards.get(index);
    if (!found) {
      found = {
        drag: new Animated.ValueXY({ x: 0, y: 0 }),
        depth: new Animated.Value(order.indexOf(index)),
      };
      cards.set(index, found);
    }
    return found;
  };

  /* Whenever the pile reorders, every card springs to its new place. */
  useEffect(() => {
    order.forEach((index, depth) => {
      Animated.spring(valuesFor(index).depth, {
        toValue: depth,
        ...STACK_SPRING,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const front = items[order[0]];
  useEffect(() => {
    if (front) onFrontChange?.(front);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  /* The card becomes the back of the pile, then springs there from wherever
     it was let go — it is never thrown off screen. */
  const sendToBack = () => {
    haptic.tick();
    const leaving = order[0];
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    Animated.spring(valuesFor(leaving).drag, {
      toValue: { x: 0, y: 0 },
      ...CARD_SPRING,
      useNativeDriver: true,
    }).start();
  };

  const settle = (index: number) =>
    Animated.spring(valuesFor(index).drag, {
      toValue: { x: 0, y: 0 },
      ...CARD_SPRING,
      useNativeDriver: true,
    }).start();

  /* Rebuilt whenever the front changes, so it always writes to that card. */
  const frontIndex = order[0];
  const pan = useRef(
    PanResponder.create({
      /* The web original claims any drag. On a phone the stack fills most of
         the screen, so claiming vertical drags would stop the page scrolling
         under a thumb. Only a mostly-sideways drag is taken. */
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        /* dragElastic 0.5: the card follows at half the distance. */
        const { drag } = valuesFor(currentFront.current);
        drag.setValue({ x: g.dx * ELASTIC, y: g.dy * ELASTIC });
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > THRESHOLD || Math.abs(g.dy) > THRESHOLD) {
          sendToBackRef.current();
        } else {
          settleRef.current(currentFront.current);
        }
      },
      onPanResponderTerminate: () => settleRef.current(currentFront.current),
      /* Once a card is moving, the page's scroll view does not get it. */
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  /* The responder is built once, so it reads these rather than closing over
     a stale front card. */
  const currentFront = useRef(frontIndex);
  currentFront.current = frontIndex;
  /* Deepest first, so the one at the front of the pile is drawn last. */
  const painted = items
    .map((item, index) => ({ item, index, depth: order.indexOf(index) }))
    .sort((a, b) => b.depth - a.depth);

  const sendToBackRef = useRef(sendToBack);
  sendToBackRef.current = sendToBack;
  const settleRef = useRef(settle);
  settleRef.current = settle;

  return (
    <View style={[{ width, height }, style]}>
      {/* Drawn back to front.
       *
       * Each card used to be handed to React in the order the festivals are
       * listed in, with a `zIndex` to sort it out. That does not sort it out:
       * a `zIndex` orders a view among its own brothers and sisters, and each
       * card had a wrapper of its own, so what actually decided which poster
       * was on top was the order of the list — not which card was at the front
       * of the pile. Handing them over deepest-first makes the paint order the
       * pile order, which is the only order there is. */
      painted.map(({ item, index, depth }) => {
        const isFront = depth === 0;
        const { drag, depth: depthValue } = valuesFor(index);

        const from = (out: (string | number)[]) =>
          depthValue.interpolate({
            inputRange: DEPTHS,
            outputRange: out as number[],
            extrapolate: "clamp",
          });

        /* Dragging leans the card away from you, as the original does. */
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

        const body = (
          <Animated.View
            style={[
              styles.card,
              { width, height },
              {
                opacity: from(FADE),
                transform: [
                  { perspective: 1200 },
                  { translateX: Animated.add(drag.x, from(SHIFT)) },
                  { translateY: Animated.add(drag.y, from(RISE)) },
                  { rotateX },
                  { rotateY },
                  { rotate: from(ROTATE) as unknown as string },
                  { scale: from(SCALE) },
                ],
              },
            ]}
            {...(isFront && !reduced ? pan.panHandlers : {})}
            pointerEvents={isFront ? "auto" : "none"}
          >
            {render(item, isFront)}
          </Animated.View>
        );

        /* Reduced motion turns the stack on a tap instead of a drag. */
        if (isFront && reduced) {
          return (
            <Tap
              key={keyOf(item)}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={sendToBack}
              style={styles.card}
            >
              {body}
            </Tap>
          );
        }

        return <View key={keyOf(item)} style={styles.card}>{body}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  /* The comp turns each card about its own centre, so the two behind splay
     evenly either side of the front one. */
  card: { position: "absolute", left: 0, top: 0 },
});
