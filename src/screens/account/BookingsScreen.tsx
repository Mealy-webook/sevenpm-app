import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronRight from "../../icons/ic-chevron-right-20.svg";
import Clock from "../../icons/ic-clock-16.svg";
import Pin from "../../icons/ic-pin-16.svg";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { SignedOut } from "../../components/SignedOut";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { useSession } from "../../session";
import { signedOutCopy } from "../../data/session";
import { bookings, bookingsCopy } from "../../data/account";

/**
 * Bookings, from Figma 462:70918.
 *
 * The screen it replaces (454:56720) put the title on its own lighter band
 * and drew the whole content region inside a hairline; this one does neither.
 * There is no top bar either — no wordmark, no Beats balance — so the page
 * opens on its own name at display size and goes straight into the filters.
 * Everything sits on one ground with nothing boxing it.
 *
 * A booking is a flat row: a 106pt poster, the name in title type, when and
 * where, and a single link into the tickets. Rows are separated by a rule
 * rather than by being carded.
 *
 * Upcoming and past are decided against the clock rather than stored on the
 * booking, so the filter stays honest the day this mock data is older than
 * the event it describes.
 *
 * **Signed out there is nothing here that belongs to anybody**, so the
 * filters go with the list and the page offers the way in instead. The title
 * stays: it is the name of the page, not a claim about the reader.
 */
export function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [filter, setFilter] = useState<string>(bookingsCopy.filters[0]);
  const tabScroll = useTabBarScroll();
  const { signedIn } = useSession();

  const now = Date.now();
  const shown = bookings.filter((booking) =>
    filter === "Upcoming"
      ? new Date(booking.endsAt).getTime() >= now
      : new Date(booking.endsAt).getTime() < now,
  );

  return (
    <View style={styles.page}>
      <ScrollView
        {...tabScroll}
        contentContainerStyle={[
          styles.section,
          { paddingTop: insets.top + gutter, paddingBottom: TAB_BAR_CLEARANCE },
        ]}
      >
        <Text
          variant="displayName"
          uppercase
          color={colors.white}
          numberOfLines={1}
          style={displaySize(type.displayName, width)}
        >
          {bookingsCopy.title}
        </Text>

        {!signedIn ? (
          <SignedOut
            art="/assets/empty-bookings.png"
            width={138}
            height={94}
            title={signedOutCopy.bookings}
            style={styles.nothing}
          />
        ) : (
          <>
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
              <View style={styles.list}>
                {shown.map((booking, index) => (
                  <View key={booking.id} style={styles.listItem}>
                    {index > 0 && <View style={styles.divider} />}
                    <BookingRow
                      booking={booking}
                      /* The row's one action names the tickets, so it opens
                         them — the payment plan is reached from inside a
                         ticket's own booking rather than from the word
                         "tickets". */
                      onOpen={() =>
                        navigation.navigate("Tickets", { bookingId: booking.id })
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
          <Text variant="titleBody" uppercase color={colors.white} numberOfLines={1}>
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
          <Text variant="bodyLBold">{bookingsCopy.tickets(booking.tickets.length)}</Text>
          <ChevronRight width={20} height={20} />
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
  /* The comp's one Section: 20 all round, 16 between everything in it. */
  section: { flexGrow: 1, paddingHorizontal: gutter, gap: space.l },
  chips: { flexDirection: "row", gap: space.m },
  /* Whatever is left below the title, so a page with nothing on it centres
     that nothing rather than hanging it under the chips. */
  nothing: { minHeight: 320 },

  list: { gap: space.l },
  /* The rule belongs to the row below it, so the gap either side of it is
     the list's own 16 rather than something the divider adds. */
  listItem: { gap: space.l },
  divider: { height: 1, backgroundColor: colors.overlay5 },

  row: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 44 },
  thumb: { width: 106, height: 106, backgroundColor: colors.bgTertiary },
  rowBody: { flex: 1, minWidth: 0, gap: space.s },
  rowText: { gap: space.s },
  metaGroup: { gap: space.xs },
  meta: { flexDirection: "row", alignItems: "center", gap: space.xs },
  underline: { textDecorationLine: "underline" },
  link: { flexDirection: "row", alignItems: "center", gap: space.s, alignSelf: "flex-start" },
});
