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
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, displaySize, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { homeStory } from "../../data/home";
import {
  accountUser,
  loyaltyBalance,
  loyaltyLifetime,
  loyaltyTiers,
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

  const tier =
    [...loyaltyTiers].reverse().find((t) => loyaltyLifetime >= t.threshold) ??
    loyaltyTiers[0];

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
          variant="displayStep"
          uppercase
          color={colors.white}
          style={displaySize(type.displayStep, width)}
        >
          {accountUser.name}
        </Text>

        <View style={styles.memberRow}>
          <View style={styles.memberChip}>
            <Crown width={16} height={16} />
            <Text variant="bodyS">{menuCopy.member(tier.name)}</Text>
          </View>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {menuCopy.since}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {menuNav.map((item) => (
          <ListRow
            key={item.id}
            icon={icon(item.icon)}
            label={item.label}
            value={item.trailing}
            onPress={routes[item.id]}
          />
        ))}
        <Text variant="caption" color={colors.contentSecondary} style={styles.note}>
          {menuCopy.note}
        </Text>
      </View>

      {/* Rate us */}
      <View style={styles.block}>
        <Text variant="titleBody" uppercase>
          {menuCopy.rateTitle}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {menuCopy.rateBody}
        </Text>
        <View style={styles.rates}>
          {menuCopy.rates.map((label) => (
            <Button
              key={label}
              label={label}
              size="m"
              variant={rated === label ? "outline" : "secondary"}
              onPress={() => setRated(label)}
              style={styles.rate}
            />
          ))}
        </View>
        {rated && (
          <Text variant="caption" color={colors.positive}>
            Thanks — nothing is sent anywhere from this build.
          </Text>
        )}
      </View>

      {/* Social */}
      <View style={styles.block}>
        <View style={styles.socials}>
          {homeStory.socials.map((social) => {
            const Mark = icon(social.icon);
            return (
              <Button
                key={social.label}
                label=""
                icon={Mark}
                onPress={() => Linking.openURL(social.href)}
                style={styles.social}
              />
            );
          })}
        </View>
        <Text variant="caption" color={colors.contentSecondary}>
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

  rows: { paddingHorizontal: space.xl, paddingTop: space.xl },
  note: { paddingTop: space.m },

  block: { paddingHorizontal: space.xl, paddingTop: space.section, gap: space.m },
  rates: { flexDirection: "row", gap: space.s },
  rate: { flex: 1 },

  socials: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  social: { width: 44, height: 44 },
});
