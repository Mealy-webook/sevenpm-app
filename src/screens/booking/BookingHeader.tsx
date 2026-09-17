import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Close from "../../icons/ic-close.svg";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, space } from "../../theme/tokens";

/**
 * The header every step of the booking journey carries, from Figma 412:14734.
 *
 * It is not a back bar. It is the event you are buying into — thumbnail, name,
 * running time — with one way out on the right. The comps repeat it on every
 * step precisely so that what you are buying never leaves the screen while you
 * are choosing how much of it to buy.
 *
 * The thumbnail is square. Everything in this system is, and the round avatar
 * on Discover's stories is the exception rather than the rule.
 */
export function BookingHeader({
  name,
  time,
  thumbnail,
  onClose,
}: {
  name: string;
  time: string;
  thumbnail: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
      <Image
        source={image(thumbnail)}
        style={styles.thumb}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.text}>
        <Text variant="bodyBold" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
          {time}
        </Text>
      </View>

      <View style={styles.actions}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={styles.close}
        >
          <Close width={20} height={20} />
        </Tap>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingHorizontal: 20,
    paddingBottom: space.xs,
  },
  thumb: { width: 40, height: 40, backgroundColor: colors.bgTertiary },
  text: { minWidth: 0 },
  actions: { flex: 1, alignItems: "flex-end" },
  close: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
});
