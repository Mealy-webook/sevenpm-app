import { Pressable, StyleSheet, View } from "react-native";

import Check from "../icons/ic-switch-check-16.svg";
import { colors, radii } from "../theme/tokens";

/**
 * Toggle switch, from Figma 2033:16698: a 52 × 32 track with a 28px white knob
 * at one end or the other. On, the track is brand yellow and the knob carries
 * a tick.
 *
 * Square edges are the house rule everywhere else in this system, and this is
 * one of its two exceptions — a pill track with a round knob is what makes a
 * switch read as a switch, and the comp draws it that way.
 */
export function Switch({
  on,
  onChange,
  label,
  disabled = false,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  /** Accessible name — the visible text sits outside the control. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!on)}
      style={[
        styles.track,
        on ? styles.on : styles.off,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.knob}>{on && <Check width={16} height={16} />}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    padding: 2,
    borderRadius: radii.pill,
    justifyContent: "center",
  },
  on: { alignItems: "flex-end", backgroundColor: colors.brand },
  off: { alignItems: "flex-start", backgroundColor: colors.overlay20 },
  disabled: { opacity: 0.4 },
  knob: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
