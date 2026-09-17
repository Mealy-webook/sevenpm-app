import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * The system has three buttons, and which one to reach for is decided by the
 * job rather than by the emphasis wanted:
 *
 * - `secondary` is the workhorse and very nearly the only one. A 5% white fill
 *   under a half-pixel 10% border, square corners, label in semibold 13.
 * - `primary` is the dock button a step ends with — white paper, near-black
 *   label. One per screen, at the bottom.
 * - `brand` is the yellow one, and it exists for exactly one press in the
 *   whole app: "Confirm & pay". Brand yellow is an accent, not a surface, and
 *   the moment a second screen fills something with it the colour stops
 *   meaning "this is the irreversible one".
 *
 * Secondary sizes itself from an inner fixed-height content box (16px) rather
 * than from padding on the label, which is how the Figma components are built;
 * sizing it any other way gives buttons a pixel or two off each other. The
 * dock buttons are full-width and set their own 16px padding instead.
 */
export function Button({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  tone = "default",
  variant = "secondary",
  style,
}: {
  label: string;
  icon?: React.FC<SvgProps>;
  onPress?: () => void;
  disabled?: boolean;
  /** `destructive` is red on the same surface — remove, delete, cancel. */
  tone?: "default" | "destructive";
  variant?: "secondary" | "primary" | "brand";
  style?: ViewStyle;
}) {
  const dock = variant !== "secondary";

  const content = disabled
    ? colors.disabled
    : dock
      ? colors.bgSecondary
      : tone === "destructive"
        ? colors.negative
        : colors.contentPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        dock ? styles.dock : styles.small,
        !disabled && variant === "primary" && styles.primary,
        !disabled && variant === "brand" && styles.brand,
        disabled && (dock ? styles.dockDisabled : styles.disabled),
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {Icon && (
        <Icon
          width={16}
          height={16}
          /* The dock marks are drawn white; on white paper they need the
             label's own ink instead. */
          color={dock && !disabled ? colors.bgSecondary : undefined}
        />
      )}
      {dock ? (
        <Text variant="bodyL" color={content} style={styles.dockLabel}>
          {label}
        </Text>
      ) : (
        <View style={styles.box}>
          <Text variant="bodySBold" color={content}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  small: {
    gap: space.xs,
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  dock: { gap: space.s, paddingHorizontal: space.xl, paddingVertical: space.l },
  dockLabel: { fontFamily: "Roboto_600SemiBold" },
  primary: { backgroundColor: colors.white },
  brand: { backgroundColor: colors.brand },
  /* Disabled loses the border too — the comp draws it as a flat dead slab
     rather than as an outlined control you cannot press. */
  disabled: { borderColor: "transparent" },
  dockDisabled: { backgroundColor: colors.overlay5 },
  pressed: { opacity: 0.85 },
  box: { height: 16, justifyContent: "center", paddingHorizontal: space.xs },
});
