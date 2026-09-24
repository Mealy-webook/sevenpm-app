import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ShortcutAbout from "../../icons/ic-shortcut-about.svg";
import ShortcutDirections from "../../icons/ic-shortcut-directions.svg";
import ShortcutTickets from "../../icons/ic-shortcut-tickets.svg";
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
import { festivalCards } from "../../data/discover";

/**
 * Bookings, from Figma 462:70918.
 *
 * The screen it replaces (454:56720) put the title on its own lighter band
 * and drew the whole content region inside a hairline; this one does neither.
 * There is no top bar either — no wordmark, no Beats balance — so the page
 * opens on its own name at display size and goes straight into the filters.
 * Everything sits on one ground with nothing boxing it.
 *
 * A booking is a card, not a row: the event's artwork across the top at 3:2,
 * then its name at display size with its run in the accent colour and the
 * venue under it as a link, all ranged left, and then three bordered
 * shortcuts — About, Directions, Tickets. 489:61435 replaced the flat 106pt
 * row this screen used to draw.
 *
 * The three lines come from the festival the booking is for rather than from
 * the booking itself: the card names the event and its run, not the session
 * you hold a seat at.
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
                {shown.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    width={width}
                    onAbout={() =>
                      navigation.navigate("Event", { slug: booking.eventSlug })
                    }
                    onLocation={() =>
                      booking.venueUrl && Linking.openURL(booking.venueUrl)
                    }
                    onTickets={() =>
                      navigation.navigate("Tickets", { bookingId: booking.id })
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** One booking, as 489:61435 draws it. */
function BookingCard({
  booking,
  width,
  onAbout,
  onLocation,
  onTickets,
}: {
  booking: (typeof bookings)[number];
  width: number;
  onAbout: () => void;
  onLocation: () => void;
  onTickets: () => void;
}) {
  /* The card names the festival, so it reads the festival's own three lines
     rather than restating the booking's. */
  const festival = festivalCards.find((item) => item.slug === booking.eventSlug);
  const name = festival?.name ?? booking.eventName;
  const art = festival?.image ?? booking.image;

  return (
    <View style={styles.card}>
      <Image
        source={image(art)}
        style={styles.media}
        contentFit="cover"
        transition={300}
      />

      <View style={styles.cardBody}>
        <View>
          <Text
            variant="displayCard"
            uppercase
            color={colors.white}
            numberOfLines={2}
            style={displaySize(type.displayCard, width)}
          >
            {name}
          </Text>
          {festival?.dates && (
            <Text variant="bodyBold" color={colors.brand}>
              {festival.dates}
            </Text>
          )}
          {/* Underlined, because it opens the venue in maps. */}
          <Text
            variant="body"
            color={colors.contentSecondary}
            numberOfLines={1}
            style={styles.venue}
            onPress={onLocation}
          >
            {festival?.venue ?? booking.venue}
          </Text>
        </View>

        <View style={styles.shortcuts}>
          <Shortcut
            icon={ShortcutAbout}
            label={bookingsCopy.shortcuts.about}
            onPress={onAbout}
          />
          <Shortcut
            icon={ShortcutDirections}
            label={bookingsCopy.shortcuts.directions}
            onPress={onLocation}
          />
          <Shortcut
            icon={ShortcutTickets}
            label={bookingsCopy.shortcuts.tickets(booking.tickets.length)}
            onPress={onTickets}
          />
        </View>
      </View>
    </View>
  );
}

/** One of the three along the foot of a card: the glyph, then its word. */
function Shortcut({
  icon: Mark,
  label,
  onPress,
}: {
  icon: React.FC<SvgProps>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      scale={0.98}
      style={styles.shortcut}
    >
      <View style={styles.shortcutIcon}>
        <Mark width={24} height={24} />
      </View>
      <Text
        variant="bodyS"
        color={colors.white}
        numberOfLines={1}
        style={styles.centred}
      >
        {label}
      </Text>
    </Tap>
  );
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

  /* The comp's Product Card: one block on the secondary ground, square. */
  card: { backgroundColor: colors.bgSecondary },
  /* 349 x 233 in the file — 3:2 across the card's width. */
  media: { width: "100%", aspectRatio: 349 / 233, backgroundColor: colors.bgTertiary },
  /* 16 all round, and 16 between the words and the shortcuts under them. */
  cardBody: { padding: space.l, gap: space.l },
  venue: { textDecorationLine: "underline" },

  shortcuts: { flexDirection: "row", alignItems: "stretch", gap: space.m },
  /* Each is its own bordered box now, not a column between two rules. */
  shortcut: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: space.s,
    paddingHorizontal: space.s,
    paddingVertical: space.m,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDimmed,
  },
  shortcutIcon: { paddingHorizontal: space.m },
  centred: { textAlign: "center" },

});
