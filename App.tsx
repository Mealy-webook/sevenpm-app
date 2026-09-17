import "react-native-gesture-handler";

import { useCallback, useEffect, useState } from "react";
import {
  Roboto_400Regular,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from "@expo-google-fonts/roboto";
import * as NativeSplash from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { FirstRun } from "./src/screens/onboarding/FirstRun";
import { SplashScreen } from "./src/screens/onboarding/SplashScreen";
import { hasSeenIntro, rememberIntroSeen } from "./src/storage";
import { colors } from "./src/theme/tokens";

/* Hold the OS splash until the fonts are in and we know whether the intro has
   been seen. Told to fail quietly: a rejected promise here would be a crash
   before the first frame, over a splash screen. */
NativeSplash.preventAutoHideAsync().catch(() => {});

/**
 * What happens between tapping the icon and the first screen.
 *
 * Three things have to be true before anything can be drawn — the fonts are
 * loaded, the intro flag has been read, and the OS splash is still covering
 * all of it — and they are deliberately not raced. Daltown is the point of
 * the display scale, so a frame of system-font fallback at 40px is a visible
 * jolt; the intro flag decides which screen is first, so guessing it means
 * either a flash of the app behind the intro or an intro that appears after
 * the app has already drawn.
 *
 * Then the app's own splash picks up the same mark on the same ground the OS
 * splash was showing, and hands over to the first run or straight to the app.
 */
export default function App() {
  const [fontsReady] = useFonts({
    Daltown: require("./assets/fonts/Daltown.otf"),
    Roboto_400Regular,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [seenIntro, setSeenIntro] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    hasSeenIntro().then(setSeenIntro);
  }, []);

  const ready = fontsReady && seenIntro !== null;

  useEffect(() => {
    if (ready) NativeSplash.hideAsync().catch(() => {});
  }, [ready]);

  const finishIntro = useCallback(() => {
    setSeenIntro(true);
    rememberIntroSeen();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        {ready && (
          <>
            {seenIntro ? <RootNavigator /> : <FirstRun onDone={finishIntro} />}
            {/* Drawn over whatever is behind it and removed when it fades, so
                the first screen is already laid out when it goes. */}
            {!revealed && <SplashScreen onDone={() => setRevealed(true)} />}
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}
