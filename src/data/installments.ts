/* ------------------------------------------------------------------ *
 * The instalment plan behind a Buy now pay later booking.
 *
 * Figma 442:5219 (the plan), 442:10270 (what was bought), 442:10579 (paying
 * one off) and 442:11389 (the receipt). The comp's own plan is four payments
 * of 20 MAD against an 80 MAD order, the first already settled — kept as the
 * starting state so the screen opens on something to do.
 * ------------------------------------------------------------------ */

export type Installment = {
  id: string;
  /** "1st payment" — the comp numbers them in words. */
  label: string;
  amount: number;
  /** When it leaves, as a date the tag can print once it has. */
  due: string;
  /** How many days from today it falls; 0 is today, negative is past. */
  inDays: number;
  paid: boolean;
};

export const installmentPlan = {
  node: "442:5219",
  eventSlug: "jazzablanca",
  currency: "MAD",
  payments: [
    { id: "p1", label: "1st payment", amount: 20, due: "10 October", inDays: -30, paid: true },
    { id: "p2", label: "2nd payment", amount: 20, due: "10 November", inDays: 0, paid: false },
    { id: "p3", label: "3rd payment", amount: 20, due: "10 December", inDays: 30, paid: false },
    { id: "p4", label: "4th payment", amount: 20, due: "10 January", inDays: 60, paid: false },
  ] satisfies Installment[],
};

export const installmentCopy = {
  tabs: [
    { id: "payments", label: "Payments" },
    { id: "order", label: "Order details" },
  ],
  /** "4 PAYMENTS (80 MAD)" over "Total 80 MAD". */
  planTitle: (count: number, total: string) => `${count} payments (${total})`,
  planTotal: (total: string) => `Total ${total}`,
  payAll: "Pay all",
  pay: "Pay",
  paid: "Paid",
  dueToday: "Due today",
  dueIn: (days: number) => `Due in ${days} days`,

  /** The order-details tab — 442:10270. */
  order: {
    tickets: (count: number) => `Tickets (${count})`,
    addons: (count: number) => `Add-ons (${count})`,
    size: (size: string) => `Size: ${size}`,
    subtotal: "Subtotal",
    total: "Total Incl. VAT",
    vat: (amount: string) => `VAT ${amount}`,
  },

  /** Paying one instalment — 442:10579. */
  paySheet: {
    title: "Pay",
    close: "Close",
    details: "Payment details",
    wallet: "Wallet credit",
    total: "Total Incl. VAT",
    vat: (amount: string) => `VAT ${amount}`,
    payWith: "Pay with",
    useWallet: "Use wallet credit",
    addCard: "Add new card",
    confirm: (amount: string) => `Confirm & Pay (${amount})`,
  },

  /** The receipt — 442:11389. */
  received: {
    title: "Payment received",
    /** "12.5 MAD has been paid. Your next payment falls on 20 Nov 2026." */
    body: (paid: string, next: string) =>
      `${paid} has been paid. Your next payment falls on ${next}.`,
    bodyDone: (paid: string) => `${paid} has been paid. Your plan is settled in full.`,
    viewBooking: "View booking",
    payAnother: "Make an other payment",
    close: "Close",
  },
};
