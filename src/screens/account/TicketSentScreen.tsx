import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Close from "../../icons/ic-close.svg";
import { Button } from "../../components/Button";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { bookings, walletCurrency } from "../../data/account";
import { festivalCards } from "../../data/discover";
import { initials, sendCopy } from "../../data/send";

/**
 * Where a send lands, from Figma 162:82059.
 *
 * It says the thing that matters first — it is sent, and it is not theirs
 * yet: somebody has to accept it. Then it restates exactly what went and to
 * whom, because the one question anybody has after sending a ticket away is
 * whether they sent the right one.
 *
 * The two actions are the comp's: nudge them, or go back to the booking. The
 * nudge names the person, which is the comp's own wording.
 */
export function TicketSentScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "TicketSent">>();

  const booking = bookings.find((item) => item.id === params.bookingId);
  const ticket = booking?.tickets.find((item) => item.id === params.ticketId);
  const festival = festivalCards.find((item) => item.slug === booking?.eventSlug);

  const close = () => navigation.navigate("Tabs");

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
            variant="displayStep"
            uppercase
            color={colors.white}
            style={[displaySize(type.displayStep, width), styles.centred]}
          >
            {sendCopy.sent.title}
          </Text>
          <Text variant="body" color={colors.contentSecondary} style={styles.centred}>
            {sendCopy.sent.pending(params.name)}
          </Text>
        </View>

        <View style={styles.list}>
          {/* What it was for. */}
          <View style={styles.row}>
            <Image
              source={image(festival?.image ?? booking?.image ?? "")}
              style={styles.thumb}
              contentFit="cover"
              transition={240}
            />
            <View style={styles.rowBody}>
              <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                {festival?.name ?? booking?.eventName}
              </Text>
              <Text
                variant="bodyS"
                color={colors.contentSecondary}
                numberOfLines={1}
              >
                {festival?.venue ?? booking?.venue}
              </Text>
            </View>
          </View>

          <Text variant="titleBody" uppercase color={colors.contentPrimary}>
            {sendCopy.sent.tickets(1)}
          </Text>

          {/* Which seat went. */}
          {ticket && (
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text variant="bodySBold" color={colors.white}>
                  {initials(ticket.holder)}
                </Text>
              </View>
              <View style={styles.rowBody}>
                <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                  {ticket.tier}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
                  {ticket.seat}
                </Text>
              </View>
              <Text variant="bodyBold" color={colors.contentPrimary}>
                {ticket.price.toFixed(2)} {walletCurrency}
              </Text>
            </View>
          )}

          <Text variant="titleBody" uppercase color={colors.contentPrimary}>
            {sendCopy.sent.sentTo}
          </Text>

          {/* And who has it. */}
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text variant="bodySBold" color={colors.white}>
                {initials(params.name)}
              </Text>
            </View>
            <View style={styles.rowBody}>
              <Text variant="body" color={colors.contentPrimary} numberOfLines={1}>
                {params.name}
              </Text>
              <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
                {params.email}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, space.m) }]}>
        {/* There is no message service behind this build, so the nudge closes
            the flow rather than claiming to have sent anything. */}
        <Button
          variant="brand"
          label={sendCopy.sent.inform(params.name)}
          onPress={close}
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

  /* The comp's Tickets list: 24 across, 16 down, 16 between its parts. */
  list: {
    paddingHorizontal: space.xl,
    paddingVertical: space.l,
    gap: space.l,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.s },
  thumb: { width: 52, height: 52, backgroundColor: colors.bgTertiary },
  rowBody: { flex: 1, minWidth: 0, gap: space.s },
  /* Round, and in the second brand colour the comp gives every initials
     avatar (489:61707 and its twin on this screen). */
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand2,
  },

  dock: {
    paddingHorizontal: gutter,
    paddingTop: space.s,
    gap: space.s,
  },
});
