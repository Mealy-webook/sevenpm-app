import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import IcBookings from "../icons/ic-acct-bookings.svg";
import IcLoyalty from "../icons/ic-acct-loyalty.svg";
import IcProfile from "../icons/ic-acct-profile.svg";
import IcTicket from "../icons/ic-ticket-24.svg";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

import { HomeScreen } from "../screens/HomeScreen";
import { EventScreen } from "../screens/EventScreen";
import { BookingScreen } from "../screens/booking/BookingScreen";
import { BookingsScreen } from "../screens/account/BookingsScreen";
import { AccountScreen } from "../screens/account/AccountScreen";
import { WalletScreen } from "../screens/account/WalletScreen";
import { ProfileScreen } from "../screens/account/ProfileScreen";
import { PaymentsScreen } from "../screens/account/PaymentsScreen";
import { RewardsScreen } from "../screens/RewardsScreen";

export type RootParamList = {
  Tabs: undefined;
  Event: { slug: string };
  Booking: { slug: string };
  Wallet: undefined;
  Profile: undefined;
  Payments: undefined;
};

export type TabParamList = {
  Home: undefined;
  Bookings: undefined;
  Rewards: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, React.FC<SvgProps>> = {
  Home: IcTicket,
  Bookings: IcBookings,
  Rewards: IcLoyalty,
  Account: IcProfile,
};

/**
 * The tab bar is drawn here rather than configured, because the stock one is a
 * rounded, blurred, iOS-shaped object and this system is square and flat.
 *
 * The icons are the ones the web build's account sidebar uses, and they carry
 * a hardcoded `#E4E4E7` fill rather than `currentColor`, so the selected tab
 * is marked by bringing the icon to full strength and putting its label in
 * brand yellow — not by tinting the artwork, which would need the SVGs
 * rewritten and would drift from the web copies the moment either changed.
 */
function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || space.s }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const Icon = TAB_ICONS[route.name as keyof TabParamList];

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            }}
            style={styles.tab}
          >
            <View style={focused ? undefined : styles.dim}>
              <Icon width={24} height={24} />
            </View>
            <Text
              variant="caption"
              color={focused ? colors.brand : colors.contentSecondary}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: "Bookings" }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ title: "Rewards" }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: "Account" }}
      />
    </Tab.Navigator>
  );
}

/** The navigator's own theme, so no white flashes between screens. */
const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgPrimary,
    card: colors.bgSecondary,
    text: colors.contentPrimary,
    border: colors.borderTertiary,
    primary: colors.brand,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: styles.page }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Event" component={EventScreen} />
        {/* The booking journey holds a timed seat hold, so it comes up as a
            sheet from the bottom rather than sliding in as another page. */}
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.bgPrimary },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.bgSecondary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderTertiary,
    paddingTop: space.m,
  },
  tab: { flex: 1, alignItems: "center", gap: space.xs },
  dim: { opacity: 0.5 },
});
