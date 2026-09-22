import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";

import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * What a list says when it has nothing in it.
 *
 * Both comps that draw one — Bookings (476:29659) and the Wallet's
 * transactions (480:56185) — build it the same way: a small illustration,
 * then one line in uppercase title type, centred in whatever room is left.
 * It is a component because a screen with nothing on it is the screen a
 * person sees first, and two of them that disagree read as two apps.
 */
export function EmptyState({
  art,
  width,
  height,
  title,
  style,
}: {
  /** The illustration's path, and the size the comp draws it at. */
  art: string;
  width: number;
  height: number;
  title: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.empty, style]}>
      <Image
        source={image(art)}
        style={{ width, height }}
        contentFit="contain"
        transition={200}
      />
      <Text
        variant="titleSection"
        uppercase
        color={colors.contentPrimary}
        style={styles.title}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.l,
  },
  title: { textAlign: "center", alignSelf: "stretch" },
});
