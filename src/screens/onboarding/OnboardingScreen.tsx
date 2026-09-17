import { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowRight from "../../icons/ic-arrow-right-20.svg";
import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { Text } from "../../theme/Text";
import { useReducedMotion } from "../../theme/motion";
import { colors, displaySize, space, type } from "../../theme/tokens";
import { onboardingCopy, steps } from "../../data/onboarding";
import { AheadArt, BeatsArt, CashlessArt } from "./OnboardingArt";

const ART = [AheadArt, BeatsArt, CashlessArt];

/**
 * The three onboarding steps, from Figma 341:1331, 329:38685 and 323:1074.
 *
 * All three are the same screen with different clothes: Skip in the top right,
 * artwork filling everything behind, then a headline, a line of body and the
 * progress marks sitting on the floor above a one-action dock.
 *
 * **Everything that moves is driven by how far the pager has been dragged**,
 * not by which step has been settled on. That distinction is the whole feel of
 * the screen: a backdrop chosen by a settled index cannot start changing until
 * the swipe has finished, so it cuts. Reading `scrollX` instead means the
 * photograph behind your thumb crossfades into the next one as you drag it,
 * and follows you back if you change your mind halfway.
 *
 * All three backdrops are mounted at once and stacked, which is what makes
 * that crossfade possible, and they live outside the pager because all three
 * bleed past the screen edges — paging a view that owns its oversized backdrop
 * clips each one to its page. They are also parallaxed: the art travels at a
 * third of the pager's speed, so the copy slides over a backdrop that drifts.
 *
 * `scrollX` drives opacity and transform only, so the whole thing runs on the
 * native driver and never touches the JS thread while a finger is down.
 *
 * The headline is Daltown at 104px against a 390px comp, `scaled` here so an
 * iPhone SE gets proportionally smaller type. Its line box is opened to the
 * full size: the comp sets 104/86 and React Native clips glyphs out of a box
 * tighter than their size.
 */
export function OnboardingScreen({
  onDone,
}: {
  /** Both Skip and finishing the last step land here. */
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const pager = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  /* The index is still tracked, but only for the things a half-finished swipe
     should not change: which step Next advances from, and what a screen
     reader is told. Nothing visual reads it. */
  const onMomentumEnd = (offsetX: number) => {
    const next = Math.round(offsetX / width);
    if (next !== index) setIndex(next);
  };

  /** Where this page sits relative to the viewport, in pages: -1, 0, 1. */
  const pageRange = (i: number) => [(i - 1) * width, i * width, (i + 1) * width];

  return (
    <View style={styles.page}>
      {/* Backdrops, stacked and crossfaded by scroll position. */}
      {ART.map((Art, i) => (
        <Animated.View
          key={steps[i].id}
          style={[
            StyleSheet.absoluteFill,
            reduced
              ? { opacity: index === i ? 1 : 0 }
              : {
                  opacity: scrollX.interpolate({
                    inputRange: pageRange(i),
                    outputRange: [0, 1, 0],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: pageRange(i),
                        outputRange: [width / 3, 0, -width / 3],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
          ]}
          pointerEvents="none"
        >
          <Art />
        </Animated.View>
      ))}

      <Animated.ScrollView
        ref={pager as never}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollEnd={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
      >
        {steps.map((item, i) => {
          /* Per page, not per settled step. Reading the current step's tone
             here would paint the next page's copy in the previous page's ink
             for the length of the swipe, then snap it. */
          const brand = item.tone === "brand";
          const ink = brand ? colors.textInverse : colors.white;
          const bodyInk = brand ? colors.textInverse : colors.contentPrimary;

          /* The copy lifts and fades as its page leaves, so the headline hands
             over to the next one rather than sliding off like a poster. */
          const copyMotion = reduced
            ? {}
            : {
                opacity: scrollX.interpolate({
                  inputRange: pageRange(i),
                  outputRange: [0, 1, 0],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateY: scrollX.interpolate({
                      inputRange: pageRange(i),
                      outputRange: [24, 0, 24],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              };

          return (
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
                {brand ? (
                  <View style={[StyleSheet.absoluteFill, styles.brandFloor]} />
                ) : (
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "#000000"]}
                    locations={[0.079, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                )}

                <Animated.View style={[styles.copy, copyMotion]}>
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
                    accessibilityLabel={onboardingCopy.progress(
                      i + 1,
                      steps.length,
                    )}
                    style={styles.marks}
                  >
                    {steps.map((mark, m) => (
                      <Mark
                        key={mark.id}
                        scrollX={scrollX}
                        range={pageRange(m)}
                        brand={brand}
                        settled={reduced ? m === index : undefined}
                      />
                    ))}
                  </View>
                </Animated.View>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <Dock>
        <Button
          variant="primary"
          label={onboardingCopy.next}
          icon={ArrowRight}
          onPress={() =>
            index === steps.length - 1
              ? onDone()
              : pager.current?.scrollTo({
                  x: (index + 1) * width,
                  animated: true,
                })
          }
        />
      </Dock>
    </View>
  );
}

/**
 * One progress mark. The active one is a 52px bar and the rest are 8px
 * squares, and it grows and shrinks with the drag rather than switching at the
 * end of it — the mark is showing you where you are, so it should move while
 * you are moving.
 *
 * Width is not a native-driver property, so this one interpolation runs on the
 * JS thread. It is three small views; the backdrop and the copy, which are the
 * expensive parts, stay native.
 */
function Mark({
  scrollX,
  range,
  brand,
  settled,
}: {
  scrollX: Animated.Value;
  range: number[];
  brand: boolean;
  /** Set under reduced motion: the mark is drawn at its end state. */
  settled?: boolean;
}) {
  const on = brand ? styles.markBrandOn : styles.markDarkOn;
  const off = brand ? styles.markBrandOff : styles.markDarkOff;

  if (settled !== undefined) {
    return (
      <View
        style={[styles.mark, settled && styles.markOn, settled ? on : off]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.mark,
        off,
        {
          width: scrollX.interpolate({
            inputRange: range,
            outputRange: [8, 52, 8],
            extrapolate: "clamp",
          }),
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          on,
          {
            opacity: scrollX.interpolate({
              inputRange: range,
              outputRange: [0, 1, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      />
    </Animated.View>
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
  mark: { width: 8, height: 8, overflow: "hidden" },
  markOn: { width: 52 },
  markDarkOn: { backgroundColor: colors.white },
  markDarkOff: { backgroundColor: "rgba(255,255,255,0.5)" },
  markBrandOn: { backgroundColor: "#000000" },
  markBrandOff: { backgroundColor: "rgba(0,0,0,0.5)" },
});
