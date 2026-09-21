import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { image } from "../images";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, motion } from "../theme/tokens";

/**
 * The poster on its own, from Figma 182:1724: 342 square, centred on the base
 * surface, with the same out-of-focus copy of itself behind it.
 *
 * It arrives by growing out of the card that was tapped rather than cutting,
 * so the poster you pressed is the poster you get. The caller measures that
 * card's poster on screen and hands the rectangle over; everything here
 * animates from it.
 *
 * It leaves the same way. Given `restTo` — the rectangle the event page draws
 * its record in — the record does not cut to that page: it carries on turning
 * and travels up to the deck, arriving at the exact size and place the page
 * already has a record. The page is pushed underneath while it travels, and
 * this fades off it once the two are on top of each other, so the record you
 * watched come out of the sleeve is the record the page is playing.
 *
 * The move is scale and translate rather than width and height so it can run
 * on the native driver and not on the JS thread.
 */

/** The comp's poster, the glow behind it, and the record it holds. */
const SIZE = 342;
const GLOW = 340;
const VINYL = 322;
/**
 * Pulling the record out settles the sleeve 58 lower and leaves the record
 * standing 136 above its top edge (182:1052 against 182:1724).
 */
const SLEEVE_DROP = 58;
const VINYL_RISE = 136;

/**
 * The beats, and where each one starts.
 *
 * They overlap rather than queue: the poster begins turning while it is still
 * growing, and the record begins to leave the sleeve while the turn is
 * finishing. Run end to end the same moves take half again as long and read
 * as a list of things happening rather than as one movement.
 *
 * The turn is half a revolution, not a whole one: a full turn passes edge-on
 * twice and reads as two flips. At the halfway point the face is mirrored, so
 * it is flipped back on itself there and the poster lands the right way round
 * having gone edge-on exactly once.
 */
const ZOOM_MS = 320;
const FLIP_AT = 260;
const FLIP_MS = 560;
const PULL_AT = 760;
const PULL_MS = 460;

/** A beat out of the sleeve, then the ride up to the deck. */
const HOLD_MS = 120;
export const TRAVEL_MS = 600;
/** The two records are one for this long, and the top one goes. */
export const HANDOVER_AT = TRAVEL_MS - 80;
export const HANDOVER_MS = 200;

export type ZoomFrom = { x: number; y: number; width: number; height: number };
/** Where the page underneath draws its record, in window coordinates. */
export type ZoomRest = { x: number; y: number; size: number };

