import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
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
import { useReducedMotion } from "../theme/motion";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Close from "../icons/ic-close.svg";
import Minus from "../icons/ic-minus.svg";
import Plus from "../icons/ic-plus.svg";
import ShareIcon from "../icons/ic-share-20.svg";
import { Chip } from "../components/Chip";
import { Page } from "../components/Screen";
import { MiniPlayer, artworkAt, useDeck } from "../components/MiniPlayer";
import { COVER_MS } from "../components/PosterZoom";
import { Tap } from "../components/Tap";
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
 * The event page, from Figma 469:72557 — measured against the comp's 390-wide
 * frame, section by section. It replaced 410:6401, which carried three more
 * sections than this one does.
 *
 * The schedule tiles have no panels. They are three columns divided by
 * hairlines, which is why they read as one band of facts rather than three
 * cards.
 *
 * What is *not* here, on purpose: **tickets, the location and the gallery**.
 * 410:6401 had all three and this comp draws none of them, which Ahmed
 * confirmed is deliberate. It leaves the page with no route into the booking
 * journey and the app with no other one, so booking needs an entry somewhere
 * before this ships. Also absent, as before: a call-to-action under the
 * schedule, names under the line-up circles, and a sponsors block.
 */

/**
 * When the page is flown to rather than pushed to.
 *
 * `PosterZoom` pushes this screen the moment the record sets off for the deck
 * and keeps covering it until the record lands, so for that first stretch the
 * page is drawn but not seen. It opens in three beats instead of one: the
 * record is already turning where it landed, then the deck it landed on
 * arrives around it, then the page itself.
 */
/**
 * Nothing on this page fades itself in on arrival. The deck — the bloom, the
 * record, its label, the arm parked on its rest, the controls — is drawn in
 * full from the first frame, because for the whole of `COVER_MS` it is behind
 * the record being flown to it and nobody can see it. A thing that fades in
 * after the cover comes off is a thing you watch arrive twice.
 *
 * Two things do move, and they start before the cover has finished coming
 * off: the deck is asked to play, which brings the arm down onto the record,
 * and the page opens under it.
 */
/* The arm is already on its way down as the cover lifts, so the page does
   not appear and then start doing something. */
const ARM_AT = COVER_MS - 120;
const ARRIVE_PAGE = ARM_AT + 620;

/**
 * The arm, and the two angles it lives at.
 *
 * The comp draws it at 96.37°, across the record. Parked it is at 62°, which
 * puts the head clear of the outer groove and low on the hero, where a rest
 * would be. It swings between the two about its **pivot** — the plate at the
 * top right of the asset — and not about the middle of its own box, because
 * an arm that rotates about its middle slides across the deck rather than
 * turning on it.
 *
 * `ARM_FIX` is the constant that puts the pivot-turned arm back where the
 * comp's centre-turned one sat, so the resting pose is unchanged.
 */
/**
 * The record on the deck, from Figma 464:71859, in the comp's own 390-wide
 * units, and the label's place on it as fractions of the disc.
 *
 * `deckRect` hands the same thing to a transition in window units, so the
 * record flown here from elsewhere can land on exactly this and wear exactly
 * this label. It is one number in one place because two copies of it would
 * drift and the landing would show a jump.
 */
export const EVENT_LABEL = "/assets/event-label.webp";
const RECORD = { left: -9, top: -63, size: 408 };
const LABEL = {
  left: (80 - RECORD.left) / RECORD.size,
  top: (20 - RECORD.top) / RECORD.size,
  width: 228 / RECORD.size,
  height: 230 / RECORD.size,
};

export function deckRect(width: number, label = EVENT_LABEL) {
  const u = (value: number) => scaled(value, width);
  return {
    x: u(RECORD.left),
    y: u(RECORD.top),
    size: u(RECORD.size),
    label,
    labelRect: LABEL,
  };
}

/**
 * The label the deck is wearing when an event's page opens: the cover of the
 * first track on it, because the record's label *is* the track. Anything
 * flying a record here asks for this so the record lands wearing what the
 * page is about to show, and the hand-over changes nothing.
 */
export function deckLabel(slug: string | undefined) {
  const first = slug ? getEvent(slug)?.playlist?.[0] : undefined;
  return first?.artworkUrl ? artworkAt(first.artworkUrl, 600) : EVENT_LABEL;
}

/** How far the record has to be pushed before it changes what is playing. */
const SHOVE = 72;
/** The gap between one record and the next in the rack behind this one. */
const RACK_GAP = 16;
/** The push across, and the arm's swing on and off. */
const PUSH_MS = 340;
const ARM_MS = 620;

