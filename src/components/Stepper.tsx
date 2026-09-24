import { StyleSheet, View } from "react-native";

import Minus from "../icons/ic-minus-16.svg";
import Plus from "../icons/ic-plus-16.svg";
import Trash from "../icons/ic-trash-16.svg";
import { Odometer } from "./Odometer";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { tap as haptic } from "../theme/haptics";
import { colors, space } from "../theme/tokens";

/**
 * Quantity control, from Figma 2024:11801. At zero it is a single "Add" pill;
 * from one up it becomes `− value +`, with the minus drawn as a bin at one
 * because that press removes the line rather than decrementing it.
 *
 * `atZero="stepper"` uses the comp's other zero state: the counter is always
 * on screen reading 0 with the minus disabled. The ticket rows use it so every
 * row offers the same control and the count is never implied.
 *
 * Every press reports through one `onChange(by)`. The keys are 22px to match
 * the comp but carry `hitSlop` out to the 44px Apple asks for — this is the
 * control pressed most in the flow, and the drawn size is not the touchable
 * one.
 */
export function Stepper({
  value,
  name,
  onChange,
  max,
  atZero = "add",
  size = "s",
  labels,
}: {
  value: number;
  /** Names the thing being counted, for screen readers. */
  name: string;
  /** The only callback: `+1` to add, `-1` to take one away. */
  onChange: (by: number) => void;
  /** The ceiling, if the caller has one. */
  max?: number;
  atZero?: "add" | "stepper";
  /**
   * `m` is the sheet's stepper (346:47150): a larger control with 20px keys
   * and the count at 17, for a sheet where it is the only thing to press.
   */
  size?: "s" | "m";
  /** Overrides for the words screen readers hear, and the pill's label. */
  labels?: Partial<typeof defaultLabels>;
}) {
  const word = { ...defaultLabels, ...labels };
  const big = size === "m";
  const glyph = big ? 20 : 16;

  const add = () => {
    haptic.tick();
    onChange(1);
  };

  if (value === 0 && atZero === "add") {
    return (
      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${word.add} — ${name}`}
        onPress={add}
        style={[styles.shell, styles.dim, styles.add]}
      >
        <Plus width={16} height={16} />
        <Text variant="bodyBold" style={styles.addLabel}>
          {word.add}
        </Text>
      </Tap>
    );
  }

  const atMax = max !== undefined && value >= max;
  const empty = value === 0;
  /* At one the minus removes the line, so it is drawn as a bin. */
  const first = value === 1;

  return (
    <View style={[styles.shell, styles.dim, big ? styles.counterBig : styles.counter]}>
      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${first ? word.remove : word.fewer} — ${name}`}
        disabled={empty}
        onPress={() => {
          haptic.tick();
          onChange(-1);
        }}
        /* A 22px key dips further than a button: at this size a 3% change is
           invisible, and this is the control people press most in the flow. */
        scale={0.88}
        hitSlop={HIT}
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
        textStyle={big ? styles.valueWeight : undefined}
        style={[styles.value, big && styles.valueBig]}
      />

      <Tap
        accessibilityRole="button"
        accessibilityLabel={`${word.more} — ${name}`}
        disabled={atMax}
        onPress={add}
        scale={0.88}
        hitSlop={HIT}
        style={[styles.key, big && styles.keyBig, atMax && styles.keyOff]}
      >
        <Plus width={glyph} height={glyph} />
      </Tap>
    </View>
  );
}

/** Drawn at 22, touchable at 44 — the gap is made up on every side. */
const HIT = 11;

const defaultLabels = {
  add: "Add",
  remove: "Remove",
  fewer: "One fewer",
  more: "One more",
};

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
  /**
   * The count's box, and the count centred in it.
   *
   * `textAlign` was on this, which is the Odometer's own View — a row of
   * digit columns — where it does nothing, so a single digit sat against the
   * left edge of the box instead of in the middle of it. Centring is the
   * row's job. And the width belongs here rather than on the glyphs: it was
   * on `textStyle`, which the Odometer applies to every digit, so a
   * two-digit count was twice as wide as the comp's 22.
   */
  value: { minWidth: 20, justifyContent: "center" },
  valueBig: { minWidth: 22 },
  valueWeight: { fontFamily: "Roboto_600SemiBold" },
});