export function PosterZoom({
  source,
  from,
  restTo,
  onClose,
  onArrive,
  onFinished,
}: {
  /** The asset path, or null when nothing is open. */
  source: string | null;
  from: ZoomFrom | null;
  restTo?: ZoomRest | null;
  onClose: () => void;
  /**
   * Called as the record sets off for the deck. The page it is heading for
   * should be pushed here, with no animation of its own — it is being flown
   * to, not slid in, and it spends the ride hidden behind this one.
   */
  onArrive?: () => void;
  /** Called once the record has landed and this has faded off it. */
  onFinished?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const open = source !== null && from !== null;
  const progress = useRef(new Animated.Value(0)).current;
  /* One half turn about the vertical axis once the poster has landed. */
  const flip = useRef(new Animated.Value(0)).current;
  /* Then the record slides up out of the sleeve. It does not turn here: a
     record turns because an arm is on it, and the arm is on the page it is
     being carried to. */
  const pull = useRef(new Animated.Value(0)).current;
  /* Then it rides up to the deck, and this fades off the page it landed on. */
  const travel = useRef(new Animated.Value(0)).current;
  const handover = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Held in refs so the run below never restarts when a parent re-renders. */
  const arrive = useRef(onArrive);
  const finish = useRef(onFinished);
  const deck = useRef(restTo);
  arrive.current = onArrive;
  finish.current = onFinished;
  deck.current = restTo;

  useEffect(() => {
    if (!open) return;
    /* Re-opening cancels anything the last one had queued. */
    if (timer.current) clearTimeout(timer.current);
    progress.setValue(reduced ? 1 : 0);
    flip.setValue(reduced ? 1 : 0);
    pull.setValue(reduced ? 1 : 0);
    travel.setValue(0);
    handover.setValue(0);
    if (reduced) return;
    /* Arrives, turns over, and lets the record out — each starting before
       the one before it has settled. */
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: ZOOM_MS,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(flip, {
        toValue: 1,
        delay: FLIP_AT,
        duration: FLIP_MS,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(pull, {
        toValue: 1,
        delay: PULL_AT,
        duration: PULL_MS,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      timer.current = setTimeout(() => {
        /* Nowhere to go: the record simply keeps turning. */
        if (!deck.current) return finish.current?.();
        /* The page is pushed now, so it is already drawn and settled by the
           time the record lands on it. */
        arrive.current?.();
        Animated.parallel([
          Animated.timing(travel, {
            toValue: 1,
            duration: TRAVEL_MS,
            /* Eased at both ends: it leaves the middle of the screen and
               settles onto the deck rather than stopping dead. */
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          /* Started before the record has quite landed, so the two are one
             object crossing over rather than one waiting for the other. */
          Animated.timing(handover, {
            toValue: 1,
            delay: HANDOVER_AT,
            duration: HANDOVER_MS,
            easing: ease,
            useNativeDriver: true,
          }),
        ]).start(({ finished: landed }) => {
          if (landed) finish.current?.();
        });
      }, HOLD_MS);
    });
    /* `restTo` is read off a ref above: it is a rectangle derived from the
       window, so it is a new object on every render, and depending on it here
       would restart the whole run each time the parent re-drew. */
  }, [open, progress, flip, pull, travel, handover, reduced]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    if (reduced) return onClose();
    Animated.timing(progress, {
      toValue: 0,
      duration: motion.base,
      easing: ease,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  if (!open || !from) return null;

  /* Where the poster is going, and how far it is from where it started. */
  const toX = (width - SIZE) / 2;
  const toY = (height - SIZE) / 2;
  const startScale = from.width / SIZE;
  const startX = from.x + from.width / 2 - (toX + SIZE / 2);
  const startY = from.y + from.height / 2 - (toY + SIZE / 2);

  /* Where the record rests once it is out, and the ride from there to the
     deck — measured centre to centre, because that is what a transform moves. */
  const vinylLeft = (width - VINYL) / 2;
  const vinylTop = toY + SLEEVE_DROP - VINYL_RISE;
  const rideX = restTo ? restTo.x + restTo.size / 2 - (vinylLeft + VINYL / 2) : 0;
  const rideY = restTo ? restTo.y + restTo.size / 2 - (vinylTop + VINYL / 2) : 0;
  const rideScale = restTo ? restTo.size / VINYL : 1;

  const between = (a: number, b: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [a, b] });
  const between2 = (value: Animated.Value, a: number, b: number) =>
    value.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

  /* The sleeve and its glow are the thing being left behind, so they go early
     in the ride rather than fading all the way up. */
  const leaving = travel.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={close}>
      <Animated.View
        style={[styles.fill, { opacity: between2(handover, 1, 0) }]}
        pointerEvents="box-none"
      >
        <Pressable style={styles.fill} onPress={close} accessibilityLabel="Close">
          <Animated.View
            style={[styles.fill, styles.page, { opacity: progress }]}
          />

          {/* The same poster, far out of focus, as the page behind it uses. */}
          <Animated.View
            style={[
              styles.glow,
              { top: 247, opacity: leaving },
            ]}
            pointerEvents="none"
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: between(0, 0.4) }]}
            >
              <Image
                source={image(source)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                blurRadius={60}
              />
            </Animated.View>
            {/* Drawn over the blur at full strength, so the bitmap's own
                straight edge is painted out rather than half-covered. */}
            <LinearGradient
              colors={[colors.bgPrimary, "transparent", "transparent", colors.bgPrimary]}
              locations={[0, 0.34, 0.66, 1]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Behind the sleeve, and drawn before it so it stays there. */}
          <Animated.View
            style={[
              styles.vinyl,
              {
                left: vinylLeft,
                /* It rests 136 clear of the sleeve's top edge; it starts that
                   same distance lower, which is inside the sleeve. */
                top: vinylTop,
                opacity: pull.interpolate({
                  inputRange: [0, 0.01, 1],
                  outputRange: [0, 1, 1],
                }),
                transform: [
                  { translateX: between2(travel, 0, rideX) },
                  { translateY: between2(pull, VINYL_RISE, 0) },
                  { translateY: between2(travel, 0, rideY) },
                  { scale: between2(travel, 1, rideScale) },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Image
              source={image("/assets/vinyl.webp")}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.poster,
              {
                left: toX,
                top: toY,
                opacity: leaving,
                transform: [
                  /* Perspective first, so the turn has depth rather than
                     squashing flat. */
                  { perspective: 1200 },
                  { translateX: between(startX, 0) },
                  { translateY: between(startY, 0) },
                  { translateY: between2(pull, 0, SLEEVE_DROP) },
                  { scale: between(startScale, 1) },
                  {
                    rotateY: flip.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          >
            {/* Counter-mirrored the moment the card passes edge-on, so the
                artwork is never seen back to front. */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [
                    {
                      scaleX: flip.interpolate({
                        inputRange: [0, 0.499, 0.5, 1],
                        outputRange: [1, 1, -1, -1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={image(source)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  /* The detail page sits on the base surface, a shade below the app's own. */
  page: { backgroundColor: "#09090b" },
  glow: { position: "absolute", left: -32, right: -32, height: GLOW },
  vinyl: { position: "absolute", width: VINYL, height: VINYL },
  poster: { position: "absolute", width: SIZE, height: SIZE },
});
