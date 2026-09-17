import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { SvgProps } from "react-native-svg";

import { image } from "../images";
import { ease, useReducedMotion } from "../theme/motion";
import { colors } from "../theme/tokens";

/**
 * The tab bar, built to the spotlight component Ahmed supplied.
 *
 * That component is a web one — Tailwind class names, DOM elements,
 * lucide-react icons — so none of it can be copied in; this is React Native.
 * What is reproduced is its geometry and behaviour, figure for figure:
 *
 * - a floating bar rather than an edge-to-edge one: 8px side padding, 12px
 *   top and bottom, 90% black, a hairline of white at 10%, 6px corners
 * - items 48 × 48 with 8px either side, so the pitch is 64
 * - the light 48 × 96, centred on the bar's **top edge** — half of it hangs
 *   above the bar — white at 40% fading to nothing, fully rounded
 * - the rail 48 × 2, white, sitting on that same top edge
 * - `1 - distance × 0.6` for how much light a neighbour catches
 * - 400ms, and the incoming light waits 100ms before it comes up
 *
 * React Native has no blur filter, and without one the light is a hard-edged
 * stadium rather than a haze — it reads as a grey pill sitting on the bar,
 * which is exactly wrong. So the source's `blur-lg` is **baked**: the 48 × 96
 * rounded gradient is rendered and blurred once, at 3x, on a canvas padded
 * enough that the blur is not clipped, and shipped as `tab-light.png`. The
 * component just fades that sprite in and out.
 *
 * The icons are filled rather than stroked, so the active weight is carried by
 * colour alone instead of by the source's `strokeWidth`.
 *
 * **It has no labels**, because the source has none. That is a real departure
 * from the Figma comps, which label all five. The names are still on every
 * item for screen readers.
 */
export function TabBar({
  state,
  descriptors,
  navigation,
  icons,
}: BottomTabBarProps & { icons: Record<string, React.FC<SvgProps>> }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  /* Two values, because the source moves the rail and the light on different
     schedules: the rail goes immediately, the light waits 100ms
     (`transitionDelay: '0.1s'` on the active item). The rail arriving first is
     what makes the light feel like it is following the rail rather than the
     two being one object. */
  const rail = useRef(new Animated.Value(state.index)).current;
  const lit = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      rail.setValue(state.index);
      lit.setValue(state.index);
      return;
    }
    const run = Animated.parallel([
      Animated.timing(rail, {
        toValue: state.index,
        duration: DURATION,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(lit, {
        toValue: state.index,
        duration: DURATION,
        delay: LIGHT_DELAY,
        easing: ease,
        useNativeDriver: true,
      }),
    ]);
    run.start();
    return () => run.stop();
  }, [state.index, reduced, rail, lit]);

  /**
   * The source's falloff — full on the item, nothing 1.67 items away — scaled
   * by its `from-white/40`. The 0.4 lives here rather than as a static opacity
   * on the sprite, because the animated opacity is applied later in the same
   * style array and would override it.
   */
  const spill = (index: number) =>
    lit.interpolate({
      inputRange: [index - 1 / 0.6, index, index + 1 / 0.6],
      outputRange: [0, LIGHT_ALPHA, 0],
      extrapolate: "clamp",
    });

  return (
    <View
      style={[
        styles.dock,
        /* Clear of the home indicator without sitting a whole safe area above
           it — a floating bar only has to miss the indicator, not the band
           around it. */
        { paddingBottom: Math.max(insets.bottom - 14, GAP) },
      ]}
    >
      <View style={styles.bar}>
        {/* The rail, on the bar's top edge. */}
        <Animated.View
          style={[
            styles.rail,
            {
              transform: [
                {
                  translateX: rail.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PAD, PAD + PITCH],
                  }),
                },
              ],
            },
          ]}
        />

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
              style={styles.item}
            >
              {/* Half of this sits above the bar, as in the source. */}
              <Animated.View
                style={[styles.light, { opacity: spill(index) }]}
                pointerEvents="none"
              >
                <Image
                  source={image("/assets/tab-light.png")}
                  style={StyleSheet.absoluteFill}
                  contentFit="fill"
                />
              </Animated.View>

              {Icon && (
                <Icon
                  width={24}
                  height={24}
                  color={focused ? colors.white : INACTIVE}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const ITEM = 48;
const GAP = 8;
const PITCH = ITEM + GAP * 2;
const PAD = 8 + GAP;
const LIGHT_H = 96;
/** How much of the light's overhang is bright enough to be worth reserving. */
const LIGHT_HEADROOM = 28;
const DURATION = 400;
/** The source's `transitionDelay: '0.1s'` on the active item's light. */
const LIGHT_DELAY = 100;
/** The source's `from-white/40`. */
const LIGHT_ALPHA = 0.4;
/* Tailwind's gray-500, which is what the source dims an inactive icon to. */
const INACTIVE = "#6b7280";

const styles = StyleSheet.create({
  /**
   * Headroom for the part of the light that shows above the bar.
   *
   * The first version reserved the light's full overhang, 48pt, and with the
   * safe area under it the bar was costing 154pt — 18% of the display held
   * open for a glow. Removing it entirely does not work either: the navigator
   * clips the tab bar's own box, so the light simply disappeared.
   *
   * So the headroom is the overhang the light actually needs to read, not the
   * overhang it geometrically has. The sprite's gradient is at its strongest
   * where the shape begins and has faded to almost nothing 28pt above that,
   * which is what this is. The bar now costs 120pt instead of 154.
   */
  dock: { alignItems: "center", paddingTop: LIGHT_HEADROOM },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GAP,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.9)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  rail: {
    position: "absolute",
    top: -1,
    left: 0,
    width: ITEM,
    height: 2,
    backgroundColor: colors.white,
  },
  item: {
    width: ITEM,
    height: ITEM,
    marginHorizontal: GAP,
    alignItems: "center",
    justifyContent: "center",
  },
  /* The sprite's canvas is 2x the shape's width and 1.6x its height, so the
     blur has somewhere to spread; the box matches the canvas, and the shape
     inside it still lands centred on the bar's top edge. */
  light: {
    position: "absolute",
    top: -(LIGHT_H * 1.6) / 2,
    width: ITEM * 2,
    height: LIGHT_H * 1.6,
  },
});
