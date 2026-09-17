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
 * - `brand` is the yellow one — Figma calls this hierarchy CTA. It is the
 *   single highest-priority action on a screen and appears at most once per
 *   view: "Confirm & pay", "Allow notifications", "Accept all". Brand yellow
 *   is an accent, not a surface; the moment a second thing on a screen is
 *   filled with it the colour stops meaning "this is the one that counts".
 * - `outline` is the dock-sized secondary: the same 5% fill and hairline
 *   border as `secondary`, at the height of the buttons it stands next to.
 *   Use it for the alternative to a dock action — "Reject all" under
 *   "Accept all".
 * - `tertiary` has no fill and no border but keeps the full dock padding, so
 *   it is a real tap target that carries no weight — "Skip", "Maybe later",
 *   "Manage cookies".
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
  size = "s",
  style,
}: {
  label: string;
  icon?: React.FC<SvgProps>;
  onPress?: () => void;
  disabled?: boolean;
  /** `destructive` is red on the same surface — remove, delete, cancel. */
  tone?: "default" | "destructive";
  variant?: "secondary" | "primary" | "brand" | "outline" | "tertiary";
  /**
   * Secondary only. `s` is the 13px control the list rows carry; `m` is the
   * 15px one the Figma screens use on their own — "Skip" on onboarding.
   */
  size?: "s" | "m";
  style?: ViewStyle;
}) {
  const dock = variant !== "secondary";

  /* The dock buttons are dark ink on light paper, except the tertiary one,
     which has no paper under it and takes the page's own content colour. */
  const content = disabled
    ? colors.disabled
    : variant === "tertiary" || variant === "outline"
      ? colors.contentPrimary
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
        dock ? styles.dock : size === "m" ? styles.medium : styles.small,
        !disabled && variant === "primary" && styles.primary,
        !disabled && variant === "brand" && styles.brand,
        variant === "outline" && styles.outline,
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
          color={
            dock && variant !== "tertiary" && variant !== "outline" && !disabled
              ? colors.bgSecondary
              : undefined
          }
        />
      )}
      {dock ? (
        <Text variant="bodyL" color={content} style={styles.dockLabel}>
          {label}
        </Text>
      ) : (
        <View style={styles.box}>
          <Text variant={size === "m" ? "bodyBold" : "bodySBold"} color={content}>
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
  medium: {
    gap: space.xs,
    padding: space.m,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  dock: { gap: space.s, paddingHorizontal: space.xl, paddingVertical: space.l },
  dockLabel: { fontFamily: "Roboto_600SemiBold" },
  primary: { backgroundColor: colors.white },
  outline: {
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  brand: { backgroundColor: colors.brand },
  /* Disabled loses the border too — the comp draws it as a flat dead slab
     rather than as an outlined control you cannot press. */
  disabled: { borderColor: "transparent" },
  dockDisabled: { backgroundColor: colors.overlay5 },
  pressed: { opacity: 0.85 },
  box: { height: 16, justifyContent: "center", paddingHorizontal: space.xs },
});
