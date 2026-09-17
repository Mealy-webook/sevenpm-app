import {
  bookingConfig,
  getAddon,
  getTicket,
  type BookingAddon,
  type BookingTicket,
} from "../../data/booking";

/**
 * The basket behind the booking journey. One line per ticket, and one per
 * add-on *per size* — two sizes of the same shirt are two lines, which is
 * what the order summary's "Size: M" sub-label implies.
 */

export type CartLine = {
  /** `id` for tickets and sized-less add-ons, `id:size` otherwise. */
  key: string;
  kind: "ticket" | "addon";
  id: string;
  size?: string;
  qty: number;
};

export type Cart = CartLine[];

export function lineKey(id: string, size?: string) {
  return size ? `${id}:${size}` : id;
}

export function findLine(cart: Cart, id: string, size?: string) {
  return cart.find((line) => line.key === lineKey(id, size));
}

export function quantityOf(cart: Cart, id: string, size?: string) {
  return findLine(cart, id, size)?.qty ?? 0;
}

/** Every unit of one add-on, whatever the size — what a product tile counts. */
export function quantityOfAny(cart: Cart, id: string) {
  return cart
    .filter((line) => line.id === id)
    .reduce((total, line) => total + line.qty, 0);
}

/**
 * Add `by` units to a line, creating or dropping it as needed. Quantities are
 * clamped to `bookingConfig.maxPerLine`; hitting zero removes the line, which
 * is what turns a stepper back into an "Add" button.
 */
export function adjust(
  cart: Cart,
  kind: CartLine["kind"],
  id: string,
  by: number,
  size?: string,
): Cart {
  const key = lineKey(id, size);
  const existing = cart.find((line) => line.key === key);
  const next = Math.min(
    bookingConfig.maxPerLine,
    Math.max(0, (existing?.qty ?? 0) + by),
  );
  if (next === 0) return cart.filter((line) => line.key !== key);
  if (!existing) return [...cart, { key, kind, id, size, qty: next }];
  return cart.map((line) => (line.key === key ? { ...line, qty: next } : line));
}

export function removeLine(cart: Cart, id: string, size?: string): Cart {
  const key = lineKey(id, size);
  return cart.filter((line) => line.key !== key);
}

export type PricedLine = CartLine & {
  name: string;
  unit: number;
  amount: number;
  icon: string;
  source: BookingTicket | BookingAddon;
};

function priceLine(line: CartLine): PricedLine | null {
  if (line.kind === "ticket") {
    const ticket = getTicket(line.id);
    if (!ticket) return null;
    return {
      ...line,
      name: ticket.name,
      unit: ticket.price,
      amount: ticket.price * line.qty,
      icon: "/assets/ic-ticket-16.svg",
      source: ticket,
    };
  }
  const addon = getAddon(line.id);
  if (!addon) return null;
  return {
    ...line,
    name: addon.name,
    unit: addon.price,
    amount: addon.price * line.qty,
    icon: addon.icon,
    source: addon,
  };
}

export type Totals = {
  ticketLines: PricedLine[];
  addonLines: PricedLine[];
  ticketCount: number;
  addonCount: number;
  itemsTotal: number;
  delivery: number;
  subtotal: number;
  /** Flat per-order fee — the comps' "Innovation fees". */
  fee: number;
  /** What the promo code takes off, never more than what is owed. */
  promo: number;
  /** What the wallet actually covers — never more than what is left. */
  wallet: number;
  total: number;
  vat: number;
};

export function totals(
  cart: Cart,
  options?: { wallet?: boolean; delivery?: number; promo?: number },
): Totals {
  const priced = cart
    .map(priceLine)
    .filter((line): line is PricedLine => line !== null);
  const ticketLines = priced.filter((line) => line.kind === "ticket");
  const addonLines = priced.filter((line) => line.kind === "addon");
  const itemsTotal = priced.reduce((sum, line) => sum + line.amount, 0);
  const delivery = options?.delivery ?? 0;
  const subtotal = itemsTotal + delivery;
  const fee = subtotal > 0 ? bookingConfig.innovationFee : 0;
  const promo = Math.min(options?.promo ?? 0, subtotal + fee);
  const owed = subtotal + fee - promo;
  const wallet = options?.wallet
    ? Math.min(bookingConfig.walletCredit, owed)
    : 0;
  const total = owed - wallet;
  return {
    ticketLines,
    addonLines,
    ticketCount: ticketLines.reduce((sum, line) => sum + line.qty, 0),
    addonCount: addonLines.reduce((sum, line) => sum + line.qty, 0),
    itemsTotal,
    delivery,
    subtotal,
    fee,
    promo,
    wallet,
    total,
    /** VAT is inside the total, not added to it — see `bookingConfig`. */
    vat: total * bookingConfig.vatRate,
  };
}
