import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Field } from "../components/Sheet";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import {
  festivals,
  galleryRows,
  homeCopy,
  homeStats,
  homeStory,
  newsItems,
} from "../data/home";

/**
 * The homepage, from Figma 15:202 by way of the web build.
 *
 * The web hero is a headline that swaps its second word, a trail of concert
 * photographs following the cursor, and a poster stage in perspective that
 * plays a preview while the spacebar is held. None of those survive the trip:
 * a phone has no cursor to trail, no spacebar to hold, and no room for a stage
 * 1512px wide. What carries over is the order the page states things in —
 * the promise, the festivals, the company, the news — and the display face
 * doing the shouting.
 *
 * Only Jazzablanca has a page behind it. The other four posters are in the
 * comp as artwork with `href: "#"`, so they are drawn but not pressable
 * rather than given a tap that goes nowhere.
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [lead, ...words] = [homeCopy.heroLead, ...homeCopy.heroWords];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: space.section }}
    >
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + space.xxl }]}>
        <Text variant="captionBold" uppercase color={colors.contentSecondary}>
          SEVENPM
        </Text>

        <View
          accessibilityRole="header"
          accessibilityLabel={homeCopy.heroTitle}
          style={styles.headline}
        >
          {words.map((word) => (
            <View key={word} style={styles.headlineRow}>
              <Text variant="displayM" uppercase color={colors.white}>
                {lead}
              </Text>
              <Text variant="displayM" uppercase color={colors.brand}>
                {word}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="bodyL" color={colors.contentSecondary}>
          {homeCopy.intro}
        </Text>
      </View>

      <Image
        source={image("/assets/festival-glow.jpg")}
        style={styles.heroImage}
        contentFit="cover"
        transition={300}
      />

      {/* Festivals */}
      <View style={styles.section}>
        <Text variant="sectionTitle" uppercase>
          Festivals
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {festivals.map((festival) => {
            const slug = festival.href.startsWith("/events/")
              ? festival.href.slice("/events/".length)
              : undefined;
            const poster = (
              <View style={styles.poster}>
                <Image
                  source={image(festival.poster.src)}
                  style={[
                    styles.posterArt,
                    {
                      aspectRatio:
                        festival.poster.width / festival.poster.height,
                    },
                  ]}
                  contentFit="contain"
                  transition={300}
                />
                <Text variant="titleBody" uppercase numberOfLines={1}>
                  {festival.name}
                </Text>
              </View>
            );

            return slug ? (
              <Pressable
                key={festival.id}
                accessibilityRole="button"
                accessibilityLabel={festival.name}
                onPress={() => navigation.navigate("Event", { slug })}
                style={({ pressed }) => pressed && styles.pressed}
              >
                {poster}
              </Pressable>
            ) : (
              <View key={festival.id}>{poster}</View>
            );
          })}
        </ScrollView>
      </View>

      {/* The band under the hero — Figma 2227:5202. */}
      <View style={styles.stats}>
        {homeStats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text variant="displayM" color={colors.white}>
              {stat.prefix ?? ""}
              {/* Years are not thousands: 2018, never 2,018. */}
              {stat.year ? stat.value : stat.value.toLocaleString("en-US")}
              {stat.suffix ?? ""}
            </Text>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Story */}
      <View style={styles.section}>
        <Text variant="bodyL">{homeStory.body}</Text>

        <View style={styles.photos}>
          {homeStory.photos.map((photo) => (
            <Image
              key={photo}
              source={image(photo)}
              style={styles.photo}
              contentFit="cover"
              transition={300}
            />
          ))}
        </View>

        <View style={styles.socials}>
          {homeStory.socials.map((social) => {
            const Mark = icon(social.icon);
            return (
              <Pressable
                key={social.label}
                accessibilityRole="link"
                accessibilityLabel={social.label}
                onPress={() => Linking.openURL(social.href)}
                style={({ pressed }) => [styles.social, pressed && styles.pressed]}
              >
                {Mark && <Mark width={20} height={20} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* News */}
      <View style={styles.section}>
        <Text variant="sectionTitle" uppercase>
          Latest news
        </Text>
        {newsItems.map((item) => (
          <View key={item.href} style={styles.news}>
            {item.image && (
              <Image
                source={image(item.image)}
                style={styles.newsImage}
                contentFit="cover"
                transition={300}
              />
            )}
            <Text variant="caption" color={colors.contentSecondary}>
              {item.date}
            </Text>
            <Text variant="titleBody">{item.title}</Text>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {item.excerpt}
            </Text>
          </View>
        ))}
      </View>

      {/* Newsletter */}
      <View style={styles.newsletter}>
        <Text variant="sectionTitle" uppercase>
          {homeCopy.newsletter.title}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {homeCopy.newsletter.body}
        </Text>
        {subscribed ? (
          <Text variant="bodyBold" color={colors.positive}>
            {`Thanks — ${email} is on the list.`}
          </Text>
        ) : (
          <>
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              keyboardType="email-address"
            />
            <Button
              variant="primary"
              label={homeCopy.newsletter.cta}
              disabled={!email.includes("@")}
              onPress={() => setSubscribed(true)}
            />
          </>
        )}
      </View>

      {/* Gallery */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {galleryRows[0].map((shot, index) => (
          <Image
            key={`${shot}-${index}`}
            source={image(shot)}
            style={styles.shot}
            contentFit="cover"
            transition={300}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  pressed: { opacity: 0.8 },

  hero: { paddingHorizontal: gutter, paddingBottom: space.xl, gap: space.l },
  headline: { gap: 0 },
  headlineRow: { flexDirection: "row", gap: space.m },
  heroImage: { width: "100%", height: 220 },

  section: { paddingHorizontal: gutter, paddingTop: space.section, gap: space.l },
  rail: { gap: space.l, paddingRight: gutter },
  poster: { width: 200, gap: space.m },
  posterArt: { width: 200 },

  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: space.section,
    paddingHorizontal: gutter,
    paddingVertical: space.xl,
    backgroundColor: colors.bgSecondary,
    rowGap: space.xl,
  },
  stat: { width: "50%", paddingRight: space.m, gap: space.xs },

  photos: { flexDirection: "row", gap: space.m },
  photo: { flex: 1, height: 180 },
  socials: { flexDirection: "row", gap: space.m },
  social: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  news: { gap: space.s, paddingBottom: space.l },
  newsImage: { width: "100%", height: 180, marginBottom: space.xs },

  newsletter: {
    marginTop: space.section,
    paddingHorizontal: gutter,
    paddingVertical: space.xxl,
    backgroundColor: colors.bgSecondary,
    gap: space.l,
  },

  gallery: { gap: space.m, paddingHorizontal: gutter, paddingTop: space.section },
  shot: { width: 220, height: 150 },
});
