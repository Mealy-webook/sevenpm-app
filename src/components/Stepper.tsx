import { StyleSheet, View } from "react-native";

import Minus from "../icons/ic-minus-16.svg";
import Plus from "../icons/ic-plus-16.svg";
import Trash from "../icons/ic-trash-16.svg";
import { Odometer } from "./Odometer";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { tap as haptic } from "../theme/haptics";
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
  size = "s",
  addLabel = bookingCopy.tickets.add,
}: {
  value: number;
  /** Names the thing being counted, for screen readers. */
  name: string;
  onAdd: () => void;
  onChange: (by: number) => void;
  emphasised?: boolean;
  atZero?: "add" | "stepper";
  /**
   * `m` is the sheet's stepper (346:47150): a larger control with 20px keys
   * and the count at 17, for a sheet where it is the only thing to press.
   */
  size?: "s" | "m";
  addLabel?: string;
}) {
  const surface = emphasised ? styles.solid : styles.dim;
  const big = size === "m";
  const glyph = big ? 20 : 16;

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
    <View style={[styles.shell, surface, big ? styles.counterBig : styles.counter]}>
      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${
          first ? bookingCopy.tickets.remove : bookingCopy.tickets.fewer
        } — ${name}`}
        disabled={empty}
        onPress={() => {
          haptic.tick();
          onChange(-1);
        }}
        /* A 22px key dips further than a button: at this size a 3% change is
           invisible, and this is the control people press most in the flow. */
        scale={0.88}
        style={[styles.key, big && styles.keyBig, empty && styles.keyOff]}
      >
        {first ? (
          <Trash width={glyph} height={glyph} />
        ) : (
          <Minus width={glyph} height={glyph} />
        )}
      </Tap>

      {/* Pressing + is the one place in this flow where a number changes
          under your finger, so it should look like it moved. */}
      <Odometer
        value={value}
        variant={big ? "bodyL" : "bodyBold"}
        textStyle={big ? styles.valueBig : undefined}
        style={styles.value}
      />

      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${bookingCopy.tickets.more} — ${name}`}
        disabled={atMax}
        onPress={() => {
          haptic.tick();
          empty ? onAdd() : onChange(1);
        }}
        scale={0.88}
        style={[styles.key, big && styles.keyBig, atMax && styles.keyOff]}
      >
        <Plus width={glyph} height={glyph} />
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
  /* The sheet's stepper is a plain 10% panel with no border. */
  counterBig: { padding: space.s, borderWidth: 0, backgroundColor: colors.overlay10 },
  key: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  keyBig: {
    width: 28,
    height: 28,
    padding: space.xs,
    backgroundColor: colors.overlay5,
  },
  keyOff: { opacity: 0.3 },
  value: { minWidth: 20, textAlign: "center" },
  valueBig: { minWidth: 22, fontFamily: "Roboto_600SemiBold" },
});
