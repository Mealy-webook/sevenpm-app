import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Text } from "./Text";
import { useEntrance, useReducedMotion } from "./motion";
import { motion } from "./tokens";

/**
 * Scroll-linked motion: the page tells its sections how far it has travelled,
 * and they decide what to do about it.
 *
 * One `Animated.Value` per screen, shared by context, driven by the native
 * driver. Everything that reads it animates opacity and transform only, so a
 * screen full of reveals still scrolls at 60fps with nothing on the JS thread.
 */
const ScrollY = createContext<Animated.Value | null>(null);

/**
 * Gives a screen a scroll value and the props to feed it.
 *
 * `onAlso` is for anything that needs the same scroll on the JS side — the tab
 * bar's shrink, for instance. There is only one `onScroll` per scroll view, so
 * a screen that wants both has to pass one through the other.
 */
export function usePageScroll(
  onAlso?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const props = {
    onScroll: Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
          onAlso?.(event),
      },
    ),
    scrollEventThrottle: 16,
  };

  return { scrollY, props };
}

export function ScrollProvider({
  value,
  children,
}: {
  value: Animated.Value;
  children: React.ReactNode;
}) {
  return <ScrollY.Provider value={value}>{children}</ScrollY.Provider>;
}

export function useScrollY() {
  return useContext(ScrollY);
}

/**
 * A block that arrives as it comes into view — rising a little and fading up.
 *
 * It measures its own offset with `onLayout`, which reports position inside
 * the **parent**, so a `Reveal` has to be a direct child of the scroll view's
 * content container. Nest one and it will read the wrong offset and either
 * never appear or appear too early. That constraint buys a reveal that needs
 * no measuring against the scroll node and no JS while scrolling.
 *
 * Anything already on screen at mount is drawn settled, so a page never opens
 * with its first screenful invisible.
 */
export function Reveal({
  children,
  style,
  distance = 72,
  /** How far up the screen the block has to be before it is fully in. */
  at = 0.86,
  /** Position in the page, for the opening stagger. */
  index = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  distance?: number;
  at?: number;
  index?: number;
}) {
  const scrollY = useScrollY();
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const [top, setTop] = useState<number | null>(null);

  /* Blocks that start on screen cannot be revealed by scrolling to them, so
     they play once on arrival instead, one after another down the page. */
  const enter = useEntrance(motion.slow, index * 110);

  const onLayout = (event: LayoutChangeEvent) =>
    setTop(event.nativeEvent.layout.y);

  if (top === null || reduced || !scrollY) {
    return (
      <Animated.View onLayout={onLayout} style={style}>
        {children}
      </Animated.View>
    );
  }

  const onScreenAtRest = top < height * at;
  const driver = onScreenAtRest ? enter : scrollY;
  const range = onScreenAtRest ? [0, 1] : [top - height, top - height * at];

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        style,
        {
          opacity: driver.interpolate({
            inputRange: range,
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: driver.interpolate({
                inputRange: range,
                outputRange: [distance, 0],
                extrapolate: "clamp",
              }),
            },
            {
              scale: driver.interpolate({
                inputRange: range,
                outputRange: [0.94, 1],
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * A heading that arrives a word at a time.
 *
 * This is the app's signature move and it is spent only on the display face —
 * a 104px Daltown line landing word by word is the whole reason the type is
 * that size. Anywhere else it would be fidgety.
 *
 * The words are separate elements in a wrapping row, so they still break
 * across lines the way a single string would; each carries its own slice of
 * the same scroll range, offset by its position, which is what makes them
 * land in sequence rather than together.
 */
export function RevealWords({
  children,
  style,
  textStyle,
  variant = "displayStep",
  color,
  uppercase = true,
  at = 0.86,
}: {
  children: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: ComponentProps<typeof Text>["variant"];
  color?: string;
  uppercase?: boolean;
  at?: number;
}) {
  const scrollY = useScrollY();
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const [top, setTop] = useState<number | null>(null);
  const enter = useEntrance(motion.slow, 60);

  /* A "\n" in the copy is a break the comp draws; it becomes a full-width
     spacer so the row wraps there and nowhere else. */
  const words = children
    .split(/(\n)/)
    .flatMap((part) => (part === "\n" ? ["\n"] : part.split(/\s+/).filter(Boolean)));
  const onLayout = (event: LayoutChangeEvent) =>
    setTop(event.nativeEvent.layout.y);

  if (top === null || reduced || !scrollY) {
    return (
      <View onLayout={onLayout} style={[styles.words, style]}>
        {words.map((word, i) =>
          word === "\n" ? (
            <View key={`br-${i}`} style={styles.lineBreak} />
          ) : (
            <Text key={`${word}-${i}`} variant={variant} color={color} uppercase={uppercase} style={textStyle}>
              {word}
            </Text>
          ),
        )}
      </View>
    );
  }

  const onScreenAtRest = top < height * at;
  const driver = onScreenAtRest ? enter : scrollY;
  const base = onScreenAtRest ? [0, 1] : [top - height, top - height * at];
  const span = base[1] - base[0];

  return (
    <View onLayout={onLayout} style={[styles.words, style]}>
      {words.map((word, i) => {
        if (word === "\n") return <View key={`br-${i}`} style={styles.lineBreak} />;
        /* Each word covers most of the range, starting a little later than
           the one before, so they overlap rather than queue. */
        const lead = (i / Math.max(words.length, 1)) * span * 0.55;
        const range = [base[0] + lead, base[1]];
        return (
          <Animated.View
            key={`${word}-${i}`}
            style={{
              opacity: driver.interpolate({
                inputRange: range,
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
              transform: [
                {
                  translateY: driver.interpolate({
                    inputRange: range,
                    outputRange: [90, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          >
            <Text variant={variant} color={color} uppercase={uppercase} style={textStyle}>
              {word}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Words wrap as a single line of type would, with a gap where the spaces
     were — the display face is tracked loosely enough that this reads. */
  words: { flexDirection: "row", flexWrap: "wrap", columnGap: 16 },
  lineBreak: { width: "100%", height: 0 },
});
