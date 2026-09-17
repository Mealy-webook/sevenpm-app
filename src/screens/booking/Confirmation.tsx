import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import Calendar from "../../icons/ic-calendar-20.svg";
import Navigate from "../../icons/ic-navigate-20.svg";
import { Button } from "../../components/Button";
import { icon } from "../../icons";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
import { accountUser } from "../../data/account";
import { bookingConfig, bookingCopy, formatMoney } from "../../data/booking";
import type { EventDetails } from "../../data/events";
import { TotalRow } from "./BookingSheets";
import type { Delivery } from "./BookingSheets";
import type { Totals } from "./cart";

/**
 * The end of the journey, from Figma 2192:5369 / 2213:16229.
 *
 * It says plainly that nothing was charged. A confirmation screen that looks
 * exactly like a real one and is not is the single most misleading thing a
 * prototype can put in front of somebody, so the note is part of the page
 * rather than a footnote under it.
 */
export function Confirmation({
  event,
  totals,
  delivery,
  orderNumber,
  onViewBooking,
}: {
  event: EventDetails;
  totals: Totals;
  delivery: Delivery | null;
  orderNumber: string;
  onViewBooking: () => void;
}) {
  const copy = bookingCopy.confirmation;
  const starts = new Date(event.startsAt);

  const dateTime = starts.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });

  /* A calendar template URL is the one "add to calendar" that needs no
     permissions and works the same on both platforms. */
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.name,
  )}&dates=${stamp(starts)}/${stamp(new Date(starts.getTime() + 5 * 3600_000))}&location=${encodeURIComponent(
    event.venue.name,
  )}`;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Image
        source={image("/assets/conf-hands.png")}
        style={styles.art}
        contentFit="contain"
        transition={300}
      />

      <View style={styles.head}>
        <Text variant="displayM" uppercase color={colors.white}>
          {copy.title}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {copy.body(event.name)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          label={copy.viewBooking}
          onPress={onViewBooking}
          style={styles.action}
        />
        <Button
          label={copy.addToCalendar}
          icon={Calendar}
          onPress={() => Linking.openURL(calendarUrl)}
        />
      </View>

      {/* Order summary */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.summary.title}
        </Text>
        <Row label={copy.summary.orderNumber} value={orderNumber} />
        <Row label={copy.summary.dateTime} value={dateTime} />
        <Row label={copy.summary.location} value={event.venue.name} />
        <Button
          label={copy.summary.directions}
          icon={Navigate}
          onPress={() => Linking.openURL(event.venue.directionsUrl)}
          style={styles.inline}
        />
      </View>

      {/* Where the tickets are */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.tickets.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {copy.tickets.body(accountUser.email)}
        </Text>
      </View>

      {/* Order details */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.order.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {copy.order.sentTo(accountUser.email)}
        </Text>

        {totals.ticketLines.map((line) => (
          <LineRow
            key={line.key}
            icon={line.icon}
            name={line.name}
            qty={line.qty}
            amount={formatMoney(line.amount)}
          />
        ))}
        {totals.addonLines.map((line) => (
          <LineRow
            key={line.key}
            icon={line.icon}
            name={line.name}
            sub={line.size ? copy.order.size(line.size) : undefined}
            qty={line.qty}
            amount={formatMoney(line.amount)}
          />
        ))}
      </View>

      {/* Delivery */}
      {delivery && (
        <View style={styles.block}>
          <Text variant="titleBody" uppercase>
            {copy.delivery.title}
          </Text>
          <Row
            label={copy.delivery.method}
            value={
              delivery.kind === "pickup"
                ? delivery.point
                : `${delivery.address}, ${delivery.city}, ${delivery.country}`
            }
          />
        </View>
      )}

      {/* Price */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.price.title}
        </Text>
        <TotalRow
          label={copy.price.subtotal}
          value={formatMoney(totals.subtotal)}
        />
        {totals.fee > 0 && (
          <TotalRow label={copy.price.fee} value={formatMoney(totals.fee)} />
        )}
        {totals.promo > 0 && (
          <TotalRow
            label={copy.price.promo}
            value={`− ${formatMoney(totals.promo)}`}
          />
        )}
        {totals.wallet > 0 && (
          <TotalRow
            label={copy.price.wallet}
            value={`− ${formatMoney(totals.wallet)}`}
          />
        )}
        <TotalRow
          label={copy.price.total}
          value={formatMoney(totals.total)}
          strong
          note={copy.price.vat(formatMoney(totals.vat))}
        />
      </View>

      <Text variant="caption" color={colors.contentSecondary}>
        {copy.note}
      </Text>
      <Text variant="caption" color={colors.contentSecondary}>
        {`Currency: ${bookingConfig.currency}`}
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color={colors.contentSecondary} style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="bodyBold" style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

function LineRow({
  icon: path,
  name,
  sub,
  qty,
  amount,
}: {
  icon: string;
  name: string;
  sub?: string;
  qty: number;
  amount: string;
}) {
  const Mark = icon(path);
  return (
    <View style={styles.line}>
      {Mark && <Mark width={16} height={16} />}
      <View style={styles.lineBody}>
        <Text variant="bodyS" numberOfLines={2}>
          {name}
        </Text>
        {sub && (
          <Text variant="caption" color={colors.contentSecondary}>
            {sub}
          </Text>
        )}
      </View>
      <Text variant="caption" color={colors.contentSecondary}>
        × {qty}
      </Text>
      <Text variant="bodySBold">{amount}</Text>
    </View>
  );
}

/** Google Calendar wants `20260918T190000Z`. */
function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const styles = StyleSheet.create({
  page: { padding: gutter, paddingBottom: space.section, gap: space.xl },
  art: { width: "100%", height: 180 },
  head: { gap: space.m },
  actions: { flexDirection: "row", alignItems: "center", gap: space.m },
  action: { flex: 1 },
  inline: { alignSelf: "flex-start" },

  block: {
    gap: space.m,
    paddingTop: space.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderTertiary,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
  rowLabel: { flex: 1, minWidth: 0 },
  rowValue: { flex: 1, minWidth: 0, textAlign: "right" },

  line: { flexDirection: "row", alignItems: "center", gap: space.s },
  lineBody: { flex: 1, minWidth: 0 },
});
