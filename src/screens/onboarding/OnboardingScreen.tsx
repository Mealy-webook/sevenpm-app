import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowRight from "../../icons/ic-arrow-right-20.svg";
import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import { onboardingCopy, steps } from "../../data/onboarding";
import { AheadArt, BeatsArt, CashlessArt } from "./OnboardingArt";

const ART = [AheadArt, BeatsArt, CashlessArt];

/**
 * The three onboarding steps, from Figma 341:1331, 329:38685 and 323:1074.
 *
 * All three are the same screen with different clothes: Skip in the top right,
 * the artwork filling everything behind, then a headline, a line of body and
 * the progress marks sitting on the floor above a one-action dock. Only the
 * backdrop and the ink change, so only those are per step.
 *
 * The backdrops are absolute and live outside the pager, and the copy scrolls
 * over them, because the comps bleed their artwork past the screen edges in
 * three different directions — paging a view that contains its own oversized
 * backdrop would clip each one to its page.
 *
 * The headline is Daltown at 104px against a 390px comp, which is `scaled`
 * here so an iPhone SE gets proportionally smaller type rather than a headline
 * that will not fit. Its line box is opened to the full size: the comp sets
 * 104/86 and React Native clips glyphs out of a box tighter than their size.
 */
export function OnboardingScreen({
  onDone,
}: {
  /** Both Skip and finishing the last step land here. */
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const step = steps[index];
  const brand = step.tone === "brand";
  const Art = ART[index];

  const ink = brand ? colors.textInverse : colors.white;
  const bodyInk = brand ? colors.textInverse : colors.contentPrimary;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={styles.page}>
      <Art />

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {steps.map((item, i) => (
          <View key={item.id} style={{ width }}>
            {/* Skip sits in its own 68px band under the status bar, as the
                comps draw it — not floating at an arbitrary offset. */}
            <View style={[styles.skipRow, { marginTop: insets.top }]}>
              <Button
                label={onboardingCopy.skip}
                size="m"
                onPress={onDone}
                style={brand ? styles.skipOnBrand : undefined}
              />
            </View>

            <View style={styles.spacer} />

            <View style={styles.copyWrap}>
              {/* Step 2 is a solid yellow field behind its copy; the dark
                  steps fade the photograph out from under theirs instead. */}
              {item.tone === "brand" ? (
                <View style={[StyleSheet.absoluteFill, styles.brandFloor]} />
              ) : (
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "#000000"]}
                  locations={[0.079, 1]}
                  style={StyleSheet.absoluteFill}
                />
              )}

              <View style={styles.copy}>
                <Text
                  variant="displayHero"
                  uppercase
                  color={ink}
                  style={displaySize(type.displayHero, width)}
                >
                  {item.title}
                </Text>
                <Text variant="body" color={bodyInk}>
                  {item.body}
                </Text>

                <View
                  accessibilityRole="progressbar"
                  accessibilityLabel={onboardingCopy.progress(i + 1, steps.length)}
                  style={styles.marks}
                >
                  {steps.map((mark, m) => (
                    <View
                      key={mark.id}
                      style={[
                        styles.mark,
                        m === i && styles.markOn,
                        brand
                          ? m === i
                            ? styles.markBrandOn
                            : styles.markBrandOff
                          : m === i
                            ? styles.markDarkOn
                            : styles.markDarkOff,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Dock>
        <Button
          variant="primary"
          label={onboardingCopy.next}
          icon={ArrowRight}
          onPress={() =>
            index === steps.length - 1
              ? onDone()
              : pager.current?.scrollTo({ x: (index + 1) * width, animated: true })
          }
        />
      </Dock>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  skipRow: {
    height: 68,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    padding: space.xl,
  },
  /* On the yellow step the 5% white fill disappears, so the control takes the
     same 5% of the ink that is actually on that screen. */
  skipOnBrand: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderColor: "rgba(0,0,0,0.12)",
  },
  spacer: { flex: 1 },

  copyWrap: { width: "100%" },
  brandFloor: { backgroundColor: colors.brand },
  copy: { padding: space.xl, gap: space.l },

  marks: { flexDirection: "row", gap: space.s, alignItems: "center" },
  mark: { width: 8, height: 8 },
  markOn: { width: 52 },
  markDarkOn: { backgroundColor: colors.white },
  markDarkOff: { backgroundColor: "rgba(255,255,255,0.5)" },
  markBrandOn: { backgroundColor: "#000000" },
  markBrandOff: { backgroundColor: "rgba(0,0,0,0.5)" },
});
