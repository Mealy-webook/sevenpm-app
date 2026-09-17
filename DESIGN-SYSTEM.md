# SEVENPM design system — mobile handoff

The web build at `../sevenpm-web` is the origin of this system; it in turn
mirrors the Figma variable collection on **SevenPM — Web**
(`QoFwc4yLlCGUhMVma1ABhb`). This document is what you need to build the app
without reading the web code.

`src/theme/tokens.ts` is the machine-readable half of everything below. Import
from it. A hex or a pixel value written at a call site is a value that will not
move when the system does.

---

## 1. Colour

Dark by default — there is no light theme and the design does not anticipate
one.

| Token | Value | Use |
|---|---|---|
| `bgPrimary` | `#0b0b0e` | The page |
| `bgSecondary` | `#18181b` | A raised band — headers, banners |
| `bgTertiary` | `#252528` | A control or tile on top of that |
| `contentPrimary` | `#e4e4e7` | Body and label text |
| `contentSecondary` | `#a1a1aa` | Supporting text, timestamps, units |
| `brand` | `#fbeb1c` | The one accent |
| `positive` / `negative` | `#22c55e` / `#ff6c6c` | Earned / destructive |
| `overlay5 / 10 / 20` | white at 5 / 10 / 20% | Fills and borders |
| `disabled` | white at 30% | The only text below secondary grey |

Two rules that are easy to break:

- **`contentPrimary` is not white.** Pure `#ffffff` appears on display type and
  on the knob of a switch, nowhere else. Body text set in white reads as a
  different, louder system.
- **Brand yellow is an accent, never a surface** — except for one deliberate
  exception: the selected row in the account nav is a solid yellow block with
  near-black text. If you find yourself filling a card with `brand`, stop.

## 2. Type

Four families. Only the first is unusual:

- **Daltown** — the display face. Headlines and big numerals, never below
  ~40px, always uppercase. Licensed; the file is the team's.
- **Roboto** 400 / 600 / 700 / 900 — everything else.

The scale lives in `type` in the tokens file. Sizes and line heights are both
absolute, never a unitless multiplier.

**Display line heights deliberately differ from the comps.** Figma and the web
build set Daltown on a line box tighter than its own size (160/116, 64/44), and
a browser lets the glyphs overflow it. React Native clips them: at 64/44 the
zeros in "500" lose their top and bottom curves and read as "5UU". Display line
heights here are therefore >= their size, and the tight vertical rhythm is
recovered with layout gaps instead. Do not "fix" them back to the Figma values.

Set text only through `src/theme/Text.tsx`. React Native has no cascade, so
every `Text` would otherwise carry its own font, size and line height — and
the moment those are written by hand they stop matching each other.

## 3. Space and shape

Gaps and paddings come from one scale: **4 / 8 / 12 / 16 / 24 / 32 / 40**.
The page gutter on a phone is **20**.

**Square edges are the house rule.** Dialogs, sheets, cards, buttons, chips,
tiles and inputs all have `borderRadius: 0`. This was an explicit correction
from Ahmed — the Figma comps round some dialogs to 38px and those were
deliberately not followed. Two exceptions only:

- the **switch** track and knob, which stop reading as a switch without a pill;
- the **saved-card face**, a drawn object at 24px.

## 4. Components

- **Button (secondary)** — 5% white fill, half-pixel 10% white border, square.
  Size comes from an inner **fixed-height content box** (16px) with padding
  around it, not from padding on the label. This is how the Figma components
  are built; sizing any other way gives buttons a pixel or two off each other.
- **Chip** — 40px tall, 12px horizontal. Selected swaps the dim border for a
  full-strength one and doubles the fill. The label does **not** change colour.
- **List row** — 66px tall. A 40px `bgTertiary` icon tile, then a two-line
  body (label over a secondary sub-line), then a trailing control. Rows sit
  flush; do not wrap them in bordered cards.
- **Switch** — 52 × 32, 28px white knob, brand track when on with a tick in the
  knob.
- **Sheet / dialog** — 378px wide on the web, full-width on a phone. Square.

## 5. Motion

One easing curve does almost all of it: `cubic-bezier(0.22, 1, 0.36, 1)`, which
Reanimated takes directly via `Easing.bezier(...motion.ease)`. Things leaving
under their own steam use an ease-in instead.

Principles worth keeping:

- **Motion driven by music stops when the music stops.** The web build's
  lighting rig and heading pulse read a shared audio clock, coast to a
  standstill when playback ends, and park. Nothing loops over silence.
- **Never flash.** Large areas brighten and dim; they never cut to black and
  back at beat tempo. That is a photosensitivity risk.
- **Honour reduced motion** — `AccessibilityInfo.isReduceMotionEnabled()` is
  the RN equivalent of the media query. Render the settled state, not nothing.
- Tabs within one area should not animate between each other. A settings area
  should feel like tabs, not like five separate pages.

## 6. What does *not* carry over

The web build has a set of hard-won workarounds that are meaningless here, and
copying them would only confuse:

- Tailwind v4 writing `translate` / `rotate` / `scale` as separate CSS
  properties — RN has no such split.
- `position: fixed` breaking inside a transformed ancestor, and the portal
  workaround for dialogs — use RN's `Modal`.
- Lenis smooth scrolling and its wheel interception.
- `--display-scale` breakpoints. A phone is one width; size display type
  against the viewport if you need it fluid.

## 7. Fonts in React Native

Daltown ships to the web as **woff2**, which React Native cannot load.
`assets/fonts/Daltown.otf` was converted from that same file with fontTools:

```bash
python3 -c "from fontTools.ttLib import TTFont; f=TTFont('Daltown.woff2'); f.flavor=None; f.save('Daltown.otf')"
```

It is CFF-flavoured (`OTTO`), hence `.otf` rather than `.ttf`. If the licensed
original is ever reissued, redo this rather than editing the converted file.

## 8. Icons

SVGs are copied unchanged from `sevenpm-web/public/assets` into `src/icons` and
imported as components via `react-native-svg-transformer` (see
`metro.config.js`). Copy what you need from there rather than redrawing —
hand-written paths will not match.

---

## Where things are

```
src/theme/tokens.ts     colour, space, radii, type scale, motion
src/theme/Text.tsx      the only way to set text
src/components/         Button, Chip
src/screens/            RewardsScreen — the system's proving ground
src/data/               demo content, carried over from the web build
src/icons/              SVGs from the web build
```

`RewardsScreen` is not the app's most important screen; it is there because
between them its blocks use the display face, the brand accent, chips, list
rows with icon tiles, a progress track and two kinds of button, so anything
wrong with the tokens shows up immediately.
