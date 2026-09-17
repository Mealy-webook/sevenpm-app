/**
 * The three things worth saying before somebody has seen the app.
 *
 * One promise per slide, in the order the product is actually used: find the
 * festival, get in, get something back for turning up. No slide asks for a
 * permission or an account — there is nothing here the app needs before it
 * can be useful, and an intro that opens with a request reads as a toll gate.
 *
 * Photography is the event gallery from the web build, so the intro is made
 * of the same nights the rest of the app is about.
 */
export type Slide = {
  id: string;
  title: string;
  lead: string;
  body: string;
  image: string;
};

export const slides: Slide[] = [
  {
    id: "festivals",
    title: "The festivals",
    lead: "Every",
    body: "Jazzablanca, Tanjazz, Casa Anfa Latina, Arma Taghazout — every SEVENPM night of the year, with the line-up, the times and the gates in one place.",
    image: "/assets/gallery-1.jpg",
  },
  {
    id: "tickets",
    title: "Your tickets",
    lead: "Keep",
    body: "Pick your days, add the parking and the merch, and pay once. Every booking stays in your pocket, with the directions attached.",
    image: "/assets/gallery-4.jpg",
  },
  {
    id: "beats",
    title: "Earn beats",
    lead: "And",
    body: "Every ticket scanned and every dirham topped up earns Beats. Spend them on discounts, free tickets and the lounge your membership unlocks.",
    image: "/assets/gallery-3.jpg",
  },
];

export const onboardingCopy = {
  skip: "Skip",
  next: "Next",
  start: "Get started",
  /** Read out in place of the dots, which say nothing to a screen reader. */
  progress: (index: number, total: number) => `Slide ${index} of ${total}`,
};
