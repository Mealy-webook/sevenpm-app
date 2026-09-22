import { welcomeCopy } from "./onboarding";

/**
 * What the app says to somebody who is not signed in.
 *
 * No comp draws these screens, so the words are held to two rules: the
 * heading and the line under it are the Welcome screen's own (393:39475), so
 * the menu asks in the same voice the sign-in screen answers in; and
 * everything else is the shortest true sentence, never a sales line.
 */
export const signedOutCopy = {
  /* The Welcome screen's line, broken where the menu needs it broken. Display
     type is stacked line by line from the breaks the copy carries, so a
     display string left to wrap on its own is laid out upward and off the top
     of the page. The Welcome screen's own copy is left unbroken: it sits at
     the foot of its screen, where that overflow has somewhere to go. */
  title: welcomeCopy.title.replace(" some", "\nsome"),
  body: welcomeCopy.body,
  /** The action, wherever it appears. */
  signIn: "Sign in",
  /** Where a list would be, if there were an account behind it. */
  bookings: "Sign in to see your bookings",
  wallet: "Sign in to see your wallet",
};
