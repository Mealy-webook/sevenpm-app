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
import {
  accountUser,
  loyaltyBalance,
  logoutCopy,
  menuCopy,
  menuNav,
} from "../../data/account";

/**
 * Menu, from Figma 359:7929 — the app's version of the web build's account
 * sidebar, and the fifth tab.
 *
 * It opens with who you are rather than with what you can do: the Beats
 * balance as a control in the corner, the name at display size, and the
 * membership you have reached. Then the rows, then the things that belong at
 * the bottom of a menu and nowhere else — rate us, the social accounts, the
 * copyright, and the way out.
 *
 * Three rows have no screen behind them yet: Resale is a tab with an empty
 * state, and Notifications and Language have not been designed. They are
 * listed because the comp lists them, and the note at the foot says which,
 * rather than each one failing silently when pressed.
 */
export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [loggingOut, setLoggingOut] = useState(false);
  const [rated, setRated] = useState<string | null>(null);
  const tabScroll = useTabBarScroll();

  /** Where each row goes. The three with no screen simply do not move. */
  const routes: Record<string, (() => void) | undefined> = {
    bookings: () => navigation.navigate("Tabs", { screen: "Bookings" } as never),
    wallet: () => navigation.navigate("Wallet"),
    resale: () => navigation.navigate("Tabs", { screen: "Resale" } as never),
    rewards: () => navigation.navigate("Rewards"),
    settings: () => navigation.navigate("Profile"),
    payments: () => navigation.navigate("Payments"),
  };

  return (
    <ScrollView
      style={styles.page}
      {...tabScroll}
      contentContainerStyle={{
        paddingTop: insets.top + space.s,
        paddingBottom: TAB_BAR_CLEARANCE,
      }}
    >
      {/* The balance sits where a screen title's action would. */}
      <View style={styles.headerActions}>
        <Button
          label={menuCopy.beats(loyaltyBalance)}
          size="m"
          onPress={() => navigation.navigate("Rewards")}
        />
      </View>

      <View style={styles.head}>
        <Text
          variant="displayName"
          uppercase
          color={colors.white}
          style={displaySize(type.displayName, width)}
        >
          {accountUser.name}
        </Text>

        <View style={styles.memberRow}>
          <View style={styles.memberChip}>
            <Crown width={16} height={16} />
            <Text variant="bodyS">{menuCopy.member(accountUser.membership)}</Text>
          </View>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {menuCopy.since}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {menuNav.map((item, index) => (
          <View key={item.id} style={index > 0 && styles.divided}>
            <ListRow
              icon={icon(item.icon)}
              label={item.label}
              value={item.trailing}
              onPress={routes[item.id]}
            />
          </View>
        ))}
      </View>

      {/* Rate us — the comp's dialog: a panel, a title over its line, and
          three drawn hands to choose from. */}
      <View style={styles.block}>
        <View style={styles.panel}>
          <Text variant="titleBody" uppercase>
            {menuCopy.rateTitle}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {menuCopy.rateBody}
          </Text>
          <View style={styles.rates}>
            {menuCopy.rates.map((rate) => {
              const Hand = icon(rate.icon);
              return (
                <Tap
                  key={rate.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: rated === rate.label }}
                  onPress={() => setRated(rate.label)}
                  style={[styles.rate, rated && rated !== rate.label && styles.rateDim]}
                >
                  <View style={styles.hand}>
                    {Hand && <Hand width={rate.width} height={rate.height} />}
                  </View>
                  <Text variant="bodyL">{rate.label}</Text>
                </Tap>
              );
            })}
          </View>
        </View>
      </View>

      {/* Social */}
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

      <View style={styles.block}>
        <Button
          variant="outline"
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
  panel: { padding: space.l, gap: space.s, backgroundColor: colors.bgSecondary },
  rates: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingTop: space.l,
  },
  rate: { width: 65, alignItems: "center", gap: 0 },
  rateDim: { opacity: 0.4 },
  /* The tallest hand is 64; the others stand on the same baseline. */
  hand: { height: 64, justifyContent: "flex-end", alignItems: "center" },

  socials: {
    flexDirection: "row",
    gap: space.l,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },
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
