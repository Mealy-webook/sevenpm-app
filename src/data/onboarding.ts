/**
 * Everything the first run says, from the "Splash & Onboarding" page of the
 * app Figma file (AXdFJEall8MaeCkSOSo5yV).
 *
 * Copy is transcribed from the comps rather than rewritten, so the screens and
 * the design file can be diffed by reading them side by side. Where a comp
 * carries a mistake it is corrected here and the correction is noted — a typo
 * shipped into an app is much more expensive to find than one caught against
 * its source.
 */

export type OnboardingStep = {
  id: string;
  /** Figma node, so a screen can be checked against the comp it came from. */
  node: string;
  title: string;
  body: string;
  /** Dark steps put white type on a photograph; the yellow step inverts. */
  tone: "dark" | "brand";
};

export const steps: OnboardingStep[] = [
  {
    id: "ahead",
    node: "341:1331",
    title: "Stay ahead of the crowd",
    body: "Get first dibs on new events, ticket drops, and exclusive experiences.",
    tone: "dark",
  },
  {
    id: "beats",
    node: "329:38685",
    title: "More shows more beats",
    body: "Earn beats everytime you book and use them to unlock discounts, perks and exclusive offers",
    tone: "brand",
  },
  {
    id: "cashless",
    node: "323:1074",
    title: "Go cashless at the venue",
    body: "Top up your sevenpm card, use it at the venue and earn beats with every purchase",
    tone: "dark",
  },
];

export const splashCopy = {
  node: "320:50535",
  poweredBy: "Powered by webook.com",
};

export const onboardingCopy = {
  skip: "Skip",
  next: "Next",
  /** Read in place of the progress marks, which say nothing to a reader. */
  progress: (index: number, total: number) => `Step ${index} of ${total}`,
};

export const welcomeCopy = {
  node: "393:39475",
  title: "Let’s make some noise",
  body: "Your next unforgettable night starts here.",
  email: "Email",
  continueWithEmail: "Continue with email",
  or: "OR",
  apple: "Continue with Apple",
  google: "Continue with Google",
  /* The comp also has variants for a failed social sign-in and for Face ID;
     neither is built — there is no auth behind this app. */
};

export const notificationsCopy = {
  node: "320:50447",
  /* Broken where the comp breaks it. */
  title: "Never miss\na moment",
  /* Verbatim from the comp, "SC Braga" included — the copy is the designer's
     to change, not the port's. */
  body: "Enable notifications so you never miss a goal, ticket sale, or exclusive offer from SC Braga.",
  allow: "Allow notifications",
  notNow: "Not now",
  /** The notification drawn inside the phone on the comp. */
  preview: {
    /* Spelt as the comp spells it. */
    title: "Jazzablnca is here!",
    body: "more music more life",
    time: "9:41 AM",
  },
};

export const privacyCopy = {
  node: "320:50542",
  title: "Privacy notice",
  body: "By selecting “Accept all”, you agree to the app storing information to enhance device navigation, analyses usage, and assist in our marketing offers.",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  manage: "Manage cookies",
};
