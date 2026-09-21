import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Globe from "../icons/ic-globe-20.svg";
import { Button } from "../components/Button";
import { CardStack } from "../components/CardStack";
import { PosterZoom, type ZoomFrom } from "../components/PosterZoom";
import { Tap } from "../components/Tap";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, scaled, space, type } from "../theme/tokens";
import { TAB_BAR_CLEARANCE } from "../navigation/TabBar";
import { discoverCopy, festivalCards } from "../data/discover";
import type { RootParamList } from "../navigation/RootNavigator";
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
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  /* The glow is the card you are looking at, so it follows the stack. */
  const [front, setFront] = useState(festivalCards[0]);
  /* Tapping the poster opens it full screen, growing out of where it sat. */
  const poster = useRef<View>(null);
  const [zoom, setZoom] = useState<
    { festival: (typeof festivalCards)[number]; from: ZoomFrom } | null
  >(null);

  /* Where the event page puts its record — Figma 464:71859, on the comp's
     own 390-wide frame, and at the top of the window because that page's
     scroll view starts there. The record flies to exactly this, so the two
     are the same object at the moment one fades off the other. */
  const deck = useMemo(() => {
    const s = (value: number) => scaled(value, width);
    return { x: s(-9), y: s(-33), size: s(408) };
  }, [width]);

  const openPoster = (festival: (typeof festivalCards)[number]) => {
    poster.current?.measureInWindow((x, y, w, h) =>
      setZoom({ festival, from: { x, y, width: w, height: h } }),
    );
  };

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
        {/* TEST ONLY — the comp's language button, borrowed on this branch as
            the way off the concept and into the rest of the app. */}
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Open the app"
          onPress={() => navigation.navigate("Tabs")}
          style={styles.iconButton}
        >
          <Globe width={20} height={20} />
        </Tap>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: TAB_BAR_CLEARANCE }]}
      >
        {/* The glow is the front card's own poster, thrown far out of focus.
            expo-image blurs it live, so it follows the stack and needs no
            second copy of every poster. */}
        <View style={styles.glow} pointerEvents="none">
          <Image
            source={image(front.image)}
            style={[StyleSheet.absoluteFill, styles.glowImage]}
            contentFit="cover"
            blurRadius={60}
            transition={400}
          />
          {/* blurRadius blurs within the view, so the bitmap still ends on a
              hard edge. This fades it back into the page at top and bottom;
              left and right are hung past the screen so they never show one.
              The fade is drawn over the image rather than around it, and the
              image carries the opacity — a half-transparent page colour
              cannot hide anything. */}
          <LinearGradient
            colors={[colors.bgPrimary, "transparent", "transparent", colors.bgPrimary]}
            locations={[0, 0.34, 0.66, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Text
          variant="displaySection"
          uppercase
          color={colors.white}
          style={[displaySize(type.displaySection, width), styles.heading]}
        >
          {discoverCopy.festivals}
        </Text>

        {/* One card at a time, the rest fanned behind it. Swipe the front
            one away and it goes to the back. */}
        <CardStack
          items={festivalCards}
          keyOf={(festival) => festival.id}
          width={CARD_W}
          height={CARD_H}
          style={styles.stack}
          label="Next festival"
          onFrontChange={setFront}
          render={(festival, isFront) => (
            <View style={[styles.card, isFront ? styles.cardFront : styles.cardBehind]}>
              {/* Only the card you can see responds; the ones behind are
                  inert until they reach the front. */}
              <Pressable
                ref={isFront ? poster : undefined}
                disabled={!isFront}
                accessibilityRole="imagebutton"
                accessibilityLabel={festival.name}
                onPress={() => openPoster(festival)}
                style={styles.poster}
              >
                <Image
                  source={image(festival.image)}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={300}
                />
              </Pressable>
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
                {festival.dates && (
                  <Text variant="bodyBold" color={colors.brand}>
                    {festival.dates}
                  </Text>
                )}
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {festival.venue}
                </Text>
              </View>
            </View>
          )}
        />

      </ScrollView>

      {/* The record comes out of the sleeve, turns, then rides up to the
          deck at the top of its own page and keeps playing there. Only
          Jazzablanca has a page, so the rest simply stay on the record. */}
      <PosterZoom
        source={zoom?.festival.image ?? null}
        from={zoom?.from ?? null}
        restTo={zoom?.festival.slug ? deck : null}
        onClose={() => setZoom(null)}
        onArrive={() => {
          const slug = zoom?.festival.slug;
          if (slug) navigation.navigate("Event", { slug, arriving: true });
        }}
        onFinished={() => setZoom(null)}
      />
    </View>
  );
}

/** The comp's card, and the room the fanned stack needs around it. */
const CARD_W = 289;
/* 16 padding + a square poster across the inner 257 + 16 gap + room for all
   three lines of text + 16 padding. Fixed, because a stack of differing
   heights would shuffle as it turns, and tall enough for the card that has
   dates so the ones without simply end early. */
const CARD_H = 424;

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
  /* The comp filters a 392px image by 63px and sits it low behind the
     stack. It is hung past both side edges rather than given the comp's
     392 — on a wider phone a fixed width stops short of the screen and the
     blur ends on a straight line down the page. */
  glow: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 221,
    height: 392,
  },
  glowImage: { opacity: 0.4 },
  heading: { textAlign: "center", alignSelf: "stretch" },

  /* The fan leans cards out past the front one, so the stack is given a
     little room rather than being clipped by the page padding. */
  stack: { marginBottom: space.xl },
  card: {
    width: CARD_W,
    height: CARD_H,
    /* Nothing from the cards behind may show through the front one. */
    overflow: "hidden",
    gap: space.l,
    padding: space.l,
    /* The comp gives every card the same drop shadow. */
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  /* The comp lifts the front card onto the lighter surface and leaves the
     ones behind on the darker one, so the top of the pile separates. */
  cardFront: { backgroundColor: colors.bgTertiary },
  cardBehind: { backgroundColor: colors.bgSecondary },
  poster: { width: "100%", aspectRatio: 1, backgroundColor: colors.bgTertiary },
});
