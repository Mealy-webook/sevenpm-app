import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Apple from "../../icons/ic-apple-20.svg";
import Google from "../../icons/ic-google-20.svg";
import { Button } from "../../components/Button";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import { onboardingCopy, welcomeCopy } from "../../data/onboarding";
import { useSession } from "../../session";

/**
 * Welcome, from Figma 393:39475 — the screen that follows the last onboarding
 * step and asks who you are.
 *
 * Every route it offers leads to the same place. There is no account service
 * behind this build, so the buttons open the app and the screen says so once,
 * quietly, at the bottom. A sign-in screen that looks like it authenticated
 * you and did not is the most misleading thing a prototype can do.
 *
 * What it does record is *which* route you took. Skip leaves you signed out
 * and the three sign-in buttons do not — not because any of them authenticate
 * anything, but because the app behind them looks different depending on the
 * answer, and until now it could not tell that the question had been asked.
 *
 * The comp also carries a failed-Google alert and a Face ID button as hidden
 * variants. Neither is built: an error state with nothing that can error, and
 * a biometric prompt that unlocks nothing, are both worse than their absence.
 */
export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  /* The only difference between the two ways off this screen. */
  const enter = () => {
    signIn();
    onDone();
  };
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.page}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={image("/assets/welcome-noise.jpg")}
          style={{
            position: "absolute",
            top: 0,
            left: -0.4107 * width,
            width: 1.442 * width,
            height,
          }}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "#000000"]}
          locations={[0.344, 0.613]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.skipRow, { marginTop: insets.top }]}>
        <Button label={onboardingCopy.skip} size="m" onPress={onDone} />
      </View>

      <View style={styles.spacer} />

      <View style={[styles.body, { paddingBottom: insets.bottom + space.l }]}>
        <View style={styles.head}>
          <Text
            variant="displayHero"
            uppercase
            color={colors.white}
            style={displaySize(type.displayHero, width)}
          >
            {welcomeCopy.title}
          </Text>
          <Text variant="body" color={colors.contentSecondary}>
            {welcomeCopy.body}
          </Text>
        </View>

        <View style={styles.form}>
          {/* The comp's resting text field: the label doubles as the
              placeholder and there is no border until it is focused. */}
          <View style={styles.field}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={welcomeCopy.email}
              placeholderTextColor={colors.contentPrimary}
              accessibilityLabel={welcomeCopy.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              selectionColor={colors.brand}
              style={styles.input}
            />
          </View>

          <Button
            variant="brand"
            label={welcomeCopy.continueWithEmail}
            onPress={enter}
          />

          <View style={styles.orRow}>
            <View style={styles.rule} />
            <Text variant="body">{welcomeCopy.or}</Text>
            <View style={styles.rule} />
          </View>

          <Button
            variant="primary"
            icon={Apple}
            label={welcomeCopy.apple}
            onPress={enter}
          />
          <Button
            variant="primary"
            icon={Google}
            label={welcomeCopy.google}
            onPress={enter}
          />

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  skipRow: {
    /* The comp draws this band 68 tall with 24px padding, which leaves 20 for
       a 40px button — in Figma the button simply overflows, and in React
       Native it is squeezed until its label disappears. Same trap as the
       button's own content box. The band is 68 because 40 + 14 + 14 is. */
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: space.xl,
    paddingVertical: 14,
  },
  spacer: { flex: 1 },

  body: { padding: space.xl, gap: space.xl },
  head: { gap: space.l },
  form: { gap: space.l },

  field: {
    justifyContent: "center",
    minHeight: 60,
    paddingLeft: space.l,
    paddingRight: space.s,
    paddingVertical: space.m,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  input: {
    fontFamily: "Roboto_400Regular",
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.085,
    color: colors.contentPrimary,
    padding: 0,
  },

  orRow: { flexDirection: "row", alignItems: "center", gap: space.l },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.overlay20 },
});
