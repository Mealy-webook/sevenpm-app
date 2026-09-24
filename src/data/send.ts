/**
 * Sending a ticket to somebody, from Figma 161:65688 and 162:82059.
 *
 * The recents are mock: there is no address book behind this build and no
 * send service, so the four names are here to show the rail rather than to be
 * anybody. Initials are derived rather than stored, so a name and its avatar
 * can never disagree.
 */
export type Recipient = {
  id: string;
  name: string;
  email: string;
};

/** The four the comp's rail shows. */
export const recentRecipients: Recipient[] = [
  { id: "rc-1", name: "Ahmed Nasr", email: "ahmed.nasr@webook.com" },
  { id: "rc-2", name: "Sofia Martinez", email: "sofia.martinez@webook.com" },
  { id: "rc-3", name: "Liam Chen", email: "liam.chen@webook.com" },
  { id: "rc-4", name: "Maya Patel", email: "maya.patel@webook.com" },
];

/** "Ahmed Nasr" → "AN". One letter if there is only one word. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

export const sendCopy = {
  /**
   * Choosing how to send, which no comp draws.
   *
   * The two are not variants of one screen: an email send needs a person, a
   * link send needs nobody, so the choice has to come before the form rather
   * than sit inside it. It is a sheet because it is one question.
   *
   * No icons: the SevenPM icon set has neither a link nor an envelope, and
   * the two lines say which is which without one.
   */
  method: {
    title: "Send tickets",
    subtitle: "Choose how they get there.",
    close: "Close",
    link: "Send a link",
    linkSub: "Anyone with the link can claim the ticket.",
    email: "Send by email",
    emailSub: "They get an email and have to accept it.",
    next: "Continue",
  },

  /** "Send 1 ticket to", with the count the comp puts in the middle of it. */
  title: (count: number) =>
    `Send ${count} ${count === 1 ? "ticket" : "tickets"} to`,
  recents: "Recently used",
  clear: "Clear",
  email: "Email",
  fullName: "Full name",
  paste: "Paste",
  contacts: "Choose from contacts",
  /* 162:81454, verbatim — "webook" lower case as the comp sets it. */
  warning:
    "Selling tickets outside webook will result in account suspension and ticket cancellation without refund.",
  /* 162:81483. "your agree on" is the comp's wording. */
  terms: "By continuing your agree on ",
  termsLink: "terms and conditions",
  slide: "Slide to Confirm",

  /** The screen it lands on (162:82059). */
  sent: {
    title: "Tickets sent",
    /* 489:62032. It answers the question the illustration raises — is that
       it? — by saying the send is still undoable. */
    pending:
      "You\u2019ll still see these tickets in your account as pending, and you can cancel anytime before they are approved.",
    /* Trailing space in the file; only the word is rendered. */
    recipient: "Recipient",
    tickets: (count: number) => `Tickets (${count})`,
    /** How many of a tier went, as the row prints it. */
    quantity: (count: number) => `${count}x`,
    /** The comp names the recipient in the button. */
    inform: (name: string) => `Inform ${name.split(/\s+/)[0]}`,
    /** A link has nobody to name, so it offers the link again instead. */
    shareAgain: "Share the link again",
    anyone: "Anyone with the link",
    back: "Back to booking",
  },
};
