import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Calendar from "../icons/ic-calendar-12.svg";
import Close from "../icons/ic-close.svg";
import Receipt from "../icons/ic-receipt-24.svg";
import { Button } from "../components/Button";
import { Segmented } from "../components/Segmented";
import { Tag } from "../components/Tag";
import { Tap } from "../components/Tap";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import { installmentCopy, installmentPlan, type Installment } from "../data/installments";
import { bookings } from "../data/account";
import { bookingConfig, formatMoney } from "../data/booking";
import { getEvent } from "../data/events";
import type { RootParamList } from "../navigation/RootNavigator";
import { PayInstallmentSheet, PaymentReceivedSheet } from "./booking/InstallmentSheets";

/**
 * A Buy now pay later plan after the booking, from Figma 442:5219 and its
 * order-details tab 442:10270.
 *
 * The event sits at the top, then a segmented control between what is owed
 * and what was bought. Each instalment is a card of two halves: which payment
 * it is and when it falls above the rule, the amount and the way to settle it
 * below. Settling one opens the pay sheet, which hands back to the receipt.
 */
export function InstallmentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const route = useRoute<RouteProp<RootParamList, "Installments">>();
  const insets = useSafeAreaInsets();

  /* Opened from a booking row, or straight at the plan's own booking. */
  const booking = bookings.find((item) => item.id === route.params?.bookingId);
  const slug = booking?.eventSlug ?? installmentPlan.eventSlug;
  const event = getEvent(slug);
  /* Only a booking bought on instalments has payments to show; any other
     opens straight on what it bought. */
  const hasPlan = slug === installmentPlan.eventSlug;

  const [tab, setTab] = useState(hasPlan ? "payments" : "order");
  const [payments, setPayments] = useState(installmentPlan.payments);
  const [paying, setPaying] = useState<Installment[] | null>(null);
  const [received, setReceived] = useState<{ amount: number; next?: string } | null>(null);

  const outstanding = useMemo(
    () => payments.filter((payment) => !payment.paid),
    [payments],
  );
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  /** Settling clears those instalments and reports what falls next. */
  const settle = (cleared: Installment[]) => {
    const ids = new Set(cleared.map((payment) => payment.id));
    const after = payments.map((payment) =>
      ids.has(payment.id) ? { ...payment, paid: true } : payment,
    );
    setPayments(after);
    setPaying(null);
    setReceived({
      amount: cleared.reduce((sum, payment) => sum + payment.amount, 0),
      next: after.find((payment) => !payment.paid)?.due,
    });
  };

  if (!event) return null;

  return (
    <View style={styles.page}>
      <View style={[styles.bar, { paddingTop: insets.top + space.s }]}>
        <View style={styles.spacer} />
        <Tap
          accessibilityRole="button"
          accessibilityLabel={installmentCopy.paySheet.close}
          onPress={navigation.goBack}
          style={styles.close}
        >
          <Close width={20} height={20} />
        </Tap>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* The booking this plan belongs to. */}
        <View style={styles.event}>
          <View style={styles.eventText}>
            <Text variant="displayM" uppercase color={colors.white} style={styles.eventName}>
              {event.name}
            </Text>
            <Text variant="bodySBold" color={colors.brand}>
              {bookingConfig.sessionTime}
            </Text>
            <Text variant="bodyS" color={colors.contentPrimary} style={styles.underline}>
              {event.venue.name}
            </Text>
          </View>
          <Image
            source={image("/assets/event-thumb.jpg")}
            style={styles.poster}
            contentFit="cover"
            transition={200}
          />
        </View>

        {hasPlan && (
          <Segmented options={installmentCopy.tabs} value={tab} onChange={setTab} />
        )}

        {hasPlan && tab === "payments" ? (
          <>
            <View style={styles.planHead}>
              <View style={styles.planText}>
                <Text variant="titleBody" uppercase>
                  {installmentCopy.planTitle(payments.length, formatMoney(total))}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {installmentCopy.planTotal(formatMoney(total))}
                </Text>
              </View>
              {outstanding.length > 0 && (
                <Button
                  variant="brand"
                  size="m"
                  label={installmentCopy.payAll}
                  onPress={() => setPaying(outstanding)}
                />
              )}
            </View>

            <View style={styles.cards}>
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onPay={() => setPaying([payment])}
                />
              ))}
            </View>
          </>
        ) : (
          <OrderDetails />
        )}
      </ScrollView>

      <PayInstallmentSheet
        payments={paying}
        onClose={() => setPaying(null)}
        onPaid={settle}
      />
      <PaymentReceivedSheet
        received={received}
        onClose={() => setReceived(null)}
        onViewBooking={() => {
          setReceived(null);
          navigation.goBack();
        }}
        onPayAnother={() => {
          setReceived(null);
          const next = payments.find((payment) => !payment.paid);
          if (next) setPaying([next]);
        }}
      />
    </View>
  );
}

