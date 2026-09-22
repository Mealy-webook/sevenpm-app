import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { SvgProps } from "react-native-svg";

import { image } from "../images";
import { tap } from "../theme/haptics";
import { tabBarShrink } from "./tabBarScroll";
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
 * **It floats.** The bar is positioned over the screen rather than laid out
 * below it, so content scrolls underneath and the glass has something to blur.
 * That means it no longer reserves any height, and every tab screen has to pay
 * for its own clearance — `useBottomTabBarHeight()` gives them the figure, and
 * `TAB_BAR_CLEARANCE` is what a screen should add to its scroll padding.
 *
 * The glass is a real blur (`expo-blur`) with a dark tint and a fill over it,
 * replacing the flat 90% black the source used — the source sits on a fixed
 * pale page and never has anything moving behind it. On Android the blur is
 * the experimental implementation and degrades to the fill alone if it is
 * unavailable, which still reads correctly, just flatter.
 *
 * **The fill is a contrast floor, not a look.** Measured against a pale poster
 * scrolling underneath, icons need 3:1 to be legible (WCAG, non-text). At the
 * 0.35 fill this started with, the *active white* icon managed only 2.9:1 and
 * the source's `gray-500` inactive managed 1.7:1 — and grey gets worse as the
 * fill rises, because it converges with the bar. So the fill is 0.55, which
 * puts white at 5.5:1, and inactive icons are white at 60% rather than a fixed
 * grey, which holds 3.1:1 in the same worst case and improves from there as
 * the content behind gets darker.
 *
 * A scrim under the whole bar does the rest: it sits behind the blur, so the
 * blur samples content that has already been darkened, and it softens the edge
 * where bright artwork meets the bar.
 *
 * **It draws itself in while you read.** Scrolling down shrinks it and takes a
 * little of its weight away; scrolling up brings it straight back. The bar is
 * never more than one gesture from full size, so nothing is hidden — it just
 * stops competing with the thing you are reading. See `useTabBarScroll`.
 *
 * **It has no labels**, because the source has none. That is a real departure
 * from the Figma comps, which label all five. The names are still on every
 * item for screen readers.
 *
 * **This is not the comp's bar, deliberately.** 454:67370 draws a flat strip
 * between the page's margins with a line over the selected tab; that was
 * built and Ahmed asked for this one back. What the comp does still decide is
 * what is in the bar and in what order — Discover / Resale / Wallet /
 * Bookings / Menu — and the five glyphs, which are taken from it.
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
      pointerEvents="box-none"
    >
      {/* Behind the bar, so the blur samples content already darkened. */}
      <LinearGradient
        colors={["rgba(11,11,14,0)", "rgba(11,11,14,0.75)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.bar,
          {
            transform: [
              {
                scale: tabBarShrink.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.86],
                }),
              },
            ],
            opacity: tabBarShrink.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.82],
            }),
          },
        ]}
      >
        <BlurView
          intensity={40}
          tint="dark"
          /* Renamed from experimentalBlurMethod in SDK 55. */
          blurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[StyleSheet.absoluteFill, styles.glass]} pointerEvents="none" />
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
                  tap.tick();
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
      </Animated.View>
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

/**
 * What a tab screen must add to the bottom of its scroll so its last row is
 * not hidden under the bar. The bar floats, so nothing reserves this for them.
 */
export const TAB_BAR_CLEARANCE = LIGHT_HEADROOM + ITEM + 12 * 2 + 24;
/** The source's `from-white/40`. */
const LIGHT_ALPHA = 0.4;
/**
 * The source dims an inactive icon to Tailwind's gray-500. That works on its
 * fixed pale page and fails here: against the bar over bright content it
 * measures 1.7:1, and darkening the bar makes it worse, not better. White at
 * 60% keeps the same *relationship* to the bar whatever is behind it.
 */
const INACTIVE = "rgba(255,255,255,0.6)";

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
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: LIGHT_HEADROOM,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GAP,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  /* A thin fill over the blur. Without it the glass is too transparent for
     white icons to hold against bright artwork scrolling underneath. */
  glass: {
    backgroundColor: Platform.select({
      /* 0.55 is the floor that keeps a white icon at 5.5:1 over a pale
         backdrop; see the note at the top before lowering it. */
      ios: "rgba(0,0,0,0.55)",
      /* Heavier, because the Android blur may not render at all. */
      default: "rgba(0,0,0,0.72)",
    }),
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
