import { walletCurrency } from "./account";

/**
 * Resale: tickets people are passing on, and the ones you have passed on.
 *
 * No comp draws this — the tab has existed since 378:27388 with nothing
 * behind it. It is designed here, and it borrows the Wallet's shape because
 * the two screens do the same kind of job: a standing balance of something
 * that is yours, and a ledger of what has happened to it.
 *
 * Every price is in the wallet's currency, so one number format serves the
 * whole account area.
 */

/** Where a listing of yours has got to. */
export type ResaleStatus = "listed" | "pending" | "sold" | "withdrawn";

export type ResaleListing = {
  id: string;
  eventName: string;
  eventSlug: string;
  image: string;
  startsAt: string;
  venue: string;
  tier: string;
  gate: string;
  entry: string;
  /** What the seller is asking, and what the ticket cost new. */
  price: number;
  faceValue: number;
  seller: string;
  /** How long it has been up, as the list prints it. */
  listed: string;
};

export type MyListing = {
  id: string;
  eventName: string;
  image: string;
  tier: string;
  price: number;
  status: ResaleStatus;
  /** The one line under the name: what happened, or what is waiting. */
  detail: string;
};

/** What other people have put up. */
export const resaleListings: ResaleListing[] = [
  {
    id: "rs-001",
    eventName: "Jazzablanca",
    eventSlug: "jazzablanca",
    image: "/assets/festival-poster-3.png",
    startsAt: "2026-09-18T19:00:00+01:00",
    venue: "Palais des Institutions Italiennes",
    tier: "Single day: Fri 19 Sept",
    gate: "Gate B",
    entry: "7:00 PM",
    price: 420,
    faceValue: 450,
    seller: "Youssef B.",
    listed: "Listed 2 days ago",
  },
  {
    id: "rs-002",
    eventName: "Jazzablanca",
    eventSlug: "jazzablanca",
    image: "/assets/festival-poster-3.png",
    startsAt: "2026-09-18T19:00:00+01:00",
    venue: "Palais des Institutions Italiennes",
    tier: "Weekend pass",
    gate: "Gate A",
    entry: "6:30 PM",
    price: 780,
    faceValue: 800,
    seller: "Salma R.",
    listed: "Listed 6 hours ago",
  },
  {
    id: "rs-003",
    eventName: "Tanjazz",
    eventSlug: "tanjazz",
    image: "/assets/festival-poster-4.png",
    startsAt: "2026-10-02T20:00:00+01:00",
    venue: "Palais Moulay Hafid, Tangier",
    tier: "Single day: Fri 2 Oct",
    gate: "Gate C",
    entry: "8:00 PM",
    price: 300,
    faceValue: 300,
    seller: "Omar T.",
    listed: "Listed yesterday",
  },
];

/** And what you have. */
export const myResaleListings: MyListing[] = [
  {
    id: "ml-001",
    eventName: "Jazzablanca",
    image: "/assets/festival-poster-3.png",
    tier: "Single day: Fri 19 Sept",
    price: 430,
    status: "listed",
    detail: "Listed 4 days ago",
  },
  {
    id: "ml-002",
    eventName: "Casa Anfa Latina",
    image: "/assets/festival-poster-5.png",
    tier: "Weekend pass",
    price: 650,
    status: "pending",
    detail: "Checking the ticket is transferable",
  },
  {
    id: "ml-003",
    eventName: "Tanjazz",
    image: "/assets/festival-poster-4.png",
    tier: "Single day: Sat 3 Oct",
    price: 310,
    status: "sold",
    detail: "Paid into your wallet on 14 Sept",
  },
];

export const resaleCopy = {
  title: "Resale",
  /** The two sections, and what each is for. */
  availableTitle: "Available now",
  availableBody:
    "Tickets other people are passing on, at the price they set. Every one is checked before it is listed.",
  mineTitle: "My listings",
  mineBody: "What you have put up, and where each one has got to.",
  emptyAvailable: "Nothing listed right now",
  emptyMine: "You have not listed anything",

  /** A price, and what the ticket cost new. */
  price: (amount: number) => `${amount.toLocaleString("en-US")} ${walletCurrency}`,
  faceValue: (amount: string) => `Face value ${amount}`,
  /** How much below face value a listing is, when it is. */
  under: (amount: string) => `${amount} under face value`,

  status: {
    listed: "Listed",
    pending: "In review",
    sold: "Sold",
    withdrawn: "Withdrawn",
  } as Record<ResaleStatus, string>,

  /** The detail screen. */
  seller: "Sold by",
  tier: "Type",
  gate: "Gate",
  entry: "Doors",
  venue: "Venue",
  book: "Book this ticket",
  confirmTitle: "Book this ticket",
  confirmBody: (price: string) =>
    `${price} goes to the seller. The ticket moves to your bookings once it clears.`,
  confirmCancel: "Cancel",
  confirmBook: "Book",
  taken: "Booked",
};
