import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Download from "../../icons/ic-download-16.svg";
import Trash from "../../icons/ic-trash-red-16.svg";
import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { NavBar, Page } from "../../components/Screen";
import { CardSheet, type SavedCard } from "../booking/BookingSheets";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, gutter, radii, space } from "../../theme/tokens";
import {
  billingDetails,
  paymentCards,
  paymentsCopy,
  receipts,
  type PaymentCard,
} from "../../data/account";

/**
 * Payments: the cards on file, the billing details, and every receipt.
 *
 * The card face is the one drawn object in this system that keeps its corners
 * — `radii.card`, 24px. Everything around it is square, which is what makes
 * the face read as a card rather than as another panel.
 *
 * The default card's Remove is present but dead, with the reason stated. A
 * missing button leaves you hunting for it; a disabled one with an explanation
 * answers the question on the spot.
 */
export function PaymentsScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<PaymentCard[]>(paymentCards);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PaymentCard | null>(null);

  const copy = paymentsCopy;

  const add = (card: SavedCard) =>
    setCards((current) => [
      ...current,
      {
        id: `${card.brand}-${card.last4}-${current.length}`,
        brand: card.brand,
        last4: card.last4,
        mark: card.mark,
      },
    ]);

  const makeDefault = (id: string) =>
    setCards((current) =>
      current.map((card) => ({ ...card, primary: card.id === id })),
    );

  return (
    <Page>
      <NavBar title={copy.title} onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="body" color={colors.contentSecondary}>
          {copy.description}
        </Text>

        {/* Cards */}
        <View style={styles.block}>
          <View style={styles.blockHead}>
            <Text variant="titleBody" uppercase style={styles.blockTitle}>
              {copy.cards.title}
            </Text>
            <Button label={copy.cards.addCard} onPress={() => setAdding(true)} />
          </View>

          {cards.length === 0 ? (
            <Text variant="bodyBold" color={colors.contentSecondary}>
              {copy.cards.empty}
            </Text>
          ) : (
            cards.map((card) => {
              const Mark = icon(card.mark);
              return (
                <View key={card.id} style={styles.cardWrap}>
                  <View style={styles.face}>
                    <View style={styles.faceHead}>
                      {Mark ? (
                        <Mark width={48} height={20} />
                      ) : (
                        <Text variant="bodyBold">{card.brand}</Text>
                      )}
                      {card.primary && (
                        <Text variant="captionBold" uppercase color={colors.brand}>
                          Default
                        </Text>
                      )}
                    </View>
                    <Text variant="title" color={colors.white}>
                      •••• {card.last4}
                    </Text>
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {card.expiry
                        ? `${copy.cards.expires} ${card.expiry}`
                        : copy.cards.expires}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    {!card.primary && (
                      <Button
                        label={copy.cards.setDefault}
                        onPress={() => makeDefault(card.id)}
                      />
                    )}
                    <Button
                      label={copy.cards.remove}
                      icon={Trash}
                      tone="destructive"
                      disabled={card.primary}
                      onPress={() => setRemoving(card)}
                    />
                  </View>
                  {card.primary && (
                    <Text variant="caption" color={colors.contentSecondary}>
                      {copy.cards.defaultLocked}
                    </Text>
                  )}
                </View>
              );
            })
          )}

          <Text variant="caption" color={colors.contentSecondary}>
            {copy.cards.note}
          </Text>
        </View>

        {/* Billing */}
        <View style={styles.block}>
          <Text variant="titleBody" uppercase>
            {copy.billing.title}
          </Text>
          {billingDetails.map((detail) => (
            <View key={detail.label} style={styles.row}>
              <View style={styles.rowBody}>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {detail.label}
                </Text>
                <Text
                  variant="bodyBold"
                  color={detail.value ? colors.contentPrimary : colors.contentSecondary}
                  numberOfLines={1}
                >
                  {detail.value ?? copy.billing.emptyValue}
                </Text>
              </View>
              {detail.action && <Button label={detail.action} />}
            </View>
          ))}
        </View>

        {/* Receipts */}
        <View style={styles.block}>
          <Text variant="titleBody" uppercase>
            {copy.receipts.title}
          </Text>
          {receipts.map((receipt) => (
            <View key={receipt.id} style={styles.row}>
              <View style={styles.rowBody}>
                <Text variant="bodyBold" numberOfLines={1}>
                  {receipt.label}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {receipt.date} · {receipt.method}
                </Text>
              </View>
              <Text variant="bodySBold">{receipt.amount}</Text>
              <Button
                label={copy.receipts.download}
                icon={Download}
                /* There is no receipt to hand over, so the button is drawn
                   dead rather than promising a file that never arrives. */
                disabled
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <CardSheet
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(card) => {
          add(card);
          setAdding(false);
        }}
      />

      <Confirm
        open={removing !== null}
        title={copy.cards.confirmTitle}
        body={copy.cards.confirmBody(
          removing ? `${removing.brand} •••• ${removing.last4}` : "",
        )}
        cancel={copy.cards.cancel}
        confirm={copy.cards.remove}
        tone="destructive"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          setCards((current) => current.filter((card) => card.id !== removing?.id));
          setRemoving(null);
        }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  body: { padding: gutter, paddingBottom: space.section, gap: space.xl },
  block: { gap: space.m },
  blockHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  blockTitle: { flex: 1, minWidth: 0 },

  cardWrap: { gap: space.s },
  face: {
    gap: space.xs,
    padding: space.xl,
    backgroundColor: colors.bgTertiary,
    borderRadius: radii.card,
  },
  faceHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  cardActions: { flexDirection: "row", gap: space.s },

  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
});
