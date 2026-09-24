/**
 * Account area content. Bookings from Figma 2173:25780 / 2173:25975, wallet
 * from 2196:12516. Mock session data until the account API lands —
 * everything the account screens render comes from here.
 */

export const accountUser = {
  name: "Ahmed Mealy",
  email: "ahmed@gmail.com",
  avatar: "/assets/nav-avatar.jpg",
  phone: "+212 6 61 23 45 67",
  /** The membership the account page names (359:7939). */
  membership: "Crowd",
};
/* ------------------------------------------------------------------ *
 * Wallet (Figma 2196:12516)
 *
 * The balance is *derived* from the transactions, so the card, the sidebar
 * and the account dropdown can never disagree. Days are stored as an offset
 * rather than a date: the comp groups by "Today" / "Yesterday", and an
 * offset keeps those headings true however long this mock data lives.
 * ------------------------------------------------------------------ */

export type WalletTransaction = {
  id: string;
  /** `topup` adds to the balance, `payment` takes from it. */
  kind: "topup" | "payment";
  label: string;
  /** Time of day, already formatted — mock data has no real timestamps. */
  time: string;
  /** Revealed when the row is expanded. */
  detail: string;
  /** Positive for a top-up, negative for a payment. */
  amount: number;
  /** 0 = today, 1 = yesterday, … */
  dayOffset: number;
};

export const walletCurrency = "MAD";

export const walletTransactions: WalletTransaction[] = [
  {
    id: "tx-006",
    kind: "payment",
    label: "Withdraw money",
    time: "10:37 PM",
    detail: "Merch store — Anfa Park",
    amount: -60,
    dayOffset: 0,
  },
  {
    id: "tx-005",
    kind: "payment",
    label: "Withdraw money",
    time: "9:12 PM",
    detail: "Bar — Anfa Park · 3 drinks",
    amount: -90,
    dayOffset: 0,
  },
  {
    id: "tx-004",
    kind: "topup",
    label: "Add money",
    time: "6:40 PM",
    detail: "Visa ending 6411",
    amount: 200,
    dayOffset: 0,
  },
  {
    id: "tx-003",
    kind: "payment",
    label: "Withdraw money",
    time: "8:05 PM",
    detail: "Jazzablanca — weekend pass · 2 tickets",
    amount: -200,
    dayOffset: 1,
  },
  {
    id: "tx-002",
    kind: "topup",
    label: "Add money",
    time: "7:20 PM",
    detail: "Visa ending 6411",
    amount: 100,
    dayOffset: 1,
  },
  {
    id: "tx-001",
    kind: "topup",
    label: "Welcome credit",
    time: "9:00 AM",
    detail: "SEVENPM loyalty program",
    amount: 100,
    dayOffset: 9,
  },
];

export const walletBalance = walletTransactions.reduce(
  (total, tx) => total + tx.amount,
  0,
);

/** "+300 MAD" for money in, "210 MAD" for money out, as in the comp. */
export function formatAmount(amount: number, currency = walletCurrency) {
  const value = `${Math.abs(amount).toLocaleString("en-US")} ${currency}`;
  return amount > 0 ? `+${value}` : value;
}

/** Logout confirmation, from Figma 2231:12668. */
export const logoutCopy = {
  label: "Logout",
  title: "Logout",
  body: "Are you sure you want to logout?",
  cancel: "Cancel",
  confirm: "Logout",
};

