import { useState } from "react";

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
  const [stage, setStage] = useState(0);
  const Stage = STAGES[stage];

  return (
    <Stage
      onDone={() =>
        stage === STAGES.length - 1 ? onDone() : setStage(stage + 1)
      }
    />
  );
}
