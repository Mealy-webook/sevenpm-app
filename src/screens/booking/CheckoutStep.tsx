import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import Beats from "../../icons/ic-beats-earn.svg";
import CheckOff from "../../icons/ic-check-off.svg";
import CheckOn from "../../icons/ic-check-on.svg";
import Delivery from "../../icons/ic-delivery-24.svg";
import Installment from "../../icons/ic-installment-24.svg";
import ApplePay from "../../icons/ic-applepay-24.svg";
import Card from "../../icons/ic-card-24.svg";
import Promo from "../../icons/ic-promo-24.svg";
import Ticket from "../../icons/ic-ticket-24.svg";
import Wallet from "../../icons/ic-wallet.svg";
import { Button } from "../../components/Button";
import { Switch } from "../../components/Switch";
import { Tap } from "../../components/Tap";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import { bookingConfig, bookingCopy, formatMoney } from "../../data/booking";
import { Option, TotalRow } from "./BookingSheets";
import type { Delivery as DeliveryChoice, SavedCard } from "./BookingSheets";
import type { Totals } from "./cart";

/**
 * Step 3, from Figma 346:47218 and its completed state 346:47323.
 *
 * Five sections of rows, each one a fact about the order and the one thing you
 * can do about it: what is in the basket, where the merchandise goes, how you
 * are paying, what you have taken off, and what it comes to.
 *
 * The app comps differ from the web build in three ways worth naming. The
 * order summary is a row here rather than a bar, with "View" opening the
 * sheet. Discounts became **Vouchers**, which covers a promo code *and*
 * spending Beats — the loyalty programme reaches into checkout, which it never
 * did on the web. And the screen states what the booking will earn you before
 * you pay, which is the only forward-looking line on it.
 *
 * VAT sits inside the total rather than on top of it, so the figure quoted is
 * the figure charged.
 */
