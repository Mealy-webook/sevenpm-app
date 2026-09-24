import { Animated, Pressable, StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ChevronRight from "../icons/ic-chevron-right-20.svg";
import { Text } from "../theme/Text";
import { usePressScale } from "../theme/motion";
import { colors, space } from "../theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  chevron = false,
  tone = "default",
}: {
  icon?: React.FC<SvgProps>;
  label: string;
  sub?: string;
  /** Right-hand text, for a row that states a value rather than offering one. */
  value?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  /**
   * Draw the chevron even with nothing behind the row yet. 454:67385-90 gives
   * all six menu rows one: the comp says these are navigable, and it is the
   * screens that are missing rather than the affordance.
   */
  chevron?: boolean;
  tone?: "default" | "destructive";
}) {
  const ink = tone === "destructive" ? colors.negative : colors.contentPrimary;
  const press = usePressScale(0.99);

  const body = (
    <>
      {Icon && <Icon width={24} height={24} />}
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
      {(onPress || chevron) && !trailing && <ChevronRight width={20} height={20} />}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      /* A row is wide, so it dips less than a button — the same 3% on a
         350px row reads as the whole list lurching. */
      style={[styles.row, press.style]}
    >
      {body}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.l, height: 66 },
  body: { flex: 1, minWidth: 0 },
});
