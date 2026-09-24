import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import Info from "../../icons/ic-info-20.svg";
import { Chip } from "../../components/Chip";
import { Stepper } from "../../components/Stepper";
import { Tap } from "../../components/Tap";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import {
  bookingConfig,
  bookingCopy,
  formatMoney,
  ticketGroups,
  type BookingTicket,
} from "../../data/booking";
import { quantityOf, type Cart } from "./cart";

/**
 * Step 1, from Figma 346:46384: the step's own title, the admission-type
 * chips, then one row per ticket grouped under its admission type. Each row
 * carries an info button that opens the line-up and a stepper that fills the
 * basket.
 *
 * The event's name and running time are not here any more — the app comps put
 * them in a header that every step of the journey carries, so what you are
 * buying never leaves the screen. See `BookingHeader`.
 */
export function TicketsStep({
  cart,
  onAdjust,
  onInfo,
}: {
  cart: Cart;
  onAdjust: (id: string, by: number) => void;
  onInfo: (ticket: BookingTicket) => void;
}) {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState("all");
  const groups =
    filter === "all"
      ? ticketGroups
      : ticketGroups.filter((group) => group.id === filter);

  const chips = [
    { id: "all", label: bookingCopy.tickets.all },
    ...ticketGroups.map((group) => ({ id: group.id, label: group.label })),
  ];

  return (
    <View style={styles.step}>
      <Text
        variant="displayStep"
        uppercase
        color={colors.white}
        style={displaySize(type.displayStep, width)}
      >
        {bookingCopy.tickets.title}
      </Text>

      <View style={styles.chips} accessibilityRole="tablist">
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            selected={filter === chip.id}
            onPress={() => setFilter(chip.id)}
          />
        ))}
      </View>

      <View style={styles.groups}>
        {groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Text variant="titleBody" uppercase color={colors.white}>
              {group.title ?? group.label}
            </Text>
            <View style={styles.list}>
            {group.tickets.map((ticket) => (
              <View key={ticket.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <View style={styles.rowTitle}>
                    <Text
                      variant="bodyBold"
                      color={colors.white}
                      numberOfLines={1}
                      style={styles.name}
                    >
                      {ticket.name}
                    </Text>
                    <Tap
                      accessibilityRole="button"
                      accessibilityLabel={bookingCopy.tickets.info(ticket.name)}
                      onPress={() => onInfo(ticket)}
                      scale={0.9}
                    >
                      <Info width={20} height={20} />
                    </Tap>
                  </View>
                  <View style={styles.price}>
                    <Text variant="bodyBold">{formatMoney(ticket.price)}</Text>
                    <Text variant="caption" color={colors.contentSecondary}>
                      {bookingCopy.tickets.perPerson}
                    </Text>
                  </View>
                </View>

                {/* 86:165150 — the larger stepper, not the bordered one. */}
                <Stepper
                  atZero="stepper"
                  size="m"
                  value={quantityOf(cart, ticket.id)}
                  name={ticket.name}
                  onChange={(by) => onAdjust(ticket.id, by)}
                  max={bookingConfig.maxPerLine}
                />
              </View>
            ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: space.l },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.l },

  groups: { gap: space.xl },
  /* 8 between a group's heading and its rows; the rows themselves are flush,
     because each carries the rule that separates it from the next. */
  group: { gap: space.s },
  list: { width: "100%" },
  /* A flat row with a rule under it, not a bordered card: 427:51040 pads it
     16 top and bottom and nothing at the sides. */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingVertical: space.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDimmed,
  },
  /* No gap between the name and the price. Figma's 8 sits between boxes
     drawn tight to the glyphs; RN's line heights already carry that leading,
     and adding it again made every row 7 taller than the comp's 76. */
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { flexDirection: "row", alignItems: "center", gap: space.s },
  name: { flexShrink: 1 },
  price: { flexDirection: "row", alignItems: "baseline", gap: 2 },
});
