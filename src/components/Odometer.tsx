import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type TextStyle } from "react-native";

import { Text } from "../theme/Text";
import { ease, useReducedMotion } from "../theme/motion";
import { motion, type as typeScale } from "../theme/tokens";

/**
 * A number that travels to its new value instead of blinking to it.
 *
 * Each digit is its own wheel of 0–9 that slides to the right row, so 199 → 200
 * rolls three columns at once rather than swapping three glyphs. The web build
 * did this for the booking total on the grounds that it is the number people
 * are watching while they add things, and seeing it move is the feedback that
 * the tap landed. The same is true of a Beats balance.
 *
 * Digits are laid out from a rendered "0", so the columns are the font's own
 * figure width and the number does not jitter as it changes — this face has
 * tabular figures, but measuring rather than assuming costs nothing.
 *
 * Non-digits (separators, currency, a plus) pass through as plain text. Under
 * reduced motion the wheels are placed rather than rolled.
 */
export function Odometer({
  value,
  variant = "bodyL",
  color,
  style,
  textStyle,
  height,
}: {
  value: string | number;
  variant?: keyof typeof typeScale;
  color?: string;
  style?: object;
  /** Overrides on the glyphs — weight, or a scaled display size. */
  textStyle?: TextStyle;
  /** The row height, when `textStyle` has changed the line height. */
  height?: number;
}) {
  const text = String(value);
  const row = height ?? typeScale[variant].line;

  return (
    <View style={[styles.row, style]} accessibilityLabel={text}>
      {text.split("").map((char, index) =>
        /\d/.test(char) ? (
          <Digit
            key={`${index}-digit`}
            digit={Number(char)}
            variant={variant}
            color={color}
            height={row}
            textStyle={textStyle}
          />
        ) : (
          <Text
            key={`${index}-${char}`}
            variant={variant}
            color={color}
            style={textStyle}
          >
            {char}
          </Text>
        ),
      )}
    </View>
  );
}

function Digit({
  digit,
  variant,
  color,
  height,
  textStyle,
}: {
  digit: number;
  variant: keyof typeof typeScale;
  color?: string;
  height: number;
  textStyle?: TextStyle;
}) {
  const reduced = useReducedMotion();
  const at = useRef(new Animated.Value(digit)).current;

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      at.setValue(digit);
      return;
    }
    const run = Animated.timing(at, {
      toValue: digit,
      duration: motion.base,
      easing: ease,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [digit, reduced, at]);

  return (
    <View style={{ height, overflow: "hidden" }}>
      <Animated.View
        style={{
          transform: [
            {
              translateY: at.interpolate({
                inputRange: [0, 9],
                outputRange: [0, -9 * height],
              }),
            },
          ],
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Text key={n} variant={variant} color={color} style={textStyle}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
});
