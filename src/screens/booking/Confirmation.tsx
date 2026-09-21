import { Linking, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronRight from "../../icons/ic-chevron-right-20.svg";
import Close from "../../icons/ic-close.svg";
import Calendar from "../../icons/ic-calendar-20.svg";
import Clock from "../../icons/ic-clock-16.svg";
import Copy from "../../icons/ic-copy-20.svg";
import DeliveryMark from "../../icons/ic-delivery-24.svg";
import Download from "../../icons/ic-download-16.svg";
import Navigate from "../../icons/ic-navigate-20.svg";
import Pin from "../../icons/ic-pin-16.svg";
import Share from "../../icons/ic-share-16.svg";
import { Button } from "../../components/Button";
import { Tap } from "../../components/Tap";
import { icon } from "../../icons";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
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
  onClose,
  installments,
}: {
  event: EventDetails;
  totals: Totals;
  delivery: Delivery | null;
  orderNumber: string;
  /** What this booking earned, and what the balance is now. */
  beatsEarned: number;
  beatsBalance: number;
  onViewBooking: () => void;
  onClose: () => void;
  /** How many instalments this was split into, or null if paid outright. */
  installments: number | null;
}) {
  const copy = bookingCopy.confirmation;
  const starts = new Date(event.startsAt);
  /* `EventDetails` carries no end time. The comps quote a range, and the one
     the booking journey already states is `bookingConfig.sessionTime`, so the
     range is taken from there rather than from a field invented here. */
  const session = bookingConfig.sessionTime;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  /* "Wed, 11 Sep 7:00 PM", as the comp writes it: day before month, and the
     session's own start time without its leading zero. */
  const dateTime = `${starts.toLocaleDateString("en-US", { weekday: "short" })}, ${starts.getDate()} ${starts.toLocaleDateString("en-US", { month: "short" })} ${session.split(" - ")[0].replace(/^0/, "")}`;

  /* A calendar template URL is the one "add to calendar" that needs no
     permissions and works the same on both platforms. */
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.name,
  )}&dates=${stamp(starts)}/${stamp(new Date(starts.getTime() + 5 * 3600_000))}&location=${encodeURIComponent(
    event.venue.name,
  )}`;

  return (
    <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + space.s }]}>
      {/* Close on the left, the new Beats balance on the right, and what this
          booking added to it as a toast under the balance. */}
      <View style={styles.topBar}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={styles.close}
        >
          <Close width={20} height={20} />
        </Tap>
        <Button label={copy.balance(beatsBalance)} onPress={onViewBooking} />
      </View>
      {beatsEarned > 0 && (
        <View style={styles.toast}>
          <Text variant="bodyS" color={colors.contentPrimary}>
            {copy.earned(beatsEarned)}
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
        <Text
          variant="displayStep"
          uppercase
          color={colors.white}
          style={[displaySize(type.displayStep, width), styles.centred]}
        >
          {copy.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} style={styles.centred}>
          {copy.body(event.name)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button variant="brand" label={copy.viewBooking} onPress={onViewBooking} />
        <Button
          variant="primary"
          label={copy.addToCalendar}
          icon={Calendar}
          onPress={() => Linking.openURL(calendarUrl)}
        />
      </View>

      {/* Order summary */}
      <View style={styles.panel}>
        <Text variant="titleBody" uppercase>
          {copy.summary.title}
        </Text>
        <Row label={copy.summary.orderNumber} value={orderNumber} trailing={Copy} />
        <Row label={copy.summary.dateTime} value={dateTime} />
        <Row
          label={copy.summary.location}
          value={event.venue.name}
          link
          trailing={Navigate}
          onTrailing={() => Linking.openURL(event.venue.directionsUrl)}
        />
        <Button label={copy.summary.share} icon={Share} style={styles.wide} />
      </View>

      {/* Price */}
      <View style={styles.panel}>
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
        {/* The comp rules the total off from the lines it sums. */}
        <View style={styles.rule} />
        <TotalRow
          label={copy.price.total}
          value={formatMoney(totals.total)}
          strong
          note={copy.price.vat(formatMoney(totals.vat))}
        />
        <Button label={copy.price.receipt} icon={Download} style={styles.wide} />
      </View>

      {/* Delivery information — only when there is something to deliver. */}
      {delivery && (
        <View style={styles.block}>
          <Text variant="titleBody" uppercase>
            {copy.delivery.title}
          </Text>
          <View style={styles.deliveryRow}>
            <DeliveryMark width={24} height={24} />
            <View style={styles.flex}>
              <Text variant="body">{copy.delivery.method}</Text>
              <Text variant="bodyS" color={colors.contentSecondary}>
                {delivery.kind === "pickup"
                  ? delivery.point
                  : `${delivery.address}, ${delivery.city}, ${delivery.country}`}
              </Text>
            </View>
          </View>
        </View>
      )}

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
              <Text variant="caption" color={colors.contentSecondary} numberOfLines={1} style={styles.underline}>
                {event.venue.name}
              </Text>
            </View>
            <Tap
              accessibilityRole="link"
              onPress={onViewBooking}
              style={styles.countLink}
            >
              <Text variant="bodySBold">{copy.ticketCount(totals.ticketCount)}</Text>
              <ChevronRight width={16} height={16} />
            </Tap>
          </View>
        </View>

        <View style={styles.lines}>
          <Text variant="bodySBold" color={colors.contentSecondary}>
            {copy.order.tickets(totals.ticketCount)}
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
        </View>
        {totals.addonLines.length > 0 && (
          <View style={[styles.lines, styles.linesDivided]}>
            <Text variant="bodySBold" color={colors.contentSecondary}>
              {copy.order.addons(totals.addonCount)}
            </Text>
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
        )}
      </View>


      {/* Paid on instalments? The comp closes on what is still owed and when. */}
      {installments && installments > 1 && (
        <View style={styles.block}>
          <Text variant="titleBody" uppercase>
            {copy.payments.title}
          </Text>
          <View style={styles.panel}>
            <View>
              <Text variant="bodyS" color={colors.contentSecondary}>
                {copy.payments.totalToPay}
              </Text>
              <Text variant="bodyL" style={styles.bold}>
                {formatMoney(totals.total / installments)}
              </Text>
            </View>

            {/* The next two instalments, side by side with a rule between. */}
            <View style={styles.dueRow}>
              {[7, 30].map((days, index) => (
                <View
                  key={days}
                  style={[styles.due, index > 0 && styles.dueDivided]}
                >
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {copy.payments.dueIn(days)}
                  </Text>
                  <Text variant="bodyL" style={styles.bold}>
                    {formatMoney(totals.total / installments)}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              variant="primary"
              label={copy.payments.make}
              onPress={onViewBooking}
              style={styles.wide}
            />
          </View>
        </View>
      )}

    </ScrollView>
  );
}

function Row({
  label,
  value,
  link = false,
  trailing: Mark,
  onTrailing,
}: {
  label: string;
  value: string;
  link?: boolean;
  trailing?: React.FC<{ width: number; height: number }>;
  onTrailing?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text variant="body">{label}</Text>
        <Text variant="bodyS" color={colors.contentSecondary} style={link && styles.underline}>
          {value}
        </Text>
      </View>
      {Mark &&
        (onTrailing ? (
          <Tap accessibilityRole="button" onPress={onTrailing} scale={0.9}>
            <Mark width={20} height={20} />
          </Tap>
        ) : (
          <Mark width={20} height={20} />
        ))}
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
      <Text variant="bodyS">{`${qty}x`}</Text>
      {Mark && <Mark width={20} height={20} />}
      <View style={styles.lineBody}>
        <Text variant="bodySBold" numberOfLines={1}>
          {name}
        </Text>
        {sub && (
          <Text variant="caption" color={colors.contentSecondary}>
            {sub}
          </Text>
        )}
      </View>
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
  head: { gap: space.m, alignItems: "center" },
  centred: { textAlign: "center" },
  actions: { gap: space.m },
  wide: { alignSelf: "stretch" },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  close: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  toast: {
    alignSelf: "flex-end",
    marginTop: -space.m,
    paddingVertical: space.s,
    paddingHorizontal: space.m,
    backgroundColor: "#0f3e21",
  },
  panel: { gap: space.m, padding: space.l, backgroundColor: colors.bgSecondary },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderTertiary },
  bold: { fontFamily: "Roboto_700Bold" },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    padding: space.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderTertiary,
  },
  dueRow: { flexDirection: "row" },
  due: { flex: 1, paddingRight: space.l },
  dueDivided: {
    paddingLeft: space.l,
    paddingRight: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.borderTertiary,
  },
  underline: { textDecorationLine: "underline" },
  countLink: { flexDirection: "row", alignItems: "center", gap: space.xs, alignSelf: "flex-start" },

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


  eventRow: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
  eventThumb: { width: 72, height: 72, backgroundColor: colors.bgTertiary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: space.xs },

  lines: { gap: space.s, paddingVertical: space.s },
  linesDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderTertiary },
  line: { flexDirection: "row", alignItems: "center", gap: space.s, paddingVertical: space.xs },
  lineBody: { flex: 1, minWidth: 0 },
});
