import { createContext, useContext, useMemo, useState } from "react";

/**
 * Whether anybody is signed in.
 *
 * The app has always had a sign-in screen (Figma 393:39475) and never had a
 * sign-in *state*: Skip and all three sign-in buttons on that screen called
 * the same `onDone`, so whichever you pressed, the app opened as Ahmed Mealy
 * with 500 Beats and a wallet. This keeps the answer, which is all that was
 * missing — the screen already asks the question.
 *
 * There is still no account service behind any of it. Signing in here does
 * not authenticate anybody; it records that somebody said they wanted to, so
 * the screens that need an account can show what they look like without one.
 * Nothing is persisted, because the first run plays on every launch anyway
 * (see the note in `App.tsx`), so every launch asks again.
 */
type Session = {
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

const SessionContext = createContext<Session>({
  signedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  /* Signed out until the Welcome screen says otherwise — Skip leaves it
     alone, so skipping sign-in is what being signed out means. */
  const [signedIn, setSignedIn] = useState(false);

  const value = useMemo(
    () => ({
      signedIn,
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
    }),
    [signedIn],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
