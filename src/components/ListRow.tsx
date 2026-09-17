import { Pressable, StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ChevronRight from "../icons/ic-chevron-right-20.svg";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * The list row the account and rewards screens are built from: a 40px tile
 * carrying the mark, a two-line body, then whatever control belongs on the
 * right. 66px tall, and rows sit flush against each other — wrapping each one
 * in its own bordered card is the mistake this component exists to prevent.
 *
 * Pass `onPress` and the row grows a chevron and announces itself as a button;
 * a row with a control on the right (a switch, a stepper, a Redeem button)
 * takes `trailing` instead and is not itself pressable, because two tap
 * targets stacked on one row is how people press the wrong one.
 */
export function ListRow({
  icon: Icon,
  label,
  sub,
  value,
  trailing,
  onPress,
  tone = "default",
}: {
  icon?: React.FC<SvgProps>;
  label: string;
  sub?: string;
  /** Right-hand text, for a row that states a value rather than offering one. */
  value?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  tone?: "default" | "destructive";
}) {
  const ink = tone === "destructive" ? colors.negative : colors.contentPrimary;

  const body = (
    <>
      {Icon && (
        <View style={styles.tile}>
          <Icon width={24} height={24} />
        </View>
      )}
      <View style={styles.body}>
        <Text variant="body" color={ink} numberOfLines={1}>
          {label}
        </Text>
        {sub && (
          <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      {value && (
        <Text variant="bodySBold" color={colors.contentPrimary}>
          {value}
        </Text>
      )}
      {trailing}
      {onPress && !trailing && <ChevronRight width={20} height={20} />}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.l, height: 66 },
  pressed: { opacity: 0.7 },
  tile: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  body: { flex: 1, minWidth: 0 },
});
