import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";

import Info from "../../icons/ic-info-20.svg";
import Minus from "../../icons/ic-minus-16-ink.svg";
import Plus from "../../icons/ic-plus-16-ink.svg";

import { Chip } from "../../components/Chip";
import { Stepper } from "../../components/Stepper";
import { Tap } from "../../components/Tap";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import {
  addons,
  bookingConfig,
  bookingCopy,
  formatMoney,
  type BookingAddon,
} from "../../data/booking";
import { quantityOf, quantityOfAny, type Cart } from "./cart";

/**
 * Step 2, from Figma 346:46509 (merchandise) and 346:46579 (parking).
 *
 * The app comps split the extras in two: merchandise and parking are separate
 * stages of the journey, and the dock reads "Next: Parking" then "Next:
 * Checkout". The chips are still there and still jump between them, so the
 * split is a suggested order rather than a gate — which is why the category is
 * owned by the journey rather than by this component.
 *
 * A shirt comes in sizes, so its tile opens the details sheet instead of
 * adding straight to the basket — the basket keeps one line per size, and a
 * tile that added an unnamed "default" size would be quietly choosing for you.
 * Parking has no sizes and adds in place.
 */
export function ExtrasStep({
  category,
  onCategory,
  cart,
  onAdjust,
  onDetails,
}: {
  category: string;
  onCategory: (id: string) => void;
  cart: Cart;
  onAdjust: (addon: BookingAddon, by: number, size?: string) => void;
  onDetails: (addon: BookingAddon) => void;
}) {
  const { width } = useWindowDimensions();
  const shown = addons.filter((addon) => addon.category === category);
  const merch = category === "merchandise";

  return (
    <View style={styles.step}>
      <Text
        variant="displayStep"
        uppercase
        color={colors.white}
        style={displaySize(type.displayStep, width)}
      >
        {bookingCopy.extras.title}
      </Text>

      <View style={styles.chips} accessibilityRole="tablist">
        {bookingCopy.extras.categories.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={category === item.id}
            onPress={() => onCategory(item.id)}
          />
        ))}
      </View>

      {merch ? (
        <View style={styles.grid}>
          {shown.map((addon) => {
            const count = quantityOfAny(cart, addon.id);
            /* The comp's "+ Add" adds in place; the size it adds is the one
               its details sheet opens on. */
            const size = addon.sizes?.includes("M") ? "M" : addon.sizes?.[0];
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
                  {/* A white control sits on the photo: "+ Add" until there
                      is one in the basket, then a stepper. */}
                  {count === 0 ? (
                    <Tap
                      accessibilityRole="button"
                      accessibilityLabel={bookingCopy.extras.add}
                      onPress={() => onAdjust(addon, 1, size)}
                      style={styles.addOnShot}
                    >
                      <Plus width={16} height={16} />
                      <Text variant="bodyBold" color={colors.bgSecondary}>
                        {bookingCopy.extras.add}
                      </Text>
                    </Tap>
                  ) : (
                    <View style={styles.stepOnShot}>
                      <Tap
                        accessibilityRole="button"
                        accessibilityLabel={bookingCopy.extras.less}
                        onPress={() => onAdjust(addon, -1, size)}
                        style={styles.stepKey}
                      >
                        <Minus width={16} height={16} />
                      </Tap>
                      <Text variant="bodyBold" color={colors.bgSecondary} style={styles.stepValue}>
                        {count}
                      </Text>
                      <Tap
                        accessibilityRole="button"
                        accessibilityLabel={bookingCopy.extras.add}
                        onPress={() => onAdjust(addon, 1, size)}
                        style={styles.stepKey}
                      >
                        <Plus width={16} height={16} />
                      </Tap>
                    </View>
                  )}
                </View>
                <Text variant="body" numberOfLines={1}>
                  {bookingCopy.extras.productName}
                </Text>
                <Text variant="bodyBold">{formatMoney(addon.price)}</Text>
              </Tap>
            );
          })}
        </View>
      ) : (
        <View style={styles.rows}>
          {shown.map((addon) => (
            <View key={addon.id} style={styles.row}>
              <View style={styles.rowBody}>
                <View style={styles.rowTitle}>
                  <Text variant="bodyBold" color={colors.white} numberOfLines={1}>
                    {addon.name}
                  </Text>
                  <Tap
                    accessibilityRole="button"
                    accessibilityLabel={bookingCopy.extras.openDetails(addon.name)}
                    onPress={() => onDetails(addon)}
                    scale={0.9}
                  >
                    <Info width={20} height={20} />
                  </Tap>
                </View>
                <View style={styles.price}>
                  <Text variant="bodyBold">{formatMoney(addon.price)}</Text>
                  <Text variant="caption" color={colors.contentSecondary}>
                    {bookingCopy.tickets.perPerson}
                  </Text>
                </View>
              </View>
              <Stepper
                atZero="stepper"
                value={quantityOf(cart, addon.id)}
                name={addon.name}
                onChange={(by) => onAdjust(addon, by)}
                max={bookingConfig.maxPerLine}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: space.l },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.l },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, rowGap: space.l },
  /* Two across with a 10 gutter, as the comp's 170-wide tiles on 390. */
  card: { width: "48.5%", gap: space.xs },
  shot: { width: "100%", aspectRatio: 170 / 210, backgroundColor: colors.bgSecondary },
  addOnShot: {
    position: "absolute",
    right: space.s,
    bottom: space.s,
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.l,
    paddingVertical: 9,
    backgroundColor: colors.white,
  },
  stepOnShot: {
    position: "absolute",
    right: space.s,
    bottom: space.s,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  stepKey: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  stepValue: { minWidth: 20, textAlign: "center" },
  price: { flexDirection: "row", alignItems: "baseline", gap: space.xs },

  rows: { gap: space.l },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    padding: space.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderTertiary,
  },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
  rowTitle: { flexDirection: "row", alignItems: "center", gap: space.s },
});
