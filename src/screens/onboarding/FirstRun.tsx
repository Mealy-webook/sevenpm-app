import { useCallback, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";

import { colors, motion } from "../../theme/tokens";
import { ease, easeIn, useReducedMotion } from "../../theme/motion";
import { OnboardingScreen } from "./OnboardingScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { PrivacyScreen } from "./PrivacyScreen";

/**
 * Everything between the splash and the app, in order.
 *
 * The "Splash & Onboarding" page of the Figma file holds these four as
 * separate frames with no flow drawn between them, so the order is a decision
 * rather than a transcription: tell the story, ask who you are, ask for
 * notifications, then deal with consent. Notifications come after sign-in
 * because the ask reads very differently once somebody has decided to stay,
 * and the privacy notice comes last because it is the only one that is not
 * about them.
 *
 * It is one array and one index — reorder the array to reorder the flow.
 *
 * Stages hand over rather than cut: the outgoing screen leaves quickly under
 * its own steam, the incoming one arrives on the system's settling curve and
 * rises the last few pixels into place. They are deliberately *not*
 * crossfaded — each of these screens is a full-bleed photograph, and holding
 * two of them on the GPU at once to dissolve between them costs more than the
 * moment is worth. Out, then in, over the page colour they both sit on.
 *
 * None of the four can be returned to. They are stages of a first run, not
 * pages, and there is nothing on any of them worth going back for; Skip
 * anywhere leaves the whole sequence, which is what Skip means on a comp that
 * puts it in the same place on every screen.
 */
const STAGES = [
  OnboardingScreen,
  WelcomeScreen,
  NotificationsScreen,
  PrivacyScreen,
] as const;

export function FirstRun({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  /* Guards the gap between the two halves of the handover: a second press
     while the screen is on its way out would skip a stage. */
  const leaving = useRef(false);

  const advance = useCallback(() => {
    if (leaving.current) return;
    const last = stage === STAGES.length - 1;

    if (reduced) {
      if (last) onDone();
      else setStage(stage + 1);
      return;
    }

    leaving.current = true;
    Animated.timing(fade, {
      toValue: 0,
      duration: motion.fast,
      easing: easeIn,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        leaving.current = false;
        return;
      }
      if (last) {
        onDone();
        return;
      }
      setStage((value) => value + 1);
      Animated.timing(fade, {
        toValue: 1,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }).start(() => {
        leaving.current = false;
      });
    });
  }, [stage, reduced, fade, onDone]);

  const Stage = STAGES[stage];

  return (
    <Animated.View
      style={[
        styles.page,
        {
          opacity: fade,
          transform: [
            {
              translateY: fade.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Stage onDone={advance} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
});
