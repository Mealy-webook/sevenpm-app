import { StyleSheet, View } from "react-native";

import Minus from "../icons/ic-minus-16.svg";
import Plus from "../icons/ic-plus-16.svg";
import Trash from "../icons/ic-trash-16.svg";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";
import { bookingConfig, bookingCopy } from "../data/booking";

/**
 * Quantity control, from Figma 2024:11801. At zero it is a single "Add" pill;
 * from one up it becomes `− value +`, with the minus drawn as a bin at one
 * because that press removes the line rather than decrementing it.
 *
 * `atZero="stepper"` uses the comp's other zero state: the counter is always
 * on screen reading 0 with the minus disabled. The ticket rows use it so every
 * row offers the same control and the count is never implied.
 *
 * `emphasised` swaps the 5% overlay for the solid elevated surface, for the
 * control that floats over a product photo.
 */
export function Stepper({
  value,
  name,
  onAdd,
  onChange,
  emphasised = false,
  atZero = "add",
  addLabel = bookingCopy.tickets.add,
}: {
  value: number;
  /** Names the thing being counted, for screen readers. */
  name: string;
  onAdd: () => void;
  onChange: (by: number) => void;
  emphasised?: boolean;
  atZero?: "add" | "stepper";
  addLabel?: string;
}) {
  const surface = emphasised ? styles.solid : styles.dim;

  if (value === 0 && atZero === "add") {
    return (
      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${addLabel} — ${name}`}
        onPress={onAdd}
        style={[styles.shell, surface, styles.add]}
      >
        <Plus width={16} height={16} />
        <Text variant="bodyBold" style={styles.addLabel}>
          {addLabel}
        </Text>
      </Tap>
    );
  }

  const atMax = value >= bookingConfig.maxPerLine;
  const empty = value === 0;
  /* At one the minus removes the line, so it is drawn as a bin. */
  const first = value === 1;

  return (
    <View style={[styles.shell, surface, styles.counter]}>
      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${
          first ? bookingCopy.tickets.remove : bookingCopy.tickets.fewer
        } — ${name}`}
        disabled={empty}
        onPress={() => onChange(-1)}
        /* A 22px key dips further than a button: at this size a 3% change is
           invisible, and this is the control people press most in the flow. */
        scale={0.88}
        style={[styles.key, empty && styles.keyOff]}
      >
        {first ? <Trash width={16} height={16} /> : <Minus width={16} height={16} />}
      </Tap>

      <Text
        variant="bodyBold"
        accessibilityLiveRegion="polite"
        style={styles.value}
      >
        {value}
      </Text>

      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${bookingCopy.tickets.more} — ${name}`}
        disabled={atMax}
        onPress={() => (empty ? onAdd() : onChange(1))}
        scale={0.88}
        style={[styles.key, atMax && styles.keyOff]}
      >
        <Plus width={16} height={16} />
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  dim: { backgroundColor: colors.overlay5 },
  solid: { backgroundColor: colors.bgTertiary },
  add: { paddingHorizontal: space.m, paddingVertical: 14 },
  addLabel: { paddingHorizontal: space.xs },
  counter: { paddingHorizontal: space.s, paddingVertical: 11 },
  key: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  keyOff: { opacity: 0.3 },
  value: { minWidth: 20, textAlign: "center" },
});
