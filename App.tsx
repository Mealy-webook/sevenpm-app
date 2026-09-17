import {
  Roboto_400Regular,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from "@expo-google-fonts/roboto";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

import { RewardsScreen } from "./src/screens/RewardsScreen";
import { colors } from "./src/theme/tokens";

/**
 * Daltown is the licensed display face shared with the web build. It ships
 * there as a woff2, which React Native cannot load, so `assets/fonts` carries
 * an .otf converted from the same file — see DESIGN-SYSTEM.md.
 *
 * Nothing renders until the faces are in. A frame of system-font fallback at
 * 40px display size is a visible jolt, and the whole point of the display
 * scale is the face.
 */
export default function App() {
  const [ready] = useFonts({
    Daltown: require("./assets/fonts/Daltown.otf"),
    Roboto_400Regular,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_900Black,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        {ready && <RewardsScreen />}
      </View>
    </SafeAreaProvider>
  );
}
