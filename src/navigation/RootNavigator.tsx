import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import IcDiscover from "../icons/ic-tab-discover.svg";
import IcMenu from "../icons/ic-tab-menu.svg";
import IcResale from "../icons/ic-tab-resale.svg";
import IcTickets from "../icons/ic-tab-tickets.svg";
import IcWallet from "../icons/ic-tab-wallet.svg";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";

import { DiscoverScreen } from "../screens/DiscoverScreen";
import { ResaleScreen } from "../screens/ResaleScreen";
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
  Rewards: undefined;
  Profile: undefined;
  Payments: undefined;
};

/** The five tabs of Figma 378:27388, in the order the comp draws them. */
export type TabParamList = {
  Discover: undefined;
  Tickets: undefined;
  Wallet: undefined;
  Resale: undefined;
  Menu: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, React.FC<SvgProps>> = {
  Discover: IcDiscover,
  Tickets: IcTickets,
  Wallet: IcWallet,
  Resale: IcResale,
  Menu: IcMenu,
};

/**
 * The tab bar is drawn here rather than configured, because the stock one is a
 * rounded, blurred, iOS-shaped object and this system is square and flat.
 *
 * The five icons are exported from that comp, where each is baked in the
 * colour of the state it was drawn in — Discover in brand yellow because the
 * comp shows Discover selected. Their `fill` attributes were rewritten once to
 * `currentColor` so one icon can serve both states; the path data is
 * untouched. That is the only edit made to an exported asset in this app, and
 * it is why these five are tinted while the web build's icons are not.
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
            <Icon
              width={24}
              height={24}
              color={focused ? colors.brand : colors.contentPrimary}
            />
            <Text
              variant="tab"
              color={focused ? colors.brand : colors.contentPrimary}
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
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Discover" }}
      />
      <Tab.Screen
        name="Tickets"
        component={BookingsScreen}
        options={{ title: "Tickets" }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: "Wallet" }}
      />
      <Tab.Screen
        name="Resale"
        component={ResaleScreen}
        options={{ title: "Resale" }}
      />
      <Tab.Screen name="Menu" component={AccountScreen} options={{ title: "Menu" }} />
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
        <Stack.Screen name="Rewards" component={RewardsScreen} />
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
    /* 5% white, as the comp fills it — not the raised band the previous bar
       used. It sits over the page rather than beside it. */
    backgroundColor: colors.overlay5,
    paddingTop: space.s,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
  },
});
