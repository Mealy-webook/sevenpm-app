# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

This project runs **SDK 57** (React Native 0.86, React 19.2). It was upgraded
from SDK 54 on 21 Sep 2026 at Ahmed's request. **Expo Go on the device must be
57.x** — an older Expo Go refuses the bundle with "Project is incompatible with
this version of Expo Go". The simulator's copy was updated automatically by
`npx expo start --ios`; a physical phone needs the App Store version.

Do not change the SDK again without asking — it is the one thing standing
between this app and not opening on his phone.

## Carried over from the 54 → 57 upgrade

- **The legacy architecture is gone** (dropped in SDK 55). This app is New
  Architecture only; there is no `newArchEnabled` flag to set.
- `StyleSheet.absoluteFillObject` **no longer exists at runtime** in RN 0.86.
  `StyleSheet.absoluteFill` is now the plain object, so spread that instead.
- `expo-blur` renamed `experimentalBlurMethod` to `blurMethod` (SDK 55).
- The top-level `splash` key was removed from the app config schema; the
  `expo-splash-screen` plugin is the only place it belongs now.
- There are no `android/` or `ios/` folders — this is continuous native
  generation, so an upgrade needs no pod install or folder regeneration.
