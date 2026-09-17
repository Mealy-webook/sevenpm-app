import { createContext, useContext, useRef, useState } from "react";
import {
  Animated,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useReducedMotion } from "./motion";

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
  distance = 28,
  /** How far up the screen the block has to be before it is fully in. */
  at = 0.78,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  distance?: number;
  at?: number;
}) {
  const scrollY = useScrollY();
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const [top, setTop] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) =>
    setTop(event.nativeEvent.layout.y);

  const settled = top === null || reduced || !scrollY;
  const range = settled ? [0, 1] : [top - height, top - height * at];

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        style,
        settled
          ? null
          : {
              opacity: scrollY!.interpolate({
                inputRange: range,
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
              transform: [
                {
                  translateY: scrollY!.interpolate({
                    inputRange: range,
                    outputRange: [distance, 0],
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
