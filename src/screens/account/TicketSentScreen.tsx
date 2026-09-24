import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Close from "../../icons/ic-close.svg";
import Copy from "../../icons/ic-copy-20.svg";
import Help from "../../icons/ic-help-20.svg";
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
  eventTime,
  walletCurrency,
} from "../../data/account";
import { initials, sendCopy } from "../../data/send";

/**
 * Where a send lands — 162:82059 for an email, 161:65552 for a link.
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
 *
 * **The two landings are one screen.** Everything below the head is the same
 * booking card, and the head is where they differ: an email names the person
 * who has to accept, a link names nobody and shows the link instead, with the
 * two things a bearer link has to say — anyone who opens it can claim, and it
 * does not last. The link screen also carries a help control, which the email
 * one does not.
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
        <View style={styles.grow} />
        {/* 161:65552 puts a help control opposite the close; the email
            landing has none. Nothing explains a link yet, so it is drawn and
            does not take presses. */}
        {byLink && (
          <View style={styles.barButton}>
            <Help width={20} height={20} />
          </View>
        )}
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
            {byLink ? sendCopy.link.title : sendCopy.sent.title}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary} style={styles.centred}>
            {byLink ? sendCopy.link.pending : sendCopy.sent.pending}
          </Text>
        </View>

        <View style={styles.content}>
          {byLink ? (
            <>
              {/* The link itself, with the one control that matters on it. */}
              <View style={styles.linkField}>
                <Text
                  variant="bodyL"
                  color={colors.contentPrimary}
                  numberOfLines={1}
                  style={styles.grow}
                >
                  {params.link}
                </Text>
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={sendCopy.link.copy}
                  onPress={() => params.link && Clipboard.setStringAsync(params.link)}
                  style={styles.linkCopy}
                >
                  <Copy width={20} height={20} />
                </Tap>
              </View>
              <Text
                variant="bodyS"
                color={colors.contentSecondary}
                style={styles.centred}
              >
                {sendCopy.link.warning}
              </Text>
              <Text
                variant="bodyS"
                color={colors.contentNotice}
                style={styles.centred}
              >
                {sendCopy.link.expires}
              </Text>
            </>
          ) : (
            <>
              <Text variant="bodyBold" color={colors.contentPrimary}>
                {sendCopy.sent.recipient}
              </Text>

              {/* Who has it. */}
              <View style={[styles.card, styles.recipient]}>
                <View style={styles.avatar}>
                  {/* The file sets these at 20 in a face the app has no token
                      for; body-L-bold is the nearest it does have. */}
                  <Text variant="bodyLBold" color={colors.contentPrimary}>
                    {initials(params.name ?? "")}
                  </Text>
                </View>
                <View style={styles.rowBody}>
                  <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                    {params.name}
                  </Text>
                  <Text
                    variant="bodyS"
                    color={colors.contentSecondary}
                    numberOfLines={1}
                  >
                    {params.email}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* And what they have. */}
          {booking && (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHead}>
                <View style={styles.bookingText}>
                  <Text
                    variant="displayStep"
                    uppercase
                    color={colors.white}
                    numberOfLines={2}
                    /* 56 on 42 in the file, which is tighter than the token. */
                    style={displaySize({ size: 56, line: 42, tracking: 0.56 }, width)}
                  >
                    {booking.eventName}
                  </Text>
                  <Text variant="bodySBold" color={colors.brand}>
                    {`${eventTime(booking.startsAt)} - ${eventTime(booking.endsAt)}`}
                  </Text>
                  <Text
                    variant="bodySBold"
                    color={colors.white}
                    numberOfLines={2}
                    style={styles.underline}
                    onPress={() =>
                      booking.venueUrl && Linking.openURL(booking.venueUrl)
                    }
                  >
                    {booking.venue}
                  </Text>
                </View>
                <Image
                  source={image(booking.image)}
                  style={styles.poster}
                  contentFit="cover"
                  transition={240}
                />
              </View>

              <View style={styles.tickets}>
                <Text variant="bodyBold" color={colors.contentSecondary}>
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
          icon={byLink ? ShareIcon : undefined}
          label={
            byLink ? sendCopy.link.share : sendCopy.sent.inform(params.name ?? "")
          }
          onPress={
            byLink
              ? () => params.link && Share.share({ message: params.link })
              : close
          }
        />
        {/* The email landing offers a way back to the booking; 161:65552
            gives the link one action and nothing else. */}
        {!byLink && (
          <Button variant="tertiary" label={sendCopy.sent.back} onPress={close} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surfaceBase },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: gutter },
  /* 48 tall, as the field is drawn. */
  linkField: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    height: 48,
    paddingLeft: space.l,
    paddingRight: space.s,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  linkCopy: { padding: space.xs },
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
  /* 40 across, measured off the render. */
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  rowBody: { flex: 1, minWidth: 0 },

  /* The comp holds this one with the dimmed border, not the tertiary one the
     recipient card above it uses. */
  bookingCard: {
    borderWidth: 1,
    borderColor: colors.borderDimmed,
    padding: space.l,
    gap: space.xl,
  },
  bookingHead: { flexDirection: "row", alignItems: "flex-start", gap: space.l },
  bookingText: { flex: 1, minWidth: 0 },
  /* 89 x 88 in the file. */
  poster: { width: 89, height: 88, backgroundColor: colors.bgTertiary },
  underline: { textDecorationLine: "underline" },

  tickets: { gap: space.s },
  ticketRow: { flexDirection: "row", alignItems: "center", gap: space.s },
  grow: { flex: 1, minWidth: 0 },

  dock: { paddingHorizontal: gutter, paddingTop: space.s, gap: space.s },
});
