import {
  Text as RNText,
  StyleSheet,
  View,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

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
 *
 * **Display type sits on a line box tighter than its size** (104 on 86, 68 on
 * 52), as the comps draw it. React Native clips glyphs that overflow their
 * line, so a display string is not one `Text` on a short line: each line —
 * split on the "\n" the copy carries where the comp breaks — is its own
 * `Text` on a full-height line, and the lines are pulled together with
 * negative margins until the stack measures exactly what Figma's does. The
 * glyphs land where the comp puts them and nothing is cut.
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

  const content =
    uppercase && typeof children === "string" ? children.toUpperCase() : children;

  const flat = StyleSheet.flatten([base, style]) as TextStyle;
  const size = flat.fontSize ?? t.size;
  const line = flat.lineHeight ?? t.line;

  if (line >= size || typeof content !== "string") {
    return (
      <RNText {...rest} style={[base, style]}>
        {content}
      </RNText>
    );
  }

  /* Tight display type: full-height lines, closed up to the comp's pitch. */
  const { textStyle, boxStyle } = splitStyle(flat);
  const squeeze = size - line;
  const lines = content.split("\n");

  return (
    <View style={[boxStyle, { marginVertical: -squeeze / 2 }]}>
      {lines.map((text, i) => (
        <RNText
          key={i}
          {...rest}
          style={[
            textStyle,
            { lineHeight: size },
            i < lines.length - 1 && { marginBottom: -squeeze },
          ]}
        >
          {text}
        </RNText>
      ))}
    </View>
  );
}

/** Text-only properties stay on the lines; layout goes to the box around them. */
function splitStyle(flat: TextStyle) {
  const textStyle: TextStyle = {};
  const boxStyle: ViewStyle = {};
  for (const [key, value] of Object.entries(flat)) {
    if (TEXT_KEYS.has(key)) {
      (textStyle as Record<string, unknown>)[key] = value;
    } else {
      (boxStyle as Record<string, unknown>)[key] = value;
    }
  }
  return { textStyle, boxStyle };
}

const TEXT_KEYS = new Set([
  "color",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "fontVariant",
  "letterSpacing",
  "lineHeight",
  "textAlign",
  "textDecorationLine",
  "textDecorationStyle",
  "textDecorationColor",
  "textShadowColor",
  "textShadowOffset",
  "textShadowRadius",
  "textTransform",
  "includeFontPadding",
  "textAlignVertical",
  "writingDirection",
  "opacity",
]);
