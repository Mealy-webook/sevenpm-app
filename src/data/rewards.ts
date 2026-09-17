/**
 * Demo content for the Rewards screen, carried over from the web build
 * (sevenpm-web/src/data/account.ts) so the two tell the same story.
 *
 * Two numbers, not one: `lifetime` is everything ever earned and only goes up,
 * and it is what sets the membership. `balance` is what is left to spend.
 * Driving the membership off the spendable balance would demote someone for
 * using the programme, which is the one thing a loyalty scheme must never do.
 */

export type Tier = { id: string; name: string; threshold: number };
export type Reward = {
  id: string;
  name: string;
  cost: number;
  tier: string;
  icon: "promo" | "ticket" | "crown";
};
export type Entry = {
  id: string;
  kind: "earn" | "burn";
  label: string;
  time: string;
  detail: string;
  beats: number;
};

export const member = { name: "Ahmed Mealy", since: "Since 2026" };

export const lifetime = 500;
export const balance = 500;

export const tiers: Tier[] = [
  { id: "crowd", name: "Crowd", threshold: 0 },
  { id: "front-row", name: "Front row", threshold: 500 },
  { id: "back-stage", name: "Back stage", threshold: 1000 },
  { id: "headliner", name: "Headliner", threshold: 2500 },
];

export const rewards: Reward[] = [
  { id: "promo-5", name: "5% discount promocode", cost: 200, tier: "crowd", icon: "promo" },
  { id: "promo-10", name: "10% discount promocode", cost: 500, tier: "crowd", icon: "promo" },
  { id: "free-ticket", name: "Free event ticket", cost: 1000, tier: "front-row", icon: "ticket" },
  { id: "vip-lounge", name: "VIP lounge pass", cost: 1000, tier: "back-stage", icon: "crown" },
];

export const activity: Entry[] = [
  {
    id: "l1",
    kind: "burn",
    label: "Burn beats",
    time: "10:37 PM",
    detail: "5% discount promocode, redeemed at checkout",
    beats: -200,
  },
  {
    id: "l2",
    kind: "burn",
    label: "Burn beats",
    time: "10:37 PM",
    detail: "Wallet top up discount",
    beats: -100,
  },
  {
    id: "l3",
    kind: "earn",
    label: "Earn Beats",
    time: "10:37 PM",
    detail: "Jazzablanca — 2 tickets, scanned at the main gate",
    beats: 210,
  },
];

export const copy = {
  unit: "Beats",
  allMemberships: "All Memberships",
  howItWorks: "How it works",
  redeem: "Redeem",
  locked: "Locked",
  today: "Today",
  title: "SevenPM Rewards",
  activityTitle: "Beats activity",
  memberLabel: (tier: string) => `${tier} Member`,
  toNext: (beats: number, tier: string) =>
    `Earn ${beats.toLocaleString("en-US")} more to unlock ${tier} membership`,
  topTier: "You are at the top membership. Nothing left to unlock.",
  note: "Beats and rewards here are a prototype. Nothing is issued and no balance leaves this screen.",
};
