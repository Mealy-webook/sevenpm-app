import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ArrowRight from "../icons/ic-arrow-right-24.svg";
import Globe from "../icons/ic-globe-20.svg";
import { Button } from "../components/Button";
import { CardStack } from "../components/CardStack";
import { PosterZoom, type ZoomFrom } from "../components/PosterZoom";
import { StoryRing } from "../components/StoryRing";
import { Tap } from "../components/Tap";
import { deckLabel, deckRect } from "./EventScreen";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, radii, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../navigation/TabBar";
import { useTabBarScroll } from "../navigation/tabBarScroll";
import { Reveal, RevealWords, ScrollProvider, usePageScroll } from "../theme/scroll";
import { loyaltyBalance } from "../data/account";
import { useWatchedStories } from "./watchedStories";
import {
  discoverCopy,
  festivalCards,
  galleryTiles,
  merchandise,
  newsRows,
  stories,
} from "../data/discover";

/**
 * Discover, from Figma 469:72755 — the app's home screen.
 *
 * Five sections down one page: the stories, the festivals, the merchandise,
 * the gallery, the news. It replaced an earlier Discover (378:27332) which
 * ranged its headings left and laid the festivals out as a paged rail, and
 * for a short while it was the Moodboard's concept on its own with the other
 * four sections dropped. This is both: the concept's festivals block inside
 * the page the rest of the app already had.
 *
 * The festivals are one card with the rest fanned behind it rather than a
 * rail, the heading over them is centred rather than ranged left, and a warm
 * glow sits behind the pile — the front card's own poster thrown far out of
 * focus, so it follows the stack and needs no second copy of every poster.
 * Tapping the poster opens it, and the record inside is carried up to the
 * event page's deck.
 */

