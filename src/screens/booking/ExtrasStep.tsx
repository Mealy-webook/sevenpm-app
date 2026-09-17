import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { Chip } from "../../components/Chip";
import { Stepper } from "../../components/Stepper";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, space } from "../../theme/tokens";
import {
  addons,
  bookingCopy,
  formatMoney,
  type BookingAddon,
} from "../../data/booking";
import { quantityOf, quantityOfAny, type Cart } from "./cart";

/**
 * Step 2, from Figma 2078:45505 / 2212:13243: merchandise as a grid of product
 * tiles, parking as rows.
 *
 * A shirt comes in sizes, so its tile opens the details sheet instead of
 * adding straight to the basket — the basket keeps one line per size, and a
 * tile that added an unnamed "default" size would be quietly choosing for you.
 * Parking has no sizes and adds in place.
 */
export function ExtrasStep({
  cart,
  onAdjust,
  onDetails,
}: {
  cart: Cart;
  onAdjust: (addon: BookingAddon, by: number, size?: string) => void;
  onDetails: (addon: BookingAddon) => void;
}) {
  const [category, setCategory] = useState("merchandise");
  const shown = addons.filter((addon) => addon.category === category);
  const merch = category === "merchandise";

  return (
    <View style={styles.step}>
      <Text variant="sectionTitle" uppercase color={colors.white}>
        {bookingCopy.extras.title}
      </Text>

      <View style={styles.chips} accessibilityRole="tablist">
        {bookingCopy.extras.categories.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={category === item.id}
            onPress={() => setCategory(item.id)}
          />
        ))}
      </View>

      {merch ? (
        <View style={styles.grid}>
          {shown.map((addon) => {
            const count = quantityOfAny(cart, addon.id);
            return (
              <Tap
                key={addon.id}
                accessibilityRole="button"
                accessibilityLabel={bookingCopy.extras.openDetails(addon.name)}
                onPress={() => onDetails(addon)}
                scale={0.98}
                style={styles.card}
              >
                <View>
                  <Image
                    source={image(addon.image)}
                    style={styles.shot}
                    contentFit="cover"
                    transition={300}
                  />
                  {count > 0 && (
                    <View style={styles.badge}>
                      <Text variant="captionBold" color={colors.bgSecondary}>
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="bodyS" numberOfLines={2}>
                  {addon.name}
                </Text>
                <View style={styles.price}>
                  <Text variant="bodyBold">{formatMoney(addon.price)}</Text>
                  {addon.wasPrice !== undefined && (
                    <Text
                      variant="caption"
                      color={colors.contentSecondary}
                      style={styles.struck}
                    >
                      {addon.wasPrice}
                    </Text>
                  )}
                </View>
                {addon.discount && (
                  <Text variant="caption" color={colors.positive}>
                    {addon.discount}
                  </Text>
                )}
              </Tap>
            );
          })}
        </View>
      ) : (
        <View style={styles.rows}>
          {shown.map((addon) => (
            <View key={addon.id} style={styles.row}>
              <View style={styles.rowBody}>
                <Text variant="bodyBold" color={colors.white} numberOfLines={1}>
                  {addon.name}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {formatMoney(addon.price)}
                </Text>
              </View>
              <Stepper
                value={quantityOf(cart, addon.id)}
                name={addon.name}
                onAdd={() => onAdjust(addon, 1)}
                onChange={(by) => onAdjust(addon, by)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: space.xl },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.s },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.m },
  card: { width: "47%", gap: space.xs },
  shot: { width: "100%", aspectRatio: 0.85, backgroundColor: colors.bgSecondary },
  badge: {
    position: "absolute",
    top: space.s,
    right: space.s,
    minWidth: 24,
    height: 24,
    paddingHorizontal: space.xs,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  price: { flexDirection: "row", alignItems: "baseline", gap: space.s },
  struck: { textDecorationLine: "line-through" },

  rows: { gap: space.m },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    padding: space.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDimmed,
  },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
});
