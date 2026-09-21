import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
 * A rail of cards you move along one at a time.
 *
 * It began as a pile — the 21st.dev "Image Stack Carousel", where the front
 * card is thrown aside and goes to the back — and a pile is the wrong shape
 * for this. A pile only goes one way: whichever side you push the top card
 * off, the same one comes up next, and there is no way back to the one you
 * just passed. Ahmed wanted to move both ways, so the cards sit **beside**
 * each other rather than on top of each other.
 *
 * Only three are ever drawn: the one you are looking at, and the ones either
 * side of it waiting just off each edge. Push and they all move together, so
 * what comes into view is the card you are actually asking for. Let go past
 * the threshold and the rail settles one place along; let go short of it and
 * it springs back to where it was.
 *
 * The list wraps, so there is no end to hit and nothing to rubber-band
 * against.
 */

/** How far, or how fast, a push has to be to count as one. */
const THRESHOLD = 56;
const FLING = 0.35;
/** The space between one card and the next. */
const GAP = 16;
const MOVE_MS = 320;
const BACK_SPRING = { stiffness: 260, damping: 26, mass: 1 };

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
  /** `isFront` is true only for the card in the middle. */
  render: (item: T, isFront: boolean) => React.ReactNode;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** What a screen reader hears on the whole rail. */
  label?: string;
  onFrontChange?: (item: T) => void;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const shove = useRef(new Animated.Value(0)).current;
  const count = items.length;

  /* The card `offset` places along, wrapping in both directions. */
  const at = (offset: number) => items[(((index + offset) % count) + count) % count];

  const front = items[index];
  useEffect(() => {
    if (front) onFrontChange?.(front);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  /* Read by the gesture, which is built once and must not go stale. */
  const hand = useRef({ pitch: 0, count, go: (_dir: number) => {} });
  hand.current.pitch = width + GAP;
  hand.current.count = count;
  hand.current.go = (dir: number) => {
    if (dir === 0) {
      return Animated.spring(shove, {
        toValue: 0,
        ...BACK_SPRING,
        useNativeDriver: true,
      }).start();
    }
    haptic.tick();
    Animated.timing(shove, {
      toValue: -dir * hand.current.pitch,
      duration: MOVE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      /* The card that was beside it becomes the one in the middle, so the
         rail can go back to nought without anything appearing to move. */
      setIndex((current) => (((current + dir) % count) + count) % count);
      shove.setValue(0);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => shove.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        const far = Math.abs(g.dx) > THRESHOLD || Math.abs(g.vx) > FLING;
        /* Pushed left, the next one comes in from the right. */
        hand.current.go(far ? (g.dx > 0 ? -1 : 1) : 0);
      },
      onPanResponderTerminate: () => hand.current.go(0),
    }),
  ).current;

  const pitch = width + GAP;
  /* The one before, the one you are on, the one after. */
  const rail = [-1, 0, 1];

  return (
    <View
      style={[{ width, height }, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      {...(reduced ? {} : pan.panHandlers)}
    >
      {rail.map((offset) => {
        const item = at(offset);
        if (!item) return null;
        return (
          <Animated.View
            key={`${keyOf(item)}-${offset}`}
            style={[
              styles.card,
              {
                width,
                height,
                transform: [
                  { translateX: Animated.add(shove, offset * pitch) },
                ],
              },
            ]}
            pointerEvents={offset === 0 ? "auto" : "none"}
          >
            {render(item, offset === 0)}
          </Animated.View>
        );
      })}

      {/* Reduced motion moves the rail on a tap instead of a push. */}
      {reduced && (
        <Tap
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => hand.current.go(1)}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: "absolute", left: 0, top: 0 },
});
