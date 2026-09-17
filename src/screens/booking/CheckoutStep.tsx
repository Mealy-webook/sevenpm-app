import { Pressable, StyleSheet, View } from "react-native";

import CheckOff from "../../icons/ic-check-off.svg";
import CheckOn from "../../icons/ic-check-on.svg";
import Trash from "../../icons/ic-trash-red-16.svg";
import { Button } from "../../components/Button";
import { Switch } from "../../components/Switch";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, space } from "../../theme/tokens";
import { bookingConfig, bookingCopy, formatMoney } from "../../data/booking";
import { Option, TotalRow } from "./BookingSheets";
import type { Delivery, SavedCard } from "./BookingSheets";
import type { Totals } from "./cart";

/**
 * Step 3, from Figma 2033:18293: where the order gets a delivery address, a
 * payment method, its discounts, and the one box that must be ticked.
 *
 * The price block is the same arithmetic the summary sheet shows, stated once
 * more in full — VAT sits inside the total rather than on top of it, which is
 * how the comp reads it, so the figure quoted here is the figure charged.
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
  promo,
  onPromo,
  onRemovePromo,
  agreed,
  onAgree,
  agreementError,
}: {
  totals: Totals;
  hasMerch: boolean;
  delivery: Delivery | null;
  onDelivery: () => void;
  method: string;
  onMethod: (id: string) => void;
  card: SavedCard | null;
  onAddCard: () => void;
  wallet: boolean;
  onWallet: (on: boolean) => void;
  promo: { code: string; off: number } | null;
  onPromo: () => void;
  onRemovePromo: () => void;
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
  agreementError: boolean;
}) {
  const copy = bookingCopy.checkout;

  return (
    <View style={styles.step}>
      <Text variant="sectionTitle" uppercase color={colors.white}>
        {copy.title}
      </Text>

      {/* Delivery */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.delivery}
        </Text>
        {hasMerch ? (
          <>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {copy.deliveryHint}
            </Text>
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text variant="bodyBold">{copy.deliveryMethod}</Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {describe(delivery)}
                </Text>
              </View>
              <Button
                label={delivery ? copy.edit : copy.add}
                onPress={onDelivery}
              />
            </View>
          </>
        ) : (
          <Text variant="bodyS" color={colors.contentSecondary}>
            {copy.deliveryNone}
          </Text>
        )}
      </View>

      {/* Payment */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.payWith}
        </Text>

        <View style={styles.walletRow}>
          <Text variant="body" style={styles.walletLabel}>
            {copy.wallet}
          </Text>
          <Text variant="bodySBold" color={colors.contentSecondary}>
            {formatMoney(bookingConfig.walletCredit)}
          </Text>
          <Switch on={wallet} onChange={onWallet} label={copy.wallet} />
        </View>

        {copy.payMethods.map((item) => {
          const Mark = icon(item.icon);
          return (
            <Option
              key={item.id}
              label={item.label}
              sub={
                item.id === "card"
                  ? card
                    ? `${card.brand} •••• ${card.last4}`
                    : copy.cardEmpty
                  : undefined
              }
              selected={method === item.id}
              onPress={() => onMethod(item.id)}
              trailing={Mark ? <Mark width={24} height={24} /> : undefined}
            />
          );
        })}

        {method === "card" && (
          <View style={styles.marks}>
            {copy.cardMarks.map((mark) => {
              const Mark = icon(mark);
              return Mark ? (
                <Mark key={mark} width={32} height={20} />
              ) : null;
            })}
            <View style={styles.spacer} />
            <Button label={copy.addCard} onPress={onAddCard} />
          </View>
        )}
      </View>

      {/* Discounts */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.discounts}
        </Text>
        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text variant="bodyBold">{promo ? promo.code : copy.promo}</Text>
            {promo && (
              <Text variant="bodyS" color={colors.positive}>
                {copy.promoSaved(formatMoney(totals.promo))}
              </Text>
            )}
          </View>
          {promo ? (
            <Button
              label={bookingCopy.promoDialog.clear}
              icon={Trash}
              tone="destructive"
              onPress={onRemovePromo}
            />
          ) : (
            <Button label={copy.add} onPress={onPromo} />
          )}
        </View>
      </View>

      {/* Price */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {copy.priceDetails}
        </Text>
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
            value={`− ${formatMoney(totals.promo)}`}
          />
        )}
        {totals.wallet > 0 && (
          <TotalRow
            label={bookingCopy.orderSummary.wallet}
            value={`− ${formatMoney(totals.wallet)}`}
          />
        )}
        <TotalRow
          label={bookingCopy.orderSummary.total}
          value={formatMoney(totals.total)}
          strong
          note={bookingCopy.orderSummary.vat(formatMoney(totals.vat))}
        />
      </View>

      {/* The one box that must be ticked. */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => onAgree(!agreed)}
        style={({ pressed }) => [styles.agree, pressed && styles.pressed]}
      >
        {agreed ? <CheckOn width={20} height={20} /> : <CheckOff width={20} height={20} />}
        <Text variant="bodyS" color={colors.contentSecondary} style={styles.agreeText}>
          {copy.agreement}
        </Text>
      </Pressable>
      {agreementError && !agreed && (
        <Text variant="caption" color={colors.negative}>
          {copy.agreementError}
        </Text>
      )}

      <Text variant="caption" color={colors.contentSecondary}>
        {`${copy.terms} ${copy.termsLink}. ${copy.privacyLead} ${copy.privacyLink} ${copy.privacyTail}`}
      </Text>
    </View>
  );
}

function describe(delivery: Delivery | null) {
  if (!delivery) return bookingCopy.checkout.deliveryHint;
  if (delivery.kind === "pickup") return delivery.point;
  return `${delivery.address}, ${delivery.city}, ${delivery.country}`;
}

const styles = StyleSheet.create({
  step: { gap: space.xl },
  block: { gap: space.m },
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },

  walletRow: { flexDirection: "row", alignItems: "center", gap: space.m },
  walletLabel: { flex: 1, minWidth: 0 },

  marks: { flexDirection: "row", alignItems: "center", gap: space.s },
  spacer: { flex: 1 },

  agree: { flexDirection: "row", alignItems: "flex-start", gap: space.m },
  agreeText: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.7 },
});
