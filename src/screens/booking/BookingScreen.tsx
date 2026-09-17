import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronDown from "../../icons/ic-chevron-down-16.svg";
import Lock from "../../icons/ic-lock-16.svg";
import { Button } from "../../components/Button";
import { NavBar, Page } from "../../components/Screen";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import {
  bookingConfig,
  bookingCopy,
  formatMoney,
  getAddon,
  type BookingAddon,
  type BookingTicket,
} from "../../data/booking";
import { getEvent } from "../../data/events";
import { adjust, totals as priceCart, type Cart } from "./cart";
import { TicketsStep } from "./TicketsStep";
import { ExtrasStep } from "./ExtrasStep";
import { CheckoutStep } from "./CheckoutStep";
import { Confirmation } from "./Confirmation";
import {
  CardSheet,
  DeliverySheet,
  ItemDetailsSheet,
  OrderSummarySheet,
  PromoSheet,
  TicketInfoSheet,
  type Delivery,
  type SavedCard,
} from "./BookingSheets";

/**
 * The booking journey: tickets, extras, checkout, confirmation.
 *
 * All of it is one screen rather than four pushed pages, because the basket,
 * the hold and the promo code belong to the journey and not to any step of it
 * — pushing a route per step would mean lifting that state somewhere else and
 * then guarding every entry point into the middle of a flow nobody can enter
 * in the middle of.
 *
 * The hold is real in the sense that it runs down and locks the flow when it
 * reaches zero. Nothing is reserved on a server, so it is a rehearsal of the
 * pressure the real thing applies, and the expired panel says so by offering
 * only one way out: start again.
 */
