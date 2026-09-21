/**
 * SEVENPM design tokens, ported from the web build's `@theme` block
 * (sevenpm-web/src/app/globals.css), which itself mirrors the Figma variable
 * collection on "SevenPM — Web" (QoFwc4yLlCGUhMVma1ABhb).
 *
 * This file is the single source of truth for the app. Nothing below should
 * be inlined at a call site: a hex or a pixel value written into a component
 * is a value that will not move when the system does.
 *
 * Keep it in step with the web tokens rather than letting the two drift —
 * see DESIGN-SYSTEM.md for what each group is for and which rules are
 * deliberate rather than incidental.
 */

export const colors = {
  /* Backgrounds, darkest first. `primary` is the page, `secondary` a raised
     band, `tertiary` a control or tile sitting on top of that. */
  bgPrimary: "#0b0b0e",
  bgSecondary: "#18181b",
  bgTertiary: "#252528",

  /* Ink scale, used by the event surfaces rather than the account ones. */
  ink900: "#0b0c10",
  ink800: "#14161c",
  ink700: "#1d2028",
  ink600: "#2a2e39",

  /* Content. `primary` is not pure white — #fff only appears on display type
     and on the knob of a switch. */
  contentPrimary: "#e4e4e7",
  contentSecondary: "#a1a1aa",
  textPrimary: "#f7f5f0",
  textSecondary: "#a9aebb",
  textInverse: "#14161c",

  /** The one brand colour. Used sparingly: an accent, never a surface. */
  brand: "#fbeb1c",

  /* States. */
  positive: "#22c55e",
  /** Tag accents — lime for settled, orange for time-sensitive (454:31845). */
  lime: "#b3e100",
  orange: "#ff7f29",
  negative: "#ff6c6c",

  /* Borders and overlays. RN has no colour-mix, so the common alphas are
     spelled out rather than computed. */
  borderSecondary: "rgba(255,255,255,0.3)",
  borderTertiary: "rgba(255,255,255,0.1)",
  borderDimmed: "rgba(255,255,255,0.05)",
  overlay5: "rgba(255,255,255,0.05)",
  overlay10: "rgba(255,255,255,0.1)",
  overlay20: "rgba(255,255,255,0.2)",
  /** Disabled content — the one place text drops below the secondary grey. */
  disabled: "rgba(255,255,255,0.3)",
  white: "#ffffff",
} as const;

/** Figma's ui-elements/gaps and ui-elements/paddings, in full. */
export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  section: 40,
} as const;

/**
 * Square edges are the house rule — dialogs, cards, buttons, chips and tiles
 * all have none. Three exceptions, and only three: the switch track and knob,
 * which stop reading as a switch without them; the drawn card face; and the
 * top of a bottom sheet.
 */
export const radii = {
  none: 0,
  pill: 9999,
  /** The saved-card face, a drawn object that keeps its corners. */
  card: 24,
  /**
   * The bottom sheet's top two corners (346:47133). The third and last
   * exception to the square rule: a square-topped panel sliding up from the
   * bottom edge reads as a new screen, which is what a sheet must not be.
   */
  sheet: 38,
} as const;

export const fonts = {
  /** Daltown. Display only: headlines, big numerals, nothing under ~40px. */
  display: "Daltown",
  regular: "Roboto_400Regular",
  semibold: "Roboto_600SemiBold",
  bold: "Roboto_700Bold",
  black: "Roboto_900Black",
} as const;

/**
 * The type scale, from the Figma text styles. `size` and `line` are both
 * absolute — never a unitless multiplier.
 *
 * The display line heights are the one place this departs from the comps, and
 * it is not optional. Figma (and the web build) set Daltown on a line box
 * *tighter* than its own size — 160/116, 64/44 — and a browser simply lets the
 * glyphs overflow it. React Native clips them instead: at 64/44 the zeros in
 * "500" lose their top and bottom curves and read as "5UU".
 *
 * So display line heights are >= their size here, and the tight vertical
 * rhythm the comps get from the line box is recovered with layout gaps.
 */
