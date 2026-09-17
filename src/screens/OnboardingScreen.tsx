import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import { onboardingCopy, slides } from "../data/onboarding";

/**
 * The intro, shown once.
 *
 * It is a paged scroll rather than a sequence of buttons because a swipe is
 * how people expect to leave an intro, and a Next button that is the only way
 * forward makes three slides feel like a form. Skip is on every slide, in the
 * same place, and it is never the quiet option — somebody who has seen this
 * before should be able to leave without reading anything.
 *
 * The dots are decorative; the live region above them is what a screen reader
 * hears, because "three dots, one filled" is not a position.
 */
export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const last = index === slides.length - 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={styles.page}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Image
              source={image(slide.image)}
              style={styles.shot}
              contentFit="cover"
              transition={300}
            />
            <View style={[styles.copy, { paddingTop: insets.top + space.l }]}>
              <Text variant="captionBold" uppercase color={colors.contentSecondary}>
                {slide.lead}
              </Text>
              <Text variant="displayM" uppercase color={colors.white}>
                {slide.title}
              </Text>
              <Text variant="bodyL" color={colors.contentSecondary}>
                {slide.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Skip floats over the artwork, out of the way of the copy. */}
      <View style={[styles.skip, { top: insets.top + space.s }]}>
        <Button label={onboardingCopy.skip} onPress={onDone} />
      </View>

      <View style={[styles.dock, { paddingBottom: insets.bottom || space.l }]}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={onboardingCopy.progress(index + 1, slides.length)}
          style={styles.dots}
        >
          {slides.map((slide, i) => (
            <View
              key={slide.id}
              style={[styles.dot, i === index ? styles.dotOn : styles.dotOff]}
            />
          ))}
        </View>

        <Button
          variant="primary"
          label={last ? onboardingCopy.start : onboardingCopy.next}
          onPress={() =>
            last
              ? onDone()
              : scroller.current?.scrollTo({
                  x: (index + 1) * width,
                  animated: true,
                })
          }
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  slide: { flex: 1 },
  shot: { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  copy: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: gutter,
    paddingBottom: space.section,
    gap: space.m,
  },
  skip: { position: "absolute", right: gutter },

  dock: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingHorizontal: gutter,
    paddingTop: space.l,
    backgroundColor: colors.bgSecondary,
  },
  dots: { flexDirection: "row", gap: space.s },
  /* Square, like everything else — a row of circles would be the only pills
     on screen outside the switch. */
  dot: { width: 20, height: 3 },
  dotOn: { backgroundColor: colors.brand },
  dotOff: { backgroundColor: colors.overlay20 },
  cta: { flex: 1 },
});
