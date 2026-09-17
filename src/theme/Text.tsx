import { Text as RNText, type TextProps, type TextStyle } from "react-native";

import { colors, type } from "./tokens";

type Variant = keyof typeof type;

/**
 * The only way text should be set in this app.
 *
 * React Native has no cascade, so every `Text` would otherwise carry its own
 * font, size and line height — and the moment those are written by hand they
 * stop matching each other. Pass a scale name instead.
 *
 * `uppercase` is a prop rather than a style because RN's `textTransform` is
 * unreliable on Android for some faces; the display styles set it here and
 * the string is transformed in JS.
 */
export function Text({
  variant = "body",
  color = colors.contentPrimary,
  uppercase = false,
  style,
  children,
  ...rest
}: TextProps & {
  variant?: Variant;
  color?: string;
  uppercase?: boolean;
}) {
  const t = type[variant];
  const base: TextStyle = {
    fontFamily: t.font,
    fontSize: t.size,
    lineHeight: t.line,
    letterSpacing: "tracking" in t ? t.tracking : 0,
    color,
  };

  return (
    <RNText {...rest} style={[base, style]}>
      {uppercase && typeof children === "string"
        ? children.toUpperCase()
        : children}
    </RNText>
  );
}
