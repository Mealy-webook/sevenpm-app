import { ScrollView, Share, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronRight from "../../icons/ic-chevron-right-16.svg";
import Clock from "../../icons/ic-clock-16.svg";
import Close from "../../icons/ic-close.svg";
import Pin from "../../icons/ic-pin-16.svg";
import ShareIcon from "../../icons/ic-share-20.svg";
import TicketIcon from "../../icons/ic-ticket-24.svg";
import { Button } from "../../components/Button";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import {
  bookings,
  bookingsCopy,
  eventDay,
  eventTime,
  walletCurrency,
} from "../../data/account";
import { initials, sendCopy } from "../../data/send";

/**
 * Where a send lands, from Figma 162:82059.
 *
 * It says the thing that matters first — sent — and then, immediately, the
 * thing that stops the reader panicking: it is still yours until they accept,
 * and you can pull it back. That line replaced "somebody needs to accept",
 * which stated the same fact without answering the question it raises.
 *
 * Then who has it, then what they have: the recipient in a card of their own
 * above the booking, because after sending a ticket away the first thing you
 * check is that it went to the right person, and only then which seat went.
 *
 * Both cards are drawn by their border alone, on the page's own ground.
 */
export function TicketSentScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "TicketSent">>();

  const booking = bookings.find((item) => item.id === params.bookingId);
  const sent = booking?.tickets.find((item) => item.id === params.ticketId);

  const close = () => navigation.navigate("Tabs");
  /* A link send has nobody to name, so the recipient card names the link. */
  const byLink = params.method === "link";

  return (
    <View style={styles.page}>
      <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={close}
          style={styles.barButton}
        >
          <Close width={20} height={20} />
        </Tap>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <Image
            source={image("/assets/sent-hands.png")}
            style={styles.art}
            contentFit="contain"
            transition={240}
          />
          <Text
            variant="displayNotice"
            uppercase
            color={colors.white}
            /* 489:61813 sets it on 65 with 0.8 of tracking, which is tighter
               and wider than the token's own 80. */
            style={[
              displaySize({ size: 80, line: 65, tracking: 0.8 }, width),
              styles.centred,
            ]}
          >
            {sendCopy.sent.title}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary} style={styles.centred}>
            {sendCopy.sent.pending}
          </Text>
        </View>

        <View style={styles.content}>
          <Text variant="bodyBold" color={colors.contentPrimary}>
            {sendCopy.sent.recipient}
          </Text>

          {/* Who has it — or, for a link, that nobody does yet. */}
          <View style={[styles.card, styles.recipient]}>
            <View style={styles.avatar}>
              {byLink ? (
                <ShareIcon width={20} height={20} />
              ) : (
                <Text variant="bodySBold" color={colors.contentPrimary}>
                  {initials(params.name ?? "")}
                </Text>
              )}
            </View>
            <View style={styles.rowBody}>
              <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                {byLink ? sendCopy.sent.anyone : params.name}
              </Text>
              <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
                {byLink ? params.link : params.email}
              </Text>
            </View>
          </View>

          {/* And what they have. */}
          {booking && (
            <View style={[styles.card, styles.bookingCard]}>
              <View style={styles.bookingRow}>
                <Image
                  source={image(booking.image)}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={240}
                />
                <View style={styles.bookingBody}>
                  <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                    {booking.eventName}
                  </Text>
                  <View style={styles.meta}>
                    <Clock width={16} height={16} />
                    <Text
                      variant="bodyS"
                      color={colors.contentSecondary}
                      numberOfLines={1}
                    >
                      {`${eventDay(booking.startsAt)} ${eventTime(booking.startsAt)} - ${eventTime(booking.endsAt)}`}
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
                  <Tap
                    accessibilityRole="button"
                    accessibilityLabel={bookingsCopy.tickets(booking.tickets.length)}
                    onPress={() =>
                      navigation.navigate("Tickets", { bookingId: booking.id })
                    }
                    scale={0.98}
                    style={styles.link}
                  >
                    <Text variant="bodyBold" color={colors.contentPrimary}>
                      {bookingsCopy.tickets(booking.tickets.length)}
                    </Text>
                    <ChevronRight width={16} height={16} />
                  </Tap>
                </View>
              </View>

              <View style={styles.tickets}>
                <Text variant="bodyBold" color={colors.contentPrimary}>
                  {sendCopy.sent.tickets(sent ? 1 : 0)}
                </Text>
                {sent && (
                  <View style={styles.ticketRow}>
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {sendCopy.sent.quantity(1)}
                    </Text>
                    <TicketIcon width={24} height={24} />
                    <Text
                      variant="body"
                      color={colors.contentPrimary}
                      numberOfLines={1}
                      style={styles.grow}
                    >
                      {sent.tier}
                    </Text>
                    <Text variant="bodyBold" color={colors.contentPrimary}>
                      {sent.price.toFixed(2)} {walletCurrency}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, space.m) }]}>
        {/* There is no message service behind this build, so the nudge closes
            the flow rather than claiming to have sent anything. */}
        <Button
          variant="brand"
          label={
            byLink
              ? sendCopy.sent.shareAgain
              : sendCopy.sent.inform(params.name ?? "")
          }
          onPress={
            byLink
              ? () => params.link && Share.share({ message: params.link })
              : close
          }
        />
        <Button variant="tertiary" label={sendCopy.sent.back} onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surfaceBase },
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

  body: { paddingBottom: space.section },
  head: {
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: gutter,
    paddingVertical: space.l,
  },
  /* 204 x 157 in the file. */
  art: { width: 204, height: 157, marginBottom: space.s },
  centred: { textAlign: "center", alignSelf: "stretch" },

  /* 24 across, 16 down, 16 between its parts. */
  content: {
    paddingHorizontal: space.xl,
    paddingVertical: space.l,
    gap: space.l,
  },
  /* Both cards are their border and nothing else — no fill, on the page. */
  card: {
    borderWidth: 1,
    borderColor: colors.borderTertiary,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
  },
  recipient: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
  },
  /* Round, because a face is — and grey, not the brand purple the seat row
     used to carry. */
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  rowBody: { flex: 1, minWidth: 0 },

  bookingCard: { padding: space.l, gap: space.l },
  bookingRow: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 44 },
  thumb: { width: 80, height: 80, backgroundColor: colors.bgTertiary },
  bookingBody: { flex: 1, minWidth: 0, gap: space.xs },
  meta: { flexDirection: "row", alignItems: "center", gap: space.xs },
  underline: { textDecorationLine: "underline" },
  link: { flexDirection: "row", alignItems: "center", gap: space.xs, alignSelf: "flex-start" },

  tickets: { gap: space.s },
  ticketRow: { flexDirection: "row", alignItems: "center", gap: space.s },
  grow: { flex: 1, minWidth: 0 },

  dock: { paddingHorizontal: gutter, paddingTop: space.s, gap: space.s },
});
