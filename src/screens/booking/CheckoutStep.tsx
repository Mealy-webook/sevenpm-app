import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ApplePay from "../../icons/ic-applepay-24.svg";
import Card from "../../icons/ic-card-24.svg";
import Delivery from "../../icons/ic-delivery-24.svg";
import Gift from "../../icons/ic-gift-16.svg";
import Info from "../../icons/ic-info-16.svg";
import Split from "../../icons/ic-split-24.svg";
import Plus from "../../icons/ic-plus-16.svg";
import Promo from "../../icons/ic-promo-24.svg";
import Shield from "../../icons/ic-shield-24.svg";
import TrashRed from "../../icons/ic-trash-red-16.svg";
import Wallet from "../../icons/ic-wallet.svg";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { PaymentSchedule } from "../../components/PaymentSchedule";
import {
  ProtectionInfoSheet,
  ProtectionSkipSheet,
} from "../../components/ProtectionSheets";
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
 * Sections of contained list rows — the comp's "List item" components, each a
 * hairline box with a 24px mark on the left, a label over an optional line,
 * and the one control on the right: a small button, a switch, or a radio.
 * What is in the basket, where the merchandise goes, how you are paying, what
 * you have taken off, whether the ticket is protected, and what it comes to.
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
  onRemoveVoucher,
  onSummary,
  agreed,
  onAgree,
  agreementError,
  plan,
  onPlan,
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
  onRemoveVoucher: () => void;
  onSummary: () => void;
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
  agreementError: boolean;
  /** The instalment plan lives in the journey — the confirmation shows it too. */
  plan: number;
  onPlan: (count: number) => void;
}) {
  const { width } = useWindowDimensions();
  const copy = bookingCopy.checkout;
  /* Protection is on by default in the comp and prices nothing here. */
  const [protectionOn, setProtectionOn] = useState(true);
  const [protectionInfo, setProtectionInfo] = useState(false);
  const [protectionAsk, setProtectionAsk] = useState(false);

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
        <Row
          label={copy.basket(
            bookingCopy.summaryBar.tickets(totals.ticketCount),
            totals.addonCount,
          )}
          trailing={<Button size="s" label={copy.view} onPress={onSummary} />}
        />
      </View>

      {/* Delivery */}
      <View style={styles.block}>
        <SectionTitle>{copy.delivery}</SectionTitle>
        {hasMerch ? (
          <Row
            icon={Delivery}
            label={copy.deliveryMethod}
            sub={delivery ? describe(delivery) : copy.deliveryHint}
            trailing={
              <Button
                size="s"
                label={delivery ? copy.edit : copy.add}
                onPress={onDelivery}
              />
            }
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

        <Row
          icon={Wallet}
          label={copy.wallet}
          slot={
            <Text variant="bodyS" color={colors.contentPrimary}>
              {formatMoney(bookingConfig.walletCredit)}
            </Text>
          }
          trailing={<Switch on={wallet} onChange={onWallet} label={copy.wallet} />}
        />

        <Option
          icon={<ApplePay width={24} height={24} />}
          label={copy.applePay}
          selected={method === "apple-pay"}
          onPress={() => onMethod("apple-pay")}
        />
        <Option
          icon={<Card width={24} height={24} />}
          label={copy.card}
          sub={card ? `**** ${card.last4}` : undefined}
          slot={
            card ? undefined : (
              <View style={styles.marks}>
                {copy.cardMarks.map((mark) => {
                  const Mark = icon(mark);
                  return Mark ? <Mark key={mark} width={24} height={16} /> : null;
                })}
              </View>
            )
          }
          selected={method === "card"}
          onPress={() => onMethod("card")}
        />

        {method === "card" && (
          <Button
            icon={Plus}
            label={copy.addCard}
            onPress={onAddCard}
            style={styles.addCard}
          />
        )}

        {/* Choosing it opens the plan directly underneath: the panel shares
            the row's bottom edge rather than sitting apart from it. */}
        <View>
          <Option
            icon={<Split width={24} height={24} />}
            label={copy.bnpl}
            sub={copy.bnplHint}
            selected={method === "bnpl"}
            onPress={() => onMethod("bnpl")}
          />

          {method === "bnpl" && (
            <View style={styles.planPanel}>
              <Text variant="bodyBold">{copy.payments}</Text>

              <View style={styles.plans}>
                {bookingConfig.paymentPlans.map((count) => (
                  <Chip
                    key={count}
                    block
                    label={copy.plan(count, formatMoney(totals.total / count))}
                    selected={plan === count}
                    onPress={() => onPlan(count)}
                  />
                ))}
              </View>

              {/* One stop per payment: the first leaves today, the rest a
                month apart. */}
            <PaymentSchedule
              payments={Array.from({ length: plan }, (_, index) => ({
                amount: formatMoney(totals.total / plan),
                when: index === 0 ? copy.today : monthDay(index),
              }))}
            />

              <Text variant="bodyS" color={colors.contentSecondary}>
                {copy.bnplNote}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Vouchers — a promo code or Beats, in one place. */}
      <View style={styles.block}>
        <SectionTitle>{copy.vouchers}</SectionTitle>
        {voucher ? (
          <Row
            icon={Promo}
            label={voucher.code}
            sub={copy.promoSaved(formatMoney(totals.promo))}
            subColor={colors.positive}
            trailing={
              <Tap
                accessibilityRole="button"
                accessibilityLabel={copy.promoRemove}
                onPress={onRemoveVoucher}
                style={styles.iconButton}
              >
                <TrashRed width={16} height={16} />
              </Tap>
            }
          />
        ) : (
          <Row
            icon={Promo}
            label={copy.vouchers}
            trailing={<Button size="s" label={copy.add} onPress={onVouchers} />}
          />
        )}
      </View>

      {/* Ticket protection — the mark explains it, the switch asks before it
          takes it away. */}
      <Row
        icon={ShieldMark}
        label={copy.protection.title}
        labelMark={
          <Tap
            accessibilityRole="button"
            accessibilityLabel={bookingCopy.protectionSheet.title}
            onPress={() => setProtectionInfo(true)}
            scale={0.9}
            /* The glyph is 16px; the target around it is not. */
            hitSlop={12}
          >
            <Info width={16} height={16} />
          </Tap>
        }
        sub={copy.protection.hint}
        trailing={
          <Switch
            on={protectionOn}
            onChange={(on) => (on ? setProtectionOn(true) : setProtectionAsk(true))}
            label={copy.protection.title}
          />
        }
      />

      <ProtectionInfoSheet
        open={protectionInfo}
        onClose={() => setProtectionInfo(false)}
      />
      <ProtectionSkipSheet
        open={protectionAsk}
        onClose={() => setProtectionAsk(false)}
        onSkip={() => {
          setProtectionOn(false);
          setProtectionAsk(false);
        }}
      />

      {/* Price */}
      <View style={styles.block}>
        <SectionTitle>{copy.priceDetails}</SectionTitle>
        <View style={styles.totals}>
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
          {totals.wallet > 0 && (
            <TotalRow
              label={bookingCopy.orderSummary.wallet}
              value={`-${formatMoney(totals.wallet)}`}
              tone="positive"
            />
          )}
          {totals.promo > 0 && (
            <TotalRow
              label={bookingCopy.confirmation.price.promo}
              value={`-${formatMoney(totals.promo)}`}
              tone="positive"
            />
          )}
          <View style={styles.rule} />
          <TotalRow
            label={copy.total}
            labelNote={copy.includeVat}
            value={formatMoney(totals.total)}
            strong
            caps
            note={bookingCopy.orderSummary.vat(formatMoney(totals.vat))}
          />
        </View>

        {/* What this booking earns — the one forward-looking line on the page. */}
        {earned > 0 && (
          <View style={styles.earn}>
            <Gift width={16} height={16} />
            <Text variant="bodyS" color={colors.contentPrimary} style={styles.rowLabel}>
              {copy.earn(earned)}
            </Text>
          </View>
        )}
      </View>

      {/* The one box that must be ticked. */}
      <Tap
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => onAgree(!agreed)}
        scale={0.99}
        style={styles.agree}
      >
        <View style={[styles.box, agreed && styles.boxOn]}>
          {agreed && <View style={styles.tick} />}
        </View>
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

/** The comp's shield is 18 × 20 drawn inside the 24px icon box. */
function ShieldMark(props: SvgProps) {
  return (
    <View style={styles.iconBox}>
      <Shield width={18} height={20} {...props} />
    </View>
  );
}

/**
 * The comp's contained list row: a hairline box, a 24px mark on the left, a
 * label — with an optional mark beside it — over an optional line or slot,
 * and one control on the right.
 */
function Row({
  icon: Mark,
  label,
  labelMark,
  sub,
  subColor = colors.contentSecondary,
  slot,
  trailing,
}: {
  icon?: React.FC<SvgProps>;
  label: string;
  labelMark?: React.ReactNode;
  sub?: string;
  subColor?: string;
  slot?: React.ReactNode;
  trailing: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      {Mark && <Mark width={24} height={24} />}
      <View style={styles.rowBody}>
        <View style={styles.rowTitle}>
          <Text variant="body" numberOfLines={1}>
            {label}
          </Text>
          {labelMark}
        </View>
        {sub && (
          <Text variant="bodyS" color={subColor} numberOfLines={2}>
            {sub}
          </Text>
        )}
        {slot}
      </View>
      {trailing}
    </View>
  );
}

/**
 * "24 Aug" — the instalment that falls `monthsAhead` months from today. The
 * month is abbreviated because four of these share a row.
 */
function monthDay(monthsAhead: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function describe(delivery: DeliveryChoice) {
  if (delivery.kind === "pickup") return delivery.point;
  return `${delivery.address}, ${delivery.city}, ${delivery.country}`;
}

const styles = StyleSheet.create({
  step: { gap: space.xl },
  block: { gap: space.m },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    minHeight: 52,
    paddingLeft: space.l,
    paddingRight: space.m,
    paddingVertical: space.m,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderTertiary,
  },
  rowBody: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { flexDirection: "row", alignItems: "center", gap: space.xs },
  rowLabel: { flex: 1, minWidth: 0 },
  iconBox: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  marks: { flexDirection: "row", alignItems: "center", gap: space.s, paddingTop: space.xs },
  addCard: { alignSelf: "flex-start" },

  /* The comp hangs the plan under the row on the dimmest border it has. */
  planPanel: {
    gap: space.xl,
    padding: space.l,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.overlay5,
  },
  plans: { gap: space.s },

  totals: { gap: space.s },
  rule: { height: 1, backgroundColor: colors.borderTertiary },

  /* The comp's positive surface: a deep green, not a tint of the page. */
  earn: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    padding: space.s,
    backgroundColor: "#0f3e21",
  },

  agree: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
  box: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  boxOn: { backgroundColor: colors.white, borderColor: colors.white },
  tick: {
    width: 6,
    height: 11,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.bgPrimary,
    transform: [{ rotate: "45deg" }],
  },
});
