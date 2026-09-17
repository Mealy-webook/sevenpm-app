import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, scaled, space, type } from "../../theme/tokens";
import { notificationsCopy, onboardingCopy } from "../../data/onboarding";

/**
 * The notifications ask, from Figma 320:50447.
 *
 * The illustration is a phone standing in the dark with one SEVENPM
 * notification landing across it. It is drawn here out of views rather than
 * imported as artwork: it is a rounded rectangle and a card, and the card is
 * the app's own notification — mark, title, body, timestamp — so building it
 * keeps it in the app's type and colour instead of freezing a picture of them.
 *
 * Nothing here requests a permission. Wiring this to the real prompt needs
 * expo-notifications and a development build, and asking the OS for something
 * the app then does nothing with is worse than not asking; the button moves
 * the flow on and the screen is honest about the rest.
 */
export function NotificationsScreen({
  onDone,
}: {
  /** Both "Allow" and Skip land here — there is no permission behind either. */
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (value: number) => scaled(value, width);

  return (
    <View style={styles.page}>
      <View style={[styles.skipRow, { marginTop: insets.top }]}>
        <Button label={onboardingCopy.skip} size="m" onPress={onDone} />
      </View>

      <View style={styles.stage}>
        {/* The phone, cropped by the top of its own frame as in the comp. */}
        <View
          style={[
            styles.phone,
            { width: s(230), height: s(430), borderRadius: s(44) },
          ]}
        />

        <View style={[styles.notification, { width: s(342) }]}>
          <Image
            source={image("/assets/logo-mark.png")}
            style={styles.notificationMark}
            contentFit="contain"
          />
          <View style={styles.notificationBody}>
            <Text variant="bodySBold" color={colors.white} numberOfLines={1}>
              {notificationsCopy.preview.title}
            </Text>
            <Text variant="bodyS" color={colors.contentPrimary} numberOfLines={1}>
              {notificationsCopy.preview.body}
            </Text>
          </View>
          <Text variant="caption" color={colors.contentSecondary}>
            {notificationsCopy.preview.time}
          </Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Text
          variant="displayHero"
          uppercase
          color={colors.white}
          style={displaySize(type.displayHero, width)}
        >
          {notificationsCopy.title}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {notificationsCopy.body}
        </Text>
      </View>

      <Dock>
        <Button
          variant="brand"
          label={notificationsCopy.allow}
          onPress={onDone}
        />
      </Dock>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  skipRow: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: space.xl,
  },

  stage: { flex: 1, alignItems: "center", overflow: "hidden" },
  phone: {
    marginTop: space.l,
    borderWidth: 2,
    borderColor: colors.ink600,
    backgroundColor: colors.ink900,
  },
  notification: {
    position: "absolute",
    top: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.m,
    borderRadius: 20,
    backgroundColor: colors.ink700,
  },
  notificationMark: { width: 38, height: 38 },
  notificationBody: { flex: 1, minWidth: 0 },

  copy: { padding: space.xl, gap: space.l },
});
