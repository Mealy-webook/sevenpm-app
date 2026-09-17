import { useState } from "react";
import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ArrowLeft from "../icons/ic-arrow-left-20.svg";
import Clock from "../icons/ic-clock-16.svg";
import MapPin from "../icons/ic-map-pin.svg";
import Minus from "../icons/ic-minus.svg";
import Navigate from "../icons/ic-navigate-20.svg";
import Pin from "../icons/ic-pin-16.svg";
import Plus from "../icons/ic-plus.svg";
import ShareIcon from "../icons/ic-share-20.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Page } from "../components/Screen";
import { Tap } from "../components/Tap";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, radii, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { eventCopy } from "../data/discover";
import { bookingConfig } from "../data/booking";
import { getEvent, type ArtistGroup } from "../data/events";

/**
 * The event page, from Figma 410:6401 — 390 × 3357 of it.
 *
 * The comp's running order is: what it is, when the gates open, what a ticket
 * costs, who is playing, where it is, what it looks like, what you may bring,
 * and what people ask. The page is a single scroll with the artwork square at
 * the top rather than a hero with a docked action, so the "Get your ticket"
 * press lives on each ticket rather than at the bottom of the screen.
 *
 * The ticket cards are stubs: a panel with a bite taken out of each side at
 * the shoulder. Figma draws that as a subtracted shape; here it is the panel
 * plus two circles in the page colour, which is the same picture and survives
 * a change of card height.
 *
 * Sponsors are **not** in this comp. They are kept, last, because a festival's
 * sponsor billing is usually contractual and dropping it is not a decision a
 * port should make quietly — but it is the one block on this page with no
 * comp behind it.
 */
