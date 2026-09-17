import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import Beats from "../../icons/ic-beats-earn.svg";
import Calendar from "../../icons/ic-calendar-20.svg";
import Clock from "../../icons/ic-clock-16.svg";
import Copy from "../../icons/ic-copy-20.svg";
import Download from "../../icons/ic-download-16.svg";
import Navigate from "../../icons/ic-navigate-20.svg";
import Pin from "../../icons/ic-pin-16.svg";
import Share from "../../icons/ic-share-16.svg";
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
 * The end of the journey, from Figma 346:47554.
 *
 * It says plainly that nothing was charged. A confirmation screen that looks
 * exactly like a real one and is not is the single most misleading thing a
 * prototype can put in front of somebody, so the note is part of the page
 * rather than a footnote under it.
 *
 * The app comp opens with what the booking earned — the new Beats balance in
 * the header, the change stated under it — which is the reward loop closing on
 * the one screen where somebody is pleased with themselves. The QR is the
 * comp's own artwork; it is a picture, not a live code, and nothing scans it.
 */
export function Confirmation({
  event,
  totals,
  delivery,
  orderNumber,
  beatsEarned,
  beatsBalance,
  onViewBooking,
}: {
  event: EventDetails;
  totals: Totals;
  delivery: Delivery | null;
  orderNumber: string;
  /** What this booking earned, and what the balance is now. */
  beatsEarned: number;
  beatsBalance: number;
  onViewBooking: () => void;
}) {
  const copy = bookingCopy.confirmation;
  const starts = new Date(event.startsAt);
  /* `EventDetails` carries no end time. The comps quote a range, and the one
     the booking journey already states is `bookingConfig.sessionTime`, so the
     range is taken from there rather than from a field invented here. */
  const session = bookingConfig.sessionTime;

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
      {/* What the booking earned, before anything about the booking. */}
      {beatsEarned > 0 && (
        <View style={styles.earned}>
          <Beats width={24} height={24} />
          <Text variant="bodyS" style={styles.flex}>
            {copy.earned(beatsEarned)}
          </Text>
          <Text variant="bodySBold" color={colors.brand}>
            {copy.balance(beatsBalance)}
          </Text>
        </View>
      )}

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
        <Row label={copy.summary.orderNumber} value={orderNumber} trailing={Copy} />
        <Row label={copy.summary.dateTime} value={dateTime} />
        <Row
          label={copy.summary.location}
          value={event.venue.name}
          trailing={Navigate}
        />
        <View style={styles.buttons}>
          <Button
            label={copy.summary.directions}
            icon={Navigate}
            onPress={() => Linking.openURL(event.venue.directionsUrl)}
          />
          <Button label={copy.summary.share} icon={Share} />
        </View>
      </View>

      {/* Where the tickets are */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.tickets.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {copy.tickets.body(accountUser.email)}
        </Text>

        <View style={styles.qrBlock}>
          <Image
            source={image("/assets/conf-qr.png")}
            style={styles.qr}
            contentFit="contain"
          />
          <Text variant="bodyS" color={colors.contentSecondary} style={styles.flex}>
            {copy.tickets.scan}
          </Text>
        </View>
      </View>

      {/* Order details */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.orderDetails}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {copy.order.sentTo(accountUser.email)}
        </Text>

        {/* The event itself, restated as the thing these lines belong to. */}
        <View style={styles.eventRow}>
          <Image
            source={image("/assets/event-thumb.jpg")}
            style={styles.eventThumb}
            contentFit="cover"
          />
          <View style={styles.flex}>
            <Text variant="bodyBold" numberOfLines={1}>
              {event.name}
            </Text>
            <View style={styles.metaRow}>
              <Clock width={16} height={16} />
              <Text variant="caption" color={colors.contentSecondary} numberOfLines={1}>
                {`${starts.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}, ${session}`}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Pin width={16} height={16} />
              <Text variant="caption" color={colors.contentSecondary} numberOfLines={1}>
                {event.venue.name}
              </Text>
            </View>
          </View>
          <Button
            label={copy.ticketCount(totals.ticketCount)}
            onPress={onViewBooking}
          />
        </View>

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
            value={`-${formatMoney(totals.promo)}`}
            tone="positive"
          />
        )}
        {totals.wallet > 0 && (
          <TotalRow
            label={copy.price.wallet}
            value={`-${formatMoney(totals.wallet)}`}
            tone="positive"
          />
        )}
        <TotalRow
          label={copy.price.total}
          value={formatMoney(totals.total)}
          strong
          note={copy.price.vat(formatMoney(totals.vat))}
        />
        {/* There is no receipt to hand over, so the control is drawn dead
            rather than promising a file that never arrives. */}
        <Button label={copy.price.receipt} icon={Download} disabled />
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

function Row({
  label,
  value,
  trailing: Mark,
}: {
  label: string;
  value: string;
  trailing?: React.FC<{ width: number; height: number }>;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {label}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
      {Mark && <Mark width={20} height={20} />}
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
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowLabel: { flex: 1, minWidth: 0, gap: 2 },
  flex: { flex: 1, minWidth: 0 },
  buttons: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },

  earned: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.m,
    backgroundColor: colors.overlay5,
  },

  qrBlock: { flexDirection: "row", alignItems: "center", gap: space.l },
  qr: { width: 96, height: 96 },

  eventRow: { flexDirection: "row", alignItems: "center", gap: space.m },
  eventThumb: { width: 56, height: 56, backgroundColor: colors.bgTertiary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: space.xs },

  line: { flexDirection: "row", alignItems: "center", gap: space.s },
  lineBody: { flex: 1, minWidth: 0 },
});
