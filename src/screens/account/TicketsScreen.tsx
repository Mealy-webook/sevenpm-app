import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronLeft from "../../icons/ic-chevron-left-20.svg";
import ChevronRight from "../../icons/ic-chevron-right-20.svg";
import Info from "../../icons/ic-info-20.svg";
import { Segmented } from "../../components/Segmented";
import { Page } from "../../components/Screen";
import { Tap } from "../../components/Tap";
import { icon } from "../../icons";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { tap as haptic } from "../../theme/haptics";
import { ease, useReducedMotion } from "../../theme/motion";
import { colors, gutter, space } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { bookings, ticketCopy, walletCurrency } from "../../data/account";
import { jazzablanca } from "../../data/events";

/**
 * The tickets in a booking, from Figma 486:60153.
 *
 * This replaces a screen designed here before the comp existed, and the comp
 * disagrees with almost all of it. The ticket is not a sheet of perforated
 * paper — that is the rail card on the event page (426:50829), a different
 * object. This one is a card: a coloured header naming the seat and its
 * price, the code in the middle inside a dashed brand frame, the two things
 * you can do with it, and a way into the rules. Nothing is textured and
 * nothing is torn.
 *
 * The screen around it opens on the event — its artwork behind the name, then
 * the three facts somebody at a gate actually wants: which day, what time,
 * when the gates open. Tickets and addons are two tabs of one rail, because
 * they are both things you hold up and neither deserves its own screen.
 *
 * The rail is paged one card at a time and the bar under it says where you
 * are, which is the comp's own answer to a stack of five.
 *
 * **Motion is not in the comp**, which is a still. The cards arrive rather
 * than appear, and each fans as it leaves the middle, the way cards held in
 * one hand move against each other; the fan is read off the scroll offset so
 * it tracks a finger and reverses with it. Reduced motion keeps the paging
 * and drops both.
 */
