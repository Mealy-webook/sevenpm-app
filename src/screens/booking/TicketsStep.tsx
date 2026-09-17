import { useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import Clock from "../../icons/ic-clock-brand-20.svg";
import Info from "../../icons/ic-info-16.svg";
import Pin from "../../icons/ic-pin-16.svg";
import { Chip } from "../../components/Chip";
import { Stepper } from "../../components/Stepper";
import { Text } from "../../theme/Text";
import { colors, space } from "../../theme/tokens";
import {
  bookingCopy,
  formatMoney,
  ticketGroups,
  type BookingTicket,
} from "../../data/booking";
import { quantityOf, type Cart } from "./cart";

/**
 * Step 1, from Figma 2138:3339 and 2024:4434: the event's name and times, the
 * admission-type chips, then one row per ticket. Each row carries an info
 * button that opens the line-up and a stepper that fills the basket.
 */
export function TicketsStep({
  eventName,
  time,
  venue,
  venueUrl,
  cart,
  onAdjust,
  onInfo,
}: {
  eventName: string;
  time: string;
  venue: string;
  venueUrl: string;
  cart: Cart;
  onAdjust: (id: string, by: number) => void;
  onInfo: (ticket: BookingTicket) => void;
}) {
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
      <View style={styles.head}>
        <Text variant="displayM" uppercase color={colors.white}>
          {eventName}
        </Text>
        <View style={styles.meta}>
          <Clock width={20} height={20} />
          <Text variant="bodySBold" color={colors.brand}>
            {time}
          </Text>
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(venueUrl)}
          style={({ pressed }) => [styles.meta, pressed && styles.pressed]}
        >
          <Pin width={20} height={20} />
          <Text variant="bodySBold" color={colors.white} style={styles.link}>
            {venue}
          </Text>
        </Pressable>
      </View>

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
              {group.label}
            </Text>
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
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={bookingCopy.tickets.info(ticket.name)}
                      onPress={() => onInfo(ticket)}
                      style={({ pressed }) => pressed && styles.pressed}
                    >
                      <Info width={20} height={20} />
                    </Pressable>
                  </View>
                  <View style={styles.price}>
                    <Text variant="bodyBold">{formatMoney(ticket.price)}</Text>
                    <Text variant="caption" color={colors.contentSecondary}>
                      {bookingCopy.tickets.perPerson}
                    </Text>
                  </View>
                </View>

                <Stepper
                  atZero="stepper"
                  value={quantityOf(cart, ticket.id)}
                  name={ticket.name}
                  onAdd={() => onAdjust(ticket.id, 1)}
                  onChange={(by) => onAdjust(ticket.id, by)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: space.xxl },
  head: { gap: space.s },
  meta: { flexDirection: "row", alignItems: "center", gap: space.xs },
  link: { textDecorationLine: "underline" },
  pressed: { opacity: 0.7 },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.s },

  groups: { gap: space.xxl },
  group: { gap: space.l },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    padding: space.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDimmed,
  },
  rowBody: { flex: 1, minWidth: 0, gap: space.s },
  rowTitle: { flexDirection: "row", alignItems: "center", gap: space.s },
  name: { flexShrink: 1 },
  price: { flexDirection: "row", alignItems: "baseline", gap: 2 },
});