export const walletCopy = {
  title: "Wallet",
  /* 480:56496 spells it "Avaiable". The comp is the spec, typo and all. */
  balanceLabel: "Avaiable balance",
  topUpCta: "Top up",
  cardTitle: "Sevenpm cashless card",
  cardBody:
    "Buy food, drinks, and merch at any SEVENPM bar or stand. Just tap or show your code — your wallet balance takes care of the rest.",
  appleWallet: "Add to Apple Wallet",
  /* Said on the card once it is held up, where the tapping happens. */
  tapToPay: "Place the back of your phone against the card reader",
  transactionsTitle: "Transactions",
  transactionsBody:
    "Your tickets live here. Wristbands are issued at the gate on presentation of your booking reference.",
  empty: "No Transactions yet",
  /** Top up, from Figma 2196:10582, 2196:11179 and 2196:12115. */
  topUp: {
    title: "Top up",
    balance: (amount: string) => `Current balance: ${amount}`,
    close: "Close",
    amount: "Enter amount",
    clear: "Clear the amount",
    /** Nothing below this reaches the provider, so the button stays off. */
    minimum: 10,
    minimumHint: (amount: string) => `Min amount is ${amount}`,
    quick: [50, 100, 200],
    quickLabel: (amount: string) => `+ ${amount}`,
    payWith: "Pay with",
    methods: [
      {
        id: "apple-pay",
        label: "Apple Pay",
        icon: "/assets/ic-applepay-24.svg",
      },
      { id: "card", label: "Card", icon: "/assets/ic-card-24.svg" },
    ],
    cardMarks: [
      "/assets/pay-cmi.svg",
      "/assets/pay-amex.svg",
      "/assets/pay-visa.svg",
      "/assets/pay-mastercard.svg",
    ],
    addCard: "Add new card",
    cardTitle: "Add payment method",
    cardSubmit: "Add card",
    submit: "Top up",
    doneTitle: "Wallet topped up",
    doneBody: (amount: string) =>
      `${amount} is showing on your balance. No payment provider is connected to this build, so nothing was actually charged.`,
    done: "Done",
  },
};

/* ------------------------------------------------------------------ *
 * Sidebar
 * ------------------------------------------------------------------ */

export type AccountNavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  /** Right-hand text (the wallet balance). */
  trailing?: string;
};

/**
 * The menu rows from Figma 359:7929. The web build's sidebar had five; this
 * has eight, and the order is the comp's.
 */
export const menuNav: AccountNavItem[] = [
  {
    id: "bookings",
    label: "Bookings",
    icon: "/assets/ic-menu-bookings.svg",
    href: "/account",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "/assets/ic-menu-wallet.svg",
    href: "/account/wallet",
    trailing: `${walletBalance} ${walletCurrency}`,
  },
  { id: "resale", label: "Resale", icon: "/assets/ic-menu-resale.svg", href: "#" },
  {
    id: "rewards",
    label: "Sevenpm rewards",
    icon: "/assets/ic-menu-rewards.svg",
    href: "/account/loyalty",
  },
  {
    id: "settings",
    label: "Account settings",
    icon: "/assets/ic-menu-settings.svg",
    href: "/account/profile",
  },
  {
    id: "payments",
    label: "Payments",
    icon: "/assets/ic-menu-payments.svg",
    href: "/account/payments",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "/assets/ic-menu-notifications.svg",
    href: "#",
  },
  {
    id: "language",
    label: "Language",
    icon: "/assets/ic-menu-language.svg",
    href: "#",
  },
];

export const menuCopy = {
  node: "359:7929",
  beats: (beats: number) => `${beats.toLocaleString("en-US")} BEATS`,
  member: (tier: string) => `${tier} Member`,
  since: "Since 2026",
  rateTitle: "Rate your experience",
  rateBody: "Help us improve and make your experience more fun",
  /* The three drawn hands and their words, as 359:7954 lays them out. */
  rates: [
    { label: "Love it", icon: "/assets/rate-love.svg", width: 35, height: 64 },
    { label: "OK!", icon: "/assets/rate-ok.svg", width: 45, height: 53 },
    { label: "#@#!", icon: "/assets/rate-bad.svg", width: 49, height: 57 },
  ],
  /** The six accounts the comp lists (359:7989), in its order. */
  socials: [
    { label: "X", href: "https://x.com", icon: "/assets/ic-social-x.svg" },
    { label: "Facebook", href: "https://facebook.com", icon: "/assets/ic-social-facebook.svg" },
    { label: "Instagram", href: "https://instagram.com", icon: "/assets/ic-social-instagram.svg" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "/assets/ic-social-linkedin.svg" },
    { label: "Snapchat", href: "https://snapchat.com", icon: "/assets/ic-social-snapchat.svg" },
    { label: "TikTok", href: "https://tiktok.com", icon: "/assets/ic-social-tiktok.svg" },
  ],
  copyright: "Copyright ©2023 Sevenpm.com. All rights reserved.",
  /** Nothing behind these rows yet — said once, at the foot of the list. */
};