export function CheckoutStep({
  totals,
  hasMerch,
  delivery,
  onDelivery,
  method,
  onMethod,
  card,
  onAddCard,
  wallet,
  onWallet,
  voucher,
  onVouchers,
  onSummary,
  agreed,
  onAgree,
  agreementError,
}: {
  totals: Totals;
  hasMerch: boolean;
  delivery: DeliveryChoice | null;
  onDelivery: () => void;
  method: string;
  onMethod: (id: string) => void;
  card: SavedCard | null;
  onAddCard: () => void;
  wallet: boolean;
  onWallet: (on: boolean) => void;
  voucher: { code: string; off: number } | null;
  onVouchers: () => void;
  onSummary: () => void;
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
  agreementError: boolean;
}) {
  const { width } = useWindowDimensions();
  const copy = bookingCopy.checkout;

  /* 1 Beat per dirham of tickets — the rule the rewards sheet states. */
  const earned = totals.ticketLines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <View style={styles.step}>
      <Text
        variant="displayStep"
        uppercase
        color={colors.white}
        style={displaySize(type.displayStep, width)}
      >
        {copy.title}
      </Text>

      {/* Order summary */}
      <View style={styles.block}>
        <SectionTitle>{copy.orderSummary}</SectionTitle>
        <ActionRow
          icon={Ticket}
          label={copy.basket(
            bookingCopy.summaryBar.tickets(totals.ticketCount),
            bookingCopy.summaryBar.addons(totals.addonCount),
          )}
          action={copy.view}
          onAction={onSummary}
        />
      </View>

      {/* Delivery */}
      <View style={styles.block}>
        <SectionTitle>{copy.delivery}</SectionTitle>
        {hasMerch ? (
          <ActionRow
            icon={Delivery}
            label={copy.deliveryMethod}
            sub={delivery ? describe(delivery) : copy.deliveryHint}
            action={delivery ? copy.edit : copy.add}
            onAction={onDelivery}
          />
        ) : (
          <Text variant="bodyS" color={colors.contentSecondary}>
            {copy.deliveryNone}
          </Text>
        )}
      </View>

      {/* Pay with */}
      <View style={styles.block}>
        <SectionTitle>{copy.payWith}</SectionTitle>

        <View style={styles.row}>
          <Wallet width={24} height={24} />
          <Text variant="body" style={styles.rowLabel}>
            {copy.wallet}
          </Text>
          <Text variant="bodySBold" color={colors.contentSecondary}>
            {formatMoney(bookingConfig.walletCredit)}
          </Text>
          <Switch on={wallet} onChange={onWallet} label={copy.wallet} />
        </View>

        <Option
          label={copy.installment}
          selected={method === "installment"}
          onPress={() => onMethod("installment")}
          trailing={<Installment width={24} height={24} />}
        />
        <Option
          label={copy.applePay}
          selected={method === "apple-pay"}
          onPress={() => onMethod("apple-pay")}
          trailing={<ApplePay width={24} height={24} />}
        />
        <Option
          label={copy.card}
          sub={card ? `${card.brand} •••• ${card.last4}` : copy.cardEmpty}
          selected={method === "card"}
          onPress={() => onMethod("card")}
          trailing={<Card width={24} height={24} />}
        />

        {method === "card" && (
          <View style={styles.marks}>
            {copy.cardMarks.map((mark) => {
              const Mark = icon(mark);
              return Mark ? <Mark key={mark} width={32} height={20} /> : null;
            })}
            <View style={styles.spacer} />
            <Button label={copy.addCard} onPress={onAddCard} />
          </View>
        )}
      </View>

      {/* Vouchers — a promo code or Beats, in one place. */}
      <View style={styles.block}>
        <SectionTitle>{copy.vouchers}</SectionTitle>
        <ActionRow
          icon={Promo}
          label={voucher ? voucher.code : copy.vouchers}
          sub={
            voucher
              ? copy.promoSaved(formatMoney(totals.promo))
              : undefined
          }
          action={voucher ? copy.edit : copy.add}
          onAction={onVouchers}
        />
      </View>

      {/* Price */}
      <View style={styles.block}>
        <SectionTitle>{copy.priceDetails}</SectionTitle>
        <TotalRow
          label={bookingCopy.orderSummary.subtotal}
          value={formatMoney(totals.subtotal)}
        />
        {totals.fee > 0 && (
          <TotalRow
            label={bookingCopy.confirmation.price.fee}
            value={formatMoney(totals.fee)}
          />
        )}
        {totals.promo > 0 && (
          <TotalRow
            label={bookingCopy.confirmation.price.promo}
            value={`-${formatMoney(totals.promo)}`}
            tone="positive"
          />
        )}
        {totals.wallet > 0 && (
          <TotalRow
            label={bookingCopy.orderSummary.wallet}
            value={`-${formatMoney(totals.wallet)}`}
            tone="positive"
          />
        )}
        <TotalRow
          label={copy.total}
          value={formatMoney(totals.total)}
          strong
          note={bookingCopy.orderSummary.vat(formatMoney(totals.vat))}
        />
      </View>

      {/* What this booking earns — the one forward-looking line on the page. */}
      {earned > 0 && (
        <View style={styles.earn}>
          <Beats width={24} height={24} />
          <Text variant="bodyS" color={colors.contentPrimary} style={styles.rowLabel}>
            {copy.earn(earned)}
          </Text>
        </View>
      )}

      {/* The one box that must be ticked. */}
      <Tap
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => onAgree(!agreed)}
        scale={0.99}
        style={styles.agree}
      >
        {agreed ? <CheckOn width={20} height={20} /> : <CheckOff width={20} height={20} />}
        <Text variant="bodyS" color={colors.contentSecondary} style={styles.rowLabel}>
          {copy.agreement}
        </Text>
      </Tap>
      {agreementError && !agreed && (
        <Text variant="caption" color={colors.negative}>
          {copy.agreementError}
        </Text>
      )}
    </View>
  );
}

/** The 18px bold heading each section of the checkout carries. */
function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="titleBody" uppercase>
      {children}
    </Text>
  );
}

/**
 * A row that states something and offers one thing to do about it: a mark, a
 * label over an optional sub-line, and a button on the right.
 */
function ActionRow({
  icon: Mark,
  label,
  sub,
  action,
  onAction,
}: {
  icon: React.FC<SvgProps>;
  label: string;
  sub?: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.row}>
      <Mark width={24} height={24} />
      <View style={styles.rowBody}>
        <Text variant="body" numberOfLines={1}>
          {label}
        </Text>
        {sub && (
          <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={2}>
            {sub}
          </Text>
        )}
      </View>
      <Button label={action} onPress={onAction} />
    </View>
  );
}

function describe(delivery: DeliveryChoice) {
  if (delivery.kind === "pickup") return delivery.point;
  return `${delivery.address}, ${delivery.city}, ${delivery.country}`;
}

const styles = StyleSheet.create({
  step: { gap: space.xl },
  block: { gap: space.m },

  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
  rowLabel: { flex: 1, minWidth: 0 },

  marks: { flexDirection: "row", alignItems: "center", gap: space.s },
  spacer: { flex: 1 },

  earn: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.m,
    backgroundColor: colors.overlay5,
  },

  agree: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
});
