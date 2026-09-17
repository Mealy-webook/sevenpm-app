import { useState } from "react";
import { StyleSheet, View } from "react-native";

import ChevronDown from "../icons/ic-chevron-down-16.svg";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * A field that opens a list of its options underneath itself.
 *
 * The comps draw Country, City and Address as one control each with a chevron
 * (346:47903). React Native has no native select, and the usual answer — a
 * modal picker over a sheet — puts a sheet on top of a sheet. Expanding in
 * place keeps the sheet the only layer and keeps the answer next to the
 * question.
 *
 * Closed it looks exactly like `Field`, so a form of these and a form of text
 * inputs read as the same form.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Tap
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        accessibilityLabel={`${label}${value ? `: ${value}` : ""}`}
        disabled={disabled || options.length === 0}
        onPress={() => setOpen(!open)}
        scale={0.995}
        style={[
          styles.field,
          open && styles.fieldOpen,
          error && styles.fieldError,
          disabled && styles.fieldOff,
        ]}
      >
        <View style={styles.fieldBody}>
          {value && (
            <Text variant="caption" color={colors.contentSecondary}>
              {label}
            </Text>
          )}
          <Text
            variant="bodyL"
            color={value ? colors.contentPrimary : colors.contentSecondary}
            numberOfLines={1}
          >
            {value ?? label}
          </Text>
        </View>
        <View style={open ? styles.flip : undefined}>
          <ChevronDown width={16} height={16} />
        </View>
      </Tap>

      {open &&
        options.map((option) => (
          <Tap
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ selected: option === value }}
            onPress={() => {
              onChange(option);
              setOpen(false);
            }}
            scale={0.995}
            style={[styles.option, option === value && styles.optionOn]}
          >
            <Text variant="body">{option}</Text>
          </Tap>
        ))}

      {error && (
        <Text variant="caption" color={colors.negative} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    minHeight: 60,
    backgroundColor: colors.overlay5,
    borderWidth: 1,
    borderColor: colors.overlay10,
  },
  fieldOpen: { borderColor: colors.contentPrimary },
  fieldError: { borderColor: colors.negative },
  fieldOff: { opacity: 0.6 },
  fieldBody: { flex: 1, minWidth: 0 },
  flip: { transform: [{ rotate: "180deg" }] },

  option: {
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    backgroundColor: colors.overlay5,
  },
  optionOn: { backgroundColor: colors.overlay10 },
});
