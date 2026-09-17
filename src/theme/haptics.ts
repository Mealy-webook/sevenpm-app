import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Touch feedback, named for what happened rather than for how it feels.
 *
 * Call sites should read as a description of the event — `tap.commit()` when
 * an order is placed — so the mapping from event to sensation lives here and
 * can be tuned in one place. Naming them "medium" and "heavy" at the call site
 * is how an app ends up buzzing at you for no reason.
 *
 * Every call is fire-and-forget and swallows its error: the taptic engine is
 * absent on a simulator and on plenty of Android hardware, and a failure to
 * vibrate must never interrupt what the press was actually doing.
 *
 * Android gets nothing here. Its haptics are coarser, fire through a different
 * API, and a buzz on every stepper press reads as a fault rather than as
 * feedback.
 */
const on = Platform.OS === "ios";

function fire(run: () => Promise<void>) {
  if (!on) return;
  run().catch(() => {});
}

export const tap = {
  /** A value changed under the finger — a stepper, a chip, a tab. */
  tick: () => fire(() => Haptics.selectionAsync()),

  /** Something was added or taken — a ticket, an add-on, a voucher. */
  pick: () =>
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** A thing was completed and cannot be un-done by looking away. */
  commit: () =>
    fire(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),

  /** A press that could not do what it looked like it would. */
  refuse: () =>
    fire(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
};
