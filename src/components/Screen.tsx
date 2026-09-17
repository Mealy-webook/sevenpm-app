import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowLeft from "../icons/ic-arrow-left-20.svg";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";

/**
 * The bar a pushed screen carries: back, then the screen's name, then whatever
 * that screen puts on the right.
 *
 * It is drawn here rather than left to the navigator's own header because the
 * navigator's header is a rounded, centred, iOS-shaped thing and this system
 * is square and left-aligned. Screens that open with a full-bleed image — the
 * event, the confirmation — pass `floating` and get the control back over the
 * artwork with no band behind it.
 */
export function NavBar({
  title,
  onBack,
  right,
  floating = false,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  floating?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + space.s },
        floating ? styles.floating : styles.solid,
      ]}
      pointerEvents="box-none"
    >
      {onBack && (
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.back}
        >
          <ArrowLeft width={20} height={20} />
        </Tap>
      )}
      {title && (
        <Text variant="titleBody" uppercase numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      )}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

/** The page itself: the dark ground, and nothing else. */
export function Page({ children }: { children: React.ReactNode }) {
  return <View style={styles.page}>{children}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingHorizontal: gutter,
    paddingBottom: space.s,
  },
  solid: { backgroundColor: colors.bgPrimary },
  floating: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  title: { flex: 1, minWidth: 0 },
  right: { flexDirection: "row", alignItems: "center", gap: space.s },
});
