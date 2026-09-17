import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, scaled } from "../../theme/tokens";

/**
 * The backdrop of each onboarding step, drawn per step because the three comps
 * have nothing in common behind the copy.
 *
 * Every figure here is measured off the 390 × 844 comps and expressed as a
 * fraction of the screen, so a wider or taller phone gets the same picture
 * rather than the same pixels. The photographs are positioned rather than
 * simply covering, because in all three the subject is deliberately off
 * centre — the saxophone is placed to the right of the headline, not behind
 * it — and `cover` would recentre them.
 *
 * All three are mounted at once and stacked; which one you see is a matter of
 * opacity, and the opacity is driven by how far the pager has been dragged.
 * That is the whole trick behind the crossfade — see `Backdrop` in
 * OnboardingScreen.
 */

/** Step 1 (341:1331) — the saxophonist, bled off the left edge. */
export function AheadArt() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgPrimary }]} />
      <Image
        source={image("/assets/onb-1-sax.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: -0.2215 * width,
          width: 1.2215 * width,
          height: 0.8465 * height,
        }}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}

/**
 * Step 2 (329:38685) — the one bright screen. A crowd photo rotated off the
 * top-left corner, the wordmark's own tonal yellow spelling RESELL across the
 * middle, and a photo card tilted the other way on top of it.
 *
 * The tonal line is deliberately nearly invisible: #ecdb0a on #fbeb1c is a
 * texture in the yellow, not a thing to read. Reproduced at the comp's size
 * because at any other size it stops sitting behind the card the way it does
 * in the comp.
 */
export function BeatsArt() {
  const { width } = useWindowDimensions();
  const s = (value: number) => scaled(value, width);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.brand }]} />

      <View
        style={{
          position: "absolute",
          left: s(-251.66),
          top: s(-93),
          width: s(830.749),
          height: s(553.832),
          transform: [{ rotate: "4.71deg" }],
        }}
      >
        <Image
          source={image("/assets/onb-2-crowd.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <View style={[StyleSheet.absoluteFill, styles.crowdShade]} />
      </View>

      <Text
        variant="displayXL"
        uppercase
        color="#ecdb0a"
        style={{
          position: "absolute",
          left: s(-6),
          top: s(356),
          width: s(589),
          fontSize: s(133),
          lineHeight: s(133),
        }}
      >
        Resell resell resell
      </Text>

      <Image
        source={image("/assets/onb-2-card.jpg")}
        style={{
          position: "absolute",
          left: s(16),
          top: s(173),
          width: s(347.565),
          height: s(231.71),
          transform: [{ rotate: "4.33deg" }],
        }}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}

/** Step 3 (323:1074) — the venue, with the wordmark laid across it at an angle. */
export function CashlessArt() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.black]} />
      <Image
        source={image("/assets/onb-3-venue.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: 0.6937 * height,
        }}
        contentFit="cover"
        transition={200}
      />
      {/* The angled wordmark is exported with its rotation already baked in,
          so it is placed rather than transformed. It is near-black on a dark
          photograph on purpose: a watermark, not a label. */}
      <Image
        source={image("/assets/onb-3-card.png")}
        style={{
          position: "absolute",
          left: 0.3436 * width,
          top: 0.28 * height,
          width: 0.2542 * width,
          height: 0.2542 * width * (193 / 298),
        }}
        contentFit="contain"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "#000000"]}
        locations={[0.439, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0.026 * height,
          height: 0.699 * height,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  black: { backgroundColor: "#000000" },
  crowdShade: { backgroundColor: "rgba(0,0,0,0.18)" },
});
