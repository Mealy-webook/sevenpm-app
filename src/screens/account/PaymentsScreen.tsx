import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import CardSheen from "../../icons/ic-card-sheen.svg";
import Trash from "../../icons/ic-trash-red-16.svg";
import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { NavBar } from "../../components/Screen";
import { Switch } from "../../components/Switch";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import {
  accountUser,
  paymentCards,
  paymentsCopy,
  type PaymentCard,
} from "../../data/account";

/**
 * Payments, from Figma 454:61192.
 *
 * The comp opens on the page's name at display size over the secondary
 * ground, then gives each card two parts: the face, and one action row
 * clamped to its bottom edge. The face is the one drawn object in this system
 * that keeps its corners — `radii.card`, 24px — and it carries the name at
 * the top, then the number, the expiry and the brand at the bottom. The row
 * under it holds "Set as default" with the system's Switch, and Remove.
 *
 * **The default card's Remove is drawn dead**, which is the comp's own answer:
 * 454:61219 is the disabled button and the second card's is not. You cannot
 * remove the card everything is charged to, and a missing button leaves you
 * hunting for one that was never there.
 *
 * **The comp stops at the cards**, and so does this. Billing details,
 * receipts and an Add card button were all here and are all gone: none of
 * them is drawn in 454:61192, and a page that shows more than its comp is a
 * page the comp can no longer be checked against.
 */
export function PaymentsScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [cards, setCards] = useState<PaymentCard[]>(paymentCards);
  const [removing, setRemoving] = useState<PaymentCard | null>(null);

  const copy = paymentsCopy;

  const makeDefault = (id: string) =>
    setCards((current) =>
      current.map((card) => ({ ...card, primary: card.id === id })),
    );

  return (
    <View style={styles.page}>
      <NavBar onBack={navigation.goBack} />

      <View style={styles.header}>
        <Text
          variant="displayScreen"
          uppercase
          color={colors.white}
          numberOfLines={1}
          style={displaySize(type.displayScreen, width)}
        >
          {copy.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Cards */}
        <View style={styles.block}>
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
                    <LinearGradient
                      /* 454:61201 — 111.7°, #282828 to #0b0b0b. */
                      colors={["#282828", "#0b0b0b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0.92 }}
                      style={styles.faceFill}
                    />
                    {/* 454:61203 — the specular band the comp lays over the
                        gradient, white at 6%. It is drawn wider than the card
                        in the file and clipped by it. */}
                    <CardSheen
                      width={FACE_SHEEN_W}
                      height={CARD_H * (255 / 254.582)}
                      style={styles.faceFill}
                    />
                    <Text variant="bodyL" color={colors.contentPrimary}>
                      {accountUser.name}
                    </Text>
                    <View style={styles.faceFoot}>
                      <View style={styles.faceFigures}>
                        {/* One string, because `uppercase` only reaches a
                            child that is one — split across an expression it
                            silently does nothing. */}
                        <Text variant="titleBody" uppercase color={colors.contentPrimary}>
                          {`xxxx xxxx xxxx ${card.last4}`}
                        </Text>
                        <Text variant="bodyS" color={colors.contentPrimary}>
                          {copy.cards.expires} {card.expiry}
                        </Text>
                      </View>
                      {Mark && <Mark width={48} height={48} />}
                    </View>
                  </View>

                  {/* Clamped to the face's bottom edge, as the comp draws it:
                      one bar, the toggle at the left, Remove at the right. */}
                  <View style={styles.cardActions}>
                    <View style={styles.setDefault}>
                      <Text variant="bodyL" color={colors.contentSecondary}>
                        {copy.cards.setDefault}
                      </Text>
                      {/* Drawn live either way, as the comp draws it. Turning
                          the default off would leave nothing to charge, so the
                          only move it makes is turning another one on. */}
                      <Switch
                        on={Boolean(card.primary)}
                        label={`${copy.cards.setDefault} — ${card.brand} ${card.last4}`}
                        onChange={() => !card.primary && makeDefault(card.id)}
                      />
                    </View>
                    <Button
                      label={copy.cards.remove}
                      icon={Trash}
                      size="m"
                      tone="destructive"
                      disabled={Boolean(card.primary)}
                      onPress={() => setRemoving(card)}
                    />
                  </View>
                </View>
              );
            })
          )}

        </View>
      </ScrollView>

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
    </View>
  );
}

/** The comp draws the face 190 tall. */
const CARD_H = 190;
/** And the sheen over it 461.757 wide on a 390 frame — wider, then clipped. */
const FACE_SHEEN_W = 461.757;

const styles = StyleSheet.create({
  body: { padding: gutter, paddingBottom: space.section, gap: space.xl },

  block: { gap: space.m },
  blockHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  blockTitle: { flex: 1, minWidth: 0 },

  /* The comp bands the title over the secondary ground rather than putting
     it in the bar. */
  page: { flex: 1, backgroundColor: colors.surfaceBase },
  header: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: gutter,
    paddingVertical: gutter,
  },

  /* Face and action row are one object: no gap between them. */
  cardWrap: { gap: 0 },
  /* Square. The comp's card surface carries a 24 radius in the file, but the
     frame it sits in clips it and the render has square corners — measured,
     the face's first row starts at the same x as every row below it. */
  face: {
    height: CARD_H,
    justifyContent: "space-between",
    padding: space.l,
    overflow: "hidden",
  },
  faceFill: { ...StyleSheet.absoluteFill },
  faceFoot: { flexDirection: "row", alignItems: "flex-end", gap: space.m },
  faceFigures: { flex: 1, minWidth: 0, gap: space.xs },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingLeft: space.l,
    paddingRight: space.m,
    paddingVertical: space.m,
    backgroundColor: colors.overlay5,
  },
  setDefault: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: space.s },

  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
});