export function EventScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Event">>();
  const event = getEvent(params.slug);

  const [day, setDay] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!event) {
    return (
      <Page>
        <View style={[styles.section, { paddingTop: insets.top + space.section }]}>
          <Text variant="body" color={colors.contentSecondary}>
            This event is no longer listed.
          </Text>
        </View>
      </Page>
    );
  }

  const artists = event.artistDays[day];
  const book = () => navigation.navigate("Booking", { slug: event.slug });

  return (
    <Page>
      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        {/* The artwork is square and the page starts on top of it. */}
        <View style={{ height: width }}>
          <Image
            source={image("/assets/event-hero.jpg")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["rgba(11,11,14,0)", colors.bgPrimary]}
            locations={[0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Name, when, where, what. */}
        <View style={[styles.section, styles.overlap]}>
          <Text
            variant="displayStep"
            uppercase
            color={colors.white}
            style={displaySize(type.displayStep, width)}
          >
            {event.name}
          </Text>

          <View style={styles.metaRow}>
            <Clock width={16} height={16} />
            <Text variant="bodyS" color={colors.contentSecondary}>
              {bookingConfig.sessionTime}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Pin width={16} height={16} />
            <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={2}>
              {event.venue.name}
            </Text>
          </View>

          <Text variant="body" color={colors.contentSecondary}>
            {event.intro}
          </Text>

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

          <Button
            variant="primary"
            label={eventCopy.exploreTickets}
            onPress={book}
          />
        </View>

        {/* The headline figure, then the stubs. */}
        <View style={styles.section}>
          {event.stat && (
            <View style={styles.stat}>
              <Text
                variant="displayCard"
                color={colors.white}
                style={displaySize(type.displayCard, width)}
              >
                {event.stat.value}
              </Text>
              <Text variant="bodyBold" color={colors.contentSecondary}>
                {event.stat.label}
              </Text>
            </View>
          )}

          {event.ticketTiers.map((tier) => (
            <View key={tier.id} style={styles.stub}>
              {/* The bite out of each shoulder. */}
              <View style={[styles.notch, styles.notchLeft]} />
              <View style={[styles.notch, styles.notchRight]} />

              <View style={styles.stubBody}>
                <Text variant="caption" color={colors.contentSecondary}>
                  {tier.kicker}
                </Text>
                <Text variant="titleBody" uppercase>
                  {tier.title}
                </Text>

                <View style={styles.priceRow}>
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {eventCopy.from}
                  </Text>
                  <Text variant="bodyL" style={styles.semibold}>
                    {tier.priceFrom} {tier.currency}
                  </Text>
                  <Text variant="caption" color={colors.contentSecondary}>
                    / Person
                  </Text>
                </View>
                {(tier.wasPrice || tier.discount) && (
                  <View style={styles.priceRow}>
                    {tier.wasPrice && (
                      <Text
                        variant="caption"
                        color={colors.contentSecondary}
                        style={styles.struck}
                      >
                        {tier.wasPrice} {tier.currency}
                      </Text>
                    )}
                    {tier.discount && (
                      <Text variant="caption" color={colors.positive}>
                        {tier.discount}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              <Button label={tier.cta} onPress={book} />
            </View>
          ))}
        </View>

        {/* Line-up */}
        <View style={styles.section}>
          <SectionHeading width={width}>{eventCopy.lineup}</SectionHeading>
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
          <SectionHeading width={width}>{eventCopy.location}</SectionHeading>
          <View>
            <Image
              source={image("/assets/event-map.jpg")}
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
              label={eventCopy.directions}
              icon={Navigate}
              onPress={() => Linking.openURL(event.venue.directionsUrl)}
            />
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <SectionHeading width={width}>{eventCopy.gallery}</SectionHeading>
        </View>
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

        {/* Good to know */}
        <View style={styles.section}>
          <SectionHeading width={width}>{eventCopy.goodToKnow}</SectionHeading>
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

        {/* FAQs — the comp opens the first one, so the block shows what it is */}
        <View style={styles.section}>
          <SectionHeading width={width}>{eventCopy.faqs}</SectionHeading>
          <View>
            {event.faq.map((item, index) => {
              const open = openFaq === index;
              return (
                <Tap
                  key={item.question}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenFaq(open ? null : index)}
                  scale={0.995}
                  style={styles.faq}
                >
                  <View style={styles.faqHead}>
                    <Text variant="body" style={styles.faqQuestion}>
                      {item.question}
                    </Text>
                    {open ? (
                      <Minus width={20} height={20} />
                    ) : (
                      <Plus width={20} height={20} />
                    )}
                  </View>
                  {open && item.answer && (
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {item.answer}
                    </Text>
                  )}
                </Tap>
              );
            })}
          </View>
        </View>

        {/* Sponsors — not in the comp; see the note at the top of this file. */}
        <View style={styles.section}>
          <SectionHeading width={width}>{eventCopy.sponsors}</SectionHeading>
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
      </ScrollView>

      {/* The bar floats over the artwork rather than sitting on a band. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.s }]}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={navigation.goBack}
          style={styles.barButton}
        >
          <ArrowLeft width={20} height={20} />
        </Tap>
        <View style={styles.barSpacer} />
        <Tap
          accessibilityRole="button"
          accessibilityLabel={eventCopy.share}
          onPress={() =>
            Share.share({ message: `${event.name} — ${event.venue.name}` })
          }
          style={styles.barButton}
        >
          <ShareIcon width={20} height={20} />
        </Tap>
      </View>
    </Page>
  );
}

/** Every section on this page is titled the same way. */
function SectionHeading({
  children,
  width,
}: {
  children: string;
  width: number;
}) {
  return (
    <Text
      variant="displayCard"
      uppercase
      color={colors.white}
      style={displaySize(type.displayCard, width)}
    >
      {children}
    </Text>
  );
}

/** The comp's solo circles and 2×2 blocks are one list on a phone. */
function flattenArtists(group: ArtistGroup) {
  if (group.type === "solo") {
    return [{ image: group.image, name: group.name, time: group.time }];
  }
  return group.items.filter((item) => item !== null);
}

const NOTCH = 24;

const styles = StyleSheet.create({
  section: { paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.m },
  /* The copy starts over the foot of the square artwork. */
  overlap: { marginTop: -space.section },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  struck: { textDecorationLine: "line-through" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: space.xs },

  tiles: { flexDirection: "row", gap: space.s, marginTop: space.s },
  tile: {
    flex: 1,
    gap: space.xs,
    padding: space.m,
    backgroundColor: colors.bgSecondary,
  },

  stat: { flexDirection: "row", alignItems: "baseline", gap: space.s },

  stub: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
    overflow: "hidden",
  },
  stubBody: { flex: 1, minWidth: 0, gap: space.xs },
  notch: {
    position: "absolute",
    top: "50%",
    width: NOTCH,
    height: NOTCH,
    marginTop: -NOTCH / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPrimary,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs },

  chips: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },
  acts: { flexDirection: "row", flexWrap: "wrap", gap: space.l },
  act: { width: "30%", gap: space.xs },
  actPortrait: { width: "100%", aspectRatio: 1, backgroundColor: colors.bgSecondary },

  map: { width: "100%", height: 180 },
  pin: { position: "absolute", left: "50%", top: 74, marginLeft: -16 },
  venue: { flexDirection: "row", alignItems: "center", gap: space.m },
  venueName: { flex: 1, minWidth: 0 },

  gallery: { gap: space.m, paddingHorizontal: space.xl, paddingTop: space.m },
  shot: { width: 240, height: 170 },

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

  sponsors: { flexDirection: "row", flexWrap: "wrap", gap: space.m },
  sponsor: {
    width: "47%",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
  },

  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.xl,
    paddingBottom: space.s,
  },
  barSpacer: { flex: 1 },
  barButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
});
