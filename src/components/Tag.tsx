import { StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Text } from "../theme/Text";
import { colors } from "../theme/tokens";

/**
 * The compact status pill from Figma 454:31838, at its XS size.
 *
 * The leading glyph takes the tag's own ink, so its SVG must paint with
 * `currentColor` rather than a baked fill.
 *
 * Read-only by design — a Chip is the interactive one. The prominent tones
 * are a tenth of their accent laid over the card, which is what Figma's
 * "90% black over the colour" stack comes to.
 */
export function Tag({
  label,
  icon: Mark,
  tone = "default",
}: {
  label: string;
  icon?: React.FC<SvgProps>;
  tone?: "default" | "lime" | "orange";
}) {
  const ink =
    tone === "lime"
      ? colors.lime
      : tone === "orange"
        ? colors.orange
        : colors.contentSecondary;

  return (
    <View style={[styles.tag, { backgroundColor: tint(tone) }]}>
      {Mark && <Mark width={12} height={12} color={ink} />}
      <Text variant="tab" color={ink}>
        {label}
      </Text>
    </View>
  );
}

function tint(tone: "default" | "lime" | "orange") {
  if (tone === "lime") return "rgba(179,225,0,0.1)";
  if (tone === "orange") return "rgba(255,127,41,0.1)";
  return colors.overlay5;
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
