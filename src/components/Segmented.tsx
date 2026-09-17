import { StyleSheet, View } from "react-native";

import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * Two or more choices sharing one track, each taking an equal share of it —
 * the control the delivery sheet uses for Pickup / Deliver to address
 * (Figma 346:47890).
 *
 * It is not a row of chips, and the difference matters. Chips are a filter:
 * any number can be on, and they size to their labels. This is one question
 * with one answer, so the options are the same width and the track makes it
 * obvious they are alternatives to each other.
 */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Tap
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            scale={0.98}
            style={[styles.option, selected && styles.selected]}
          >
            <Text
              variant="bodyBold"
              color={selected ? colors.contentPrimary : colors.contentSecondary}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: space.xs,
    backgroundColor: colors.overlay5,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: space.m,
  },
  selected: { backgroundColor: colors.overlay10 },
});
