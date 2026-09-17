import { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Navigate from "../../icons/ic-navigate-20.svg";
import Ticket from "../../icons/ic-ticket-16.svg";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { bookings, bookingsCopy } from "../../data/account";

/**
 * Bookings, from Figma 2173:25780 / 2173:25975.
 *
 * Upcoming and past are decided against the clock rather than stored on the
 * booking, so the filter stays honest the day this mock data is older than
 * the event it describes.
 */
export function BookingsScreen() {
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={styles.page}
      {...tabScroll}
      contentContainerStyle={[
        styles.body,
        { paddingTop: insets.top + space.l, paddingBottom: TAB_BAR_CLEARANCE },
      ]}
    >
      <Text variant="sectionTitle" uppercase>
        {bookingsCopy.title}
      </Text>
      <Text variant="body" color={colors.contentSecondary}>
        {bookingsCopy.description}
      </Text>

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
        <Text variant="bodyBold" color={colors.contentSecondary}>
          {bookingsCopy.empty}
        </Text>
      ) : (
        shown.map((booking) => {
          const starts = new Date(booking.startsAt);
          return (
            <View key={booking.id} style={styles.card}>
              <Image
                source={image(booking.image)}
                style={styles.poster}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.cardBody}>
                <Text variant="titleBody" uppercase numberOfLines={1}>
                  {booking.eventName}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {starts.toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={2}>
                  {booking.venue}
                </Text>
                <View style={styles.tickets}>
                  <Ticket width={16} height={16} />
                  <Text variant="bodySBold">
                    {booking.tickets} {booking.tickets === 1 ? "ticket" : "tickets"}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Button
                    label="View event"
                    onPress={() =>
                      navigation.navigate("Event", { slug: booking.eventSlug })
                    }
                  />
                  {booking.venueUrl && (
                    <Button
                      label="Directions"
                      icon={Navigate}
                      onPress={() => Linking.openURL(booking.venueUrl!)}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  body: { paddingHorizontal: gutter, gap: space.l },
  chips: { flexDirection: "row", gap: space.s },

  card: {
    flexDirection: "row",
    gap: space.l,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },
  poster: { width: 92, height: 130, backgroundColor: colors.bgTertiary },
  cardBody: { flex: 1, minWidth: 0, gap: space.xs },
  tickets: { flexDirection: "row", alignItems: "center", gap: space.xs },
  actions: { flexDirection: "row", gap: space.s, marginTop: space.s, flexWrap: "wrap" },
});
