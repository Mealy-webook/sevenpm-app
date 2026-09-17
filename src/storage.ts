import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * The one thing this app remembers between launches: whether the intro has
 * been seen. Everything else — the basket, the Beats balance, a card added in
 * a sheet — belongs to the session it was created in and is meant to go.
 *
 * Both calls swallow their errors. Storage is unavailable often enough
 * (a cleared app, a device out of space) that a prototype should not fail to
 * start over it; an unreadable flag is treated as "not seen", which shows the
 * intro again rather than locking somebody out of it.
 */
const SEEN_INTRO = "sevenpm.seenIntro";

export async function hasSeenIntro() {
  try {
    return (await AsyncStorage.getItem(SEEN_INTRO)) === "true";
  } catch {
    return false;
  }
}

export async function rememberIntroSeen() {
  try {
    await AsyncStorage.setItem(SEEN_INTRO, "true");
  } catch {
    /* Nothing to do: the intro shows again next launch, which is survivable. */
  }
}