export const accountNav: AccountNavItem[] = [
  {
    id: "bookings",
    label: "Bookings",
    icon: "/assets/ic-acct-bookings.svg",
    href: "/account",
  },
  {
    id: "loyalty",
    label: "SevenPM Rewards",
    icon: "/assets/ic-acct-loyalty.svg",
    href: "/account/loyalty",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "/assets/ic-acct-wallet.svg",
    href: "/account/wallet",
    trailing: `${walletBalance} ${walletCurrency}`,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "/assets/ic-acct-profile.svg",
    href: "/account/profile",
  },
  {
    id: "payments",
    label: "Payments",
    icon: "/assets/ic-acct-payments.svg",
    href: "/account/payments",
  },
];

/* ------------------------------------------------------------------ *
 * Loyalty
 * ------------------------------------------------------------------ */

export type LoyaltyTier = {
  id: string;
  name: string;
  /** Beats earned all time to reach it. */
  threshold: number;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  /**
   * The membership this reward is filed under. It drives the chips only —
   * whether a reward can be taken is a question of Beats, not rank.
   */
  tier: string;
};

export type LoyaltyEntry = {
  id: string;
  kind: "earn" | "burn";
  label: string;
  time: string;
  /** Revealed when the row is expanded. */
  detail: string;
  beats: number;
  dayOffset: number;
};

/**
 * SevenPM Rewards, from Figma 2250:10073.
 *
 * Two numbers, not one. `loyaltyLifetime` is everything ever earned and only
 * goes up — it is what sets the membership. `loyaltyBalance` is what is left
 * to spend. Driving the membership off the spendable balance would demote
 * someone for using the programme, which is the one thing a loyalty scheme
 * must never do.
 */
export const loyaltyLifetime = 500;
export const loyaltyBalance = 500;

export const loyaltyTiers: LoyaltyTier[] = [
  { id: "crowd", name: "Crowd", threshold: 0 },
  { id: "front-row", name: "Front row", threshold: 500 },
  { id: "back-stage", name: "Back stage", threshold: 1000 },
  { id: "headliner", name: "Headliner", threshold: 2500 },
];

export const loyaltyRewards: LoyaltyReward[] = [
  {
    id: "promo-5",
    name: "5% discount promocode",
    cost: 200,
    icon: "/assets/ic-promocode-24.svg",
    tier: "crowd",
  },
  {
    id: "promo-10",
    name: "10% discount promocode",
    cost: 500,
    icon: "/assets/ic-promocode-24.svg",
    tier: "crowd",
  },
  {
    id: "free-ticket",
    name: "Free event ticket",
    cost: 1000,
    icon: "/assets/ic-ticket-24.svg",
    tier: "front-row",
  },
  {
    id: "vip-lounge",
    name: "VIP lounge pass",
    cost: 1000,
    icon: "/assets/ic-crown-24.svg",
    tier: "back-stage",
  },
];

/** Recent movement, newest first. */
export const loyaltyActivity: LoyaltyEntry[] = [
  {
    id: "l1",
    kind: "burn",
    label: "Burn beats",
    time: "10:37 PM",
    detail: "5% discount promocode, redeemed at checkout",
    beats: -200,
    dayOffset: 0,
  },
  {
    id: "l2",
    kind: "burn",
    label: "Burn beats",
    time: "10:37 PM",
    detail: "Wallet top up discount",
    beats: -100,
    dayOffset: 0,
  },
  {
    id: "l3",
    kind: "earn",
    label: "Earn Beats",
    time: "10:37 PM",
    detail: "Jazzablanca — 2 tickets, scanned at the main gate",
    beats: 210,
    dayOffset: 0,
  },
];

