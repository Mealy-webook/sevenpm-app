/**
 * Newsroom. Placeholder copy written around what the current site states
 * (seven-pm.com) — replace with the real feed when the CMS lands. The
 * homepage cards and `/news` read from the same list, so they can't drift.
 */

export type NewsArticle = {
  slug: string;
  title: string;
  /** ISO date, for <time datetime>. */
  date: string;
  /** How the comp writes it: "19 Aug, 2026". */
  dateLabel: string;
  category: string;
  excerpt: string;
  image: string;
  readingTime: string;
  /** Body paragraphs; the first is the lead. */
  body: string[];
};

export const newsCategories = [
  "All",
  "Festivals",
  "Line-up",
  "Company",
] as const;

export const newsCopy = {
  title: "Latest news",
  description:
    "Line-up announcements, festival reports and everything else out of the SEVENPM office in Casablanca.",
  readMore: "Read the story",
  backToNews: "All news",
  related: "More from the newsroom",
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "jazzablanca-19th-edition-close",
    title:
      "Jazzablanca draws nearly 100,000 festival goers as 19th edition comes to a close",
    date: "2026-08-19",
    dateLabel: "19 Aug, 2026",
    category: "Festivals",
    excerpt:
      "The 19th edition of Jazzablanca concluded after ten days of music and entertainment, attracting nearly 100,000 festivalgoers and reaffirming its position as one of Africa's leading cultural events.",
    image: "/assets/gallery-1.jpg",
    readingTime: "4 min read",
    body: [
      "The 19th edition of Jazzablanca concluded after ten days of music and entertainment, attracting nearly 100,000 festivalgoers and reaffirming its position as one of Africa's leading cultural events.",
      "Anfa Park held three stages this year, with the main stage running from early evening until the small hours and the Jazz Club programming a quieter, seated room for the second half of each night. The makers' market returned with twice the number of stalls, and the food court moved to the eastern edge of the park to give the crowd more room to move between sets.",
      "Audiences travelled from across Morocco and beyond: a quarter of ticket holders came from outside Casablanca, and one in ten from outside the country. The festival's own wristband payments meant shorter queues at the bars, with the average wait down to under three minutes across the ten days.",
      "Planning for the 20th edition begins this autumn. Presale codes go to newsletter subscribers first, as always.",
    ],
  },
  {
    slug: "tanjazz-22nd-edition-dates",
    title: "Tanjazz returns to Tangier for a 22nd edition this September",
    date: "2026-08-04",
    dateLabel: "4 Aug, 2026",
    category: "Festivals",
    excerpt:
      "The city becomes the stage again as Tanjazz takes over Tangier for three days of concerts across the medina and the Palais Moulay Hafid.",
    image: "/assets/gallery-3.jpg",
    readingTime: "3 min read",
    body: [
      "The city becomes the stage again as Tanjazz takes over Tangier for three days of concerts across the medina and the Palais Moulay Hafid.",
      "Now in its 22nd year, Tanjazz remains the most intimate festival in the SEVENPM calendar: several stages within walking distance of one another, and a programme that runs from midday sessions in the gardens to late sets in the courtyards.",
      "Full line-up and ticketing open next month.",
    ],
  },
  {
    slug: "casa-anfa-latina-line-up",
    title: "Casa Anfa Latina announces its first names for 2026",
    date: "2026-07-22",
    dateLabel: "22 Jul, 2026",
    category: "Line-up",
    excerpt:
      "Salsa, cumbia and reggaeton return to Anfa Park, with the first eight artists confirmed and more to follow before the summer is out.",
    image: "/assets/gallery-5.jpg",
    readingTime: "2 min read",
    body: [
      "Salsa, cumbia and reggaeton return to Anfa Park, with the first eight artists confirmed and more to follow before the summer is out.",
      "The festival keeps its two-stage format, with dance classes running each afternoon before the music starts — free with any ticket, and open to anyone who turns up early enough to get a place.",
    ],
  },
  {
    slug: "village-casa-anfa-family-programme",
    title: "Village Casa Anfa widens its family programme",
    date: "2026-07-02",
    dateLabel: "2 Jul, 2026",
    category: "Festivals",
    excerpt:
      "The festival village adds a second workshop tent and free entry for under-twelves across the whole run.",
    image: "/assets/gallery-4.jpg",
    readingTime: "2 min read",
    body: [
      "The festival village adds a second workshop tent and free entry for under-twelves across the whole run.",
      "The programme leans on local associations: instrument-making, printing and dance workshops run every afternoon, staffed by the same Casablanca collectives that have worked with the village since its first year.",
    ],
  },
  {
    slug: "sevenpm-loyalty-programme",
    title: "SEVENPM opens its loyalty programme to every ticket holder",
    date: "2026-06-11",
    dateLabel: "11 Jun, 2026",
    category: "Company",
    excerpt:
      "Points on every booking, early access to presales, and a wallet balance that works at the bar and the merch store.",
    image: "/assets/gallery-6.jpg",
    readingTime: "3 min read",
    body: [
      "Points on every booking, early access to presales, and a wallet balance that works at the bar and the merch store.",
      "The programme rolls out across all four festivals this season. Existing accounts are enrolled automatically, with points backdated to the start of the year.",
    ],
  },
  {
    slug: "sevenpm-hiring-2026",
    title: "We're hiring across production, communications and support",
    date: "2026-05-28",
    dateLabel: "28 May, 2026",
    category: "Company",
    excerpt:
      "Six roles are open in the Casablanca office ahead of the 2026 season, from stage management to partner communications.",
    image: "/assets/gallery-2.jpg",
    readingTime: "2 min read",
    body: [
      "Six roles are open in the Casablanca office ahead of the 2026 season, from stage management to partner communications.",
      "Every role is based in Casablanca with travel to Tangier during Tanjazz. Applications stay open until the positions are filled.",
    ],
  },
];

export function getArticle(slug: string) {
  return newsArticles.find((article) => article.slug === slug);
}