/** One instalment: what it is and when, over what it costs and how to settle. */
function PaymentCard({
  payment,
  onPay,
}: {
  payment: Installment;
  onPay: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text variant="bodyS" style={styles.flex}>
          {payment.label}
        </Text>
        <Tag
          icon={Calendar}
          label={
            payment.paid
              ? payment.due
              : payment.inDays === 0
                ? installmentCopy.dueToday
                : installmentCopy.dueIn(payment.inDays)
          }
          tone={payment.paid ? "lime" : payment.inDays === 0 ? "orange" : "default"}
        />
      </View>

      <View style={styles.rule} />

      <View style={styles.cardBody}>
        <Receipt width={24} height={24} />
        <Text variant="body" style={styles.flex}>
          {formatMoney(payment.amount)}
        </Text>
        <Button
          size="m"
          label={payment.paid ? installmentCopy.paid : installmentCopy.pay}
          disabled={payment.paid}
          onPress={onPay}
        />
      </View>
    </View>
  );
}

/** What the plan bought — Figma 442:10270. */
function OrderDetails() {
  const copy = installmentCopy.order;
  const lines = installmentPlan.payments;
  const subtotal = lines.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <View style={styles.order}>
      <Text variant="bodySBold" color={colors.contentSecondary}>
        {copy.tickets(orderTickets.length)}
      </Text>
      {orderTickets.map((line) => (
        <OrderLine key={line.name} {...line} />
      ))}

      <Text variant="bodySBold" color={colors.contentSecondary} style={styles.orderGap}>
        {copy.addons(orderAddons.length)}
      </Text>
      {orderAddons.map((line) => (
        <OrderLine key={line.name} {...line} />
      ))}

      <View style={styles.rule} />
      <View style={styles.totalRow}>
        <Text variant="bodyS" color={colors.contentSecondary} style={styles.flex}>
          {copy.subtotal}
        </Text>
        <Text variant="bodyS">{formatMoney(subtotal)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text variant="bodyL" style={styles.flex}>
          {copy.total}
        </Text>
        <View style={styles.totalValue}>
          <Text variant="bodyL" style={styles.bold}>
            {formatMoney(subtotal)}
          </Text>
          <Text variant="tab" color={colors.contentSecondary}>
            {copy.vat(formatMoney(Math.round(subtotal * 0.15 * 100) / 100))}
          </Text>
        </View>
      </View>
    </View>
  );
}

function OrderLine({
  qty,
  icon: path,
  name,
  sub,
  amount,
}: {
  qty: number;
  icon: string;
  name: string;
  sub?: string;
  amount: number;
}) {
  const Mark = icon(path);
  return (
    <View style={styles.orderLine}>
      <Text variant="bodyS">{`${qty}x`}</Text>
      {Mark && <Mark width={20} height={20} />}
      <View style={styles.flex}>
        <Text variant="bodySBold" numberOfLines={1}>
          {name}
        </Text>
        {sub && (
          <Text variant="caption" color={colors.contentSecondary}>
            {sub}
          </Text>
        )}
      </View>
      <Text variant="bodySBold">{formatMoney(amount)}</Text>
    </View>
  );
}

/* The comp's own basket (442:10270): two tickets and two add-ons. */
const orderTickets = [
  { qty: 1, icon: "/assets/ic-ticket-24.svg", name: "Single day: Fri 19 Sept", amount: 50 },
  { qty: 1, icon: "/assets/ic-ticket-24.svg", name: "Single day: Sat 20 Sept", amount: 50 },
];
const orderAddons = [
  {
    qty: 1,
    icon: "/assets/ic-tshirt-16.svg",
    name: "Casablanca L'Arche T-shirt in Organic Cotton",
    sub: "Size: M",
    amount: 50,
  },
  { qty: 1, icon: "/assets/ic-parking-16.svg", name: "VIP parking", amount: 50 },
];

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  bar: { flexDirection: "row", paddingHorizontal: gutter, paddingBottom: space.s },
  spacer: { flex: 1 },
  close: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  body: { padding: gutter, paddingBottom: space.section, gap: space.xl },

  event: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
  eventText: { flex: 1, minWidth: 0, gap: space.xs },
  eventName: { marginBottom: space.xs },
  underline: { textDecorationLine: "underline" },
  poster: { width: 89, height: 88, backgroundColor: colors.bgTertiary },

  planHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  planText: { flex: 1, minWidth: 0 },

  cards: { gap: space.m },
  card: {
    gap: space.m,
    padding: space.l,
    backgroundColor: colors.overlay5,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  cardHead: { flexDirection: "row", alignItems: "center" },
  cardBody: { flexDirection: "row", alignItems: "center", gap: space.m },
  rule: { height: 1, backgroundColor: colors.borderTertiary },
  flex: { flex: 1, minWidth: 0 },

  order: { gap: space.s },
  orderGap: { marginTop: space.l },
  orderLine: { flexDirection: "row", alignItems: "center", gap: space.s, paddingVertical: space.xs },
  totalRow: { flexDirection: "row", alignItems: "flex-start", gap: space.m, paddingTop: space.xs },
  totalValue: { alignItems: "flex-end" },
  bold: { fontFamily: "Roboto_700Bold" },
});
