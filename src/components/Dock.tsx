import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { space } from "../theme/tokens";

/**
 * The Button Dock from the app's Figma library (162:76293): the strip pinned
 * to the bottom of a screen that holds its actions.
 *
 * Two things it is specified to do. It draws a shade behind itself that fades
 * up out of the page, so a white button never sits on a photograph with
 * nothing between them. And it does **not** own the bottom safe area — the
 * Figma note is explicit that the screen around it is responsible for the home
 * indicator — except that on a phone there is no screen "around" it, so the
 * inset is added here once and the caller stops having to remember.
 *
 * Actions stack vertically with a 12px gap, which covers both the One Action
 * and Vertical Actions variants without either needing its own component.
 */
export function Dock({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.dock}>
      <LinearGradient
        colors={["rgba(0,0,0,0.03)", "rgba(0,0,0,0.35)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.actions, { paddingBottom: insets.bottom || space.m }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { width: "100%" },
  actions: {
    gap: space.m,
    paddingHorizontal: 20,
    /* 20px horizontal, as the dock draws it in the comps. */
    paddingTop: space.s,
  },
});
