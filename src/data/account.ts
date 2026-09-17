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
    amount: 500,
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
  balanceLabel: "Available balance",
  topUpCta: "Top up",
  transactionsTitle: "Transactions",
  empty: "No transactions yet",
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

/** What the "How it works" sheet explains. */
export const loyaltyHowTo = {
  title: "How it works",
  intro:
    "Beats are what SevenPM Rewards runs on. You earn them by turning up, and you spend them on the rewards your membership unlocks.",
  earnTitle: "Ways to earn",
  earn: [
    {
      id: "tickets",
      label: "Book a ticket",
      detail: "1 Beat per dirham, credited when the gate scans it",
      icon: "/assets/ic-ticket-24.svg",
    },
    {
      id: "wallet",
      label: "Top up your wallet",
      detail: "2 Beats per dirham loaded before the festival",
      icon: "/assets/ic-wallet.svg",
    },
    {
      id: "merch",
      label: "Buy merchandise",
      detail: "1 Beat per dirham, in the shop or at the stand",
      icon: "/assets/ic-tshirt-16.svg",
    },
    {
      id: "refer",
      label: "Bring someone new",
      detail: "500 Beats each once their first booking is scanned",
      icon: "/assets/ic-user.svg",
    },
  ],
  membershipTitle: "How memberships work",
  membershipBody:
    "Your membership comes from Beats earned all time, so spending them never moves you down a level. Each level keeps everything the one below it unlocked.",
  expiryTitle: "When Beats expire",
  expiryBody:
    "Beats last twelve months from the day they land. The card at the top of this page always names the next batch to go.",
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
    `${beats.toLocaleString("en-US")} beats will expire at ${date}`,
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

export type Booking = {
  id: string;
  eventName: string;
  eventSlug: string;
  image: string;
  /** ISO datetimes; the card formats them. */
  startsAt: string;
  endsAt: string;
  venue: string;
  venueUrl?: string;
  tickets: number;
};

export const bookings: Booking[] = [
  {
    id: "bk-2026-0918",
    eventName: "Jazzablanca",
    eventSlug: "jazzablanca",
    image: "/assets/festival-poster-3.png",
    startsAt: "2026-09-18T19:00:00+01:00",
    endsAt: "2026-09-18T21:30:00+01:00",
    venue: "Palais des Institutions Italiennes",
    venueUrl:
      "https://www.google.com/maps/search/?api=1&query=Palais+des+Institutions+Italiennes+Casablanca",
    tickets: 2,
  },
];

export const bookingsCopy = {
  title: "Bookings",
  description:
    "Your tickets live here. Wristbands are issued at the gate on presentation of your booking reference.",
  filters: ["Upcoming", "Past"] as const,
  empty: "No bookings yet",
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
