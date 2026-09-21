import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import ApplePay from "../../icons/ic-applepay-24.svg";
import Card from "../../icons/ic-card-24.svg";
import Plus from "../../icons/ic-plus-16.svg";
import Wallet from "../../icons/ic-wallet.svg";
import { Button } from "../../components/Button";
import { Dock } from "../../components/Dock";
import { Sheet } from "../../components/Sheet";
import { image } from "../../images";
import { Switch } from "../../components/Switch";
import { Text } from "../../theme/Text";
import { colors, space } from "../../theme/tokens";
import { bookingConfig, bookingCopy, formatMoney } from "../../data/booking";
import { installmentCopy, type Installment } from "../../data/installments";
import { Option, TotalRow } from "./BookingSheets";

/**
 * Settling one instalment, or all of them at once — Figma 442:10579.
 *
 * What is owed at the top, then the same payment rows the checkout uses, and
 * a dock that names the figure it is about to take.
 */
export function PayInstallmentSheet({
  payments,
  onClose,
  onPaid,
}: {
  /** The instalments being settled, or null when the sheet is shut. */
  payments: Installment[] | null;
  onClose: () => void;
  onPaid: (payments: Installment[]) => void;
}) {
  const copy = installmentCopy.paySheet;
  const [wallet, setWallet] = useState(true);
  const [method, setMethod] = useState("card");

  const due = (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
  const credit = wallet ? Math.min(bookingConfig.walletCredit, due) : 0;
  const total = due - credit;

  return (
    <Sheet
      open={payments !== null}
      onClose={onClose}
      title={copy.title}
      closeLabel={copy.close}
      footer={
        <Dock surface="panel">
          <Button
            variant="brand"
            label={copy.confirm(formatMoney(total))}
            onPress={() => payments && onPaid(payments)}
          />
        </Dock>
      }
    >
      <Text variant="titleBody" uppercase>
        {copy.details}
      </Text>

      <View style={styles.totals}>
        {(payments ?? []).map((payment) => (
          <TotalRow
            key={payment.id}
            label={payment.label}
            value={formatMoney(payment.amount)}
          />
        ))}
        {credit > 0 && (
          <TotalRow
            label={copy.wallet}
            value={`-${formatMoney(credit)}`}
            tone="positive"
          />
        )}
        <View style={styles.ruleDashed} />
        <TotalRow
          label={copy.total}
          value={formatMoney(total)}
          strong
          note={copy.vat(formatMoney(Math.round(total * 0.15 * 100) / 100))}
        />
      </View>

      <Text variant="titleBody" uppercase>
        {copy.payWith}
      </Text>

      <View style={styles.row}>
        <Wallet width={24} height={24} />
        <View style={styles.rowBody}>
          <Text variant="body">{copy.useWallet}</Text>
          <Text variant="bodyS" color={colors.contentPrimary}>
            {formatMoney(bookingConfig.walletCredit)}
          </Text>
        </View>
        <Switch on={wallet} onChange={setWallet} label={copy.useWallet} />
      </View>

      <Option
        icon={<ApplePay width={24} height={24} />}
        label={bookingCopy.checkout.applePay}
        selected={method === "apple-pay"}
        onPress={() => setMethod("apple-pay")}
      />
      <Option
        icon={<Card width={24} height={24} />}
        label={bookingCopy.checkout.card}
        sub="**** 1243"
        selected={method === "card"}
        onPress={() => setMethod("card")}
      />

      <Button icon={Plus} label={copy.addCard} style={styles.addCard} />
    </Sheet>
  );
}

/**
 * The receipt after one clears — Figma 442:11389. It offers the next payment
 * straight away, because the plan is the reason you are here.
 */
export function PaymentReceivedSheet({
  received,
  onClose,
  onViewBooking,
  onPayAnother,
}: {
  received: { amount: number; next?: string } | null;
  onClose: () => void;
  onViewBooking: () => void;
  onPayAnother: () => void;
}) {
  const copy = installmentCopy.received;

  return (
    <Sheet
      open={received !== null}
      onClose={onClose}
      title=""
      closeLabel={copy.close}
      footer={
        <Dock surface="panel">
          <Button variant="primary" label={copy.viewBooking} onPress={onViewBooking} />
          {received?.next && (
            <Button variant="brand" label={copy.payAnother} onPress={onPayAnother} />
          )}
        </Dock>
      }
    >
      <View style={styles.receipt}>
        <Image
          source={image("/assets/payment-received.png")}
          style={styles.mark}
          contentFit="contain"
          transition={200}
        />
        <Text variant="displayXS" uppercase style={styles.centred}>
          {copy.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} style={styles.centred}>
          {received?.next
            ? copy.body(formatMoney(received.amount), received.next)
            : copy.bodyDone(formatMoney(received?.amount ?? 0))}
        </Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  totals: { gap: space.s, width: "100%" },
  ruleDashed: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderTertiary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderTertiary,
  },
  rowBody: { flex: 1, minWidth: 0 },
  addCard: { alignSelf: "flex-start" },

  receipt: { alignItems: "center", gap: space.l, width: "100%" },
  centred: { textAlign: "center" },
  mark: { width: 88, height: 88 },
});
