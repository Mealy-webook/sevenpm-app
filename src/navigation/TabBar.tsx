import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { SvgProps } from "react-native-svg";

import { Text } from "../theme/Text";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, motion, space } from "../theme/tokens";

/**
 * The tab bar, with the spotlight treatment Ahmed asked for.
 *
 * The idea comes from a web component built on Tailwind and lucide-react,
 * which cannot be used here — this is React Native, so there is no DOM to
 * put class names on and no CSS `blur` to fall back on. What is portable is
 * the behaviour: a light above the selected tab, a rail that slides to it, and
 * neighbouring tabs catching some of the spill so the bar reads as one lit
 * object rather than five separate buttons.
 *
 * Three departures from the original, each deliberate:
 *
 * - The light is **brand yellow**, not white. This bar already marks the
 *   selected tab in brand, and a white glow over a yellow icon would put two
 *   highlight colours on one control.
 * - It falls *into* the bar rather than spilling above it. The original lets
 *   the glow hang over the page; on a phone that means a haze over whatever
 *   you are scrolling, and Android clips it unpredictably anyway.
 * - There is no blur. React Native has no filter, so the softness is the
 *   gradient's own falloff plus a generous corner radius, which at this size
 *   and opacity is indistinguishable from a blurred one.
 *
 * The falloff is the original's: full on the selected tab, then
 * `1 - distance × 0.6`, which reaches nothing 1.67 tabs away. Driven by one
 * value so the whole bar moves together, on the native driver.
 */
export function TabBar({
  state,
  descriptors,
  navigation,
  icons,
}: BottomTabBarProps & { icons: Record<string, React.FC<SvgProps>> }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);

  /* One value for the whole bar: which tab the light is over, as a float
     while it travels. */
  const position = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      position.setValue(state.index);
      return;
    }
    const run = Animated.timing(position, {
      toValue: state.index,
      duration: motion.base,
      easing: ease,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [state.index, reduced, position]);

  const count = state.routes.length;
  const tab = width / count;

  /** The original's `1 - distance × 0.6`, as an interpolation. */
  const spill = (index: number) =>
    position.interpolate({
      inputRange: [index - 1 / 0.6, index, index + 1 / 0.6],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom || space.s }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {/* The rail the light hangs from. */}
      {width > 0 && (
        <Animated.View
          style={[
            styles.rail,
            {
              width: RAIL,
              transform: [
                {
                  translateX: position.interpolate({
                    inputRange: [0, 1],
                    outputRange: [tab / 2 - RAIL / 2, tab / 2 - RAIL / 2 + tab],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const Icon = icons[route.name];

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            }}
            style={styles.tab}
          >
            {/* The spotlight, falling from the rail into the bar. */}
            <Animated.View
              style={[styles.spotlight, { opacity: spill(index) }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["rgba(251,235,28,0.35)", "rgba(251,235,28,0)"]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {Icon && (
              <Icon
                width={24}
                height={24}
                color={focused ? colors.brand : colors.contentPrimary}
              />
            )}
            <Text
              variant="tab"
              color={focused ? colors.brand : colors.contentPrimary}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const RAIL = 48;
const GLOW = 48;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.overlay5,
    paddingTop: space.s,
  },
  rail: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.brand,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
    overflow: "hidden",
  },
  spotlight: {
    position: "absolute",
    top: -space.s,
    width: GLOW,
    height: 72,
    borderRadius: GLOW / 2,
    overflow: "hidden",
  },
});
