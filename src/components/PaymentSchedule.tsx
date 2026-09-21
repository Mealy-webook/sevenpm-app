import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

/**
 * The instalment schedule under Buy now pay later (Figma 435:3528, 435:3961,
 * 435:4503).
 *
 * One marker per payment, joined by a hairline. The markers are a progress
 * series rather than a start-and-end pair: the *i*th of *n* is filled `i / n`,
 * so a three-payment plan reads a third, two thirds, whole. Figma draws each
 * as a 24px ring of radius 9 with a filled wedge of radius 7 inside it, and
 * only ships the quarter steps as assets — the wedge is drawn here instead so
 * any plan length is exact rather than rounded to the nearest icon.
 */
export function PaymentSchedule({
  payments,
}: {
  payments: { amount: string; when: string }[];
}) {
  return (
    <View style={styles.row}>
      {payments.map((payment, index) => (
        <View key={index} style={styles.stopGroup}>
          {index > 0 && <View style={styles.line} />}
          <View style={styles.stop}>
            <ProgressMark filled={(index + 1) / payments.length} />
            <View style={styles.labels}>
              <Text variant="bodySBold">{payment.amount}</Text>
              <Text variant="bodyS" color={colors.contentSecondary}>
                {payment.when}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The ring, and the wedge of it that this payment completes. */
function ProgressMark({ filled }: { filled: number }) {
  const angle = Math.min(Math.max(filled, 0), 1) * 2 * Math.PI;
  const x = 12 + 7 * Math.sin(angle);
  const y = 12 - 7 * Math.cos(angle);

  return (
    <Svg width={24} height={24}>
      <Circle cx={12} cy={12} r={9} stroke={colors.white} strokeWidth={2} fill="none" />
      {filled >= 1 ? (
        <Circle cx={12} cy={12} r={7} fill={colors.white} />
      ) : (
        <Path
          d={`M 12 12 L 12 5 A 7 7 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y} Z`}
          fill={colors.white}
        />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  /* Every stop but the first brings its own leading rule, so the run of
     hairlines and the run of markers stay in step however many there are. */
  stopGroup: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  line: { flex: 1, height: 1, marginTop: 12, backgroundColor: colors.overlay10 },
  stop: { alignItems: "center", gap: space.m },
  labels: { alignItems: "center", gap: space.xs },
});
