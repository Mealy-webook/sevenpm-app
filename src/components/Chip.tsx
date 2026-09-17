import { Pressable, StyleSheet } from "react-native";

import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * A filter chip. Selected swaps the dim border for a full-strength one and
 * doubles the fill — the label does not change colour, because a chip row
 * where only one item is bright reads as four disabled options and one live
 * one, rather than as a choice.
 */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected ? styles.on : styles.off]}
    >
      <Text variant="bodyBold">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: space.m,
    borderWidth: 1,
  },
  on: { borderColor: colors.contentPrimary, backgroundColor: colors.overlay10 },
  off: { borderColor: colors.overlay10, backgroundColor: colors.overlay5 },
});
