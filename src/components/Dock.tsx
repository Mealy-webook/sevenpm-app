import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { space } from "../theme/tokens";

/**
 * The Button Dock from the app's Figma library (162:76293): the strip pinned
 * to the bottom of a screen that holds its actions.
 *
 * Three things it is specified to do. It draws a shade behind itself that
 * fades up out of the page, so a white button never sits on a photograph with
 * nothing between them — glass, not paint: the footer in the comps blurs what
 * is behind it as well as darkening it, and the shade reaches 16 above the
 * dock so the page dissolves into it rather than meeting it on a line. It can carry an **accessory** above the buttons —
 * Figma's word — for a line that qualifies the action: what is in the basket,
 * a disclaimer, a total. And it does *not* own the bottom safe area; the
 * Figma note is explicit that the screen around it is responsible for the home
 * indicator, except that on a phone there is no screen "around" it, so the
 * inset is added here once and callers stop having to remember.
 *
 * Actions stack vertically with a 12px gap, which covers the One Action and
 * Vertical Actions variants; a row of them is the caller's own `flexDirection`.
 *
 * `surface` swaps the fade for the booking journey's flat panel, which sits
 * over a scrolling list rather than over artwork.
 */
export function Dock({
  children,
  accessory,
  surface = "shade",
}: {
  children: React.ReactNode;
  accessory?: React.ReactNode;
  surface?: "shade" | "panel";
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.dock}>
      {surface === "shade" ? (
        <View style={styles.shade} pointerEvents="none">
          <BlurView
            intensity={40}
            tint="dark"
            /* Renamed from experimentalBlurMethod in SDK 55. */
            blurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.03)", "rgba(0,0,0,0.35)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.panel]} pointerEvents="none" />
      )}

      <View style={[styles.actions, { paddingBottom: insets.bottom || space.m }]}>
        {accessory}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { width: "100%" },
  /* Hung 16 above the dock, as the comps' footer is. */
  shade: { ...StyleSheet.absoluteFill, top: -16 },
  /* 85% of the raised band, as the booking comps fill it. */
  panel: { backgroundColor: "rgba(24,24,27,0.85)" },
  actions: {
    gap: space.m,
    /* 20px horizontal, as the dock draws it in the comps. */
    paddingHorizontal: 20,
    paddingTop: space.s,
  },
});
