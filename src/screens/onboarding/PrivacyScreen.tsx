import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";

import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import { privacyCopy } from "../../data/onboarding";

/**
 * The privacy notice, from Figma 320:50542.
 *
 * Three actions stacked in the dock, in the comp's order: Accept all as the
 * yellow CTA, Reject all as an outline of the same size, and Manage cookies
 * with no fill at all. That ordering is the design's, and it is worth keeping
 * — rejecting is one press, at the same size, in the same place, not a link
 * hidden under the button somebody actually wants you to press.
 *
 * No answer is recorded, because this build stores nothing and measures
 * nothing to consent to. The note says so rather than leaving it implied.
 */
export function PrivacyScreen({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const notice = displaySize(type.displayNotice, width);

  return (
    <View style={styles.page}>
      <View style={styles.spacer} />

      <View style={styles.section}>
        <Image
          source={image("/assets/privacy-cookie.png")}
          style={styles.art}
          contentFit="contain"
          transition={200}
        />

        <View style={styles.copy}>
          <Text
            variant="displayNotice"
            uppercase
            color={colors.white}
            style={notice}
          >
            {privacyCopy.title}
          </Text>
          <Text variant="body" color={colors.contentSecondary}>
            {privacyCopy.body}
          </Text>
          <Text variant="caption" color={colors.contentSecondary}>
            {privacyCopy.note}
          </Text>
        </View>
      </View>

      <Dock>
        <Button variant="brand" label={privacyCopy.acceptAll} onPress={onDone} />
        <Button variant="outline" label={privacyCopy.rejectAll} onPress={onDone} />
        <Button variant="tertiary" label={privacyCopy.manage} onPress={onDone} />
      </Dock>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  spacer: { flex: 1 },
  section: { padding: space.xl, gap: space.xl },
  art: { width: 92, height: 99 },
  copy: { gap: space.s },
});
