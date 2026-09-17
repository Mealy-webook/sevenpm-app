import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import Close from "../icons/ic-close.svg";
import Send from "../icons/ic-send-outline-20.svg";
import { Button } from "../components/Button";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, radii, space } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { stories, storyCopy } from "../data/discover";

/**
 * The story viewer, from Figma 415:38335.
 *
 * The comp is one still frame of something that only exists in motion: a row
 * of progress segments, one per frame, the leading one part-filled. So the
 * behaviour around it is inferred from the picture — frames advance on a
 * timer, the bar is that timer's readout, and the bars behind and ahead of it
 * are full and empty.
 *
 * Three things the comp cannot show and this adds, because a viewer without
 * them is unusable rather than merely incomplete: tapping the right half
 * skips forward and the left half goes back, holding anywhere pauses (the
 * caption is unreadable in five seconds otherwise), and running off the end
 * closes the story.
 *
 * The progress bar is animation, but it is not decoration — it is the only
 * indication of how long is left — so it runs under reduced motion too.
 */
export function StoryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootParamList, "Story">>();

  const story = stories.find((item) => item.id === params.id) ?? stories[0];
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const current = story.frames[frame];
  const last = frame === story.frames.length - 1;

  useEffect(() => {
    progress.setValue(0);
    if (paused) return;

    const run = Animated.timing(progress, {
      toValue: 1,
      duration: storyCopy.frameMs,
      easing: Easing.linear,
      /* Width cannot be driven natively, and a bar that jumps in 60ms steps
         is worse than one that costs a few frames of JS. */
      useNativeDriver: false,
    });

    run.start(({ finished }) => {
      if (!finished) return;
      if (last) navigation.goBack();
      else setFrame((value) => value + 1);
    });

    return () => run.stop();
  }, [frame, paused, last, progress, navigation]);

  const go = (by: number) => {
    const next = frame + by;
    if (next < 0) return;
    if (next >= story.frames.length) {
      navigation.goBack();
      return;
    }
    setFrame(next);
  };

  return (
    <View style={styles.page}>
      <Image
        source={image(current.image)}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      {/* The comp darkens the top of the photograph so the header reads. */}
      <LinearGradient
        colors={["#0b0b0e", "rgba(11,11,14,0)"]}
        locations={[0.25, 1]}
        style={[styles.shade, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <View style={styles.bars}>
          {story.frames.map((item, index) => (
            <View key={item.image} style={styles.barTrack}>
              {index < frame && <View style={styles.barFull} />}
              {index === frame && (
                <Animated.View
                  style={[
                    styles.barFull,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View
          style={styles.header}
          accessibilityLabel={storyCopy.progress(frame + 1, story.frames.length)}
        >
          <Image
            source={image(story.avatar ?? story.image)}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.headerText}>
            <View style={styles.headerLine}>
              <Text variant="bodyBold" numberOfLines={1}>
                {story.label}
              </Text>
              <Text variant="caption" color={colors.contentSecondary}>
                {story.posted}
              </Text>
            </View>
            <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
              {story.venue}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={storyCopy.close}
            onPress={navigation.goBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Close width={20} height={20} />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Tap zones sit under the controls and over the photograph. */}
      <View style={styles.zones} pointerEvents="box-none">
        <Pressable
          style={styles.zone}
          accessibilityLabel="Previous frame"
          onPress={() => go(-1)}
          onLongPress={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
          delayLongPress={200}
        />
        <Pressable
          style={styles.zone}
          accessibilityLabel="Next frame"
          onPress={() => go(1)}
          onLongPress={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
          delayLongPress={200}
        />
      </View>

      <View style={[styles.foot, { paddingBottom: insets.bottom + space.l }]}>
        <Text variant="bodyBold" style={styles.caption}>
          {current.caption}
        </Text>
        <Button variant="brand" size="m" label={storyCopy.explore} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={storyCopy.share}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Send width={20} height={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  pressed: { opacity: 0.7 },

  shade: { position: "absolute", left: 0, right: 0, top: 0, zIndex: 2, gap: space.l },
  bars: {
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: space.xl,
    paddingTop: space.l,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.overlay5,
    overflow: "hidden",
  },
  barFull: { height: "100%", width: "100%", backgroundColor: colors.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: 20,
    paddingBottom: space.s,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.bgTertiary,
  },
  headerText: { flex: 1, minWidth: 0 },
  headerLine: { flexDirection: "row", alignItems: "center", gap: space.s },

  iconButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  zones: { ...StyleSheet.absoluteFillObject, flexDirection: "row", zIndex: 1 },
  zone: { flex: 1 },

  foot: {
    zIndex: 2,
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: 20,
    backgroundColor: colors.bgPrimary,
  },
  caption: { flex: 1, minWidth: 0 },
});
