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

import { Record } from "./Record";
import { glow, image } from "../images";
import { ease, useReducedMotion } from "../theme/motion";
import { colors, motion, scaled } from "../theme/tokens";

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

/**
 * The comp's poster, the record it holds, and the bloom behind both.
 *
 * Measured against 469:72741 on its 390-wide frame, which puts the sleeve at
 * 342 square with its top on 309 and the record at 322 square with its top on
 * 173 — exactly `SLEEVE_DROP` below and `VINYL_RISE` above where this already
 * had them. The bloom is an 834 square hung off the left at -222 and reaching
 * the top of the screen, so it is a wash over the whole page rather than a
 * disc of light behind the poster.
 */
const SIZE = 342;
const VINYL = 322;
const GLOW = 834;
const GLOW_X = -222;
/**
 * Pulling the record out settles the sleeve 58 lower and leaves the record
 * standing 136 above its top edge (182:1052 against 182:1724).
 */
const SLEEVE_DROP = 58;
const VINYL_RISE = 136;

/**
 * The beats, as one timeline rather than a queue.
 *
 * Every move is started from the same moment with its own delay, and every
 * one of them begins before the move in front of it has finished. Nothing
 * here waits for anything: there is no frame in the whole run where the
 * screen is holding still between two things, which is the difference
 * between a movement and a list of movements.
 *
 * The turn is half a revolution, not a whole one: a full turn passes edge-on
 * twice and reads as two flips. At the halfway point the face is mirrored, so
 * it is flipped back on itself there and the poster lands the right way round
 * having gone edge-on exactly once.
 */
const ZOOM_MS = 420;
const FLIP_AT = 220;
const FLIP_MS = 640;
const PULL_AT = 700;
const PULL_MS = 640;

/**
 * The ride up to the deck. It is the longest move in the run on purpose: it
 * is the one that carries a thing from one screen to another, and at half
 * this it went by before it could be read as travelling at all. It has been
 * lengthened four times at Ahmed's asking — 600, 1000, 1300, 1700, now 2200 —
 * and this is the one number to change if it still goes by too fast. The
 * hand-over and everything the event page does are measured off it, so they
 * follow on their own.
 *
 * `TRAVEL_AT` is the other half of the same request: how long the poster has
 * to grow, turn over and let the record out before any of this starts. The
 * three moves before it were stretched to match, so the record still has not
 * stopped when it sets off.
 */
const TRAVEL_AT = 1200;
const TRAVEL_MS = 2200;
/**
 * The two records are one for this stretch. It starts well before the ride
 * ends, so the page underneath is uncovered while the record is still
 * settling onto it rather than after it has stopped.
 */
const HANDOVER_AT = TRAVEL_AT + TRAVEL_MS - 200;
const HANDOVER_MS = 300;
/** The same hand-over, run short, when someone presses to skip the rest. */
const SKIP_MS = 180;

/**
 * The system's `ease` is an expo-out: it leaves fast and takes a long time to
 * settle. That is right for a thing arriving from nowhere and wrong for a
 * thing already moving — four of them in a row is four launches and four
 * stops, which is what makes a run of overlapping moves still read as a list.
 *
 * So the pull is given a shallow tail: it is still travelling when it ends.
 *
 * The ride was given an ease-out to take that speed up, and that turned out
 * to be the wrong trade. An ease-out spends two thirds of the distance in the
 * first three tenths of the time, so a ride that lasts a second is over, to
 * look at, in three hundred milliseconds — long enough to be missed
 * altogether on a phone, which is exactly what Ahmed was seeing. It is eased
 * at both ends now and runs longer, so the speed is spread across the move
 * instead of spent at the start of it. The slow start is covered by the pull,
 * which is still going for the first 160ms of it, so nothing stalls.
 */
const PULL_EASE = Easing.out(Easing.quad);
const RIDE_EASE = Easing.inOut(Easing.quad);

/**
 * When the page being flown to is pushed.
 *
 * It used to be pushed as the record set off, and mounting a screen is native
 * work on the same thread the record is moving on — so the one move in this
 * run that has to be watched was sharing its first moments with the building
 * of a whole page. On a phone that is enough to make the flight jump, or miss
 * it entirely. It is pushed while the record is still coming out of the
 * sleeve now, half a second earlier, so by the time the record sets off the
 * page beneath is built, laid out and still.
 */
const PUSH_AT = PULL_AT;

/**
 * How long that page spends underneath this one, from the moment it is
 * pushed. It is what that page waits out before it does anything of its own.
 */
export const COVER_MS = HANDOVER_AT + HANDOVER_MS - PUSH_AT;