/* Figures off the comp's 390px frame. */
const CARD_W = 289;
/** The media is wider than the card's own padding box, and is let overflow. */
const CARD_MEDIA = 273;
/** Media, the gap under it, and the three lines of type. */
const CARD_H = 392;
const STORY = 72;
const TILE_W = 228;
const TILE_H = 152;
const NEWS_TILE = 106;
/** The comp's product media, 170 x 212.5. */
const MEDIA_RATIO = 170 / 212.5;

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const watched = useWatchedStories();
  const tabScroll = useTabBarScroll();
  /* One onScroll per scroll view, so the tab bar's shrink rides along with
     the page's own scroll value. */
  const { scrollY, props: scrollProps } = usePageScroll(tabScroll.onScroll);

  /* The glow is the card you are looking at, so it follows the stack. */
  const [front, setFront] = useState(festivalCards[0]);
  /* Tapping the poster opens it full screen, growing out of where it sat. */
  const poster = useRef<View>(null);
  const [zoom, setZoom] = useState<
    { festival: (typeof festivalCards)[number]; from: ZoomFrom } | null
  >(null);

  /* Where the event page puts its record, taken from that page itself so the
     two cannot drift apart. The record flies to exactly this, and puts on
     exactly that label on the way, so the two are the same object at the
     moment one fades off the other. */
  const deck = useMemo(
    () => deckRect(width, deckLabel(zoom?.festival.slug)),
    [width, zoom?.festival.slug],
  );

  const openPoster = (festival: (typeof festivalCards)[number]) => {
    poster.current?.measureInWindow((x, y, w, h) =>
      setZoom({ festival, from: { x, y, width: w, height: h } }),
    );
  };

  const heading = displaySize(type.displaySection, width);
  const cardName = displaySize(type.displayCard, width);
  const news = () => navigation.navigate("Tabs", { screen: "News" } as never);

  return (
    <View style={styles.page}>
      {/* Wordmark left, what you have to spend and the language right. */}
      <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
        <Image
          source={image("/assets/wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
          accessibilityLabel="SEVENPM"
        />
        <View style={styles.spacer} />
        <Button
          label={discoverCopy.beats(loyaltyBalance)}
          size="m"
          /* The comp does not say where this goes. It states a Beats
             balance, so it opens the Beats. */
          onPress={() => navigation.navigate("Rewards")}
        />
        {/* The comp's language button. Drawn and not wired: this app speaks
            one language, and a control that answers a press by doing nothing
            is worse than one that plainly does not take presses. */}
        <View style={styles.iconButton}>
          <Globe width={20} height={20} />
        </View>
      </View>

      <ScrollProvider value={scrollY}>
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}
          {...scrollProps}
        >
          {/* Stories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stories}
          >
            {stories.map((story) => (
              <Tap
                key={story.id}
                accessibilityRole="button"
                accessibilityLabel={discoverCopy.story(story.label)}
                onPress={() => navigation.navigate("Story", { id: story.id })}
                style={styles.story}
              >
                {/* Yellow while there is something new in it; grey once it
                    has been seen. */}
                <StoryRing watched={watched.has(story.id)}>
                  <Image
                    source={image(story.image)}
                    style={styles.storyPhoto}
                    contentFit="cover"
                    transition={200}
                  />
                </StoryRing>
                <Text variant="bodyS" numberOfLines={1} style={styles.storyLabel}>
                  {story.label}
                </Text>
              </Tap>
            ))}
          </ScrollView>

          {/* Festivals */}
          <Reveal index={1} style={styles.festivals}>
            {/* The front card's own poster, thrown far out of focus.
                expo-image blurs it live, so it follows the stack. */}
            <View style={styles.glow} pointerEvents="none">
              <Image
                source={image(front.image)}
                style={[StyleSheet.absoluteFill, styles.glowImage]}
                contentFit="cover"
                blurRadius={60}
                transition={400}
              />
              {/* blurRadius blurs within the view, so the bitmap still ends
                  on a hard edge. This fades it back into the page top and
                  bottom at full strength; the sides are hung past the screen
                  so they never show one. */}
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
              style={[heading, styles.centred]}
            >
              {discoverCopy.festivals}
            </Text>

            {/* One card at a time, the rest fanned behind it. Push the front
                one aside and it goes to the back. */}
            <CardStack
              items={festivalCards}
              keyOf={(festival) => festival.id}
              width={CARD_W}
              height={CARD_H}
              style={styles.stack}
              label="Next festival"
              onFrontChange={setFront}
              render={(festival, isFront) => (
                <View style={styles.card}>
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
                  {/* Only the card in front is named. The ones behind it are
                      posters and nothing else, as the comp draws them —
                      without a panel to hide behind, three sets of type would
                      otherwise be stacked on top of each other. */}
                  {isFront && (
                    <View style={styles.cardText}>
                      <Text
                        variant="displayCard"
                        uppercase
                        color={colors.white}
                        numberOfLines={1}
                        style={[cardName, styles.centred]}
                      >
                        {festival.name}
                      </Text>
                      {/* Absent until content sets it — see data/discover.ts. */}
                      {festival.dates && (
                        <Text
                          variant="bodyBold"
                          color={colors.brand}
                          style={styles.centred}
                        >
                          {festival.dates}
                        </Text>
                      )}
                      <Text
                        variant="bodyS"
                        color={colors.contentSecondary}
                        style={styles.centred}
                      >
                        {festival.venue}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          </Reveal>

          {/* Merchandise */}
          <Reveal index={2} style={styles.section}>
            <View style={styles.headingRow}>
              <RevealWords
                variant="displaySection"
                color={colors.white}
                textStyle={heading}
              >
                {discoverCopy.merchandise}
              </RevealWords>
              {/* The comp's see-all arrow. There is no merchandise index to
                  open yet, so it is drawn and not wired — flagged. */}
              <View style={styles.arrowButton}>
                <ArrowRight width={24} height={24} />
              </View>
            </View>
            <View style={styles.grid}>
              {merchandise.map((item) => (
                <View key={item.id} style={styles.product}>
                  <Image
                    source={image(item.image)}
                    style={styles.productMedia}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.productBody}>
                    <Text variant="bodyBold" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text variant="bodyBold">{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Reveal>

          {/* Gallery */}
          <Reveal index={3} style={styles.section}>
            <RevealWords
              variant="displaySection"
              color={colors.white}
              textStyle={heading}
            >
              {discoverCopy.gallery}
            </RevealWords>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              <View style={styles.galleryRows}>
                {[galleryTiles.slice(0, 3), galleryTiles.slice(3)].map((row, i) => (
                  <View key={i} style={styles.galleryRow}>
                    {row.map((tile) => (
                      <Image
                        key={tile}
                        source={image(tile)}
                        style={styles.tile}
                        contentFit="cover"
                        transition={200}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Reveal>

          {/* News */}
          <Reveal index={4} style={styles.section}>
            <View style={styles.headingRow}>
              <RevealWords
                variant="displaySection"
                color={colors.white}
                textStyle={heading}
              >
                {discoverCopy.news}
              </RevealWords>
              {/* Discover shows three; this opens the newsroom rather than
                  appending the rest to a five-section home screen. */}
              <Tap
                accessibilityRole="button"
                accessibilityLabel={discoverCopy.loadMore}
                onPress={news}
                style={styles.arrowButton}
              >
                <ArrowRight width={24} height={24} />
              </Tap>
            </View>
            <View>
              {newsRows.map((row) => (
                <Tap
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={row.title}
                  onPress={() => navigation.navigate("Article", { slug: row.id })}
                  style={styles.newsRow}
                  scale={0.99}
                >
                  <Image
                    source={image(row.image)}
                    style={styles.newsTile}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.newsBody}>
                    <Text variant="bodySBold" color={colors.brand}>
                      {row.date}
                    </Text>
                    <Text variant="bodyL" color={colors.white} numberOfLines={2}>
                      {row.title}
                    </Text>
                  </View>
                </Tap>
              ))}
            </View>
          </Reveal>
        </Animated.ScrollView>
      </ScrollProvider>

      {/* The record comes out of the sleeve, turns, then rides up to the deck
          at the top of its own page and keeps playing there. Only Jazzablanca
          has a page, so the rest simply stay on the record. */}
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

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingHorizontal: space.l + space.xs,
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

  stories: {
    flexDirection: "row",
    gap: space.l,
    paddingHorizontal: space.l + space.xs,
    paddingVertical: space.l,
  },
  story: { alignItems: "center", gap: space.xs, paddingTop: space.xs },
  storyPhoto: {
    width: STORY,
    height: STORY,
    borderRadius: radii.pill,
    backgroundColor: colors.bgTertiary,
  },
  storyLabel: { width: 72, textAlign: "center" },

  section: {
    paddingHorizontal: space.l + space.xs,
    paddingVertical: space.l,
    gap: space.l,
  },
  /* The festivals block centres its heading and gives the pile more room
     under it than the other sections need. */
  festivals: {
    paddingHorizontal: space.l + space.xs,
    paddingVertical: space.l,
    gap: space.xl,
    alignItems: "center",
  },
  centred: { textAlign: "center", alignSelf: "stretch" },
  /* The comp filters a 392px image by 63px and sits it low behind the pile.
     Hung past both side edges rather than given the comp's fixed 392 — on a
     wider phone a fixed width stops short and the blur ends on a straight
     line down the page. */
  glow: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 221,
    height: 392,
  },
  glowImage: { opacity: 0.4 },

  /* The fan leans cards out past the front one, so the stack is given a
     little room rather than being clipped by the page padding. */
  stack: { marginBottom: space.l },
  card: { width: CARD_W, height: CARD_H, gap: space.l + space.m, alignItems: "center" },
  /* Wider than the card's padding box, as the comp draws it. */
  poster: { width: CARD_MEDIA, height: CARD_MEDIA, backgroundColor: colors.bgTertiary },
  cardText: { alignSelf: "stretch" },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.m,
  },
  arrowButton: {
    padding: 14,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.l },
  product: { width: "47%", gap: space.xs },
  productMedia: {
    width: "100%",
    aspectRatio: MEDIA_RATIO,
    backgroundColor: colors.bgTertiary,
  },
  productBody: { gap: space.xs, paddingHorizontal: space.xs },

  gallery: { paddingRight: space.l },
  galleryRows: { gap: space.l },
  galleryRow: { flexDirection: "row", gap: space.l },
  tile: { width: TILE_W, height: TILE_H, backgroundColor: "#27272a" },

  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingVertical: space.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  newsTile: { width: NEWS_TILE, height: NEWS_TILE, backgroundColor: "#27272a" },
  newsBody: { flex: 1, minWidth: 0, gap: space.xs },
});
