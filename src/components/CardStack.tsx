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
 * Three cards in a group, and a push that moves you through them either way.
 *
 * Two earlier tries got one half of this each. The first was a pile: the
 * front card thrown aside and sent to the back, which looks right and only
 * goes one way — whichever side you push it off, the same card comes up next
 * and there is no way back to the one you just passed. The second went both
 * ways but laid the cards out in a row with a gap between them, which reads
 * as a list rather than as a group of posters.
 *
 * So the cards are grouped, as they were at the start: the one you are on in
 * front and full size, the one before it and the one after it tucked behind
 * at a tilt, one to each side. What is different is that none of those are
 * fixed places. Each card's tilt, size and offset are read off how far it is
 * from the middle *right now*, so a push does not slide a row along — it
 * turns the group over, the card you are on sinking back to one side while
 * the one you asked for rises out of the other.
 *
 * The list wraps, so there is no end to hit.
 */

/** The group, by how far a card is from the middle: behind, front, behind. */
const SLOTS = [-1, 0, 1];
const SHIFT = [-26, 0, 26];
const TILT = ["-10deg", "0deg", "10deg"];
const SIZE = [0.9106, 1, 0.9106];

/** How far a finger travels to turn the group one place. */
const REACH = 0.5;
/** How far, or how fast, it has to go for the turn to take. */
const THRESHOLD = 0.34;
const FLING = 0.35;
const TURN_MS = 340;
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
  /** What a screen reader hears on the whole group. */
  label?: string;
  onFrontChange?: (item: T) => void;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  /* 0 at rest; -1 once the group has turned one place towards the next. */
  const turn = useRef(new Animated.Value(0)).current;
  const count = items.length;

  const at = (offset: number) => items[(((index + offset) % count) + count) % count];

  const front = items[index];
  useEffect(() => {
    if (front) onFrontChange?.(front);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  /**
   * Which card is drawn on top.
   *
   * Everything else about a card is read off `turn` on the native driver, but
   * the drawing order is not something a transform can express, so it is
   * state — flipped once, when the card being brought in passes the card
   * being sent back. One change per push, not one per frame.
   */
  const [lead, setLead] = useState(0);
  useEffect(() => {
    const id = turn.addListener(({ value }) => {
      const next = value <= -0.5 ? 1 : value >= 0.5 ? -1 : 0;
      setLead((was) => (was === next ? was : next));
    });
    return () => turn.removeListener(id);
  }, [turn]);

  /* Read by the gesture, which is built once and must not go stale. */
  const hand = useRef({ reach: 0, go: (_dir: number) => {} });
  hand.current.reach = width * REACH;
  hand.current.go = (dir: number) => {
    if (dir === 0) {
      return Animated.spring(turn, {
        toValue: 0,
        ...BACK_SPRING,
        useNativeDriver: true,
      }).start();
    }
    haptic.tick();
    Animated.timing(turn, {
      toValue: -dir,
      duration: TURN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      /* The card that was beside it is the one in the middle now, so the
         group can go back to nought without anything appearing to move. */
      setIndex((current) => (((current + dir) % count) + count) % count);
      turn.setValue(0);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => {
        const reach = hand.current.reach || 1;
        turn.setValue(Math.max(-1, Math.min(1, g.dx / reach)));
      },
      onPanResponderRelease: (_, g) => {
        const reach = hand.current.reach || 1;
        const far = Math.abs(g.dx / reach) > THRESHOLD || Math.abs(g.vx) > FLING;
        /* Pushed left, the one after it comes forward. */
        hand.current.go(far ? (g.dx > 0 ? -1 : 1) : 0);
      },
      onPanResponderTerminate: () => hand.current.go(0),
    }),
  ).current;

  /* Furthest from the middle first, so the one in front is drawn last. */
  const painted = [...SLOTS].sort((a, b) =>
    a === lead ? 1 : b === lead ? -1 : Math.abs(b) - Math.abs(a),
  );

  return (
    <View
      style={[{ width, height }, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      {...(reduced ? {} : pan.panHandlers)}
    >
      {painted.map((offset) => {
        const item = at(offset);
        if (!item) return null;
        /* Where this card is in the group at this moment. */
        const slot = Animated.add(turn, offset);
        const from = (out: (string | number)[]) =>
          slot.interpolate({
            inputRange: SLOTS,
            outputRange: out as number[],
            extrapolate: "clamp",
          });

        return (
          <Animated.View
            key={`${keyOf(item)}-${offset}`}
            style={[
              styles.card,
              {
                width,
                height,
                transform: [
                  { translateX: from(SHIFT) },
                  { rotate: from(TILT) as unknown as string },
                  { scale: from(SIZE) },
                ],
              },
            ]}
            pointerEvents={offset === 0 ? "auto" : "none"}
          >
            {render(item, offset === 0)}
          </Animated.View>
        );
      })}

      {/* Reduced motion turns the group on a tap instead of a push. */}
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
  /* Each card turns about its own centre, so the two behind splay evenly
     either side of the one in front. */
  card: { position: "absolute", left: 0, top: 0 },
});
