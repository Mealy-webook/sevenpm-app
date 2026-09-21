import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { SvgProps } from "react-native-svg";
import ChevronDown from "../../icons/ic-chevron-down-16.svg";
import ChevronRight from "../../icons/ic-chevron-right-20.svg";
import ApplePayWord from "../../icons/ic-applepay-word.svg";
import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { Odometer } from "../../components/Odometer";
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
import { tap } from "../../theme/haptics";
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
 * All of it is one screen rather than four pushed pages, because the basket
 * and the promo code belong to the journey and not to any step of it —
 * pushing a route per step would mean lifting that state somewhere else and
 * then guarding every entry point into the middle of a flow nobody can enter
 * in the middle of.
 *
 * There is **no hold timer**. The comps (346:46384 and its siblings) have
 * none, and nothing is reserved on a server for one to count down, so the
 * journey simply waits for you.
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

  const [infoTicket, setInfoTicket] = useState<BookingTicket | null>(null);
  const [detailsAddon, setDetailsAddon] = useState<BookingAddon | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [method, setMethod] = useState("apple-pay");
  /* The instalment plan belongs to the journey: checkout picks it, the
     confirmation reports what is still owed. */
  const [plan, setPlan] = useState(bookingConfig.paymentPlans[0]);
  const [card, setCard] = useState<SavedCard | null>(null);
  const [wallet, setWallet] = useState(true);
  const [promo, setPromo] = useState<
    { code: string; off: number; beats?: number } | null
  >(null);
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const totals = useMemo(
    () => priceCart(cart, { wallet, promo: promo?.off ?? 0 }),
    [cart, wallet, promo],
  );

  /* 1 Beat per dirham of tickets — the rule SevenPM Rewards states. */
  const earnedBeats = totals.ticketLines.reduce(
    (sum, line) => sum + line.amount,
    0,
  );

  const hasMerch = totals.addonLines.some(
    (line) => getAddon(line.id)?.category === "merchandise",
  );

  if (!event) return null;

  const addTicket = (id: string, by: number) => {
    tap.pick();
    setCart((current) => adjust(current, "ticket", id, by));
  };

  const addAddon = (addon: BookingAddon, by: number, size?: string) => {
    tap.pick();
    setCart((current) => adjust(current, "addon", addon.id, by, size));
  };

  const pay = () => {
    if (!agreed) {
      tap.refuse();
      setAgreementError(true);
      return;
    }
    tap.commit();
    setOrderNumber(
      `SPM-${Math.floor(100000 + Math.random() * 900000)}`,
    );
    setDone(true);
  };

  const LAST = 3;
  /* On the last step the comps name the method on the button — "Pay with
     Apple Pay" — so the press says what is about to happen rather than just
     that something is. */
  const payLabel =
    method === "apple-pay"
      ? bookingCopy.checkout.payWith
      : bookingCopy.checkout.payWith2(
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

  /* The confirmation is its own page in the comp — its close and Beats
     balance replace the journey's header. */
  if (done) {
    return (
      <Page>
        <Confirmation
          event={event}
          totals={totals}
          delivery={delivery}
          orderNumber={orderNumber}
          beatsEarned={earnedBeats}
          beatsBalance={loyaltyBalance + earnedBeats}
          onViewBooking={() => {
            navigation.goBack();
            navigation.navigate("Tabs");
          }}
          onClose={() => navigation.goBack()}
          installments={method === "bnpl" ? plan : null}
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
            plan={plan}
            onPlan={setPlan}
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
            onRemoveVoucher={() => setPromo(null)}
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

      {/* The dock: what is in the basket above, the step's one action below. */}
      <Dock
        surface="panel"
        accessory={
          step === LAST ? (
            <Text variant="body" color={colors.contentPrimary} style={styles.terms}>
              {bookingCopy.checkout.dockTerms}{" "}
              <Text variant="body" style={styles.termsLink}>
                {bookingCopy.checkout.termsLink}
              </Text>
            </Text>
          ) : (
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

                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={bookingCopy.summaryBar.open}
                  onPress={() => setSummaryOpen(true)}
                  style={styles.total}
                >
                  {/* It travels to its new figure as the basket changes —
                      this is the number you are watching while you tap. */}
                  <Odometer
                    value={formatMoney(totals.total)}
                    variant="bodyL"
                    textStyle={styles.semibold}
                  />
                  <ChevronDown width={16} height={16} />
                </Tap>
              </>
            )}
          </View>
          )
        }
      >
        <View style={styles.actions}>
          {/* Tickets is the first stage; there is nothing behind it but the
              way out, which the header already offers. */}
          {step > 0 && step < LAST && (
            <Tap
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => {
                if (step === 2) setCategory("merchandise");
                setStep(step - 1);
              }}
              style={styles.back}
            >
              <ChevronRight width={20} height={20} style={{ transform: [{ scaleX: -1 }] }} />
            </Tap>
          )}
          {/* The pay button is the primary white one, and names the method:
              the Apple mark for Apple Pay, words for the rest. */}
          <Button
            variant="primary"
            icon={step === LAST && method === "apple-pay" ? PayMark : undefined}
            iconSide="right"
            label={action}
            disabled={totals.ticketCount === 0}
            onPress={advance}
            style={styles.cta}
          />
        </View>
      </Dock>

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

/** The Apple Pay wordmark, at its own 31 × 20 rather than the button's 20-box. */
function PayMark(props: SvgProps) {
  return <ApplePayWord {...props} width={31} height={20} />;
}

const styles = StyleSheet.create({
  body: { padding: gutter, paddingBottom: space.section },

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
  terms: { textAlign: "center" },
  termsLink: { textDecorationLine: "underline" },
});
