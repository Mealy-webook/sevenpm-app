import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Globe from "../icons/ic-globe-20.svg";
import { Button } from "../components/Button";
import { Tap } from "../components/Tap";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, space, type } from "../theme/tokens";
import { TAB_BAR_CLEARANCE } from "../navigation/TabBar";
import { discoverCopy } from "../data/discover";
import { menuCopy } from "../data/account";
import { loyaltyBalance } from "../data/account";

/**
 * The Moodboard's homepage concept — Figma file hH59yXcVCdjIhf2TtGG23j,
 * node 182:1352. An exploration, not the built Discover: the heading is
 * centred rather than ranged left, the festivals are one stacked card rather
 * than a rail, and a warm glow sits behind them.
 *
 * The glow is a 392px image the comp blurs by 63px. React Native has no
 * filter, so the blur is baked into the asset and this only places and fades
 * it.
 */
export function MoodboardHome() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.page}>
      {/* Wordmark left, balance and language right. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
        <Image
          source={image("/assets/wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
        />
        <View style={styles.spacer} />
        <Button size="m" label={menuCopy.beats(loyaltyBalance)} />
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Language"
          style={styles.iconButton}
        >
          <Globe width={20} height={20} />
        </Tap>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: TAB_BAR_CLEARANCE }]}
      >
        {/* The glow sits behind the card, bleeding off the left edge. */}
        <Image
          source={image("/assets/moodboard-glow.webp")}
          style={styles.glow}
          contentFit="cover"
          pointerEvents="none"
        />

        <Text
          variant="displaySection"
          uppercase
          color={colors.white}
          style={[displaySize(type.displaySection, width), styles.heading]}
        >
          {discoverCopy.festivals}
        </Text>

        <View style={styles.card}>
          <Image
            source={image("/assets/card-jazzablanca.jpg")}
            style={styles.poster}
            contentFit="cover"
            transition={300}
          />
          <View>
            <Text
              variant="displayCard"
              uppercase
              color={colors.white}
              numberOfLines={1}
              style={displaySize(type.displayCard, width)}
            >
              {festival.name}
            </Text>
            <Text variant="bodyBold" color={colors.brand}>
              {festival.dates}
            </Text>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {festival.venue}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* The comp's own card, spelling included ("Jullet"). */
const festival = {
  name: "Jazzablanca",
  dates: "02 - 11 Jullet 2026",
  venue: "Anfa Park in Casablanca, Morocco",
};

/** The transparent margin baked around the glow, in the comp's own units. */
const GLOW_PAD = 392 * (180 / 600);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },

  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingHorizontal: 20,
    paddingBottom: space.xs,
  },
  wordmark: { width: 98, height: 18 },
  spacer: { flex: 1 },
  iconButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  body: { alignItems: "center", gap: space.xl, padding: 20 },
  /* The comp filters a 392px image by 63px. The blur is baked in here, on a
     padded canvas, so the falloff is part of the asset — which is why this is
     drawn wider than 392 and offset back by the padding. */
  glow: {
    position: "absolute",
    left: -1 - GLOW_PAD,
    top: 221 - GLOW_PAD,
    width: 392 + GLOW_PAD * 2,
    height: 392 + GLOW_PAD * 2,
    opacity: 0.4,
  },
  heading: { textAlign: "center", alignSelf: "stretch" },

  card: {
    width: 289,
    gap: space.l,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },
  poster: { width: "100%", aspectRatio: 1, backgroundColor: colors.bgTertiary },
});