/**
 * The "How it works" sheet, from Figma 286:52793.
 *
 * The comp replaces the web build's three paragraphs with a rate card: one
 * row per way to earn, each with what it pays. It is a better answer to the
 * question the sheet is opened to ask.
 */
export const loyaltyHowTo = {
  title: "How it works",
  intro: "Earn beats on each activity you make",
  earn: [
    { id: "day", label: "Book 1 day pass", beats: 200, icon: "/assets/ic-ticket-24.svg" },
    { id: "weekend", label: "Book weekend pass", beats: 500, icon: "/assets/ic-ticket-24.svg" },
    { id: "all", label: "Book all days pass", beats: 1000, icon: "/assets/ic-ticket-24.svg" },
    { id: "wallet", label: "Top up your wallet", beats: 100, icon: "/assets/ic-menu-wallet.svg" },
    { id: "merch", label: "Buy merchandise", beats: 100, icon: "/assets/ic-tshirt-16.svg" },
    { id: "share", label: "Share event", beats: 200, icon: "/assets/ic-share-16.svg" },
  ],
  rate: (beats: number) => `${beats.toLocaleString("en-US")} Beats`,
  done: "Got it",
};

export const loyaltyCopy = {
  title: "SevenPM Rewards",
  unit: "Beats",
  greeting: (name: string) => `Hi, ${name}`,
  memberLabel: (tier: string) => `${tier} Member`,
  memberSince: "Since 2026",
  howTo: "How it works",
  /** Beats expire, so the card says when and how many. */
  expiring: 100,
  expiresAt: "20 Sep 2026",
  expiry: (beats: number, date: string) =>
    /* 454:63288 capitalises Beats here, as everywhere else it names them. */
    `${beats.toLocaleString("en-US")} Beats will expire at ${date}`,
  toNextLead: "Earn",
  toNext: (beats: number) => `${beats.toLocaleString("en-US")} more to unlock`,
  toNextTail: "membership",
  topTier: "You are at the top membership. Nothing left to unlock.",
  allMemberships: "All Memberships",
  redeem: "Redeem",
  redeemed: "Redeemed",
  /** Not enough Beats yet. Rank never locks a reward, only the balance does. */
  locked: "Locked",
  today: "Today",
  activityTitle: "Beats activity",
  beats: (beats: number) => `${Math.abs(beats).toLocaleString("en-US")} Beats`,
  earned: (beats: number) => `+${beats.toLocaleString("en-US")} Beats`,
  confirmTitle: "Redeem",
  confirmBody: (name: string, cost: number) =>
    `Spend ${cost.toLocaleString("en-US")} Beats on ${name}?`,
  cancel: "Cancel",
  empty: "Nothing in this membership yet",
  note: "Beats and rewards here are a prototype. Nothing is issued and no balance leaves this page.",
};

/* ------------------------------------------------------------------ *
 * Bookings
 * ------------------------------------------------------------------ */

/**
 * One admission, as the gate sees it.
 *
 * `code` is what the QR carries and what a scanner reads back. It is the only
 * field on here that has to be unique, and it is printed under the QR as well
 * so a ticket is still usable when a scanner will not read the screen — a
 * phone at the wrong angle in the dark is the normal case, not the rare one.
 */
export type Ticket = {
  id: string;
  code: string;
  /** The tier as it was bought, verbatim from the booking. */
  tier: string;
  /** Where it puts you, as the ticket header prints it (486:60740). */
  seat: string;
  /** What it cost, in the wallet's currency. */
  price: number;
  holder: string;
  gate: string;
  /** When this ticket lets you in, which is not always the event's own time. */
  entry: string;
};