export function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Tickets">>();
  const booking = bookings.find((item) => item.id === params.bookingId);

  const [tab, setTab] = useState("tickets");
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();
  const scrollX = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

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

  if (!booking) {
    return (
      <Page>
        <View style={[styles.gone, { paddingTop: insets.top + space.section }]}>
          <Text variant="body" color={colors.contentSecondary}>
            This booking is no longer listed.
          </Text>
        </View>
      </Page>
    );
  }

  const starts = new Date(booking.startsAt);
  const doors = new Date(booking.doorsAt);
  const time = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  /* Both tabs are the same object as far as the rail is concerned: a code,
     a seat and a price. */
  const items =
    tab === "tickets"
      ? booking.tickets.map((item) => ({
          id: item.id,
          code: item.code,
          seat: item.seat,
          price: item.price,
        }))
      : booking.addons.map((item) => ({
          id: item.id,
          code: item.code,
          seat: `${item.name} · ${item.seat}`,
          price: item.price,
        }));

  const card = width - gutter * 2;
  const step = card + space.m;
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / step);
    if (next === shown) return;
    haptic.tick();
    setShown(next);
  };

  const held = items[Math.min(shown, items.length - 1)];
  const sponsors = [jazzablanca.officialSponsor, ...jazzablanca.goldSponsors];

  return (
    <Page>
      {/* The event, behind its own name. */}
      <View style={styles.header}>
        {/* The booking's own poster rather than a fixed hero, so this works
            for whatever was booked — cropped to its top, which is where a
            poster is artwork rather than its own name. */}
        <Image
          source={image(booking.image)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
          transition={240}
        />
        <LinearGradient
          /* Heavy, because this artwork carries the festival's own wordmark
             and the bar sets the name over it. What the image has to do here
             is say which event at a glance, not be read. */
          colors={["rgba(11,11,14,0.82)", "rgba(11,11,14,0.96)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
          <Tap
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={navigation.goBack}
            style={styles.barButton}
          >
            <ChevronLeft width={20} height={20} color={colors.contentPrimary} />
          </Tap>
          <View style={styles.barTitle}>
            <Text variant="titleBody" uppercase numberOfLines={1}>
              {booking.eventName}
            </Text>
          </View>
          {/* The footprint the back control has, so the name stays centred
              on the screen rather than on what is left of the bar. */}
          <View style={styles.barSpacer} />
        </View>

        {/* Which day, what time, when the gates open. */}
        <View style={styles.facts}>
          <Fact
            label={ticketCopy.date}
            value={starts.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            })}
          />
          <Fact label={ticketCopy.time} value={time(starts)} />
          <Fact label={ticketCopy.gateOpen} value={time(doors)} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.tabs}>
          <Segmented
            options={[
              { id: "tickets", label: ticketCopy.tickets(booking.tickets.length) },
              { id: "addons", label: ticketCopy.addons(booking.addons.length) },
            ]}
            value={tab}
            onChange={(next) => {
              setTab(next);
              setShown(0);
              scrollX.setValue(0);
            }}
          />
        </View>

        <Animated.View
          style={{
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [ENTER_RISE, 0],
                }),
              },
            ],
          }}
        >
          <Animated.ScrollView
            key={tab}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            decelerationRate="fast"
            onMomentumScrollEnd={onScroll}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            contentContainerStyle={styles.rail}
          >
            {items.map((item, index) => (
              <TicketCard
                key={item.id}
                seat={item.seat}
                price={item.price}
                code={item.code}
                index={index}
                width={card}
                step={step}
                scrollX={scrollX}
                still={reduced !== false}
                label={ticketCopy.which(index + 1, items.length)}
                onSend={() =>
                  Share.share({
                    message: `${booking.eventName}\n${item.seat}\n${ticketCopy.number(item.code)}`,
                  })
                }
                onSell={() =>
                  navigation.navigate("Tabs", { screen: "Resale" } as never)
                }
              />
            ))}
          </Animated.ScrollView>
        </Animated.View>

        {/* Where you are in the stack. */}
        {items.length > 1 && (
          <View style={styles.progress}>
            <View style={styles.track}>
              <View
                style={[
                  styles.range,
                  { width: `${((shown + 1) / items.length) * 100}%` },
                ]}
              />
            </View>
            <Text variant="bodyS" color={colors.contentPrimary}>
              {ticketCopy.position(shown + 1, items.length)}
            </Text>
          </View>
        )}

        <View style={styles.sponsors}>
          <Text variant="titleSection" uppercase color={colors.contentPrimary}>
            {ticketCopy.sponsors}
          </Text>
          <View style={styles.tiles}>
            {sponsors.map((sponsor) => {
              const Logo = icon(sponsor.logo);
              return (
                <View key={sponsor.name} style={styles.tile}>
                  {Logo && <Logo width={56} height={28} />}
                  <Text
                    variant="caption2"
                    color={colors.contentSecondary}
                    numberOfLines={1}
                  >
                    {sponsor.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Read by anything that announces the screen. */}
      <View style={styles.hidden} accessibilityElementsHidden>
        <Text variant="caption">{held?.code}</Text>
      </View>
    </Page>
  );
}

/** One of the three facts above the rail. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text variant="caption2Bold" uppercase color={colors.contentPrimary}>
        {label}
      </Text>
      <Text variant="bodyBold" color={colors.contentPrimary}>
        {value}
      </Text>
    </View>
  );
}

/**
 * One ticket.
 *
 * Everything below the header sits on white, so its ink and its two buttons
 * are spelled out here rather than taken from the dark-surface tokens — the
 * same thing `TicketStub` does for the same reason.
 */
function TicketCard({
  seat,
  price,
  code,
  index,
  width,
  step,
  scrollX,
  still,
  label,
  onSell,
  onSend,
}: {
  seat: string;
  price: number;
  code: string;
  index: number;
  width: number;
  step: number;
  scrollX: Animated.Value;
  still: boolean;
  label: string;
  onSell: () => void;
  onSend: () => void;
}) {
  const at = [(index - 1) * step, index * step, (index + 1) * step];
  const fan = still
    ? null
    : {
        opacity: scrollX.interpolate({
          inputRange: at,
          outputRange: [FAN_DIM, 1, FAN_DIM],
          extrapolate: "clamp" as const,
        }),
        transform: [
          {
            scale: scrollX.interpolate({
              inputRange: at,
              outputRange: [FAN_SCALE, 1, FAN_SCALE],
              extrapolate: "clamp" as const,
            }),
          },
        ],
      };

  return (
    <Animated.View
      style={[styles.card, { width }, fan]}
      accessibilityLabel={label}
    >
      <View style={styles.cardHead}>
        <Text
          variant="bodyBold"
          color={colors.white}
          numberOfLines={1}
          style={styles.cardSeat}
        >
          {seat}
        </Text>
        <Text variant="bodyBold" color={colors.white}>
          {price.toFixed(2)} {walletCurrency}
        </Text>
      </View>

      <View style={styles.cardBody}>
        {/* The comp frames the code in a dashed brand border. */}
        <View style={styles.qrFrame}>
          <QRCode value={code} size={QR} color={INK} backgroundColor={PAPER} />
        </View>
        <Text variant="caption" color={INK}>
          {ticketCopy.number(code)}
        </Text>
      </View>

      <View style={styles.dock}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel={ticketCopy.sell}
          onPress={onSell}
          style={[styles.action, styles.sell]}
        >
          <Text variant="bodyL" color={INK} style={styles.actionLabel}>
            {ticketCopy.sell}
          </Text>
        </Tap>
        <Tap
          accessibilityRole="button"
          accessibilityLabel={ticketCopy.send}
          onPress={onSend}
          style={[styles.action, styles.send]}
        >
          <Text variant="bodyL" color={INK} style={styles.actionLabel}>
            {ticketCopy.send}
          </Text>
        </Tap>
      </View>

      <View style={styles.instructions}>
        <Info width={20} height={20} color={INK_SECONDARY} />
        <Text variant="body" color={INK} style={styles.instructionsLabel}>
          {ticketCopy.instructions}
        </Text>
        <ChevronRight width={20} height={20} color={INK_SECONDARY} />
      </View>
    </Animated.View>
  );
}

/** The comp's code, and the light surface it is printed on. */
const QR = 162;
const PAPER = "#ffffff";
const INK = "#18181b";
const INK_SECONDARY = "#52525b";
/** backgrounds/bg-tertiary on a light surface — the instructions bar. */
const INSTRUCTIONS_BG = "#d4d4d8";

const ENTER_MS = 620;
const ENTER_RISE = 40;
const FAN_SCALE = 0.94;
const FAN_DIM = 0.6;

const styles = StyleSheet.create({
  gone: { paddingHorizontal: gutter },
  hidden: { height: 0, overflow: "hidden" },

  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDimmed,
    paddingBottom: space.l,
  },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: gutter },
  barButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  barSpacer: { width: 40, height: 40 },
  barTitle: { flex: 1, minWidth: 0, alignItems: "center", paddingHorizontal: space.m },

  /* Three cells sharing the width, each centred on its own label. */
  facts: { flexDirection: "row", gap: space.s, paddingHorizontal: gutter, paddingTop: space.l },
  fact: { flex: 1, minWidth: 0, alignItems: "center" },

  page: { paddingBottom: space.section, gap: space.l },
  tabs: { paddingHorizontal: gutter, paddingTop: space.l },
  rail: { paddingHorizontal: gutter, gap: space.m },

  /* The card. Square, as everything here is, and shadowed the way the comp
     lifts it off the page. */
  card: {
    overflow: "hidden",
    backgroundColor: PAPER,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
    backgroundColor: colors.brand2,
  },
  cardSeat: { flex: 1, minWidth: 0 },

  cardBody: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.l,
    paddingHorizontal: space.l,
    paddingVertical: space.xl,
  },
  qrFrame: { borderWidth: 4, borderColor: colors.brand, borderStyle: "dashed" },

  dock: { flexDirection: "row", gap: space.s, padding: space.s },
  action: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
    paddingVertical: space.l,
  },
  /* The comp's secondary button on a light surface: a wash of black rather
     than of white, so the paper shows through its edges. */
  sell: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
  },
  send: { backgroundColor: colors.brand },
  actionLabel: { fontWeight: "600" },

  instructions: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    backgroundColor: INSTRUCTIONS_BG,
  },
  instructionsLabel: { flex: 1, minWidth: 0 },

  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: gutter,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: colors.overlay10,
    borderRadius: 2,
    overflow: "hidden",
  },
  /* Rounded because the comp draws it as a pill, which is one of the few
     things here that literally is. */
  range: { height: 4, backgroundColor: colors.white, borderRadius: 2 },

  sponsors: { paddingHorizontal: gutter, paddingTop: space.l, gap: space.l },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: space.m },
  tile: {
    width: 80,
    alignItems: "center",
    gap: space.s,
    paddingVertical: space.m,
    backgroundColor: colors.bgSecondary,
  },
});