export const type = {
  /* Display — Daltown, uppercase, always. */
  displayXL: { font: fonts.display, size: 160, line: 168 },
  /**
   * The onboarding headline, from the app Figma (341:1338 and its siblings):
   * 104px on a 390px-wide comp, and the notice screen's 80px.
   *
   * Both are drawn there on a line box tighter than the size — 104/86 and
   * 80/67 — which a browser lets overflow and React Native clips. Same rule as
   * the rest of this scale: the line box is at least the size, and the tight
   * rhythm is recovered with layout gaps. Size these through `displaySize()`
   * rather than using the raw figure: 104px is measured against a 390px
   * screen, and an iPhone SE is 375.
   */
  displayHero: { font: fonts.display, size: 104, line: 86, tracking: 1.04 },
  displayNotice: { font: fonts.display, size: 80, line: 67, tracking: 0 },
  /** A tab screen's own title — Bookings (457:70287): 76 on 55. */
  displayScreen: { font: fonts.display, size: 76, line: 55, tracking: 0 },
  /** Section headings on Discover (378:27345): 68 on 52. */
  displaySection: { font: fonts.display, size: 68, line: 52, tracking: 0.68 },
  /** A page's own title — the event's name (410:6406): 88 on 60. */
  displayPage: { font: fonts.display, size: 88, line: 60, tracking: 0.88 },
  /** The member's name on the account page (359:7935): 88 on 73, no tracking. */
  displayName: { font: fonts.display, size: 88, line: 73, tracking: 0 },
  /** Section headings inside a page — the event page's (410:6455): 72 on 51. */
  displayBlock: { font: fonts.display, size: 72, line: 51, tracking: 0 },
  /** The festival card's name (378:27352): 48px, drawn there on 40. */
  displayCard: { font: fonts.display, size: 48, line: 40, tracking: 0.48 },
  /** A step's own title in the booking journey (412:15124): 56px on 46. */
  displayStep: { font: fonts.display, size: 56, line: 46, tracking: 0.56 },
  displayL: { font: fonts.display, size: 64, line: 68 },
  displayM: { font: fonts.display, size: 40, line: 44 },

  /** The sheets' own heading — Roboto Black, 24/28 (432:3329). */
  displayXS: { font: fonts.black, size: 24, line: 28, tracking: -0.5 },

  /* Titles — Roboto Bold, uppercase, negative tracking. */
  sectionTitle: { font: fonts.bold, size: 26, line: 32, tracking: -0.13 },
  title: { font: fonts.bold, size: 22, line: 28, tracking: -0.11 },
  titleBody: { font: fonts.bold, size: 18, line: 24, tracking: -0.09 },

  /* Body. */
  bodyL: { font: fonts.regular, size: 17, line: 24, tracking: 0.085 },
  body: { font: fonts.regular, size: 15, line: 22, tracking: 0.15 },
  bodyBold: { font: fonts.semibold, size: 15, line: 22, tracking: 0.19 },
  bodyS: { font: fonts.regular, size: 13, line: 20, tracking: 0.13 },
  bodySBold: { font: fonts.semibold, size: 13, line: 20, tracking: 0.16 },

  /* Captions. */
  caption: { font: fonts.regular, size: 12, line: 16, tracking: 0.12 },
  /* Captions/Caption-2 — the smallest label in the system. It sits under
     an icon on a schedule tile and under the title on a good-to-know
     panel, where 12 is too loud for a thing you read second. */
  caption2: { font: fonts.regular, size: 10, line: 14, tracking: 0.1 },
  /** The tab bar's label — Figma calls it Caption-2. */
  tab: { font: fonts.regular, size: 10, line: 14, tracking: 0.1 },
  captionBold: { font: fonts.bold, size: 12, line: 16, tracking: 0.12 },
} as const;

/**
 * Motion. One easing curve does almost all the work on the web build — the
 * same `cubic-bezier(0.22, 1, 0.36, 1)` — and Reanimated's `Easing.bezier`
 * takes it directly. Durations are seconds on the web; milliseconds here.
 */
export const motion = {
  /** Everything that settles: panels, rows, reveals. */
  ease: [0.22, 1, 0.36, 1] as const,
  /** Anything leaving under its own steam. */
  easeIn: [0.55, 0, 1, 0.45] as const,
  fast: 250,
  base: 400,
  slow: 700,
} as const;

/** The page gutter. The web steps 20 → 48 → 120; a phone only ever sees 20. */
export const gutter = 20;

/**
 * The width every screen in the app Figma file is drawn against. Absolute
 * figures taken off those comps — display sizes, the placement of the
 * decorative artwork on the onboarding steps — are in these units.
 */
export const designWidth = 390;

/** A figure from the comps, in the units of the screen it is drawn on. */
export function scaled(value: number, width: number) {
  return (value * width) / designWidth;
}

/**
 * The display styles at the size this screen can actually hold.
 *
 * Daltown is condensed enough that 104px reads on a 390px screen and breaks
 * on a 375px one, so the size travels with the viewport rather than being
 * pinned — which is what the web build's `--display-scale` did, and what
 * DESIGN-SYSTEM.md means by "size display type against the viewport".
 */
export function displaySize(
  /* Not every display style carries tracking — the older scale entries do
     not — so it is optional rather than required at every call site. */
  style: { size: number; line: number; tracking?: number },
  width: number,
) {
  const size = Math.round(scaled(style.size, width));
  return {
    fontSize: size,
    lineHeight: Math.round(scaled(style.line, width)),
    letterSpacing: scaled(style.tracking ?? 0, width),
  };
}
