import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Crown from "../../icons/ic-crown-24.svg";
import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { ListRow } from "../../components/ListRow";
import { Tap } from "../../components/Tap";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { useSession } from "../../session";
import { signedOutCopy } from "../../data/session";
import {
  accountUser,
  loyaltyBalance,
  logoutCopy,
  menuCopy,
  menuNav,
} from "../../data/account";

/** The rows that mean anything without an account behind them. */
const PUBLIC_ROWS = ["notifications", "language"];

/**
 * Rows the tab bar now carries. 454:67370 gives Bookings, Wallet and Resale
 * tabs of their own, so listing them here as well offers the same three
 * places twice and makes the menu longer than what is only reachable through
 * it. They are dropped rather than kept as a shortcut.
 */
const IN_THE_TAB_BAR = ["bookings", "wallet", "resale"];

/**
 * Menu, from Figma 359:7929 — the app's version of the web build's account
 * sidebar, and the fifth tab.
 *
 * It opens with who you are rather than with what you can do: the Beats
 * balance as a control in the corner, the name at display size, and the
 * membership you have reached. Then the rows, then the things that belong at
 * the bottom of a menu and nowhere else — the social accounts, the copyright,
 * and the way out. 454:67370 drops the rate-us panel the older comp carried.
 *
 * Three rows have no screen behind them yet: Resale is a tab with an empty
 * state, and Notifications and Language have not been designed. They are
 * listed because the comp lists them, and the note at the foot says which,
 * rather than each one failing silently when pressed.
 *
 * **Signed out it is a different page, not a greyed-out one.** No comp draws
 * this state, so it is designed to the rule the rest of the menu follows: the
 * page opens with who you are. With nobody there it opens with the invitation
 * instead, in the same display type the name would have used and in the
 * Welcome screen's own words, above one button that goes and asks.
 *
 * Everything that needs an account is *gone* rather than dimmed — Bookings,
 * Wallet, Resale, Rewards, Account settings, Payments, the Beats balance in
 * the corner, and Logout, which has nothing to end. A row that is drawn only
 * to refuse you is a worse answer than no row. What is left is what is true
 * without an account: the two device rows, how to rate the app, where to find
 * it elsewhere, and who owns it.
 */
export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { signedIn, signOut } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const tabScroll = useTabBarScroll();

  /** Where each row goes. The three with no screen simply do not move. */
  const routes: Record<string, (() => void) | undefined> = {
    rewards: () => navigation.navigate("Rewards"),
    settings: () => navigation.navigate("Profile"),
    payments: () => navigation.navigate("Payments"),
  };

  const rows = menuNav
    .filter((item) => !IN_THE_TAB_BAR.includes(item.id))
    .filter((item) => signedIn || PUBLIC_ROWS.includes(item.id));

  return (
    <ScrollView
      style={styles.page}
      {...tabScroll}
      contentContainerStyle={{
        paddingTop: insets.top + space.s,
        paddingBottom: TAB_BAR_CLEARANCE,
      }}
    >
      {/* The balance sits where a screen title's action would — and there is
          no balance to put there without an account. */}
      {signedIn && (
        <View style={styles.headerActions}>
          <Button
            label={menuCopy.beats(loyaltyBalance)}
            size="m"
            onPress={() => navigation.navigate("Rewards")}
          />
        </View>
      )}

      <View style={styles.head}>
        <Text
          variant="displayName"
          uppercase
          color={colors.white}
          style={displaySize(type.displayName, width)}
        >
          {signedIn ? accountUser.name : signedOutCopy.title}
        </Text>

        {signedIn ? (
          <View style={styles.memberRow}>
            <View style={styles.memberChip}>
              <Crown width={16} height={16} />
              <Text variant="bodyS">{menuCopy.member(accountUser.membership)}</Text>
            </View>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {menuCopy.since}
            </Text>
          </View>
        ) : (
          <>
            <Text variant="body" color={colors.contentSecondary}>
              {signedOutCopy.body}
            </Text>
            <Button
              variant="brand"
              label={signedOutCopy.signIn}
              onPress={() => navigation.navigate("SignIn")}
            />
          </>
        )}
      </View>

      <View style={styles.rows}>
        {rows.map((item, index) => (
          <View key={item.id} style={index > 0 && styles.divided}>
            {/* Every row carries a chevron in 454:67385-90, including the
                three with no screen behind them yet. The comp says these are
                navigable; it is the screens that are missing, not the
                affordance. */}
            <ListRow
              icon={icon(item.icon)}
              label={item.label}
              value={item.trailing}
              chevron
              onPress={routes[item.id]}
            />
          </View>
        ))}
      </View>

      {/* Social. On the page's own ground in 454:67392 — the panel this used
          to sit in came from the older comp. */}
      <View style={styles.block}>
        <View style={styles.socials}>
          {menuCopy.socials.map((social) => {
            const Mark = icon(social.icon);
            return (
              <Tap
                key={social.label}
                accessibilityRole="link"
                accessibilityLabel={social.label}
                onPress={() => Linking.openURL(social.href)}
                style={styles.social}
              >
                {Mark && <Mark width={20} height={20} />}
              </Tap>
            );
          })}
        </View>
        <Text variant="body" color={colors.contentSecondary} style={styles.copyright}>
          {menuCopy.copyright}
        </Text>
      </View>

      {signedIn && (
        <View style={styles.block}>
          <Button
            variant="outline"
            label={logoutCopy.label}
            onPress={() => setLoggingOut(true)}
          />
        </View>
      )}

      <Confirm
        open={loggingOut}
        title={logoutCopy.title}
        body={logoutCopy.body}
        cancel={logoutCopy.cancel}
        confirm={logoutCopy.confirm}
        tone="destructive"
        onCancel={() => setLoggingOut(false)}
        /* There is still no account service to sign out of, but there is now
           a signed-in state to drop — which is the whole of what this build
           can honestly end, and it puts the signed-out menu one press away. */
        onConfirm={() => {
          setLoggingOut(false);
          signOut();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  headerActions: { alignItems: "flex-end", paddingHorizontal: space.xl },

  head: { paddingHorizontal: space.xl, paddingTop: space.m, gap: space.m },
  memberRow: { flexDirection: "row", alignItems: "center", gap: space.m },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderTertiary,
  },
  rows: { paddingHorizontal: space.xl, paddingTop: space.xl },

  block: { paddingHorizontal: space.xl, paddingTop: space.section, gap: space.m },

  socials: { flexDirection: "row", justifyContent: "center", gap: space.l },
  social: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  copyright: { textAlign: "center", paddingTop: space.s },
});
