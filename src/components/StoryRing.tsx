import { StyleSheet, View } from "react-native";

import { colors, radii, space } from "../theme/tokens";

/**
 * The ring around a story: brand yellow while there is something new in it,
 * a dim grey once it has been seen. It is still — the colour does the job.
 */
export function StoryRing({
  watched,
  children,
}: {
  watched: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.ring, watched ? styles.seen : styles.live]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: space.xs,
    borderWidth: 2,
    borderRadius: radii.pill,
  },
  live: { borderColor: colors.brand },
  seen: { borderColor: colors.overlay10 },
});
