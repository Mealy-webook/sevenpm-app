import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Close from "../../icons/ic-close.svg";
import MapPin from "../../icons/ic-map-pin.svg";
import { Button } from "../../components/Button";
import { Page } from "../../components/Screen";
import { Tap } from "../../components/Tap";
import { Text } from "../../theme/Text";
import { tap as haptic } from "../../theme/haptics";
import { ease, useReducedMotion } from "../../theme/motion";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { bookings, ticketCopy, type Ticket } from "../../data/account";

/**
 * The tickets in a booking, one sheet at a time.
 *
 * No comp draws this — it is designed here, from the pieces the app already
 * has, and the one decision that matters is what the screen is *for*. It is
 * held up at a gate, in the dark, by someone who is being waved forward. So
 * the code is the screen: a white sheet, the QR as large as the width allows,
 * and nothing above it to scroll past. Everything a person might want to read
 * — who it admits, which gate, when the doors open — is underneath it, where
 * it can be found but cannot get in the way.
 *
 * A booking can hold several tickets and they are paged sideways, one to a
 * screen, because two people at a gate hand over one ticket each and a list
 * you scroll is the wrong shape for that. The counter says which of how many.
 *
 * The sheet is white and stays white. Everything else in this app is dark,
 * and this is the one screen where that would be a problem: scanners want
 * contrast and phones dim themselves, so the ticket borrows none of the
 * page's colour.
 *
 * **It behaves like a thing rather than a page.** One idea, in four parts:
 * the tickets arrive rather than appear, rising and settling as a hand brings
 * them up; the code is issued a beat after the sheet lands, so the sheet is
 * paper first and a ticket second; swiping fans them, each sheet tilting and
 * dropping back as it leaves the middle, the way cards held in one hand move
 * against each other; and light crosses whichever one is being held, once,
 * when it arrives. None of it is decoration hung on the screen — it is the
 * screen admitting what it is, which is a piece of paper somebody is about to
 * hold up in the dark.
 *
 * The fan is driven by the scroll offset rather than by a timer, so it tracks
 * a finger exactly and reverses when the finger does. Reduced motion keeps
 * the paging and drops all four.
 */
