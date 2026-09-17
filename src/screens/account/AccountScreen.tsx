import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Logout from "../../icons/ic-acct-logout.svg";
import { Confirm } from "../../components/Confirm";
import { ListRow } from "../../components/ListRow";
import { icon } from "../../icons";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { accountNav, accountUser, logoutCopy } from "../../data/account";

/**
 * The account index — the phone's version of the web build's 293px sidebar.
 *
 * On the web the sidebar sits beside the panel it is navigating and marks the
 * open one with a solid brand-yellow row. A phone shows one at a time, so
 * there is nothing to mark: every row is a push. That also spares the one
 * trick the web row needs, darkening a white icon with a CSS filter to make
 * it legible on yellow, which React Native has no equivalent for.
 *
 * Bookings and Rewards are tabs of their own down at the bottom of the screen;
 * they are listed here too because this is where the web build puts them and
 * because somebody looking for their tickets will look in their account.
 */
export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [loggingOut, setLoggingOut] = useState(false);

  /** Where each of the web's sidebar rows lands on a phone. */
  const routes: Record<string, () => void> = {
    bookings: () => navigation.navigate("Tabs", { screen: "Bookings" } as never),
    loyalty: () => navigation.navigate("Tabs", { screen: "Rewards" } as never),
    wallet: () => navigation.navigate("Wallet"),
    profile: () => navigation.navigate("Profile"),
    payments: () => navigation.navigate("Payments"),
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: space.section }}
    >
      <View style={[styles.head, { paddingTop: insets.top + space.l }]}>
        <Image
          source={image(accountUser.avatar)}
          style={styles.avatar}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.headText}>
          <Text variant="title" uppercase numberOfLines={1}>
            {accountUser.name}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
            {accountUser.email}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {accountNav.map((item) => (
          <ListRow
            key={item.id}
            icon={icon(item.icon)}
            label={item.label}
            value={item.trailing}
            onPress={routes[item.id]}
          />
        ))}

        <View style={styles.divider} />

        <ListRow
          icon={Logout}
          label={logoutCopy.label}
          onPress={() => setLoggingOut(true)}
        />
      </View>

      <Confirm
        open={loggingOut}
        title={logoutCopy.title}
        body={logoutCopy.body}
        cancel={logoutCopy.cancel}
        confirm={logoutCopy.confirm}
        tone="destructive"
        onCancel={() => setLoggingOut(false)}
        /* There is no session behind this build to end, so the confirm closes
           and says nothing rather than pretending to sign anybody out. */
        onConfirm={() => setLoggingOut(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingHorizontal: gutter,
    paddingBottom: space.xl,
    backgroundColor: colors.bgSecondary,
  },
  avatar: { width: 64, height: 64, backgroundColor: colors.bgTertiary },
  headText: { flex: 1, minWidth: 0, gap: space.xs },

  rows: { paddingHorizontal: gutter, paddingTop: space.l },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderTertiary,
    marginVertical: space.s,
  },
});
