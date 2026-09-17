import { jazzablanca } from "./events";
import { newsArticles } from "./news";

/**
 * Homepage content, from Figma node 15:202 (1512 × 5838). Copy and imagery
 * only — layout lives in `src/components/home/`.
 */

export type Festival = {
  id: string;
  /** Display name. Only Jazzablanca is confirmed; the others are read off
   *  the poster artwork and should be checked by content. */
  name: string;
  href: string;
  /** Poster export from the comp — already drawn in perspective for its slot. */
  poster: { src: string; width: number; height: number };
  /** Preview played while the visitor holds the spacebar. */
  audioSrc?: string;
};

export const festivals: Festival[] = [
  {
    id: "village-casa-anfa",
    name: "Village Casa Anfa",
    href: "#",
    poster: { src: "/assets/festival-poster-1.png", width: 374, height: 526 },
  },
  {
    id: "tanjazz",
    name: "Tanjazz",
    href: "#",
    poster: {
      src: "/assets/festival-poster-2.png",
      width: 362.003,
      height: 509.5,
    },
  },
  {
    id: "jazzablanca",
    name: "Jazzablanca",
    href: `/events/${jazzablanca.slug}`,
    poster: {
      src: "/assets/festival-poster-3.png",
      width: 305.5,
      height: 495.5,
    },
    audioSrc: jazzablanca.playlist[0]?.audioSrc,
  },
  {
    id: "casa-anfa-latina",
    name: "Casa Anfa Latina",
    href: "#",
    poster: {
      src: "/assets/festival-poster-4.png",
      width: 364.064,
      height: 511,
    },
  },
  {
    id: "arma-taghazout",
    name: "Arma Taghazout",
    href: "#",
    poster: { src: "/assets/festival-poster-5.png", width: 375, height: 526 },
  },
];

export type NewsItem = {
  date: string;
  title: string;
  excerpt: string;
  image?: string;
  href: string;
};

/** The homepage shows the three most recent stories from `data/news.ts`. */
export const newsItems: NewsItem[] = newsArticles
  .slice(0, 3)
  .map((article) => ({
    date: article.dateLabel,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    href: `/news/${article.slug}`,
  }));

/**
 * The band under the hero — Figma 2227:5202. Split into parts so the figure
 * can count up on its own without a parser guessing where the "+" ends.
 */
export const homeStats = [
  {
    value: 2018,
    label: "Founded in Casablanca",
    /** Years are not thousands: 2018, never 2,018. */
    year: true,
  },
  { value: 4, label: "Festivals produced every year" },
  { value: 20, prefix: "+", suffix: "K", label: "Festival goers at Jazzablanca" },
  { value: 22, label: "Editions of Tanjazz and counting" },
];

/** The story block — Figma 2227:5229. */
export const homeStory = {
  body: "SEVENPM, founded in 2018, was born from the desire to propel cultural events in Morocco to new heights. Since then, SEVENPM has established itself as an essential player, orchestrating iconic festivals.",
  photos: ["/assets/gallery-2.jpg", "/assets/gallery-5.jpg"],
  socials: [
    { label: "Facebook", href: "https://facebook.com", icon: "/assets/ic-social-facebook.svg" },
    { label: "X", href: "https://x.com", icon: "/assets/ic-social-x.svg" },
    { label: "TikTok", href: "https://tiktok.com", icon: "/assets/ic-social-tiktok.svg" },
    { label: "YouTube", href: "https://youtube.com", icon: "/assets/ic-social-youtube.svg" },
    { label: "Instagram", href: "https://instagram.com", icon: "/assets/ic-social-instagram.svg" },
  ],
};

export const homeCopy = {
  /** The accessible name for the hero heading, which is shown a word at a
      time — see `HeroHeadline`. */
  heroTitle: "More music more life",
  heroLead: "More",
  heroWords: ["Music", "Life"],
  intro:
    "SEVENPM creates cultural experiences that bring the world’s artists, Moroccan talent and communities together—transforming cities through music, culture and unforgettable moments.",
  listenHint: ["Press & Hold", "spacebar to listen"],
  newsletter: {
    title: "Be the first to know",
    body: "Subscribe to our newsletter to be the first to know about concert announcements, and exclusive updates — and never miss the most exciting news.",
    cta: "Subscribe",
  },
};

/** The two gallery rows are the event photos, repeated to fill the marquee. */
export const galleryRows: string[][] = [
  [
    "/assets/gallery-1.jpg",
    "/assets/gallery-2.jpg",
    "/assets/gallery-3.jpg",
    "/assets/gallery-4.jpg",
    "/assets/gallery-5.jpg",
  ],
  [
    "/assets/gallery-6.jpg",
    "/assets/gallery-4.jpg",
    "/assets/gallery-1.jpg",
    "/assets/gallery-5.jpg",
    "/assets/gallery-2.jpg",
    "/assets/gallery-3.jpg",
  ],
];

/** Concert photos that trail the cursor across the homepage hero. */
export const heroTrailImages = [
  { src: "/assets/gallery-1.jpg", alt: "" },
  { src: "/assets/gallery-2.jpg", alt: "" },
  { src: "/assets/gallery-3.jpg", alt: "" },
  { src: "/assets/gallery-4.jpg", alt: "" },
  { src: "/assets/gallery-5.jpg", alt: "" },
  { src: "/assets/gallery-6.jpg", alt: "" },
];
