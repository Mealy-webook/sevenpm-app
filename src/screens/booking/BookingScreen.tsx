import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChevronDown from "../../icons/ic-chevron-down-16.svg";
import ChevronLeft from "../../icons/ic-arrow-left-20.svg";
import Lock from "../../icons/ic-lock-16.svg";
import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { Page } from "../../components/Screen";
import { Tap } from "../../components/Tap";
import { BookingHeader } from "./BookingHeader";
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
import { loyaltyBalance } from "../../data/account";
import { getEvent } from "../../data/events";
import { adjust, quantityOf, totals as priceCart, type Cart } from "./cart";
import { TicketsStep } from "./TicketsStep";
import { ExtrasStep } from "./ExtrasStep";
import { CheckoutStep } from "./CheckoutStep";
import { Confirmation } from "./Confirmation";
import {
  CardSheet,
  DeliverySheet,
  ItemDetailsSheet,
  OrderSummarySheet,
  VouchersSheet,
  TicketInfoSheet,
  type Delivery,
  type SavedCard,
} from "./BookingSheets";

/**
 * The booking journey: tickets, merchandise, parking, checkout, confirmation.
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
 *
 * The app comps (346:46384 and its siblings) have no timer at all — they
 * replace the whole header with the event chip. Ahmed asked to keep the hold,
 * so it moved into the dock's accessory row beside the total, which is the one
 * place on these screens that already states facts about the order rather than
 * about the event. It is the only element here that is not in a comp.
 *
 * Extras is two stages rather than one, per the comps: merchandise, then
 * parking. The chips still jump between them, so the split is a suggested
 * order rather than a gate.
 */
export function BookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "Booking">>();
  const event = getEvent(params.slug);

  const [cart, setCart] = useState<Cart>([]);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("merchandise");
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
  const [promo, setPromo] = useState<
    { code: string; off: number; beats?: number } | null
  >(null);
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

  const LAST = 3;
  /* On the last step the comps name the method on the button — "Pay with
     Apple Pay" — so the press says what is about to happen rather than just
     that something is. */
  const payLabel = bookingCopy.checkout.payWith2(
    bookingCopy.checkout.payMethods.find((m) => m.id === method)?.label ??
      bookingCopy.checkout.card,
  );
  const action = [
    bookingCopy.summaryBar.nextExtras,
    bookingCopy.extras.nextParking,
    bookingCopy.summaryBar.nextCheckout,
    payLabel,
  ][step];

  /* Moving on from a stage also moves the chips, so the extras chips and the
     dock never disagree about which half you are looking at. */
  const advance = () => {
    if (step === LAST) return pay();
    if (step === 0) setCategory("merchandise");
    if (step === 1) setCategory("parking");
    setStep(step + 1);
  };

  if (done) {
    return (
      <Page>
        <BookingHeader
          name={event.name}
          time={bookingConfig.sessionTime}
          thumbnail="/assets/event-thumb.jpg"
          onClose={() => navigation.goBack()}
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
      <BookingHeader
        name={event.name}
        time={bookingConfig.sessionTime}
        thumbnail="/assets/event-thumb.jpg"
        onClose={() => navigation.goBack()}
      />

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
              cart={cart}
              onAdjust={addTicket}
              onInfo={setInfoTicket}
            />
          )}
          {(step === 1 || step === 2) && (
            <ExtrasStep
              category={category}
              onCategory={(id) => {
                setCategory(id);
                setStep(id === "merchandise" ? 1 : 2);
              }}
              cart={cart}
              onAdjust={addAddon}
              onDetails={setDetailsAddon}
            />
          )}
          {step === 3 && (
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
              voucher={promo}
              onVouchers={() => setPromoOpen(true)}
              onSummary={() => setSummaryOpen(true)}
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

      {/* The dock: what is in the basket above, the step's one action below. */}
      {!expired && (
        <Dock
          surface="panel"
          accessory={
            <View style={styles.accessory}>
              {totals.ticketCount === 0 ? (
                <Text variant="bodyL" color={colors.contentSecondary}>
                  {bookingCopy.summaryBar.empty}
                </Text>
              ) : (
                <>
                  <Text variant="bodyL" style={styles.semibold}>
                    {bookingCopy.summaryBar.tickets(totals.ticketCount)}
                    {totals.addonCount > 0 &&
                      `, ${bookingCopy.summaryBar.addons(totals.addonCount)}`}
                  </Text>
                  <View style={styles.spacer} />

                  {/* The hold. Not in any comp — see the note above. */}
                  <Text
                    variant="bodySBold"
                    color={left <= 60 ? colors.negative : colors.contentSecondary}
                  >
                    {clock(left)}
                  </Text>

                  <Tap
                    accessibilityRole="button"
                    accessibilityLabel={bookingCopy.summaryBar.open}
                    onPress={() => setSummaryOpen(true)}
                    style={styles.total}
                  >
                    <Text variant="bodyL" style={styles.semibold}>
                      {formatMoney(totals.total)}
                    </Text>
                    <ChevronDown width={16} height={16} />
                  </Tap>
                </>
              )}
            </View>
          }
        >
          <View style={styles.actions}>
            {/* Tickets is the first stage; there is nothing behind it but the
                way out, which the header already offers. */}
            {step > 0 && (
              <Tap
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={() => {
                  if (step === 2) setCategory("merchandise");
                  setStep(step - 1);
                }}
                style={styles.back}
              >
                <ChevronLeft width={20} height={20} />
              </Tap>
            )}
            <Button
              variant={step === LAST ? "brand" : "primary"}
              icon={step === LAST ? Lock : undefined}
              label={action}
              disabled={totals.ticketCount === 0}
              onPress={advance}
              style={styles.cta}
            />
          </View>
        </Dock>
      )}

      <TicketInfoSheet
        ticket={infoTicket}
        quantity={infoTicket ? quantityOf(cart, infoTicket.id) : 0}
        onClose={() => setInfoTicket(null)}
        onAdjust={(ticket, by) => addTicket(ticket.id, by)}
        onAdd={(ticket) => {
          /* Add to cart closes the sheet, but only adds if the stepper in it
             has not already put one in — otherwise pressing both puts two in
             when you asked for one. */
          if (quantityOf(cart, ticket.id) === 0) addTicket(ticket.id, 1);
          setInfoTicket(null);
        }}
      />
      <ItemDetailsSheet
        addon={detailsAddon}
        cart={cart}
        onClose={() => setDetailsAddon(null)}
        onAdjust={(addon, by, size) => addAddon(addon, by, size)}
        onAdd={(addon, size) => {
          if (quantityOf(cart, addon.id, size) === 0) addAddon(addon, 1, size);
          setDetailsAddon(null);
        }}
      />
      <OrderSummarySheet
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        totals={totals}
      />
      <VouchersSheet
        open={promoOpen}
        subtotal={totals.subtotal}
        beats={loyaltyBalance}
        onClose={() => setPromoOpen(false)}
        onApply={(voucher) => {
          setPromo(voucher);
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
  body: { padding: gutter, paddingBottom: space.section },
  expired: { flex: 1, justifyContent: "center", padding: gutter, gap: space.l },

  accessory: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingLeft: space.s,
  },
  spacer: { flex: 1 },
  total: { flexDirection: "row", alignItems: "center", gap: space.xs, padding: 6 },
  actions: { flexDirection: "row", alignItems: "stretch", gap: space.m },
  back: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  cta: { flex: 1 },
  semibold: { fontFamily: "Roboto_600SemiBold" },
});
