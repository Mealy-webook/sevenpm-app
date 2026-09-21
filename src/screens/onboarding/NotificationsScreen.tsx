import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, scaled, space, type } from "../../theme/tokens";
import { notificationsCopy } from "../../data/onboarding";

/**
 * The notifications ask, from Figma 320:50447.
 *
 * The illustration is a phone standing in the dark — the comp's own mockup
 * render, 276 wide, cut off by the top of the screen and fading out before
 * the copy — with one SEVENPM notification sitting across it. There is no
 * Skip on this screen: "Not now" under the main action is the way past it.
 */
export function NotificationsScreen({
  onDone,
}: {
  /** Both "Allow" and "Not now" land here — there is no permission behind either. */
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (value: number) => scaled(value, width);

  return (
    <View style={styles.page}>
      <View style={[styles.stage, { marginTop: insets.top + s(15) }]}>
        <Image
          source={image("/assets/phone-mockup.webp")}
          style={{ width: s(276), height: s(276 / PHONE_ASPECT) }}
          contentFit="contain"
          transition={200}
        />
        <LinearGradient
          colors={["rgba(11,11,14,0)", colors.bgPrimary]}
          locations={[0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* The notification, as iOS draws one: icon, two lines, the time. */}
        <View style={[styles.notification, { top: s(86), width: s(342) }]}>
          <Image
            source={image("/assets/logo-mark.png")}
            style={styles.notificationMark}
            contentFit="contain"
          />
          <View style={styles.notificationBody}>
            <Text variant="bodyBold" color={colors.white} numberOfLines={1}>
              {notificationsCopy.preview.title}
            </Text>
            <Text variant="body" color={colors.white} numberOfLines={1}>
              {notificationsCopy.preview.body}
            </Text>
          </View>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {notificationsCopy.preview.time}
          </Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Text
          variant="displayNotice"
          uppercase
          color={colors.white}
          style={displaySize(type.displayNotice, width)}
        >
          {notificationsCopy.title}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {notificationsCopy.body}
        </Text>
      </View>

      <Dock>
        <Button variant="brand" label={notificationsCopy.allow} onPress={onDone} />
        <Button variant="tertiary" label={notificationsCopy.notNow} onPress={onDone} />
      </Dock>
    </View>
  );
}

/** The mockup render's own proportions, trimmed to the phone. */
const PHONE_ASPECT = 1077 / 2202;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  stage: { flex: 1, alignItems: "center", overflow: "hidden" },
  notification: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.ink700,
  },
  notificationMark: { width: 40, height: 40 },
  notificationBody: { flex: 1, minWidth: 0 },

  copy: { padding: space.xl, gap: space.s },
});
