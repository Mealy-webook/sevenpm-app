import { useState } from "react";
import {
  Animated,
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
import MapPin from "../icons/ic-map-pin.svg";
import Minus from "../icons/ic-minus.svg";
import Navigate from "../icons/ic-navigate-20.svg";
import Plus from "../icons/ic-plus.svg";
import ShareIcon from "../icons/ic-share-20.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Page } from "../components/Screen";
import { Tap } from "../components/Tap";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { Reveal, ScrollProvider, usePageScroll } from "../theme/scroll";
import { colors, displaySize, radii, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { eventCopy } from "../data/discover";
import { bookingConfig } from "../data/booking";
import { getEvent, type ArtistGroup } from "../data/events";

/**
 * The event page, from Figma 410:6401.
 *
 * Two things about this page are not like the rest of the app, and both are
 * deliberate in the comp.
 *
 * The tickets are **paper**: a grey stub holding a sheet of textured white
 * card, with the type in near-black. Every other surface in this system is
 * dark with light type, and the inversion is the point — a ticket should look
 * like an object you were handed, not like another panel. The paper is the
 * comp's own artwork, cut to shape with its corner notches already in the
 * alpha, so the shape survives whatever height the content needs.
 *
 * And the schedule tiles have no panels. They are three columns divided by
 * hairlines, which is why they read as one band of facts rather than as three
 * cards.
 *
 * Sponsors are not in this comp. They are kept, last, because a festival's
 * sponsor billing is usually contractual and dropping it is not a decision a
 * port should make quietly — it is the one block here with no comp behind it.
 */

/**
 * The line-up photography ships with the app comps and is not in the web
 * build, whose artist entries are numbered placeholders. Names and set times
 * still come from the shared data; only the faces are local to this file.
 */
const LINEUP = [
  "/assets/lineup-1.jpg",
  "/assets/lineup-2.jpg",
  "/assets/lineup-3.jpg",
  "/assets/lineup-4.jpg",
  "/assets/lineup-5.jpg",
  "/assets/lineup-6.jpg",
  "/assets/lineup-7.jpg",
  "/assets/lineup-8.jpg",
  "/assets/lineup-9.jpg",
];

const GALLERY = [
  "/assets/event-gallery-1.jpg",
  "/assets/event-gallery-2.jpg",
  "/assets/event-gallery-3.jpg",
  "/assets/event-gallery-4.jpg",
];

export function EventScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Event">>();
  const event = getEvent(params.slug);

  const [day, setDay] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollY, props: scrollProps } = usePageScroll();

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

  const book = () => navigation.navigate("Booking", { slug: event.slug });
  const heading = displaySize(type.displayStep, width);

  return (
    <Page>
      <ScrollProvider value={scrollY}>
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: space.section }}
          {...scrollProps}
        >
        {/* The artwork holds its ground as the page leaves — it travels at a
            third of the scroll — and pulling down past the top stretches it
            rather than exposing the page colour behind. */}
        <Animated.View
          style={{
            height: width,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, width],
                  outputRange: [0, width * 0.34],
                  extrapolateLeft: "extend",
                  extrapolateRight: "clamp",
                }),
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [-width, 0],
                  outputRange: [2.4, 1],
                  extrapolateRight: "clamp",
                }),
              },
            ],
          }}
        >
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
        </Animated.View>

        {/* Name, when, where, what. */}
        <Reveal style={[styles.section, styles.overlap]}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {event.name}
          </Text>

          {/* The time is the accent, and the venue is a link. Neither carries
              an icon in the comp — the colour and the underline do that job. */}
          <Text variant="bodySBold" color={colors.brand}>
            {bookingConfig.sessionTime}
          </Text>
          <Tap
            accessibilityRole="link"
            onPress={() => Linking.openURL(event.venue.directionsUrl)}
            scale={0.99}
          >
            <Text variant="bodySBold" style={styles.link}>
              {event.venue.name}
            </Text>
          </Tap>

          <Text variant="body" style={styles.intro}>
            {event.intro}
          </Text>

          {/* Three columns divided by hairlines — no panels. */}
          <View style={styles.tiles}>
            {event.schedule.map((tile, index) => {
              const Mark = icon(tile.icon);
              return (
                <View
                  key={tile.label}
                  style={[styles.tile, index > 0 && styles.tileDivided]}
                >
                  {Mark && <Mark width={24} height={24} />}
                  <Text variant="caption" color={colors.contentSecondary}>
                    {tile.label}
                  </Text>
                  <Text variant="bodyBold">{tile.value}</Text>
                </View>
              );
            })}
          </View>

          <Button variant="brand" label={eventCopy.exploreTickets} onPress={book} />
        </Reveal>

        {/* Tickets */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.tickets}
          </Text>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {event.ticketTiers.map((tier) => (
            <View key={tier.id} style={styles.stub}>
              <Image
                source={image("/assets/ticket-paper.png")}
                style={StyleSheet.absoluteFill}
                contentFit="fill"
              />
              <View style={styles.stubBody}>
                <Text
                  variant="captionBold"
                  uppercase
                  color={colors.ink900}
                  style={styles.kicker}
                >
                  {`★  ${tier.kicker}  ★`}
                </Text>
                <Text
                  variant="displayM"
                  uppercase
                  color={colors.ink900}
                  style={displaySize(type.displayM, width)}
                >
                  {tier.title}
                </Text>

                <View style={styles.priceRow}>
                  <Text variant="body" color={colors.ink800}>
                    {eventCopy.from}
                  </Text>
                  <Text variant="bodyL" color={colors.ink900} style={styles.semibold}>
                    {tier.priceFrom} {tier.currency}
                  </Text>
                  <Text variant="bodyS" color={colors.ink600}>
                    {eventCopy.perPerson}
                  </Text>
                </View>
                {(tier.wasPrice || tier.discount) && (
                  <View style={styles.priceRow}>
                    {tier.wasPrice && (
                      <Text
                        variant="caption"
                        color={colors.ink600}
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

                {/* Dark ink on paper: the button inverts with the card. */}
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={tier.cta}
                  onPress={book}
                  style={styles.stubCta}
                >
                  <Text variant="bodyL" color={colors.white} style={styles.semibold}>
                    {tier.cta}
                  </Text>
                </Tap>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Line-up */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.lineup}
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
        </Reveal>
        {/* Circles, sized by their group: a solo act is one large one, a block
            is four small. They run off the right edge as the comp draws them. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {event.artistDays[day].groups.map((group, gi) => (
            <ArtistGroupView key={`${group.type}-${gi}`} group={group} index={gi} />
          ))}
        </ScrollView>

        {/* Location */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.location}
          </Text>
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
            <Text
              variant="body"
              color={colors.contentSecondary}
              style={styles.venueName}
            >
              {event.venue.name}
            </Text>
            <Button
              variant="primary"
              label={eventCopy.directions}
              icon={Navigate}
              onPress={() => Linking.openURL(event.venue.directionsUrl)}
            />
          </View>
        </Reveal>

        {/* Gallery */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.gallery}
          </Text>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {GALLERY.map((shot) => (
            <Image
              key={shot}
              source={image(shot)}
              style={styles.shot}
              contentFit="cover"
              transition={300}
            />
          ))}
        </ScrollView>

        {/* Good to know — panels, two across. */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.goodToKnow}
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
        </Reveal>

        {/* FAQs — the control is on the left, ahead of the question. */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.faqs}
          </Text>
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
                  <View style={styles.faqMark}>
                    {open ? (
                      <Minus width={20} height={20} />
                    ) : (
                      <Plus width={20} height={20} />
                    )}
                  </View>
                  <View style={styles.faqBody}>
                    <Text variant="bodyL" color={colors.white} style={styles.semibold}>
                      {item.question}
                    </Text>
                    {open && item.answer && (
                      <Text variant="body" color={colors.contentSecondary}>
                        {item.answer}
                      </Text>
                    )}
                  </View>
                </Tap>
              );
            })}
          </View>
        </Reveal>

        {/* Sponsors — not in the comp; see the note at the top of this file. */}
        <Reveal style={styles.section}>
          <Text variant="displayStep" uppercase color={colors.white} style={heading}>
            {eventCopy.sponsors}
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
        </Reveal>
        </Animated.ScrollView>
      </ScrollProvider>

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

const SOLO = 200;
const SMALL = 96;

/** A solo act is one large circle; a block is a 2 × 2 of small ones. */
function ArtistGroupView({
  group,
  index,
}: {
  group: ArtistGroup;
  index: number;
}) {
  if (group.type === "solo") {
    return (
      <View style={styles.act}>
        <Image
          source={image(LINEUP[index % LINEUP.length])}
          style={styles.soloCircle}
          contentFit="cover"
          transition={300}
        />
        <Text variant="bodyBold" numberOfLines={1}>
          {group.name}
        </Text>
        {group.time && (
          <Text variant="bodyS" color={colors.contentSecondary}>
            {group.time}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.quad}>
      {group.items.map((item, i) =>
        item ? (
          <View key={`${item.name}-${i}`} style={styles.quadCell}>
            <Image
              source={image(LINEUP[(index + i + 1) % LINEUP.length])}
              style={styles.smallCircle}
              contentFit="cover"
              transition={300}
            />
          </View>
        ) : (
          <View key={`gap-${i}`} style={styles.quadCell} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.m },
  overlap: { marginTop: -space.section },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  struck: { textDecorationLine: "line-through" },
  link: { textDecorationLine: "underline" },
  intro: { marginTop: space.s },
  rail: { gap: space.l, paddingHorizontal: space.xl, paddingTop: space.m },

  tiles: { flexDirection: "row", marginTop: space.m },
  tile: { flex: 1, gap: space.xs, paddingHorizontal: space.m },
  /* The hairline between columns is what makes them one band. */
  tileDivided: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.borderTertiary,
  },

  /* Paper, not panel: the type on this card is near-black. */
  stub: { width: 320, minHeight: 300, padding: space.xl, justifyContent: "center" },
  stubBody: { gap: space.xs, alignItems: "center" },
  kicker: { letterSpacing: 1.2 },
  stubCta: {
    marginTop: space.m,
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: space.l,
    backgroundColor: colors.ink700,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs },

  chips: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },
  act: { width: SOLO, gap: space.xs },
  soloCircle: {
    width: SOLO,
    height: SOLO,
    borderRadius: radii.pill,
    backgroundColor: colors.bgSecondary,
  },
  quad: { width: SMALL * 2 + space.s, flexDirection: "row", flexWrap: "wrap", gap: space.s },
  quadCell: { width: SMALL, height: SMALL },
  smallCircle: {
    width: SMALL,
    height: SMALL,
    borderRadius: radii.pill,
    backgroundColor: colors.bgSecondary,
  },

  map: { width: "100%", height: 180 },
  pin: { position: "absolute", left: "50%", top: 74, marginLeft: -16 },
  venue: { flexDirection: "row", alignItems: "center", gap: space.m },
  venueName: { flex: 1, minWidth: 0 },

  shot: { width: 300, height: 200 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.m },
  info: {
    width: "47%",
    gap: space.xs,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },

  faq: {
    flexDirection: "row",
    gap: space.m,
    paddingVertical: space.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderTertiary,
  },
  faqMark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay20,
  },
  faqBody: { flex: 1, minWidth: 0, gap: space.s },

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