/** Something bought alongside the tickets — the comp's second tab. */
export type Addon = {
  id: string;
  code: string;
  name: string;
  seat: string;
  price: number;
};

export type Booking = {
  id: string;
  eventName: string;
  eventSlug: string;
  image: string;
  /** ISO datetimes; the card formats them. */
  startsAt: string;
  endsAt: string;
  /** When the gates open, which the ticket prints beside the start time. */
  doorsAt: string;
  venue: string;
  venueUrl?: string;
  tickets: Ticket[];
  addons: Addon[];
};

export const bookings: Booking[] = [
  {
    id: "bk-2026-0918",
    eventName: "Jazzablanca",
    eventSlug: "jazzablanca",
    image: "/assets/festival-poster-3.png",
    startsAt: "2026-09-18T19:00:00+01:00",
    endsAt: "2026-09-18T21:30:00+01:00",
    /** The comp prints gate open beside the start time, and they differ. */
    doorsAt: "2026-09-18T17:30:00+01:00",
    venue: "Palais des Institutions Italiennes",
    venueUrl:
      "https://www.google.com/maps/search/?api=1&query=Palais+des+Institutions+Italiennes+Casablanca",
    tickets: [
      {
        id: "tk-0918-a",
        code: "SPM-0918-4K7Q-2XR9",
        tier: "Single day: Fri 19 Sept",
        seat: "Grandstand - GA3",
        price: 210.75,
        holder: "Ahmed Mealy",
        gate: "Gate B",
        entry: "7:00 PM",
      },
      {
        id: "tk-0918-b",
        code: "SPM-0918-9WJ3-6LT4",
        tier: "Single day: Fri 19 Sept",
        seat: "Grandstand - GA4",
        price: 210.75,
        holder: "Guest",
        gate: "Gate B",
        entry: "7:00 PM",
      },
    ],
    addons: [
      {
        id: "ad-0918-a",
        code: "SPM-0918-PARK-1180",
        name: "Parking pass",
        seat: "Anfa Park - Lot B",
        price: 60,
      },
      {
        id: "ad-0918-b",
        code: "SPM-0918-LOCK-4471",
        name: "Locker",
        seat: "Cloakroom - 214",
        price: 40,
      },
    ],
  },
];

export const bookingsCopy = {
  title: "Bookings",
  filters: ["Upcoming", "Past", "VIP Box requests"] as const,
  empty: "No bookings yet",
  /** The row's one action — "4 tickets \u203a" (454:56757). */
  tickets: (count: number) => `${count} ${count === 1 ? "ticket" : "tickets"}`,
};

export const ticketCopy = {
  title: "Tickets",
  /** Which of how many, for screen readers and the rail's counter. */
  which: (index: number, total: number) => `Ticket ${index} of ${total}`,
  /** 486:60153's three facts above the rail. */
  date: "DATE",
  time: "TIME",
  gateOpen: "GATE OPEN",
  /** The two tabs, each carrying its own count. */
  tickets: (count: number) => `Tickets (${count})`,
  addons: (count: number) => `Addons (${count})`,
  /** Printed under the code on the ticket itself. */
  number: (code: string) => `No. ${code}`,
  /** The dock under each ticket. */
  sell: "Sell",
  send: "Send",
  instructions: "Ticket instructions",
  /** The rail's position, as the comp writes it. */
  position: (index: number, total: number) => `${index}/${total}`,
  sponsors: "Sponsors",
};

/* ------------------------------------------------------------------ *
 * Profile (Figma 2173:26214)
 *
 * Three cards of rows. A field with no `value` renders as "Not provided"
 * and offers "Add" rather than "Edit" — that is how the comp shows the
 * fields the visitor has never filled in.
 * ------------------------------------------------------------------ */

export type ProfileField = {
  id: string;
  label: string;
  value?: string;
  /** Label of the inline action; omit for a read-only row. */
  action?: string;
};