export function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Tickets">>();
  const booking = bookings.find((item) => item.id === params.bookingId);

  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();
  /* Where the rail is, in pixels — every sheet's tilt is read off this. */
  const scrollX = useRef(new Animated.Value(0)).current;
  /* The whole rail arriving, and the code arriving after it. */
  const enter = useRef(new Animated.Value(0)).current;
  /* Light crossing the sheet in the middle. Restarted when that changes. */
  const sheen = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) return enter.setValue(1);
    const run = Animated.timing(enter, {
      toValue: 1,
      duration: ENTER_MS,
      easing: ease,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [reduced, enter]);

  useEffect(() => {
    if (reduced !== false) return;
    sheen.setValue(0);
    const run = Animated.timing(sheen, {
      toValue: 1,
      duration: SHEEN_MS,
      delay: SHEEN_AT,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [shown, reduced, sheen]);

  if (!booking) {
    return (
      <Page>
        <View style={[styles.empty, { paddingTop: insets.top + space.section }]}>
          <Text variant="body" color={colors.contentSecondary}>
            This booking is no longer listed.
          </Text>
        </View>
      </Page>
    );
  }

  const starts = new Date(booking.startsAt);
  const day = starts.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  /* One ticket to a screen, so the page is the ticket. */
  const page = width;
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / page);
    if (next === shown) return;
    /* One ticket has become the one being held. */
    haptic.tick();
    setShown(next);
  };

  const ticket = booking.tickets[shown];
  const title = displaySize(type.displayCard, width);

  return (
    <Page>
      {/* The tickets coming up into the hand. */}
      <Animated.View
        style={[
          styles.rail,
          {
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [ENTER_RISE, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          contentContainerStyle={{ paddingTop: insets.top + BAR }}
        >
          {booking.tickets.map((item, index) => (
            <Sheet
              key={item.id}
              ticket={item}
              index={index}
              width={page}
              scrollX={scrollX}
              enter={enter}
              sheen={sheen}
              active={index === shown}
              still={reduced !== false}
              title={title}
              eventName={booking.eventName}
              day={day}
              venue={booking.venue}
              venueUrl={booking.venueUrl}
              label={ticketCopy.which(index + 1, booking.tickets.length)}
              onSend={() =>
                Share.share({
                  message: `${booking.eventName} — ${day}\n${ticketCopy.code}: ${item.code}`,
                })
              }
              /* Resale has no screens yet. The tab says so plainly, which is
                 a truer answer than a button that does nothing. */
              onResell={() =>
                navigation.navigate("Tabs", { screen: "Resale" } as never)
              }
            />
          ))}
        </Animated.ScrollView>
      </Animated.View>

      {/* Which of how many, and the way out of this booking's tickets. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.s }]}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={navigation.goBack}
          style={styles.barButton}
        >
          <Close width={20} height={20} />
        </Tap>
        <View style={styles.barTitle}>
          <Text variant="titleBody" uppercase numberOfLines={1}>
            {booking.tickets.length > 1
              ? ticketCopy.which(shown + 1, booking.tickets.length)
              : ticketCopy.title}
          </Text>
        </View>
        {/* Sending is a named action on the ticket itself now, not an icon
            up here. The space it held stays, so the title is still centred on
            the screen rather than on what is left of the bar. */}
        <View style={styles.barSpacer} />
      </View>

      {/* The dots the rail is paged by, for a booking that has more than one. */}
      {booking.tickets.length > 1 && (
        <View style={[styles.dots, { bottom: Math.max(insets.bottom, 20) }]}>
          {booking.tickets.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.dot,
                reduced !== false
                  ? index === shown
                    ? null
                    : styles.dotOff
                  : {
                      opacity: scrollX.interpolate({
                        inputRange: span(index, page),
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                      }),
                      transform: [
                        {
                          scaleX: scrollX.interpolate({
                            inputRange: span(index, page),
                            outputRange: [DOT / DOT_ON, 1, DOT / DOT_ON],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                    },
              ]}
            />
          ))}
        </View>
      )}
    </Page>
  );
}

/** One ticket, filling one screen. */
function Sheet({
  ticket,
  index,
  width,
  scrollX,
  enter,
  sheen,
  active,
  still,
  title,
  eventName,
  day,
  venue,
  venueUrl,
  label,
  onSend,
  onResell,
}: {
  ticket: Ticket;
  index: number;
  width: number;
  scrollX: Animated.Value;
  enter: Animated.Value;
  sheen: Animated.Value;
  /** Whether this is the one being held. */
  active: boolean;
  /** Reduced motion, or the setting not yet known. */
  still: boolean;
  title: ReturnType<typeof displaySize>;
  eventName: string;
  day: string;
  venue: string;
  venueUrl?: string;
  label: string;
  onSend: () => void;
  onResell: () => void;
}) {
  /* The code fills the sheet's width less its padding, capped so it does not
     become the whole screen on a tablet. */
  const qr = Math.min(width - gutter * 2 - space.xl * 2, 260);
  const sheetWidth = width - gutter * 2;

  /**
   * The fan: read straight off the rail's offset, so it tracks the finger and
   * reverses with it. A sheet leaving the middle tips away, drops back and
   * dims — the three things a card does when another is brought in front of
   * it. Clamped, so a sheet two along does not keep tipping.
   */
  const at = span(index, width);
  const fan = still
    ? null
    : {
        opacity: scrollX.interpolate({
          inputRange: at,
          outputRange: [FAN_DIM, 1, FAN_DIM],
          extrapolate: "clamp",
        }),
        transform: [
          {
            translateY: scrollX.interpolate({
              inputRange: at,
              outputRange: [FAN_DROP, 0, FAN_DROP],
              extrapolate: "clamp",
            }),
          },
          {
            rotate: scrollX.interpolate({
              inputRange: at,
              outputRange: [`${FAN_TILT}deg`, "0deg", `-${FAN_TILT}deg`],
              extrapolate: "clamp",
            }),
          },
          {
            scale: scrollX.interpolate({
              inputRange: at,
              outputRange: [FAN_SCALE, 1, FAN_SCALE],
              extrapolate: "clamp",
            }),
          },
        ],
      };

  /* The code is issued after the sheet has landed, so the sheet is paper
     first and a ticket second. */
  const issued = enter.interpolate({
    inputRange: [ISSUE_AT, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[{ width }, fan]}>
    <ScrollView
      contentContainerStyle={styles.sheetPage}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={label}
    >
      <View style={styles.sheet}>
        {/* Light crossing the sheet, once, as it arrives. Only on the one
            being held — the others are not being looked at. */}
        {active && !still && (
          <Animated.View
            style={[
              styles.sheen,
              {
                transform: [
                  {
                    translateX: sheen.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-SHEEN_W, sheetWidth + SHEEN_W],
                    }),
                  },
                  { rotate: "18deg" },
                ],
                opacity: sheen.interpolate({
                  inputRange: [0, 0.12, 0.88, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {/* The code, first and largest. */}
        <Animated.View
          style={[
            styles.code,
            still
              ? null
              : {
                  opacity: issued,
                  transform: [
                    {
                      scale: issued.interpolate({
                        inputRange: [0, 1],
                        outputRange: [ISSUE_SCALE, 1],
                      }),
                    },
                  ],
                },
          ]}
        >
          <QRCode
            value={ticket.code}
            size={qr}
            color="#0b0b0e"
            backgroundColor="#ffffff"
          />
        </Animated.View>
        <Text variant="bodySBold" color="#0b0b0e" style={styles.codeText}>
          {ticket.code}
        </Text>
        <Text variant="caption2" color="#52525b" style={styles.centred}>
          {ticketCopy.scan}
        </Text>

        {/* The perforation: this sheet's one borrowed detail from the paper
            ticket on the event page, and the line the eye stops at. Punched
            rather than dashed — a 1px dashed border does not draw reliably on
            iOS, and the app squares everything anyway. */}
        <View style={styles.tear}>
          {Array.from({ length: 24 }).map((_, index) => (
            <View key={index} style={styles.punch} />
          ))}
        </View>

        <Text variant="displayCard" uppercase color="#0b0b0e" style={[title, styles.centred]}>
          {eventName}
        </Text>
        <Text variant="bodyBold" color="#0b0b0e" style={styles.centred}>
          {day} · {ticket.entry}
        </Text>
        <Tap
          accessibilityRole="link"
          disabled={!venueUrl}
          onPress={() => venueUrl && Linking.openURL(venueUrl)}
          scale={0.99}
          style={styles.venue}
        >
          <MapPin width={16} height={16} color="#52525b" />
          <Text variant="bodyS" color="#52525b" style={styles.venueName}>
            {venue}
          </Text>
        </Tap>

        <View style={styles.facts}>
          <Fact label={ticketCopy.holder} value={ticket.holder} />
          <Fact label={ticketCopy.tier} value={ticket.tier} />
          <Fact label={ticketCopy.gate} value={ticket.gate} />
          <Fact label={ticketCopy.entry} value={ticket.entry} />
        </View>
      </View>

      {/* The two things you can do with the ticket above. They live on the
          sheet rather than in the bar because they act on *this* ticket, and
          the rail is one ticket to a page. */}
      <View style={styles.actions}>
        <Button variant="primary" label={ticketCopy.send} onPress={onSend} />
        <Button label={ticketCopy.resell} onPress={onResell} />
      </View>

      <Text variant="caption2" color={colors.contentSecondary} style={styles.note}>
        {ticketCopy.note}
      </Text>
    </ScrollView>
    </Animated.View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text variant="caption2" color="#52525b">
        {label}
      </Text>
      <Text variant="bodySBold" color="#0b0b0e">
        {value}
      </Text>
    </View>
  );
}

/** The floating bar's own height, so the rail starts clear of it. */
const BAR = 52;

/** The tickets coming up into the hand. */
const ENTER_MS = 620;
const ENTER_RISE = 40;
/** How far through that the code is issued, and the size it comes up from. */
const ISSUE_AT = 0.45;
const ISSUE_SCALE = 0.82;

/** Light crossing the sheet being held: when, how long, how wide. */
const SHEEN_AT = 260;
const SHEEN_MS = 900;
const SHEEN_W = 120;

/** What a sheet does as it leaves the middle. */
const FAN_TILT = 4;
const FAN_DROP = 26;
const FAN_SCALE = 0.9;
const FAN_DIM = 0.55;

/** The paging dots, resting and held. */
const DOT = 8;
const DOT_ON = 28;

/**
 * The rail offsets at which a sheet is one to the left, centred, and one to
 * the right — the input range everything about it is read off.
 */
function span(index: number, page: number) {
  return [(index - 1) * page, index * page, (index + 1) * page];
}

const styles = StyleSheet.create({
  empty: { paddingHorizontal: gutter },
  rail: { flex: 1 },

  sheetPage: {
    paddingHorizontal: gutter,
    paddingTop: space.l,
    paddingBottom: space.section * 2,
    gap: space.l,
  },
  /* White, and staying white: a scanner wants contrast and a phone dims
     itself, so this one sheet borrows nothing from the page under it. */
  sheet: {
    backgroundColor: "#ffffff",
    padding: space.xl,
    gap: space.m,
    alignItems: "center",
    /* The light has to stop at the paper's edge. */
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    top: -SHEEN_W,
    bottom: -SHEEN_W,
    left: 0,
    width: SHEEN_W,
  },
  code: { padding: space.m, backgroundColor: "#ffffff" },
  codeText: { letterSpacing: 1.5, textAlign: "center" },
  centred: { textAlign: "center", alignSelf: "stretch" },

  /* A row of punches, the way the paper ticket is perforated. */
  tear: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: space.m,
  },
  punch: { width: 6, height: 2, backgroundColor: "#d4d4d8" },

  venue: { flexDirection: "row", alignItems: "center", gap: space.xs },
  venueName: { textDecorationLine: "underline" },

  facts: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: space.s,
  },
  fact: { width: "50%", paddingVertical: space.s, gap: 2 },

  actions: { gap: space.m },
  note: { paddingHorizontal: space.xs },

  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: gutter,
    paddingBottom: space.s,
    backgroundColor: colors.bgPrimary,
  },
  barButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  barTitle: { flex: 1, minWidth: 0, alignItems: "center", paddingHorizontal: space.m },
  /* The footprint the share control had, so the title stays centred. */
  barSpacer: { width: 40, height: 40 },

  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: space.s,
  },
  /* One size, scaled down when it is not the one being held, because width
     cannot be animated off the main thread and scaleX can. */
  dot: { width: DOT_ON, height: DOT, backgroundColor: colors.brand },
  dotOff: { opacity: 0.3, transform: [{ scaleX: DOT / DOT_ON }] },
});