/**
 * One record: the disc and the label on it.
 *
 * `spin` is passed only to the one in the middle. The records either side of
 * it are the next and previous tracks waiting their turn, and a record that
 * is not under the arm does not turn.
 */
type Turn = { transform: { rotate: Animated.AnimatedInterpolation<string> }[] };

function Record({ label, spin }: { label: string; spin?: Turn }) {
  return (
    <>
      {/* Sized in per cent rather than with absoluteFill: an Image pinned
          only by its insets falls back to the bitmap's own size, and this
          bitmap is twice the screen. */}
      <Animated.Image source={image("/assets/vinyl.webp")} style={[styles.disc, spin]} />
      {/* The label is the track: change what is playing and the record is
          wearing the new cover. Round, because a label is round and a cover
          is square. It crossfades, for the times the track is changed from
          the bar rather than by pushing the record aside. */}
      <Animated.View style={[styles.discLabel, spin]}>
        <Image
          source={image(label)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={260}
        />
      </Animated.View>
    </>
  );
}

const ARM_W = 213.297;
const ARM_H = 266.4;
const ARM_REST = 96.37;
const ARM_PARK = 62;
/** The pivot plate's centre, as a fraction of the asset. */
const ARM_PIVOT = { x: (0.673 - 0.5) * ARM_W, y: (0.225 - 0.5) * ARM_H };
const ARM_FIX = turned(ARM_PIVOT, ARM_REST);

function turned(point: { x: number; y: number }, degrees: number) {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: point.x * cos - point.y * sin - point.x,
    y: point.x * sin + point.y * cos - point.y,
  };
}

/** The comp's page header is 279 tall on a 390 frame; the title sits on it. */
const HEADER_RATIO = 279 / 390;
/** The record hero's own height: the comp's Section begins 373 down. */
const HERO_H = 373;

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