export type ProfileSection = {
  id: string;
  title: string;
  fields: ProfileField[];
};

export const profileCopy = {
  title: "Profile",
  description: "View & Update Your Personal and Contact Information",
  emptyValue: "Not provided",
  deleteCta: "Delete account",
};

export const profileSections: ProfileSection[] = [
  {
    id: "contact",
    title: "Contact information",
    fields: [
      { id: "email", label: "Email", value: accountUser.email },
      {
        id: "phone",
        label: "Mobile number",
        value: accountUser.phone,
        action: "Edit",
      },
    ],
  },
  {
    id: "personal",
    title: "Personal information",
    fields: [
      { id: "name", label: "Name", value: accountUser.name, action: "Edit" },
      { id: "birthday", label: "Date of birth", action: "Add" },
      { id: "gender", label: "Gender", action: "Add" },
      { id: "nationality", label: "Nationality", action: "Add" },
    ],
  },
  {
    id: "security",
    title: "Security",
    fields: [
      {
        id: "password",
        label: "Password",
        value: "Last updated: 19 Mar, 2025",
        action: "Update",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Payments — no comp; composed from the account vocabulary.
 * ------------------------------------------------------------------ */

export type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  /**
   * MM/YY. Optional: a card added through `CardDialog` never hands its expiry
   * out — only the brand, mark and last four leave that component — so a card
   * saved in this session has none to show.
   */
  expiry?: string;
  /** Brand logo for the card face. */
  mark?: string;
  primary?: boolean;
};

export type Receipt = {
  id: string;
  label: string;
  date: string;
  method: string;
  amount: string;
};

export const paymentsCopy = {
  title: "Payments",
  description:
    "The cards you pay with and every receipt SEVENPM has issued you.",
  cards: {
    title: "Manage your cards",
    addCard: "Add card",
    addTitle: "Add card",
    expires: "Exp. date",
    setDefault: "Set as default",
    /** Why the default card's Remove button is dead rather than missing. */
    defaultLocked: "Your default card cannot be removed",
    remove: "Remove",
    confirmTitle: "Remove card",
    confirmBody: (card: string) =>
      `Remove ${card}? You can add it again at any time.`,
    cancel: "Cancel",
    empty: "No cards saved yet",
    /** Cards are a mock here; nothing is stored and nothing is charged. */
    note: "Cards on this page are a prototype. Nothing is stored and no payment method is charged.",
  },
  billing: {
    title: "Billing details",
    emptyValue: "Not provided",
  },
  receipts: {
    title: "Receipts",
    download: "Download",
  },
};

export const paymentCards: PaymentCard[] = [
  {
    id: "visa-6411",
    brand: "Visa",
    last4: "6411",
    expiry: "09/28",
    mark: "/assets/pay-visa-mark.svg",
    primary: true,
  },
  {
    id: "mc-2044",
    brand: "Mastercard",
    last4: "2044",
    expiry: "03/27",
    mark: "/assets/pay-mastercard.svg",
  },
];

export const billingDetails = [
  { label: "Billing name", value: accountUser.name, action: "Edit" },
  { label: "Billing address", value: "Casablanca, Morocco", action: "Edit" },
  { label: "Company / VAT number", action: "Add" },
];

export const receipts: Receipt[] = [
  {
    id: "rc-2026-0902",
    label: "Jazzablanca — weekend pass",
    date: "2 Sept 2026",
    method: "Visa •••• 6411",
    amount: "200 MAD",
  },
  {
    id: "rc-2026-0901",
    label: "Wallet top up",
    date: "1 Sept 2026",
    method: "Visa •••• 6411",
    amount: "500 MAD",
  },
  {
    id: "rc-2026-0820",
    label: "Casa Anfa Latina — day pass",
    date: "20 Aug 2026",
    method: "Mastercard •••• 2044",
    amount: "150 MAD",
  },
];
