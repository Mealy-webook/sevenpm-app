import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronRight from "../../icons/ic-chevron-right-16.svg";
import Clock from "../../icons/ic-clock-16.svg";
import Pin from "../../icons/ic-pin-16.svg";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { bookings, bookingsCopy, loyaltyBalance } from "../../data/account";
import { discoverCopy } from "../../data/discover";

/**
 * Bookings, from Figma 454:56720.
 *
 * The title sits on its own lighter band, and everything below it is one
 * outlined area — the comp draws the whole content region inside a dimmed
 * hairline rather than boxing each booking. A booking is a flat row, not a
 * card: the poster, the name, when and where, and a single link into it.
 *
 * Upcoming and past are decided against the clock rather than stored on the
 * booking, so the filter stays honest the day this mock data is older than
 * the event it describes.
 */
export function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [filter, setFilter] = useState<string>(bookingsCopy.filters[0]);
  const tabScroll = useTabBarScroll();

  const now = Date.now();
  const shown = bookings.filter((booking) =>
    filter === "Upcoming"
      ? new Date(booking.endsAt).getTime() >= now
      : new Date(booking.endsAt).getTime() < now,
  );

  return (
    <View style={styles.page}>
      {/* Wordmark left, what there is to spend right — the same bar
          Discover carries, which 476:29659 gives this screen too. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
        <Image
          source={image("/assets/wordmark.png")}
          style={styles.wordmark}
          contentFit="contain"
          accessibilityLabel="SEVENPM"
        />
        <View style={styles.spacer} />
        <Button
          label={discoverCopy.beats(loyaltyBalance)}
          size="m"
          onPress={() => navigation.navigate("Rewards")}
        />
      </View>

      <View style={styles.header}>
        <Text
          variant="displayName"
          uppercase
          color={colors.white}
          numberOfLines={1}
          style={displaySize(type.displayName, width)}
        >
          {bookingsCopy.title}
        </Text>
      </View>

      <View style={styles.content}>
        <ScrollView
          {...tabScroll}
          contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_CLEARANCE }]}
        >
          <View style={styles.chips}>
            {bookingsCopy.filters.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={filter === item}
                onPress={() => setFilter(item)}
              />
            ))}
          </View>

          {shown.length === 0 ? (
            <EmptyState
              art="/assets/empty-bookings.png"
              width={138}
              height={94}
              title={bookingsCopy.empty}
              style={styles.nothing}
            />
          ) : (
            shown.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                /* The row's one action names the tickets, so it opens
                   them — the payment plan is reached from inside a ticket's
                   own booking rather than from the word "tickets". */
                onOpen={() =>
                  navigation.navigate("Tickets", { bookingId: booking.id })
                }
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/** One booking: the poster, what it is, when and where, and the way in. */
function BookingRow({
  booking,
  onOpen,
}: {
  booking: (typeof bookings)[number];
  onOpen: () => void;
}) {
  return (
    <View style={styles.row}>
      <Image
        source={image(booking.image)}
        style={styles.thumb}
        contentFit="cover"
        transition={300}
      />

      <View style={styles.rowBody}>
        <View style={styles.rowText}>
          <Text variant="bodyL" numberOfLines={1}>
            {booking.eventName}
          </Text>

          <View style={styles.metaGroup}>
            <View style={styles.meta}>
              <Clock width={16} height={16} />
              <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
                {when(booking.startsAt, booking.endsAt)}
              </Text>
            </View>
            <View style={styles.meta}>
              <Pin width={16} height={16} />
              <Text
                variant="bodyS"
                color={colors.contentSecondary}
                numberOfLines={1}
                style={styles.underline}
              >
                {booking.venue}
              </Text>
            </View>
          </View>
        </View>

        <Tap
          accessibilityRole="button"
          accessibilityLabel={bookingsCopy.tickets(booking.tickets.length)}
          onPress={onOpen}
          scale={0.98}
          style={styles.link}
        >
          <Text variant="bodyBold">{bookingsCopy.tickets(booking.tickets.length)}</Text>
          <ChevronRight width={16} height={16} />
        </Tap>
      </View>
    </View>
  );
}

/** "Wed, 11 Sep 7:00 PM - 9:30 PM", as the comp writes it. */
function when(startsAt: string, endsAt: string) {
  const starts = new Date(startsAt);
  const ends = new Date(endsAt);
  const day = starts.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} ${time(starts)} - ${time(ends)}`;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingHorizontal: gutter,
    paddingBottom: space.xs,
  },
  wordmark: { width: 98, height: 18 },
  spacer: { flex: 1 },
  /* The comp gives the empty state the whole of what is left below the
     chips, so it sits in the middle of the page rather than under them. */
  nothing: { minHeight: 320 },

  header: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 20,
    paddingBottom: space.l,
  },

  /* The comp outlines the whole content region, not each booking. */
  content: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.overlay5,
  },
  list: { padding: 20, gap: space.xl },
  chips: { flexDirection: "row", gap: space.xl },

  row: { flexDirection: "row", alignItems: "center", gap: space.l, minHeight: 44 },
  thumb: { width: 80, height: 80, backgroundColor: colors.bgTertiary },
  rowBody: { flex: 1, minWidth: 0, gap: space.s },
  rowText: { gap: space.xs },
  metaGroup: { gap: space.xs },
  meta: { flexDirection: "row", alignItems: "center", gap: space.xs },
  underline: { textDecorationLine: "underline" },
  link: { flexDirection: "row", alignItems: "center", gap: space.xs, alignSelf: "flex-start" },
});