export type ZoomFrom = { x: number; y: number; width: number; height: number };
/** Where the page underneath draws its record, in window coordinates. */
export type ZoomRest = {
  x: number;
  y: number;
  size: number;
  /**
   * The label that page's record wears. The record puts it on during the
   * ride, so it arrives already dressed and the hand-over changes nothing
   * about it. Where it sits on the disc is the record's own business — both
   * places draw the same `Record`.
   */
  label?: string;
};

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
  const run = useRef<Animated.CompositeAnimation | null>(null);
  /* Whether the page underneath has been asked for, and whether the run has
     been cut short — both so neither can happen twice. */
  const arrived = useRef(false);
  const done = useRef(false);
  /* Held in refs so the run below never restarts when a parent re-renders. */
  const arrive = useRef(onArrive);
  const finish = useRef(onFinished);
  const deck = useRef(restTo);
  arrive.current = onArrive;
  finish.current = onFinished;
  deck.current = restTo;

  /**
   * Wound back the moment a new one opens, during render rather than after.
   *
   * These values keep whatever the last run left them at, and an effect does
   * not run until after the screen has been drawn — so opening a second
   * poster showed one frame of the *first* one's ending, full size and turned
   * over, before snapping back to the start.
   */
  const was = useRef(false);
  if (open && !was.current) {
    progress.setValue(0);
    flip.setValue(0);
    pull.setValue(0);
    travel.setValue(0);
    handover.setValue(0);
    arrived.current = false;
    done.current = false;
  }
  was.current = open;

  useEffect(() => {
    if (!open) return;
    /* Re-opening cancels anything the last one had queued. */
    if (timer.current) clearTimeout(timer.current);
    if (reduced) {
      /**
       * Reduce Motion is not "no journey".
       *
       * This used to set everything to its end state and stop, which meant
       * the page the record was being carried to was never asked for: the
       * whole point of the movement was skipped and so was its destination,
       * leaving a poster on screen and nowhere to go. It goes straight there
       * instead.
       */
      progress.setValue(1);
      flip.setValue(1);
      pull.setValue(1);
      travel.setValue(1);
      handover.setValue(1);
      if (!deck.current) return;
      arrived.current = true;
      arrive.current?.();
      timer.current = setTimeout(() => finish.current?.(), 60);
      return;
    }

    /* One timeline. Each move carries its own delay from this moment, so the
       poster is still growing when it starts to turn, still turning when the
       record starts to leave it, and still letting the record go when the
       record starts for the deck. */
    const moves = [
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
        easing: PULL_EASE,
        useNativeDriver: true,
      }),
    ];

    /* Somewhere to go: the record rides up and this hands the page over.
       Nowhere to go, and the run simply ends with the record out. */
    if (deck.current) {
      moves.push(
        Animated.timing(travel, {
          toValue: 1,
          delay: TRAVEL_AT,
          duration: TRAVEL_MS,
          easing: RIDE_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handover, {
          toValue: 1,
          delay: HANDOVER_AT,
          duration: HANDOVER_MS,
          easing: ease,
          useNativeDriver: true,
        }),
      );
      /* Pushed before the record sets off, so the flight has the thread to
         itself and the page beneath is drawn, settled and waiting. */
      timer.current = setTimeout(() => {
        arrived.current = true;
        arrive.current?.();
      }, PUSH_AT);
    }

    run.current = Animated.parallel(moves);
    run.current.start(({ finished }) => {
      if (!finished || done.current) return;
      done.current = true;
      /* Somewhere to go, and the hand-over has already uncovered it. Nowhere
         to go, and the poster has to get itself off the screen — it used to
         simply stop being drawn. */
      if (deck.current) return finish.current?.();
      Animated.timing(progress, {
        toValue: 0,
        duration: motion.base,
        easing: ease,
        useNativeDriver: true,
      }).start(() => finish.current?.());
    });
    return () => run.current?.stop();
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

  /**
   * A press means "get on with it", not "forget it".
   *
   * This runs for the better part of four seconds, and there was no way past
   * it: a press cancelled the run and faded the poster back, which after the
   * record had already set off left you on a page you had been thrown at with
   * the cover peeling off behind you. Anyone who has seen it once should be
   * able to skip the rest of it, and a press is the obvious way to say so.
   *
   * Before the record sets off there is nothing to skip to, so a press still
   * means what it used to: take it away.
   */
  const press = () => {
    if (!deck.current || (!arrived.current && !done.current)) return close();
    if (done.current) return;
    done.current = true;
    if (timer.current) clearTimeout(timer.current);
    run.current?.stop();
    progress.setValue(1);
    flip.setValue(1);
    pull.setValue(1);
    travel.setValue(1);
    if (!arrived.current) {
      arrived.current = true;
      arrive.current?.();
    }
    /* Not a cut: the page is uncovered on the same fade it would have been,
       only sooner. */
    Animated.timing(handover, {
      toValue: 1,
      duration: SKIP_MS,
      easing: ease,
      useNativeDriver: true,
    }).start(() => finish.current?.());
  };

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    run.current?.stop();
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

  /* The sleeve is the thing being left behind. It goes over half the ride,
     shrinking a little as it goes, so it is let go of rather than switched
     off — a fade that finishes in a couple of frames reads as a cut. */
  const leaving = travel.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1, 0, 0],
  });
  /* The bloom behind it dims but stays lit: the page being flown to has one
     too, so something soft is behind the record the whole way across. */
  const bloom = travel.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={close}>
      <Animated.View
        style={[styles.fill, { opacity: between2(handover, 1, 0) }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.fill}
          onPress={press}
          accessibilityRole="button"
          accessibilityLabel="Skip"
        >
          <Animated.View
            style={[styles.fill, styles.page, { opacity: progress }]}
          />

          {/* The same poster, far out of focus, as the page behind it uses. */}
          <Animated.View
            style={[
              styles.glow,
              {
                left: scaled(GLOW_X, width),
                width: scaled(GLOW, width),
                height: scaled(GLOW, width),
                opacity: bloom,
              },
            ]}
            pointerEvents="none"
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: between(0, 0.4) }]}
            >
              <Image
                source={glow(source)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
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
            {/* The same record the page it is heading for draws. One
                component, so the record you watch come out of the sleeve and
                the record that page ends up playing cannot drift into being
                two different objects. It puts its label on during the ride,
                so it arrives already dressed. */}
            <Record
              label={restTo?.label}
              fade={travel.interpolate({
                inputRange: [0, 0.25, 0.8, 1],
                outputRange: [0, 0, 1, 1],
              })}
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
                  { scale: between2(travel, 1, 0.92) },
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
  glow: { position: "absolute", top: 0 },
  vinyl: { position: "absolute", width: VINYL, height: VINYL },
  poster: { position: "absolute", width: SIZE, height: SIZE },
});
