import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * The secondary button — the workhorse of this system and very nearly the only
 * one. A 5% white fill under a half-pixel 10% border, square corners, and the
 * label in semibold 13 or 15.
 *
 * Size comes from an inner fixed-height content box rather than from padding
 * on the label, which is how the Figma components are built: the box is 16px
 * tall and the padding around it does the rest. Sizing it any other way gives
 * buttons that are a pixel or two off their neighbours.
 */
export function Button({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  tone = "default",
  style,
}: {
  label: string;
  icon?: React.FC<{ width: number; height: number }>;
  onPress?: () => void;
  disabled?: boolean;
  /** `destructive` is red on the same surface — remove, delete, cancel. */
  tone?: "default" | "destructive";
  style?: ViewStyle;
}) {
  const content =
    disabled
      ? colors.disabled
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
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {Icon && <Icon width={16} height={16} />}
      <View style={styles.box}>
        <Text variant="bodySBold" color={content}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  /* Disabled loses the border too — the comp draws it as a flat dead slab
     rather than as an outlined control you cannot press. */
  disabled: { borderColor: "transparent" },
  pressed: { backgroundColor: colors.overlay10 },
  box: { height: 16, justifyContent: "center", paddingHorizontal: space.xs },
});
