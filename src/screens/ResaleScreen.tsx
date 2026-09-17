import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";

/**
 * Resale.
 *
 * The tab is in the comp (378:27388) and the second onboarding step is built
 * around the word, but no resale screen has been designed yet. It is here as
 * an empty state saying exactly that, rather than as a tab that opens a blank
 * page or, worse, one quietly left out of a tab bar that was specified with
 * five.
 */
export function ResaleScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top + space.section }]}>
      <Text variant="sectionTitle" uppercase>
        Resale
      </Text>
      <Text variant="body" color={colors.contentSecondary}>
        Passing a ticket on to somebody else is coming. The screens for it have
        not been designed yet, so there is nothing here to use.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: gutter,
    gap: space.m,
  },
});
