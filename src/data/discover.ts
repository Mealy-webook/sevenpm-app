/**
 * Discover — the app's home screen, from Figma 378:27332.
 *
 * Where the comp carries placeholder content, real content from the web build
 * is used instead and the swap is noted: a card that says "Product name" twice
 * tells you nothing about whether the layout survives a real product name, and
 * a news list that repeats one headline three times hides how two-line
 * headlines stack.
 */
import { newsArticles } from "./news";
import { addons, formatMoney } from "./booking";

export type Story = {
  id: string;
  label: string;
  image: string;
  /** A watched story loses the brand ring for a dim one. */
  watched?: boolean;
  /** Where it was posted, shown under the name in the viewer. */
  venue: string;
  /** How long ago, as the viewer writes it — "14h". */
  posted: string;
  /** The logo that sits in the viewer's header, if it has one. */
  avatar?: string;
  /**
   * The frames the story plays through, one progress segment each.
   *
   * The comp (415:38335) draws nine segments against a single photograph,
   * which is a placeholder for however many frames a story turns out to have.
   * These are the real photographs the app has for each festival rather than
   * one image repeated nine times — a viewer tested against nine copies of one
   * frame proves nothing about whether the progress bar tracks.
   */
  frames: { image: string; caption: string }[];
};

/**
 * The comp labels the third story "Casa anifa latina"; the festival is Casa
 * Anfa Latina, as the web build spells it. Corrected here.
 */
export const stories: Story[] = [
  {
    id: "jazzablanca",
    label: "Jazzablanca",
    image: "/assets/story-1.jpg",
    venue: "Anfa Park in Casablanca, Morocco",
    posted: "14h",
    avatar: "/assets/story-avatar.png",
    frames: [
      { image: "/assets/story-frame.jpg", caption: "Give & Take -Show at Comedy Pod" },
      { image: "/assets/gallery-1.jpg", caption: "Main stage, second night" },
      { image: "/assets/gallery-3.jpg", caption: "Anfa Park after dark" },
    ],
  },
  {
    id: "tanjazz",
    label: "Tanjazz",
    image: "/assets/story-2.jpg",
    venue: "Tangier, Morocco",
    posted: "1d",
    frames: [
      { image: "/assets/gallery-4.jpg", caption: "Tanjazz, opening night" },
      { image: "/assets/gallery-5.jpg", caption: "The courtyard sessions" },
    ],
  },
  {
    id: "casa-anfa-latina",
    label: "Casa Anfa Latina",
    image: "/assets/story-3.jpg",
    venue: "Casablanca, Morocco",
    posted: "2d",
    frames: [{ image: "/assets/gallery-2.jpg", caption: "Casa Anfa Latina" }],
  },
  {
    id: "sevenpm",
    label: "sevenpm",
    image: "/assets/story-4.jpg",
    watched: true,
    venue: "Casablanca, Morocco",
    posted: "3d",
    frames: [{ image: "/assets/gallery-6.jpg", caption: "More music more life" }],
  },
];

export type FestivalCard = {
  id: string;
  name: string;
  /** Dates in the accent colour. Undefined when content has not set them. */
  dates?: string;
  venue: string;
  image: string;
  /** Only Jazzablanca has a page behind it. */
  slug?: string;
};

/**
 * The comp shows the same Jazzablanca card twice. The second is filled with
 * the other festival the poster art belongs to.
 *
 * Its dates are deliberately absent rather than invented — the comp does not
 * state them and nothing in the web build does either. The card renders
 * without the accent line until content supplies one.
 *
 * "02 - 11 Jullet 2026" in the comp is a misspelling of the French Juillet.
 */
export const festivalCards: FestivalCard[] = [
  {
    id: "jazzablanca",
    name: "Jazzablanca",
    dates: "02 - 11 Juillet 2026",
    venue: "Anfa Park in Casablanca, Morocco",
    image: "/assets/card-jazzablanca.jpg",
    slug: "jazzablanca",
  },
  {
    id: "tanjazz",
    name: "Tanjazz",
    venue: "Tangier, Morocco",
    image: "/assets/card-tanjazz.jpg",
  },
];

/** The comp's two "Product name / 50 MAD" tiles, filled from the real shop. */
export const merchandise = [
  {
    id: addons[0].id,
    name: addons[0].name,
    price: formatMoney(addons[0].price),
    image: "/assets/merch-tee-black.jpg",
  },
  {
    id: addons[1].id,
    name: addons[1].name,
    price: formatMoney(addons[1].price),
    image: "/assets/merch-tee-white.jpg",
  },
];

/**
 * The comp's gallery is six empty grey tiles. They are filled with the event
 * photography the rest of the app already carries — a gallery of placeholders
 * cannot show whether the row reads as a gallery.
 */
export const galleryTiles = [
  "/assets/gallery-1.jpg",
  "/assets/gallery-2.jpg",
  "/assets/gallery-3.jpg",
  "/assets/gallery-4.jpg",
  "/assets/gallery-5.jpg",
  "/assets/gallery-6.jpg",
];

/** The comp repeats one headline three times; these are the real three. */
export const newsRows = newsArticles.slice(0, 3).map((article, index) => ({
  id: article.slug,
  date: article.dateLabel,
  title: article.title,
  image: ["/assets/story-1.jpg", "/assets/story-3.jpg", "/assets/story-4.jpg"][index],
}));

export const eventCopy = {
  node: "410:6401",
  exploreTickets: "Explore tickets",
  getTicket: "Get your ticket",
  from: "From",
  lineup: "Line-up",
  location: "Location",
  directions: "Directions",
  gallery: "Gallery",
  goodToKnow: "Good to know",
  faqs: "FAQs",
  sponsors: "Sponsors",
  share: "Share this event",
};

export const discoverCopy = {
  node: "378:27332",
  beats: (beats: number) => `${beats.toLocaleString("en-US")} BEATS`,
  festivals: "Our iconic music festivals",
  merchandise: "Merchandise",
  gallery: "Gallery",
  news: "Latest news",
  loadMore: "Load more",
  story: (label: string) => `${label} — story`,
};

export const storyCopy = {
  node: "415:38335",
  close: "Close",
  share: "Share this story",
  explore: "Explore",
  /** Announced when a frame changes, since the bars are not readable. */
  progress: (index: number, total: number) => `Frame ${index} of ${total}`,
  /** How long each frame is on screen before the story moves on. */
  frameMs: 5000,
};