export function EventScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Event">>();
  const event = getEvent(params.slug);

  const [day, setDay] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollY, props: scrollProps } = usePageScroll();

  /* Flown to, so the page holds itself back until the record has landed. */
  const arriving = params.arriving === true;
  const arm = useRef(new Animated.Value(0)).current;
  const [pageOpen, setPageOpen] = useState(!arriving);
  /* The player is not on the page until the record has gone: it is the same
     record, carried on into a bar once there is no deck left to look at. */
  const [playerUp, setPlayerUp] = useState(false);

  /* One deck for the page: the arm starts it, the bar carries on with it.
     Held above the early return below, because a hook that only sometimes
     runs is a hook that breaks the next render. */
  const player = useDeck(event?.playlist ?? []);
  const start = player.play;

  /* Beat two and beat three of an arrival. Both are on timers rather than on
     a callback because the thing they wait for is drawn by another screen. */
  /* Armed once. An arrival happens once, and a timer that re-arms would
     reach back in and start the deck again long after it was turned off. */
  const cued = useRef(false);
  useEffect(() => {
    if (!arriving || cued.current) return;
    cued.current = true;
    /* Ask the deck to play. The arm follows that on its own, below. */
    const cue = setTimeout(() => start(), ARM_AT);
    const page = setTimeout(() => setPageOpen(true), ARRIVE_PAGE);
    return () => {
      clearTimeout(cue);
      clearTimeout(page);
    };
  }, [arriving, start]);

  /* The bar can only be pressed once it is there. The opacity itself runs on
     the native driver off the scroll; this is only the touch target. */
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const up = value > width * 0.22;
      setPlayerUp((was) => (was === up ? was : up));
    });
    return () => scrollY.removeListener(id);
  }, [scrollY, width]);

  /* The hero is a collage at the comp's own 390-wide measurements. */
  const s = (value: number) => scaled(value, width);

  /**
   * The record answers to the hand on it.
   *
   * A press stops it. A push to either side slides the whole rack across —
   * the track before it and the track after it are sitting just off each
   * edge, so what comes into view as you push is the record you are asking
   * for, not a guess at one.
   *
   * The arm comes off the moment the push is taken and stays off until the
   * new record has arrived in the middle, because that is what has to happen
   * for a record to be changed. The sound is held rather than stopped, so the
   * deck is still a deck that is on, and it comes back when the arm lands.
   *
   * The push is only claimed once the finger is clearly sideways, so the page
   * still scrolls under a finger that started on the record.
   */
  const shove = useRef(new Animated.Value(0)).current;
  const [changing, setChanging] = useState(false);
  const hand = useRef({
    pitch: 0,
    take: () => {},
    settle: (_dir: number) => {},
  });
  hand.current.pitch = s(RECORD.size) + RACK_GAP;
  hand.current.take = () => {
    setChanging(true);
    player.hold(true);
  };
  hand.current.settle = (dir: number) => {
    if (dir === 0) {
      setChanging(false);
      return Animated.spring(shove, {
        toValue: 0,
        stiffness: 260,
        damping: 26,
        mass: 1,
        useNativeDriver: true,
      }).start();
    }
    /* Asking for a record is asking to hear it. The arm is held off by
       `changing` until it has arrived, so this only decides what happens
       when it lands. */
    player.play();
    Animated.timing(shove, {
      toValue: -dir * hand.current.pitch,
      duration: PUSH_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      /* The record that was beside it becomes the one in the middle, so the
         rack can go back to nought without anything appearing to move. */
      player.step(dir);
      shove.setValue(0);
      setChanging(false);
    });
  };

  const hands = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
      onPanResponderGrant: () => hand.current.take(),
      onPanResponderMove: (_, g) => shove.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        const far = Math.abs(g.dx) > SHOVE || Math.abs(g.vx) > 0.5;
        hand.current.settle(far ? (g.dx > 0 ? -1 : 1) : 0);
      },
      onPanResponderTerminate: () => hand.current.settle(0),
    }),
  ).current;

  /**
   * The arm is where the sound is. It lies across the record while the deck
   * is meant to be playing and goes back to its rest the moment it is not,
   * so stopping the record is a thing you watch happen rather than a thing
   * you infer from silence. It follows the deck's intent rather than what it
   * has managed to load, so it moves the moment it is asked — and it is held
   * off the record for as long as one is being changed.
   *
   * The sound comes back when the arm lands, not before: the needle reaching
   * the groove is what starts a record, and doing it the other way round
   * gives you a track playing under an arm still on its way down.
   */
  const land = useRef(() => {});
  land.current = () => player.hold(false);
  useEffect(() => {
    const down = player.intent && !changing;
    Animated.timing(arm, {
      toValue: down ? 1 : 0,
      duration: ARM_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && down) land.current();
    });
  }, [player.intent, changing, arm]);

  /* The record turns because it is playing — at 33 1/3 rpm, which is 1.8s a
     revolution. The disc and its label turn as one: each spins about its own
     centre, and the comp puts those centres on the same point. Tie it to the
     sound rather than to the page and the turning record becomes the thing
     that tells you whether anything is coming out of it. */
  const reducedMotion = useReducedMotion();
  const turning = player.playing;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion || !turning) return;
    const turn = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    turn.start();
    return () => turn.stop();
  }, [spin, reducedMotion, turning]);

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


  /* Each record wears the cover of the track it is. */
  const coverOf = (at: number) => {
    const many = event.playlist.length;
    const track = event.playlist[((at % many) + many) % many];
    return track?.artworkUrl ? artworkAt(track.artworkUrl, 600) : EVENT_LABEL;
  };
  const label = coverOf(player.index);
  const before = coverOf(player.index - 1);
  const after = coverOf(player.index + 1);
  const rack = s(RECORD.size) + RACK_GAP;

  const spinning = {
    transform: [
      {
        rotate: spin.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };
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
  /* The player comes up on the same stretch the record goes off the top of
     the screen on, so the hand-over reads as one object moving. */
  const playerRange = [width * 0.12, width * 0.45];
  const playerIn = scrollY.interpolate({
    inputRange: playerRange,
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const playerRise = scrollY.interpolate({
    inputRange: playerRange,
    outputRange: [28, 0],
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
          {/* blurRadius blurs inside the view, so the bitmap still ends on
              a straight edge. The sides are hung past the screen and the top
              and bottom are painted back into the page at full strength — a
              half-transparent page colour cannot hide an edge. */}
          <Animated.View
            style={{
              position: "absolute",
              left: -32,
              right: -32,
              top: s(7),
              height: s(340),
            }}
            pointerEvents="none"
          >
            <Image
              source={image("/assets/event-label.webp")}
              style={[StyleSheet.absoluteFill, styles.glow]}
              contentFit="cover"
              blurRadius={60}
            />
            <LinearGradient
              colors={[
                colors.bgPrimary,
                "transparent",
                "transparent",
                colors.bgPrimary,
              ]}
              locations={[0, 0.34, 0.66, 1]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {/* The rack. The record you are listening to is in the middle;
              the one before it and the one after it wait just off each edge,
              so a push brings the record you asked for into view rather than
              something standing in for it. Only the middle one turns. */}
          <Animated.View
            style={{
              position: "absolute",
              left: s(RECORD.left),
              top: s(RECORD.top),
              width: s(RECORD.size),
              height: s(RECORD.size),
              transform: [{ translateX: shove }],
            }}
            {...hands.panHandlers}
          >
            <View
              style={[styles.beside, { transform: [{ translateX: -rack }] }]}
              pointerEvents="none"
            >
              <Record label={before} />
            </View>
            <View
              style={[styles.beside, { transform: [{ translateX: rack }] }]}
              pointerEvents="none"
            >
              <Record label={after} />
            </View>
            <Tap
              accessibilityRole="button"
              accessibilityState={{ selected: player.playing }}
              accessibilityLabel={
                player.playing ? "Stop the record" : "Play the record"
              }
              onPress={player.toggle}
              scale={1}
              style={StyleSheet.absoluteFill}
            >
              <Record label={label} spin={spinning} />
            </Tap>
          </Animated.View>

          {/* The arm is drawn upright and laid across the disc, so it is
              turned in place inside a box the comp sizes for it. */}
          <Animated.View
            style={{
              position: "absolute",
              left: s(134),
              top: s(202),
              width: s(288.423),
              height: s(241.54),
              alignItems: "center",
              justifyContent: "center",
            }}
            pointerEvents="none"
          >
            <Animated.View
              style={{
                width: s(ARM_W),
                height: s(ARM_H),
                transform: [
                  /* Puts the pivot-turned arm back on the comp's mark. */
                  { translateX: s(ARM_FIX.x) },
                  { translateY: s(ARM_FIX.y) },
                  /* Turn about the pivot: to it, round, and back. */
                  { translateX: s(ARM_PIVOT.x) },
                  { translateY: s(ARM_PIVOT.y) },
                  {
                    rotate: arm.interpolate({
                      inputRange: [0, 1],
                      outputRange: [`${ARM_PARK}deg`, `${ARM_REST}deg`],
                    }),
                  },
                  { translateX: s(-ARM_PIVOT.x) },
                  { translateY: s(-ARM_PIVOT.y) },
                ],
              }}
            >
              <Image
                source={image("/assets/tonearm.webp")}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                transition={300}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>

        {/* Everything below the deck. On an arrival it is not rendered at all
            until the record has landed, so each block plays its own entrance
            from that moment rather than having played it behind the cover. */}
        {pageOpen && (
        <>
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
                    <Text variant="caption2" color={colors.contentSecondary}>
                      {tile.label}
                    </Text>
                    <Text variant="bodySBold">{tile.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Reveal>

        {/* Line-up */}
        <Reveal index={1} style={styles.section}>
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

        {/* Good to know — panels, two across. */}
        <Reveal index={2} style={styles.section}>
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
                    <Text variant="bodySBold">{info.title}</Text>
                    <Text variant="caption2" color={colors.contentSecondary}>
                      {info.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Reveal>

        {/* FAQs — the control is on the left, ahead of the question. */}
        <Reveal index={3} style={styles.section}>
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
        </>
        )}
        </Animated.ScrollView>
      </ScrollProvider>

      {/* The player, floated above the page as the web build floats it.
          It is not there while the deck is: the record at the top of the page
          is the record, and a second one in a bar underneath it would be two
          of the same thing. It slides up as the deck scrolls away, so there
          is always exactly one record on screen. */}
      {pageOpen && (
        <Animated.View
          style={[
            styles.player,
            {
              bottom: Math.max(insets.bottom, 20),
              opacity: playerIn,
              transform: [{ translateY: playerRise }],
            },
          ]}
          pointerEvents={playerUp ? "box-none" : "none"}
        >
          <MiniPlayer deck={player} />
        </Animated.View>
      )}

      {/* Close, not back: the page is a sheet over Discover in the comp. */}
      <Animated.View
        style={[styles.bar, { paddingTop: insets.top + space.s }]}
      >
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
      </Animated.View>
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
  glow: { opacity: 0.4 },
  disc: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  discLabel: {
    position: "absolute",
    left: `${LABEL.left * 100}%`,
    top: `${LABEL.top * 100}%`,
    width: `${LABEL.width * 100}%`,
    height: `${LABEL.height * 100}%`,
    /* A record's label is round, and a cover is square. The house rule
       squares everything that is not literally a circle; this is literally a
       circle. */
    borderRadius: 999,
    overflow: "hidden",
  },
  player: { position: "absolute", left: gutter, right: gutter, zIndex: 3 },
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
  beside: { ...StyleSheet.absoluteFill },
  barSolid: { backgroundColor: colors.bgSecondary },
});
