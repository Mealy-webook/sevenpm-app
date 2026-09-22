import { useRef, useState } from "react";
import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Close from "../../icons/ic-close.svg";
import MapPin from "../../icons/ic-map-pin.svg";
import ShareIcon from "../../icons/ic-share-20.svg";
import { Button } from "../../components/Button";
import { Page } from "../../components/Screen";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
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
 */
export function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Tickets">>();
  const booking = bookings.find((item) => item.id === params.bookingId);

  const [shown, setShown] = useState(0);
  const rail = useRef<ScrollView>(null);

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
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setShown(Math.round(event.nativeEvent.contentOffset.x / page));

  const ticket = booking.tickets[shown];
  const title = displaySize(type.displayCard, width);

  return (
    <Page>
      <ScrollView
        ref={rail}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={{ paddingTop: insets.top + BAR }}
      >
        {booking.tickets.map((item, index) => (
          <Sheet
            key={item.id}
            ticket={item}
            width={page}
            title={title}
            eventName={booking.eventName}
            day={day}
            venue={booking.venue}
            venueUrl={booking.venueUrl}
            label={ticketCopy.which(index + 1, booking.tickets.length)}
          />
        ))}
      </ScrollView>

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
        <Tap
          accessibilityRole="button"
          accessibilityLabel={ticketCopy.share}
          onPress={() =>
            ticket &&
            Share.share({
              message: `${booking.eventName} — ${day}\n${ticketCopy.code}: ${ticket.code}`,
            })
          }
          style={styles.barButton}
        >
          <ShareIcon width={20} height={20} />
        </Tap>
      </View>

      {/* The dots the rail is paged by, for a booking that has more than one. */}
      {booking.tickets.length > 1 && (
        <View style={[styles.dots, { bottom: Math.max(insets.bottom, 20) }]}>
          {booking.tickets.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === shown && styles.dotOn]}
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
  width,
  title,
  eventName,
  day,
  venue,
  venueUrl,
  label,
}: {
  ticket: Ticket;
  width: number;
  title: ReturnType<typeof displaySize>;
  eventName: string;
  day: string;
  venue: string;
  venueUrl?: string;
  label: string;
}) {
  /* The code fills the sheet's width less its padding, capped so it does not
     become the whole screen on a tablet. */
  const qr = Math.min(width - gutter * 2 - space.xl * 2, 260);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.sheetPage}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={label}
    >
      <View style={styles.sheet}>
        {/* The code, first and largest. */}
        <View style={styles.code}>
          <QRCode
            value={ticket.code}
            size={qr}
            color="#0b0b0e"
            backgroundColor="#ffffff"
          />
        </View>
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

      <Text variant="caption2" color={colors.contentSecondary} style={styles.note}>
        {ticketCopy.note}
      </Text>
    </ScrollView>
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

const styles = StyleSheet.create({
  empty: { paddingHorizontal: gutter },

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

  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: space.s,
  },
  dot: { width: 8, height: 8, backgroundColor: colors.overlay10 },
  dotOn: { width: 28, backgroundColor: colors.brand },
});
