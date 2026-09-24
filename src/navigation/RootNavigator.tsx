import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import type { SvgProps } from "react-native-svg";

import IcBookings from "../icons/ic-tab-bookings.svg";
import IcDiscover from "../icons/ic-tab-discover.svg";
import IcMenu from "../icons/ic-tab-menu.svg";
import IcWallet from "../icons/ic-tab-wallet.svg";
import IcResale from "../icons/ic-tab-resale.svg";
import { TabBar } from "./TabBar";
import { colors } from "../theme/tokens";

import { DiscoverScreen } from "../screens/DiscoverScreen";
import { ResaleScreen } from "../screens/ResaleScreen";
import { ResaleListingScreen } from "../screens/ResaleListingScreen";
import { StoryScreen } from "../screens/StoryScreen";
import { ArticleScreen, NewsScreen } from "../screens/NewsScreen";
import { EventScreen } from "../screens/EventScreen";
import { BookingScreen } from "../screens/booking/BookingScreen";
import { BookingsScreen } from "../screens/account/BookingsScreen";
import { AccountScreen } from "../screens/account/AccountScreen";
import { WalletScreen } from "../screens/account/WalletScreen";
import { ProfileScreen } from "../screens/account/ProfileScreen";
import { PaymentsScreen } from "../screens/account/PaymentsScreen";
import { InstallmentsScreen } from "../screens/InstallmentsScreen";
import { TicketsScreen } from "../screens/account/TicketsScreen";
import { SendTicketScreen } from "../screens/account/SendTicketScreen";
import { TicketSentScreen } from "../screens/account/TicketSentScreen";
import { RewardsScreen } from "../screens/RewardsScreen";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";

export type RootParamList = {
  Tabs: undefined;
  /**
   * `arriving` means the screen is being flown to rather than pushed to:
   * `PosterZoom` is carrying a record onto its deck and this page is being
   * put underneath, so it neither slides in nor opens until that lands.
   */
  Event: { slug: string; arriving?: boolean };
  Booking: { slug: string };
  Rewards: undefined;
  News: undefined;
  ResaleListing: { id: string };
  /** Sending a ticket on, and where that lands. */
  SendTicket: { bookingId: string; ticketId: string };
  TicketSent: {
    bookingId: string;
    ticketId: string;
    /** Which of the two ways it went. */
    method: "email" | "link";
    /** An email send names somebody; a link send does not. */
    name?: string;
    email?: string;
    link?: string;
  };
  Profile: undefined;
  Payments: undefined;
  Installments: { bookingId?: string } | undefined;
  Tickets: { bookingId: string };
  Story: { id: string };
  Article: { slug: string };
  SignIn: undefined;
};

/**
 * The Welcome screen again, reached from inside the app rather than from the
 * first run. It is the same screen — there is only one place the app asks who
 * you are — so it is wrapped rather than copied: leaving it goes back to
 * wherever it was opened from, and whether you signed in or skipped is
 * recorded by the screen itself.
 */
function SignInScreen({
  navigation,
}: NativeStackScreenProps<RootParamList, "SignIn">) {
  return <WelcomeScreen onDone={() => navigation.goBack()} />;
}

/**
 * The five tabs, in the order the comps draw them.
 *
 * **The comps disagreed about this bar.** Discover (378:27388) showed
 * Discover / Tickets / Wallet / Resale / Menu and the account screen
 * (359:7929) showed Discover / Bookings / News / Resale / Menu. The newer
 * account screen (454:67370) settled it: Discover / Resale / Wallet /
 * Bookings / Menu, which is what its five glyphs draw and what Ahmed
 * confirmed. Wallet takes the tab; News gives one up and is reached from
 * Discover, which is the only place that ever linked to it.
 */
export type TabParamList = {
  Discover: undefined;
  Resale: undefined;
  Wallet: undefined;
  Bookings: undefined;
  Menu: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, React.FC<SvgProps>> = {
  Discover: IcDiscover,
  Resale: IcResale,
  Wallet: IcWallet,
  Bookings: IcBookings,
  Menu: IcMenu,
};

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} icons={TAB_ICONS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Discover" }}
      />
      <Tab.Screen
        name="Resale"
        component={ResaleScreen}
        options={{ title: "Resale" }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: "Wallet" }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: "Bookings" }}
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
        screenOptions={{
          headerShown: false,
          contentStyle: styles.page,
          /* Android's default is a fade up and iOS's is a slide from the
             right. Pinned so a push is the same gesture on both, and so the
             back swipe matches what the push looked like. */
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Event"
          component={EventScreen}
          options={({ route }) => ({
            /* A flown-to page must not also slide: it is already being
               covered by the thing flying onto it. */
            animation: route.params?.arriving ? "none" : "slide_from_right",
            /* No swipe back from this one. The record at the top of the page
               is pushed left and right to change what is playing, and the
               record reaches the edge of the screen — a back gesture living
               in the same place would take the page away instead. The comp
               gives this page a close button rather than a back arrow, so
               nothing is lost by it. */
            gestureEnabled: false,
          })}
        />
        {/* The booking journey holds a timed seat hold, so it comes up as a
            sheet from the bottom rather than sliding in as another page. */}
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ presentation: "fullScreenModal" }}
        />
        <Stack.Screen name="Article" component={ArticleScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="ResaleListing" component={ResaleListingScreen} />
        {/* Sending a ticket comes up over the ticket it is about, and its
            confirmation replaces it rather than stacking on it. */}
        <Stack.Screen
          name="SendTicket"
          component={SendTicketScreen}
          options={{ presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="TicketSent"
          component={TicketSentScreen}
          options={{ presentation: "fullScreenModal" }}
        />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
        <Stack.Screen name="Installments" component={InstallmentsScreen} />
        {/* A ticket is held up at a gate, so it comes up over the app the way
            the booking journey does rather than sliding in beside it. */}
        <Stack.Screen
          name="Tickets"
          component={TicketsScreen}
          options={{ presentation: "fullScreenModal" }}
        />
        {/* Asking who you are comes up over the app rather than beside it:
            it is not a page in the app, it is the way into it. */}
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ presentation: "fullScreenModal" }}
        />
        {/* The story player has no way in at the moment. It was opened from
            the ring on the Discover screen this app used to have, and the
            Discover that replaced it — the Moodboard's — has no ring. The
            screen is kept and routed so it is one call away once there is
            somewhere to put that entry. */}
        <Stack.Screen
          name="Story"
          component={StoryScreen}
          options={{ presentation: "fullScreenModal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.bgPrimary },
});