export function BookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Booking">>();
  const event = getEvent(params.slug);

  const [cart, setCart] = useState<Cart>([]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(bookingConfig.holdSeconds);

  const [infoTicket, setInfoTicket] = useState<BookingTicket | null>(null);
  const [detailsAddon, setDetailsAddon] = useState<BookingAddon | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState<SavedCard | null>(null);
  const [wallet, setWallet] = useState(true);
  const [promo, setPromo] = useState<{ code: string; off: number } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  /* The hold stops the moment the order is placed — a confirmation that keeps
     counting down is telling you to hurry up about something already done. */
  useEffect(() => {
    if (done || left <= 0) return;
    const tick = setInterval(() => setLeft((value) => value - 1), 1000);
    return () => clearInterval(tick);
  }, [done, left]);

  const totals = useMemo(
    () => priceCart(cart, { wallet, promo: promo?.off ?? 0 }),
    [cart, wallet, promo],
  );

  const hasMerch = totals.addonLines.some(
    (line) => getAddon(line.id)?.category === "merchandise",
  );

  if (!event) return null;

  const expired = left <= 0 && !done;

  const restart = () => {
    setCart([]);
    setStep(0);
    setPromo(null);
    setDelivery(null);
    setAgreed(false);
    setAgreementError(false);
    setLeft(bookingConfig.holdSeconds);
  };

  const addTicket = (id: string, by: number) =>
    setCart((current) => adjust(current, "ticket", id, by));

  const addAddon = (addon: BookingAddon, by: number, size?: string) =>
    setCart((current) => adjust(current, "addon", addon.id, by, size));

  const pay = () => {
    if (!agreed) {
      setAgreementError(true);
      return;
    }
    setOrderNumber(
      `SPM-${Math.floor(100000 + Math.random() * 900000)}`,
    );
    setDone(true);
  };

  const action =
    step === 0
      ? bookingCopy.summaryBar.nextExtras
      : step === 1
        ? bookingCopy.summaryBar.nextCheckout
        : bookingCopy.summaryBar.pay;

  if (done) {
    return (
      <Page>
        <NavBar
          title={bookingCopy.confirmation.title}
          onBack={() => navigation.goBack()}
        />
        <Confirmation
          event={event}
          totals={totals}
          delivery={delivery}
          orderNumber={orderNumber}
          onViewBooking={() => {
            navigation.goBack();
            navigation.navigate("Tabs");
          }}
        />
      </Page>
    );
  }

  return (
    <Page>
      <NavBar
        title={bookingCopy.chrome.back}
        onBack={() => navigation.goBack()}
        right={
          <Text variant="bodySBold" color={left <= 60 ? colors.negative : colors.brand}>
            {bookingCopy.chrome.timer(clock(left))}
          </Text>
        }
      />

      {/* Where we are. The steps are stated rather than made pressable: you
          can go back through the flow, but jumping to checkout past an empty
          basket is not a thing the journey allows. */}
      <View style={styles.steps}>
        {bookingCopy.steps.map((item, index) => (
          <View key={item.id} style={styles.stepMark}>
            <View
              style={[styles.rail, index <= step ? styles.railOn : styles.railOff]}
            />
            <Text
              variant="captionBold"
              uppercase
              color={index <= step ? colors.contentPrimary : colors.contentSecondary}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {expired ? (
        <View style={styles.expired}>
          <Text variant="title" uppercase>
            {bookingCopy.chrome.expired}
          </Text>
          <Text variant="body" color={colors.contentSecondary}>
            {bookingCopy.chrome.expiredBody}
          </Text>
          <Button
            variant="primary"
            label={bookingCopy.chrome.restart}
            onPress={restart}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <TicketsStep
              eventName={event.name}
              time={bookingConfig.sessionTime}
              venue={event.venue.name}
              venueUrl={event.venue.directionsUrl}
              cart={cart}
              onAdjust={addTicket}
              onInfo={setInfoTicket}
            />
          )}
          {step === 1 && (
            <ExtrasStep
              cart={cart}
              onAdjust={addAddon}
              onDetails={setDetailsAddon}
            />
          )}
          {step === 2 && (
            <CheckoutStep
              totals={totals}
              hasMerch={hasMerch}
              delivery={delivery}
              onDelivery={() => setDeliveryOpen(true)}
              method={method}
              onMethod={setMethod}
              card={card}
              onAddCard={() => setCardOpen(true)}
              wallet={wallet}
              onWallet={setWallet}
              promo={promo}
              onPromo={() => setPromoOpen(true)}
              onRemovePromo={() => setPromo(null)}
              agreed={agreed}
              onAgree={(value) => {
                setAgreed(value);
                if (value) setAgreementError(false);
              }}
              agreementError={agreementError}
            />
          )}
        </ScrollView>
      )}

      {/* Summary bar — what is in the basket, and the step's one action. */}
      {!expired && (
        <View style={[styles.bar, { paddingBottom: insets.bottom || space.l }]}>
          <View style={styles.barBody}>
            {totals.ticketCount === 0 ? (
              <Text variant="bodyBold" color={colors.contentSecondary}>
                {bookingCopy.summaryBar.empty}
              </Text>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={bookingCopy.summaryBar.open}
                  onPress={() => setSummaryOpen(true)}
                  style={({ pressed }) => [styles.barOpen, pressed && styles.pressed]}
                >
                  <Text variant="bodyBold" numberOfLines={1}>
                    {[
                      bookingCopy.summaryBar.tickets(totals.ticketCount),
                      totals.addonCount > 0 &&
                        bookingCopy.summaryBar.addons(totals.addonCount),
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                  <ChevronDown width={16} height={16} />
                </Pressable>
                <View style={styles.barTotal}>
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {bookingCopy.summaryBar.total}
                  </Text>
                  <Text variant="bodyL" style={styles.semibold}>
                    {formatMoney(totals.total)}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Button
            variant={step === 2 ? "brand" : "primary"}
            icon={step === 2 ? Lock : undefined}
            label={action}
            disabled={totals.ticketCount === 0}
            onPress={() => (step === 2 ? pay() : setStep(step + 1))}
            style={styles.barCta}
          />
        </View>
      )}

      <TicketInfoSheet
        ticket={infoTicket}
        onClose={() => setInfoTicket(null)}
        onAdd={(ticket) => {
          addTicket(ticket.id, 1);
          setInfoTicket(null);
        }}
      />
      <ItemDetailsSheet
        addon={detailsAddon}
        onClose={() => setDetailsAddon(null)}
        onAdd={(addon, size) => {
          addAddon(addon, 1, size);
          setDetailsAddon(null);
        }}
      />
      <OrderSummarySheet
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        totals={totals}
      />
      <PromoSheet
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onApply={(code, off) => {
          setPromo({ code, off });
          setPromoOpen(false);
        }}
      />
      <DeliverySheet
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        onSave={(value) => {
          setDelivery(value);
          setDeliveryOpen(false);
        }}
      />
      <CardSheet
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        onSave={(value) => {
          setCard(value);
          setMethod("card");
          setCardOpen(false);
        }}
      />
    </Page>
  );
}

/** "9:59", as the comp writes the hold. */
function clock(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  steps: { flexDirection: "row", gap: space.s, paddingHorizontal: gutter },
  stepMark: { flex: 1, gap: space.xs },
  rail: { height: 3 },
  railOn: { backgroundColor: colors.brand },
  railOff: { backgroundColor: colors.overlay10 },

  body: { padding: gutter, paddingBottom: space.section },
  expired: { flex: 1, justifyContent: "center", padding: gutter, gap: space.l },

  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.l,
    backgroundColor: "#27272a",
  },
  barBody: { flex: 1, minWidth: 0 },
  barOpen: { flexDirection: "row", alignItems: "center", gap: space.s },
  barTotal: { flexDirection: "row", alignItems: "baseline", gap: space.xs },
  barCta: { flex: 1 },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  pressed: { opacity: 0.7 },
});
