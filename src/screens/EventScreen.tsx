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

import Close from "../icons/ic-close.svg";
import MapPin from "../icons/ic-map-pin.svg";
import Minus from "../icons/ic-minus.svg";
import Navigate from "../icons/ic-navigate-20.svg";
import Plus from "../icons/ic-plus.svg";
import ShareIcon from "../icons/ic-share-20.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { PhotoPile } from "../components/PhotoPile";
import { Page } from "../components/Screen";
import { Tap } from "../components/Tap";
import { TicketStub } from "../components/TicketStub";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { Reveal, RevealWords, ScrollProvider, usePageScroll } from "../theme/scroll";
import { colors, displaySize, gutter, radii, scaled, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { eventCopy } from "../data/discover";
import { bookingConfig } from "../data/booking";
import { getEvent, type ArtistGroup } from "../data/events";

/**
 * The event page, from Figma 410:6401 — measured against the comp's 390-wide
 * frame, section by section.
 *
 * Three things about this page are not like the rest of the app, and all are
 * deliberate in the comp.
 *
 * The tickets are **paper** (`TicketStub`): a perforated grey stub holding a
 * sheet of textured card, with the type in near-black. Every other surface in
 * this system is dark with light type, and the inversion is the point — a
 * ticket should look like an object you were handed, not like another panel.
 *
 * The gallery is a **pile of polaroids**, not a rail: three prints, one
 * upright in front and two tucked behind at a tilt. `PhotoPile` adds the
 * interaction the still comp implies — flick the front print aside and the
 * pile turns.
 *
 * And the schedule tiles have no panels. They are three columns divided by
 * hairlines, which is why they read as one band of facts rather than three
 * cards.
 *
 * What is *not* here, on purpose: a call-to-action under the schedule, names
 * under the line-up circles, and a sponsors block. The comp has none of them;
 * the tickets themselves are the call to action.
 */

/** The comp's page header is 279 tall on a 390 frame; the title sits on it. */
const HEADER_RATIO = 279 / 390;
/** The record hero's own height: the comp's Section begins 414 down. */
const HERO_H = 414;

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
  "/assets/event-gallery-5.jpg",
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
  /* The hero is a collage at the comp's own 390-wide measurements. */
  const s = (value: number) => scaled(value, width);
  const heading = displaySize(type.displayBlock, width);
  const title = displaySize(type.displayPage, width);
  const gutterWidth = width - gutter * 2;
  const infoWidth = (gutterWidth - space.l) / 2;
  /* The pinned controls are glass over the artwork and solid over the page:
     the fill arrives as the hero leaves, so an ✕ never floats bare over a
     heading. */
  const barFill = scrollY.interpolate({
    inputRange: [width * 0.35, width * 0.7],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Page>
      <ScrollProvider value={scrollY}>
        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: space.xl + Math.max(insets.bottom, 20),
          }}
          {...scrollProps}
        >
        {/* The record, from Figma 464:71859. Four layers at the comp's own
            offsets: the artwork out of focus behind everything, the disc
            running off the top of the screen, the sleeve art as its label,
            and the arm resting across it. It still travels at half the
            scroll, as the photo hero did. */}
        <Animated.View
          style={{
            height: s(HERO_H),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, width],
                  outputRange: [0, width * 0.55],
                  extrapolateLeft: "extend",
                  extrapolateRight: "clamp",
                }),
              },
            ],
          }}
        >
          <Image
            source={image("/assets/event-label.webp")}
            style={{
              position: "absolute",
              left: s(16),
              top: s(7),
              width: s(340),
              height: s(340),
              opacity: 0.4,
            }}
            contentFit="cover"
            blurRadius={60}
          />
          <Image
            source={image("/assets/vinyl.webp")}
            style={{
              position: "absolute",
              left: s(-9),
              top: s(-33),
              width: s(408),
              height: s(408),
            }}
            contentFit="contain"
            transition={300}
          />
          <Image
            source={image("/assets/event-label.webp")}
            style={{
              position: "absolute",
              left: s(80),
              top: s(50),
              width: s(228),
              height: s(230),
            }}
            contentFit="cover"
            transition={300}
          />
          {/* The arm is drawn upright and laid across the disc, so it is
              turned in place inside a box the comp sizes for it. */}
          <View
            style={{
              position: "absolute",
              left: s(134),
              top: s(232),
              width: s(288.423),
              height: s(241.54),
              alignItems: "center",
              justifyContent: "center",
            }}
            pointerEvents="none"
          >
            <Image
              source={image("/assets/tonearm.webp")}
              style={{
                width: s(213.297),
                height: s(266.4),
                transform: [{ rotate: "96.37deg" }],
              }}
              contentFit="contain"
              transition={300}
            />
          </View>
        </Animated.View>

        {/* Name, when, where, what. */}
        <Reveal
          index={0}
          style={styles.section}
        >
          <RevealWords variant="displayPage" color={colors.white} textStyle={title}>
            {event.name}
          </RevealWords>

          {/* The time is the accent, and the venue is a link. Neither carries
              an icon in the comp — the colour and the underline do that job —
              and they sit as one stacked pair. */}
          <View>
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
          </View>

          <Text variant="body" color={colors.contentSecondary}>
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
                  <View style={styles.tileText}>
                    <Text variant="caption" color={colors.contentSecondary}>
                      {tile.label}
                    </Text>
                    <Text variant="bodyBold">{tile.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Reveal>

        {/* Tickets */}
        <Reveal index={1} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.tickets}
          </RevealWords>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ticketRail}
        >
          {event.ticketTiers.map((tier) => (
            <TicketStub key={tier.id} tier={tier} onPress={book} />
          ))}
        </ScrollView>

        {/* Line-up */}
        <Reveal index={2} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.lineup}
          </RevealWords>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRail}
        >
          {event.artistDays.map((item, index) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={index === day}
              onPress={() => setDay(index)}
            />
          ))}
        </ScrollView>
        {/* Circles, sized by their group: a solo act is one large one, a block
            is four small. Each overlaps the last by 20, and they run off the
            right edge, as the comp draws them. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.circleRail}
        >
          {event.artistDays[day].groups.map((group, gi) => (
            <ArtistGroupView key={`${group.type}-${gi}`} group={group} index={gi} />
          ))}
        </ScrollView>

        {/* Location */}
        <Reveal index={3} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.location}
          </RevealWords>
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
            <Text variant="bodyS" color={colors.white} style={styles.venueName}>
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
        <Reveal index={4} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.gallery}
          </RevealWords>
          <PhotoPile photos={GALLERY} style={styles.pile} />
        </Reveal>

        {/* Good to know — panels, two across. */}
        <Reveal index={5} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.goodToKnow}
          </RevealWords>
          <View style={styles.infoGrid}>
            {event.infoTiles.map((info) => {
              const Mark = icon(info.icon);
              return (
                <View key={info.title} style={[styles.info, { width: infoWidth }]}>
                  {Mark && <Mark width={24} height={24} />}
                  <View>
                    <Text variant="bodyBold">{info.title}</Text>
                    <Text variant="caption" color={colors.contentSecondary}>
                      {info.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Reveal>

        {/* FAQs — the control is on the left, ahead of the question. */}
        <Reveal index={6} style={styles.section}>
          <RevealWords variant="displayBlock" color={colors.white} textStyle={heading}>
            {eventCopy.faqs}
          </RevealWords>
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
                      <Text variant="bodyS" color={colors.contentSecondary}>
                        {item.answer}
                      </Text>
                    )}
                  </View>
                </Tap>
              );
            })}
          </View>
        </Reveal>
        </Animated.ScrollView>
      </ScrollProvider>

      {/* Close, not back: the page is a sheet over Discover in the comp. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.s }]}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={navigation.goBack}
          style={styles.barButton}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.barSolid, { opacity: barFill }]}
          />
          <Close width={20} height={20} />
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
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.barSolid, { opacity: barFill }]}
          />
          <ShareIcon width={20} height={20} />
        </Tap>
      </View>
    </Page>
  );
}

const SOLO = 216;
const SMALL = SOLO / 2;
/** Each group overlaps the one before it by this much. */
const LAP = 20;

/**
 * A solo act is one large circle; a block is a 2 × 2 of small ones. The comp
 * draws no names — the faces are the line-up — so the name is carried for
 * assistive tech only.
 */
function ArtistGroupView({
  group,
  index,
}: {
  group: ArtistGroup;
  index: number;
}) {
  const lap = index > 0 && styles.lapped;

  if (group.type === "solo") {
    return (
      <Image
        source={image(LINEUP[index % LINEUP.length])}
        style={[styles.soloCircle, lap]}
        contentFit="cover"
        transition={300}
        accessibilityLabel={group.time ? `${group.name}, ${group.time}` : group.name}
      />
    );
  }

  return (
    <View style={[styles.quad, lap]}>
      {group.items.map((item, i) =>
        item ? (
          <Image
            key={`${item.name}-${i}`}
            source={image(LINEUP[(index + i + 1) % LINEUP.length])}
            style={styles.smallCircle}
            contentFit="cover"
            transition={300}
            accessibilityLabel={item.name}
          />
        ) : (
          <View key={`gap-${i}`} style={styles.smallCircle} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: gutter, paddingTop: space.xl, gap: space.m },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  link: { textDecorationLine: "underline" },
  chipRail: { gap: space.l, paddingHorizontal: gutter, paddingTop: space.m },
  circleRail: { paddingHorizontal: gutter, paddingTop: space.xl },

  /* 24 icon, 8, label, value — centred in a 90-tall column. */
  tiles: { flexDirection: "row", marginTop: space.xs },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: space.s,
    paddingVertical: space.m,
    paddingHorizontal: space.s,
  },
  tileText: { alignItems: "center" },
  /* The hairline between columns is what makes them one band. */
  tileDivided: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.borderTertiary,
  },

  /* Tickets sit flush, so their perforations meet. */
  ticketRail: { paddingHorizontal: gutter, paddingTop: space.l },

  lapped: { marginLeft: -LAP },
  soloCircle: {
    width: SOLO,
    height: SOLO,
    borderRadius: radii.pill,
    backgroundColor: colors.bgSecondary,
  },
  quad: { width: SOLO, height: SOLO, flexDirection: "row", flexWrap: "wrap" },
  smallCircle: {
    width: SMALL,
    height: SMALL,
    borderRadius: radii.pill,
    backgroundColor: colors.bgSecondary,
  },

  map: { width: "100%", height: 163 },
  pin: { position: "absolute", left: "50%", top: 66, marginLeft: -16 },
  venue: { flexDirection: "row", alignItems: "center", gap: space.l, marginTop: space.xs },
  venueName: { flex: 1, minWidth: 0 },

  pile: { marginTop: space.m },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.l },
  info: {
    gap: space.s,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },

  faq: {
    flexDirection: "row",
    gap: space.xl,
    paddingVertical: space.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderTertiary,
  },
  faqMark: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay20,
  },
  faqBody: { flex: 1, minWidth: 0, gap: space.s },

  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: gutter,
    paddingBottom: space.s,
  },
  barSpacer: { flex: 1 },
  barButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  barSolid: { backgroundColor: colors.bgSecondary },
});
