import { Animated, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Text } from "../theme/Text";
import { usePressScale } from "../theme/motion";
import { colors, space } from "../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
 * **Sizing note, and it is a trap.** The Figma components are built from an
 * inner content box of a fixed 16px with padding around it, and this component
 * used to reproduce that literally. In Figma a text layer overflows its box
 * without consequence; in React Native a 20px line inside a 16px box is
 * clipped, and every secondary button in the app lost the bottom of its
 * letters. It is the same mistake as setting a display line height tighter
 * than its size — see DESIGN-SYSTEM.md §2.
 *
 * So the heights the comps specify are reproduced with padding instead, and
 * the arithmetic is written down: total = line height + 2 × vertical padding.
 * Secondary small is 13/20 in 36px, medium 15/22 in 40px, and the dock
 * buttons are 17/24 in 52px.
 */
export function Button({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  tone = "default",
  variant = "secondary",
  size = "s",
  iconSide = "left",
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
  /**
   * Figma's Button has a Left icon slot and a Right Icon slot. Which one is
   * filled is part of the design — "Next →" trails its arrow, "Add to
   * calendar" leads with its mark — so it is a prop rather than a constant.
   */
  iconSide?: "left" | "right";
  style?: ViewStyle;
}) {
  const dock = variant !== "secondary";
  const press = usePressScale();

  /* The dock marks are drawn white; on white paper they need the label's own
     ink instead. */
  const Mark = () =>
    Icon ? (
      <Icon
        width={dock ? 20 : 16}
        height={dock ? 20 : 16}
        color={
          dock && variant !== "tertiary" && variant !== "outline" && !disabled
            ? colors.bgSecondary
            : undefined
        }
      />
    ) : null;

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
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.base,
        dock ? styles.dock : size === "m" ? styles.medium : styles.small,
        !disabled && variant === "primary" && styles.primary,
        !disabled && variant === "brand" && styles.brand,
        variant === "outline" && styles.outline,
        disabled && (dock ? styles.dockDisabled : styles.disabled),
        style,
        /* A disabled control does not answer the finger. */
        !disabled && press.style,
      ]}
    >
      {Icon && iconSide === "left" && <Mark />}
      {dock ? (
        <Text variant="bodyL" color={content} style={styles.dockLabel}>
          {label}
        </Text>
      ) : (
        <Text variant={size === "m" ? "bodyBold" : "bodySBold"} color={content}>
          {label}
        </Text>
      )}
      {Icon && iconSide === "right" && <Mark />}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  /* 20px line + 8 + 8 = 36. */
  small: {
    gap: space.xs,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  /* 22px line + 9 + 9 = 40. */
  medium: {
    gap: space.xs,
    paddingVertical: 9,
    paddingHorizontal: space.l,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  /* 24px line + 14 + 14 = 52, and the comps' 20px side padding. */
  dock: { gap: space.s, paddingHorizontal: 20, paddingVertical: 14 },
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
});
