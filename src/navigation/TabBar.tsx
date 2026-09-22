import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { SvgProps } from "react-native-svg";

import { tap } from "../theme/haptics";
import { tabBarShrink } from "./tabBarScroll";
import { ease, useReducedMotion } from "../theme/motion";
import { colors } from "../theme/tokens";

/**
 * The tab bar, from Figma 454:67370 — "Tab Bar/V2".
 *
 * It replaces the floating spotlight bar this app carried before, which came
 * from a web component rather than the comps. The comp's bar is the opposite
 * shape: not a pill hovering in the middle of the screen, but one flat strip
 * spanning the page's own 24pt margins, 64 tall, square, held by a single
 * dimmed hairline. The fill is barely there — 5% black — because the darkening
 * is done behind it instead, by a gradient that fades from nothing to 35%
 * black under a blur, so what the strip sits on is already dim by the time the
 * strip is drawn over it.
 *
 * **The selected tab is marked by a line above it, not a glow behind it.** The
 * comp draws it as a 2pt border on the top edge of the active tab, in
 * content-primary. Nothing else about an active tab differs except its icon
 * colour. Because the comp is a still, it cannot say what happens between two
 * tabs — so the line slides, on the system curve, rather than cutting.
 *
 * **It has no labels**, as the comp has none. The names are still on every
 * item for screen readers.
 *
 * **It floats**, as the old one did: the bar is positioned over the screen
 * rather than laid out below it, so content scrolls underneath and the blur
 * has something to work on. Every tab screen pays for its own clearance with
 * `TAB_BAR_CLEARANCE`.
 *
 * **It draws itself in while you read.** Scrolling down takes a little of its
 * weight away and scrolling up brings it back — behaviour carried over from
 * the old bar. The old bar also shrank, which suited something floating in the
 * middle of the screen and does not suit a strip pinned to two margins: it
 * would visibly peel away from both edges. So only the weight changes now.
 */
export function TabBar({
  state,
  descriptors,
  navigation,
  icons,
}: BottomTabBarProps & { icons: Record<string, React.FC<SvgProps>> }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const rail = useRef(new Animated.Value(state.index)).current;
  /* The tabs share the strip evenly, so how wide one is is only known once the
     strip has been laid out — and the line has to be exactly that wide. */
  const [strip, setStrip] = useState(0);

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) return rail.setValue(state.index);
    const run = Animated.timing(rail, {
      toValue: state.index,
      duration: DURATION,
      easing: ease,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [state.index, reduced, rail]);

  const count = state.routes.length;
  const tabWidth = strip > 0 ? (strip - INSET * 2 - GAP * (count - 1)) / count : 0;

  return (
    <View style={styles.dock} pointerEvents="box-none">
      {/* The comp's ".Back blur": it starts 16 above the strip, so the page
          does not meet the bar at a hard line. */}
      <BlurView
        intensity={18}
        tint="dark"
        /* Renamed from experimentalBlurMethod in SDK 55. */
        blurMethod="dimezisBlurView"
        style={styles.backdrop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.03)", "rgba(0,0,0,0.35)"]}
        style={styles.backdrop}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.bar,
          {
            opacity: tabBarShrink.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.82],
            }),
          },
        ]}
      >
        <View
          style={styles.strip}
          onLayout={(event) => setStrip(event.nativeEvent.layout.width)}
        >
          {/* The line above the selected tab. */}
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.rail,
                {
                  width: tabWidth,
                  transform: [
                    {
                      translateX: rail.interpolate({
                        inputRange: [0, 1],
                        outputRange: [INSET, INSET + tabWidth + GAP],
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
                    tap.tick();
                    navigation.navigate(route.name as never);
                  }
                }}
                style={styles.tab}
              >
                {Icon && (
                  <Icon
                    width={24}
                    height={24}
                    color={focused ? colors.contentPrimary : colors.contentSecondary}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* The comp's 4pt gap, then the home indicator's own band. */}
      <View style={{ height: FOOT + Math.max(insets.bottom, FOOT) }} />
    </View>
  );
}

/** The strip is 64 tall and the tabs sit 4 in from its top and bottom. */
const BAR_H = 64;
const PAD_V = 4;
/** The page's own margin, which the strip runs between. */
const MARGIN = 24;
/** Inside the strip: 8 before the first tab, and 8 between each. */
const INSET = 8;
const GAP = 8;
/** And 4 between the strip and the home indicator. */
const FOOT = 4;
const DURATION = 400;
/** How far the backdrop reaches above the strip. */
const RISE = 16;

/**
 * What a tab screen must add to the bottom of its scroll so its last row is
 * not hidden under the bar. The bar floats, so nothing reserves this for them.
 */
export const TAB_BAR_CLEARANCE = BAR_H + FOOT + 34 + 12;

const styles = StyleSheet.create({
  dock: { position: "absolute", left: 0, right: 0, bottom: 0 },
  backdrop: { ...StyleSheet.absoluteFill, top: -RISE },
  bar: { height: BAR_H, paddingHorizontal: MARGIN, paddingVertical: PAD_V },
  strip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: GAP,
    paddingHorizontal: INSET,
    /* The comp's fill is almost nothing; the gradient behind does the work. */
    backgroundColor: Platform.select({
      ios: "rgba(0,0,0,0.05)",
      /* Heavier, because the Android blur may not render at all. */
      default: "rgba(0,0,0,0.35)",
    }),
    borderWidth: 1,
    borderColor: colors.overlay5,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  rail: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.contentPrimary,
  },
});
