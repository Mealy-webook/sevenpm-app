import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronDown from "../icons/ic-chevron-down-16.svg";
import MapPin from "../icons/ic-map-pin.svg";
import Navigate from "../icons/ic-navigate-20.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { NavBar, Page } from "../components/Screen";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { getEvent, type ArtistGroup } from "../data/events";

/**
 * The event page, from the web build's `/events/[slug]`.
 *
 * That page is a long piece of theatre: a hero whose spectrum is driven by a
 * Web Audio analyser reading the playlist, a vinyl carousel, a polaroid fan
 * measured off a 1294px Figma group, a marquee of ticket stubs. This is the
 * same content standing still — a phone shows one column, and a page that
 * animates while you scroll it with your thumb fights the scroll.
 *
 * What is kept is the running order the web page states: what it is, when the
 * gates open, what a ticket costs, who is playing, where it is, what you may
 * bring, what people ask, and who paid for it.
 */
export function EventScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Event">>();
  const event = getEvent(params.slug);

  const [day, setDay] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!event) {
    return (
      <Page>
        <NavBar title="Event" onBack={navigation.goBack} />
        <View style={styles.section}>
          <Text variant="body" color={colors.contentSecondary}>
            This event is no longer listed.
          </Text>
        </View>
      </Page>
    );
  }

  const artists = event.artistDays[day];

  return (
    <Page>
      <NavBar floating onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        {/* Hero */}
        <Image
          source={image("/assets/poster-jazzablanca.jpg")}
          style={styles.hero}
          contentFit="cover"
          transition={300}
        />
        <View style={[styles.head, { marginTop: -space.section }]}>
          <Text variant="displayL" uppercase color={colors.white}>
            {event.name}
          </Text>
          <Text variant="body" color={colors.contentSecondary}>
            {event.intro}
          </Text>
        </View>

        {/* Schedule */}
        <View style={styles.tiles}>
          {event.schedule.map((tile) => {
            const Mark = icon(tile.icon);
            return (
              <View key={tile.label} style={styles.tile}>
                {Mark && <Mark width={24} height={24} />}
                <Text variant="caption" color={colors.contentSecondary}>
                  {tile.label}
                </Text>
                <Text variant="bodyBold">{tile.value}</Text>
              </View>
            );
          })}
        </View>

        {/* Tickets */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            Tickets
          </Text>
          {event.ticketTiers.map((tier) => (
            <View
              key={tier.id}
              style={[styles.tier, tier.featured && styles.tierFeatured]}
            >
              <Text variant="caption" color={colors.contentSecondary}>
                {tier.kicker}
              </Text>
              <Text variant="titleBody" uppercase>
                {tier.title}
              </Text>
              <View style={styles.tierPrice}>
                <Text variant="bodyL" style={styles.semibold}>
                  {tier.priceFrom} {tier.currency}
                </Text>
                {tier.wasPrice && (
                  <Text
                    variant="caption"
                    color={colors.contentSecondary}
                    style={styles.struck}
                  >
                    {tier.wasPrice}
                  </Text>
                )}
                {tier.discount && (
                  <Text variant="caption" color={colors.positive}>
                    {tier.discount}
                  </Text>
                )}
              </View>
              <Button
                label={tier.cta}
                variant={tier.featured ? "primary" : "secondary"}
                onPress={() =>
                  navigation.navigate("Booking", { slug: event.slug })
                }
                style={styles.tierCta}
              />
            </View>
          ))}
        </View>

        {/* Line-up */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            Line-up
          </Text>
          <View style={styles.chips}>
            {event.artistDays.map((item, index) => (
              <Chip
                key={item.id}
                label={item.label}
                selected={index === day}
                onPress={() => setDay(index)}
              />
            ))}
          </View>
          <View style={styles.acts}>
            {artists.groups.flatMap(flattenArtists).map((act, index) => (
              <View key={`${act.name}-${index}`} style={styles.act}>
                <Image
                  source={image(act.image)}
                  style={styles.actPortrait}
                  contentFit="cover"
                  transition={300}
                />
                <Text variant="bodyBold" numberOfLines={1}>
                  {act.name}
                </Text>
                {act.time && (
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {act.time}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            Location
          </Text>
          <View>
            <Image
              source={image(event.venue.mapImage)}
              style={styles.map}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.pin}>
              <MapPin width={32} height={32} />
            </View>
          </View>
          <View style={styles.venue}>
            <Text variant="bodyBold" style={styles.venueName}>
              {event.venue.name}
            </Text>
            <Button
              label="Directions"
              icon={Navigate}
              onPress={() => Linking.openURL(event.venue.directionsUrl)}
            />
          </View>
        </View>

        {/* Good to know */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            Good to know
          </Text>
          <View style={styles.infoGrid}>
            {event.infoTiles.map((info) => {
              const Mark = icon(info.icon);
              return (
                <View key={info.title} style={styles.info}>
                  {Mark && <Mark width={24} height={24} />}
                  <Text variant="bodyBold">{info.title}</Text>
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {info.value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            FAQ
          </Text>
          <View>
            {event.faq.map((item, index) => {
              const open = openFaq === index;
              return (
                <Pressable
                  key={item.question}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenFaq(open ? null : index)}
                  style={styles.faq}
                >
                  <View style={styles.faqHead}>
                    <Text variant="body" style={styles.faqQuestion}>
                      {item.question}
                    </Text>
                    <View style={open ? styles.flip : undefined}>
                      <ChevronDown width={16} height={16} />
                    </View>
                  </View>
                  {open && item.answer && (
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {item.answer}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sponsors */}
        <View style={styles.section}>
          <Text variant="sectionTitle" uppercase>
            Sponsors
          </Text>
          <View style={styles.sponsors}>
            {[event.officialSponsor, ...event.goldSponsors].map((sponsor) => {
              const Logo = icon(sponsor.logo);
              return (
                <View key={sponsor.name} style={styles.sponsor}>
                  {Logo ? (
                    <Logo width={96} height={32} />
                  ) : (
                    <Text variant="bodyBold">{sponsor.name}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {event.gallery.map((shot) => (
            <Image
              key={shot.image}
              source={image(shot.image)}
              style={styles.shot}
              contentFit="cover"
              transition={300}
            />
          ))}
        </ScrollView>
      </ScrollView>

      {/* The one action this page exists for, kept under the thumb rather than
          left at the bottom of a page this long. */}
      <View style={[styles.dock, { paddingBottom: insets.bottom || space.l }]}>
        <Button
          variant="primary"
          label="Get your ticket"
          onPress={() => navigation.navigate("Booking", { slug: event.slug })}
        />
      </View>
    </Page>
  );
}

/** The comp's solo circles and 2×2 blocks are one list on a phone. */
function flattenArtists(group: ArtistGroup) {
  if (group.type === "solo") {
    return [{ image: group.image, name: group.name, time: group.time }];
  }
  return group.items.filter((item) => item !== null);
}

const styles = StyleSheet.create({
  hero: { width: "100%", height: 320 },
  head: { paddingHorizontal: gutter, gap: space.m },

  tiles: {
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: gutter,
    paddingTop: space.xl,
  },
  tile: {
    flex: 1,
    gap: space.xs,
    padding: space.m,
    backgroundColor: colors.bgSecondary,
  },

  section: { paddingHorizontal: gutter, paddingTop: space.section, gap: space.l },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  struck: { textDecorationLine: "line-through" },

  tier: {
    gap: space.xs,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  tierFeatured: { backgroundColor: colors.bgTertiary },
  tierPrice: { flexDirection: "row", alignItems: "baseline", gap: space.s },
  tierCta: { marginTop: space.m },

  chips: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  acts: { flexDirection: "row", flexWrap: "wrap", gap: space.l },
  act: { width: "30%", gap: space.xs },
  actPortrait: { width: "100%", aspectRatio: 1, backgroundColor: colors.bgSecondary },

  map: { width: "100%", height: 180 },
  pin: {
    position: "absolute",
    left: "50%",
    top: 74,
    marginLeft: -16,
  },
  venue: { flexDirection: "row", alignItems: "center", gap: space.m },
  venueName: { flex: 1, minWidth: 0 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: space.l },
  info: { width: "50%", paddingRight: space.m, gap: space.xs },

  faq: {
    gap: space.s,
    paddingVertical: space.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderTertiary,
  },
  faqHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  faqQuestion: { flex: 1, minWidth: 0 },
  flip: { transform: [{ rotate: "180deg" }] },

  sponsors: { flexDirection: "row", flexWrap: "wrap", gap: space.m },
  sponsor: {
    width: "47%",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
  },

  gallery: { gap: space.m, paddingHorizontal: gutter, paddingTop: space.section },
  shot: { width: 240, height: 170 },

  dock: {
    paddingHorizontal: gutter,
    paddingTop: space.m,
    backgroundColor: colors.bgSecondary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderTertiary,
  },
});
