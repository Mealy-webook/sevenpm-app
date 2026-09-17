import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ArrowRight from "../icons/ic-arrow-right-20.svg";
import { Button } from "../components/Button";
import { Tap } from "../components/Tap";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, radii, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../navigation/TabBar";
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

/* Card and tile figures come straight off the comp's 390px frame. */
const CARD_WIDTH = 289;
const MEDIA_RATIO = 170 / 212.5;
const STORY = 72;

/**
 * Discover, from Figma 378:27332 — the app's home screen.
 *
 * The comp is a stack of sections, each with a Daltown heading at 88px and a
 * rail or grid under it: stories, the festivals, merchandise, the gallery, the
 * news. It scrolls as one page under a header that stays put.
 *
 * Headings are sized against the viewport for the same reason the onboarding
 * headline is — 88px is measured against a 390px screen — and their line
 * boxes are opened from the comp's 71 to the full size, because React Native
 * clips glyphs out of a box tighter than their own size.
 */
export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [card, setCard] = useState(0);
  const watched = useWatchedStories();

  const heading = displaySize(type.displaySection, width);
  const cardName = displaySize(type.displayCard, width);
  const cardStep = CARD_WIDTH + space.l;

  return (
    <View style={styles.page}>
      {/* Header: the wordmark, and what you have to spend. */}
      <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
        <Image
          source={image("/assets/wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
          accessibilityLabel="SEVENPM"
        />
        <View style={styles.headerActions}>
          <Button
            label={discoverCopy.beats(loyaltyBalance)}
            size="m"
            /* The comp does not say where this goes. It states a Beats
               balance, so it opens the Beats. */
            onPress={() => navigation.navigate("Rewards")}
          />
        </View>
      </View>

      {/* The bar floats over this screen, so the last row buys its own room. */}
      <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}>
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
              {/* Yellow while there is something new in it, grey once seen. */}
              <View
                style={[styles.ring, watched.has(story.id) && styles.ringWatched]}
              >
                <Image
                  source={image(story.image)}
                  style={styles.storyPhoto}
                  contentFit="cover"
                  transition={200}
                />
              </View>
              <Text variant="bodyS" numberOfLines={1} style={styles.storyLabel}>
                {story.label}
              </Text>
            </Tap>
          ))}
        </ScrollView>

        {/* Festivals */}
        <View style={styles.section}>
          <Text variant="displaySection" uppercase color={colors.white} style={heading}>
            {discoverCopy.festivals}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardStep}
            decelerationRate="fast"
            contentContainerStyle={styles.cards}
            onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
              setCard(Math.round(e.nativeEvent.contentOffset.x / cardStep))
            }
          >
            {festivalCards.map((festival) => (
              <Tap
                key={festival.id}
                accessibilityRole="button"
                accessibilityLabel={festival.name}
                disabled={!festival.slug}
                onPress={() =>
                  festival.slug &&
                  navigation.navigate("Event", { slug: festival.slug })
                }
                /* A 289px card dips less than a 72px story ring. */
                scale={0.985}
                style={styles.card}
              >
                <Image
                  source={image(festival.image)}
                  style={styles.cardMedia}
                  contentFit="cover"
                  transition={200}
                />
                <View>
                  <Text
                    variant="displayCard"
                    uppercase
                    color={colors.white}
                    numberOfLines={1}
                    style={cardName}
                  >
                    {festival.name}
                  </Text>
                  {/* Absent until content sets it — see data/discover.ts. */}
                  {festival.dates && (
                    <Text variant="bodyBold" color={colors.brand}>
                      {festival.dates}
                    </Text>
                  )}
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {festival.venue}
                  </Text>
                </View>
              </Tap>
            ))}
          </ScrollView>

          <View style={styles.marks}>
            {festivalCards.map((festival, index) => (
              <View
                key={festival.id}
                style={[
                  styles.mark,
                  index === card ? styles.markOn : styles.markOff,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Merchandise */}
        <View style={styles.section}>
          <Text variant="displaySection" uppercase color={colors.white} style={heading}>
            {discoverCopy.merchandise}
          </Text>
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
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <Text variant="displaySection" uppercase color={colors.white} style={heading}>
            {discoverCopy.gallery}
          </Text>
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
        </View>

        {/* News */}
        <View style={styles.section}>
          <Text variant="displaySection" uppercase color={colors.white} style={heading}>
            {discoverCopy.news}
          </Text>
          <View>
            {newsRows.map((row) => (
              <View key={row.id} style={styles.newsRow}>
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
              </View>
            ))}
          </View>
          {/* Discover shows three stories; this opens the newsroom rather
              than appending three more rows to a five-section home screen. */}
          <Button
            variant="primary"
            label={discoverCopy.loadMore}
            icon={ArrowRight}
            iconSide="right"
            onPress={() => navigation.navigate("Tabs", { screen: "News" } as never)}
          />
        </View>
      </ScrollView>
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
  headerActions: { flex: 1, alignItems: "flex-end" },

  stories: {
    flexDirection: "row",
    gap: space.l,
    paddingHorizontal: space.l + space.xs,
    paddingVertical: space.l,
  },
  story: { alignItems: "center", gap: space.xs, paddingTop: space.xs },
  ring: {
    padding: space.xs,
    borderWidth: 2,
    borderColor: colors.brand,
    borderRadius: radii.pill,
  },
  ringWatched: { borderColor: colors.overlay10 },
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

  cards: { flexDirection: "row", gap: space.l },
  card: {
    width: CARD_WIDTH,
    gap: space.l,
    padding: space.l,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  cardMedia: {
    width: "100%",
    aspectRatio: MEDIA_RATIO,
    backgroundColor: colors.bgTertiary,
  },

  marks: { flexDirection: "row", gap: space.s, alignItems: "center" },
  mark: { width: 8, height: 8 },
  markOn: { width: 52, backgroundColor: colors.brand },
  markOff: { backgroundColor: "rgba(251,235,28,0.2)" },

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
  tile: { width: 228, height: 152, backgroundColor: "#27272a" },

  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingVertical: space.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  newsTile: { width: 106, height: 106, backgroundColor: "#27272a" },
  newsBody: { flex: 1, minWidth: 0, gap: space.xs },
});
