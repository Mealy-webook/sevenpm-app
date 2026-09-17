import "react-native-gesture-handler";

import { useEffect, useState } from "react";
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
import { colors } from "./src/theme/tokens";

/* Hold the OS splash until the fonts are in. Told to fail quietly: a rejected
   promise here would be a crash before the first frame, over a splash. */
NativeSplash.preventAutoHideAsync().catch(() => {});

/**
 * What happens between tapping the icon and the first screen.
 *
 * **The splash and the first run play every launch, on purpose.** They were
 * built to be seen once and remembered in storage; Ahmed asked for them every
 * time, which is what you want while the screens are still being designed —
 * you cannot review an intro you have to reinstall the app to see. Putting
 * the "seen it" flag back is a small change: read it before the first frame,
 * skip `FirstRun` when it is set, and write it when the run completes.
 *
 * Nothing is drawn until the fonts are in. Daltown is the point of the display
 * scale, and a frame of system-font fallback at 104px is a visible jolt.
 *
 * Then the app's own splash picks up the same mark on the same ground the OS
 * splash was showing, and hands over to the first run.
 */
export default function App() {
  const [ready] = useFonts({
    Daltown: require("./assets/fonts/Daltown.otf"),
    Roboto_400Regular,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [revealed, setRevealed] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (ready) NativeSplash.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        {ready && (
          <>
            {introDone ? (
              <RootNavigator />
            ) : (
              <FirstRun onDone={() => setIntroDone(true)} />
            )}
            {/* Drawn over whatever is behind it and removed when it fades, so
                the first screen is already laid out when it goes. */}
            {!revealed && <SplashScreen onDone={() => setRevealed(true)} />}
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}
