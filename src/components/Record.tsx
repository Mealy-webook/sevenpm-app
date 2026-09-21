import { Animated, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { image } from "../images";

/**
 * A record: the disc, and the label on it.
 *
 * It lives here rather than on the event page because it is drawn twice — on
 * that page's deck, and in the hand that carries one there from Discover. The
 * whole point of that transition is that the record you watch come out of the
 * sleeve is the record the page ends up playing, and two copies of this drawn
 * in two places would eventually stop being the same object. One component,
 * one record.
 *
 * Everything is in per cent, so it is the same record at any size: the flight
 * draws it at 322 and the page at 408, and the label sits in the same place
 * on both.
 */

/** Where the page puts the disc, in the comp's own 390-wide units. */
export const RECORD = { left: -9, top: -63, size: 408 };
/** And the label on it, as fractions of the disc. */
export const LABEL = {
  left: (80 - RECORD.left) / RECORD.size,
  top: (20 - RECORD.top) / RECORD.size,
  width: 228 / RECORD.size,
  height: 230 / RECORD.size,
};

export type Turn = {
  transform: { rotate: Animated.AnimatedInterpolation<string> }[];
};

export function Record({
  label,
  spin,
  fade,
}: {
  /** The cover on the label. Without one the disc is bare. */
  label?: string;
  /** Turns the disc and its label as one. */
  spin?: Turn;
  /** Dips the label, for when the record is being wound to another track. */
  fade?: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <>
      {/* Sized in per cent rather than with absoluteFill: an Image pinned
          only by its insets falls back to the bitmap's own size, and this
          bitmap is twice the screen. */}
      <Animated.Image
        source={image("/assets/vinyl.webp")}
        style={[styles.disc, spin]}
      />
      {/* The label is the track: change what is playing and the record is
          wearing the new cover. Round, because a label is round and a cover
          is square. It crossfades, for the times the track is changed from
          the bar rather than by winding the record. */}
      {label && (
        <Animated.View
          style={[styles.label, spin, fade ? { opacity: fade } : null]}
        >
          <Image
            source={image(label)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={260}
          />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  disc: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  label: {
    position: "absolute",
    left: `${LABEL.left * 100}%`,
    top: `${LABEL.top * 100}%`,
    width: `${LABEL.width * 100}%`,
    height: `${LABEL.height * 100}%`,
    /* A record's label is round, and a cover is square. The house rule
       squares everything that is not literally a circle; this is literally a
       circle. */
    borderRadius: 999,
    overflow: "hidden",
  },
});
