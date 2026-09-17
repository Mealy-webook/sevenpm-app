/**
 * The photographs and posters copied out of `sevenpm-web/public/assets`,
 * reachable by the same path the web build writes in its data files.
 *
 * Same reasoning as `src/icons/index.ts`: the data in `src/data` is ported
 * from the web build unchanged and holds strings like "/assets/gallery-1.jpg".
 * Metro will not resolve a `require` built from a variable, so every file is
 * required once here and the map turns the path back into a source.
 *
 * Remote URLs (the Apple preview artwork on the playlist) pass through as a
 * `{ uri }` source, so a component can hand `image()` anything the data holds
 * without checking which kind it is first.
 */
import type { ImageSourcePropType } from "react-native";

export const images: Record<string, ImageSourcePropType> = {
  "/assets/festival-poster-1.png": require("../assets/img/festival-poster-1.png"),
  "/assets/festival-poster-2.png": require("../assets/img/festival-poster-2.png"),
  "/assets/festival-poster-3.png": require("../assets/img/festival-poster-3.png"),
  "/assets/festival-poster-4.png": require("../assets/img/festival-poster-4.png"),
  "/assets/festival-poster-5.png": require("../assets/img/festival-poster-5.png"),
  "/assets/gallery-1.jpg": require("../assets/img/gallery-1.jpg"),
  "/assets/gallery-2.jpg": require("../assets/img/gallery-2.jpg"),
  "/assets/gallery-3.jpg": require("../assets/img/gallery-3.jpg"),
  "/assets/gallery-4.jpg": require("../assets/img/gallery-4.jpg"),
  "/assets/gallery-5.jpg": require("../assets/img/gallery-5.jpg"),
  "/assets/gallery-6.jpg": require("../assets/img/gallery-6.jpg"),
  "/assets/artist-1.png": require("../assets/img/artist-1.png"),
  "/assets/artist-2.png": require("../assets/img/artist-2.png"),
  "/assets/artist-3.png": require("../assets/img/artist-3.png"),
  "/assets/artist-4.png": require("../assets/img/artist-4.png"),
  "/assets/artist-5.png": require("../assets/img/artist-5.png"),
  "/assets/artist-6.png": require("../assets/img/artist-6.png"),
  "/assets/artist-7.png": require("../assets/img/artist-7.png"),
  "/assets/artist-8.png": require("../assets/img/artist-8.png"),
  "/assets/artist-9.png": require("../assets/img/artist-9.png"),
  "/assets/merch-casa-way.jpg": require("../assets/img/merch-casa-way.jpg"),
  "/assets/merch-arche.jpg": require("../assets/img/merch-arche.jpg"),
  "/assets/merch-casablanca.jpg": require("../assets/img/merch-casablanca.jpg"),
  "/assets/loc-map.jpg": require("../assets/img/loc-map.jpg"),
  "/assets/poster-jazzablanca.jpg": require("../assets/img/poster-jazzablanca.jpg"),
  "/assets/nav-avatar.jpg": require("../assets/img/nav-avatar.jpg"),
  "/assets/conf-hands.png": require("../assets/img/conf-hands.png"),
  "/assets/festival-glow.jpg": require("../assets/img/festival-glow.jpg"),

  /* First run. The photography is exported from the app Figma file rather
     than the web build, and is the only art in the app that has no equivalent
     on the web — those screens do not exist there. */
  "/assets/logo-mark.png": require("../assets/img/logo-mark.png"),
  "/assets/onb-1-sax.jpg": require("../assets/img/onb-1-sax.jpg"),
  "/assets/onb-2-crowd.jpg": require("../assets/img/onb-2-crowd.jpg"),
  "/assets/onb-2-card.jpg": require("../assets/img/onb-2-card.jpg"),
  "/assets/onb-3-venue.jpg": require("../assets/img/onb-3-venue.jpg"),
  "/assets/welcome-noise.jpg": require("../assets/img/welcome-noise.jpg"),
  "/assets/privacy-cookie.png": require("../assets/img/privacy-cookie.png"),

  /* Discover. */
  "/assets/wordmark.png": require("../assets/img/wordmark.png"),
  "/assets/story-1.jpg": require("../assets/img/story-1.jpg"),
  "/assets/story-2.jpg": require("../assets/img/story-2.jpg"),
  "/assets/story-3.jpg": require("../assets/img/story-3.jpg"),
  "/assets/story-4.jpg": require("../assets/img/story-4.jpg"),
  "/assets/card-jazzablanca.jpg": require("../assets/img/card-jazzablanca.jpg"),
  "/assets/card-tanjazz.jpg": require("../assets/img/card-tanjazz.jpg"),
  "/assets/merch-tee-black.jpg": require("../assets/img/merch-tee-black.jpg"),
  "/assets/merch-tee-white.jpg": require("../assets/img/merch-tee-white.jpg"),
  "/assets/story-frame.jpg": require("../assets/img/story-frame.jpg"),
  "/assets/story-avatar.png": require("../assets/img/story-avatar.png"),
  "/assets/event-thumb.jpg": require("../assets/img/event-thumb.jpg"),
  "/assets/conf-qr.png": require("../assets/img/conf-qr.png"),
  "/assets/event-hero.jpg": require("../assets/img/event-hero.jpg"),
  "/assets/event-map.jpg": require("../assets/img/event-map.jpg"),
  "/assets/tab-light.png": require("../assets/img/tab-light.png"),
  "/assets/ticket-paper.png": require("../assets/img/ticket-paper.png"),
  "/assets/lineup-1.jpg": require("../assets/img/lineup-1.jpg"),
  "/assets/lineup-2.jpg": require("../assets/img/lineup-2.jpg"),
  "/assets/lineup-3.jpg": require("../assets/img/lineup-3.jpg"),
  "/assets/lineup-4.jpg": require("../assets/img/lineup-4.jpg"),
  "/assets/lineup-5.jpg": require("../assets/img/lineup-5.jpg"),
  "/assets/lineup-6.jpg": require("../assets/img/lineup-6.jpg"),
  "/assets/lineup-7.jpg": require("../assets/img/lineup-7.jpg"),
  "/assets/lineup-8.jpg": require("../assets/img/lineup-8.jpg"),
  "/assets/lineup-9.jpg": require("../assets/img/lineup-9.jpg"),
  "/assets/event-gallery-1.jpg": require("../assets/img/event-gallery-1.jpg"),
  "/assets/event-gallery-2.jpg": require("../assets/img/event-gallery-2.jpg"),
  "/assets/event-gallery-3.jpg": require("../assets/img/event-gallery-3.jpg"),
  "/assets/event-gallery-4.jpg": require("../assets/img/event-gallery-4.jpg"),
  "/assets/event-gallery-5.jpg": require("../assets/img/event-gallery-5.jpg"),
};

export function image(path: string | undefined): ImageSourcePropType | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return { uri: path };
  return images[path];
}
