import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import Next from "../icons/ic-player-next.svg";
import Pause from "../icons/ic-player-pause.svg";
import Play from "../icons/ic-player-play.svg";
import Previous from "../icons/ic-player-previous.svg";
import { Tap } from "./Tap";
import { image } from "../images";
import { Text } from "../theme/Text";
import { tap as haptic } from "../theme/haptics";
import { useReducedMotion } from "../theme/motion";
import { colors, space } from "../theme/tokens";
import type { PlaylistTrack } from "../data/events";

/**
 * One deck for the whole page.
 *
 * The sound is held here rather than inside the bar because the bar is not
 * the only thing that starts it: the arm coming down on the record at the top
 * of the event page does too, and both have to be talking about the same
 * track. The page owns a deck; the bar is a view onto it.
 */
export type Deck = ReturnType<typeof useDeck>;

export function useDeck(tracks: PlaylistTrack[]) {
  const [index, setIndex] = useState(0);
  const track = tracks[index];
  const source = track?.audioSrc;

  /**
   * One player for the whole playlist, not one per track.
   *
   * `useAudioPlayer(source)` builds a **new** player whenever the source
   * changes and releases the old one. Anything that was asked of the old
   * player goes with it, which is why pushing the record aside used to
   * change the track and then leave the deck silent. Here the player is made
   * once with nothing in it and the track is loaded into it by hand.
   */
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const playing = status?.playing ?? false;
  const loaded = status?.isLoaded ?? false;
  const at = status?.currentTime ?? 0;
  const runs = status?.duration ?? 0;

  /**
   * The last track this player was actually heard playing.
   *
   * Everything about the end of a track is latched behind this. A player
   * that has just been handed a new source keeps reporting the old one's
   * clock for a moment, and reading "stopped, at the end" off that walked
   * the whole playlist in a couple of seconds — every advance loaded a
   * source, every load looked finished, and every finish advanced again.
   * A track cannot end until it has been heard to start.
   */
  const heard = useRef<string | null>(null);
  useEffect(() => {
    if (playing && source) heard.current = source;
  }, [playing, source]);

  /**
   * What the deck is *meant* to be doing, which is not the same as what it
   * is doing. These are streamed previews, so a track is asked for well
   * before it can start — the arm comes down on the record while the file is
   * still on its way, and a player with nothing loaded drops the request.
   * Kept as a ref for the logic below and as state for the page to draw.
   */
  const wanted = useRef(false);
  const [intent, setIntent] = useState(false);
  const want = useCallback((on: boolean) => {
    wanted.current = on;
    setIntent(on);
  }, []);

  /**
   * Sound stopped without changing what the deck is *for*.
   *
   * Pushing the record aside stops it, but it does not mean you asked for
   * silence — the arm is off the record for the length of the change and the
   * deck is still meant to be playing. `intent` stays where it was, so the
   * page keeps drawing a deck that is on, and the sound comes back when the
   * arm does.
   */
  const held = useRef(false);
  const hold = useCallback(
    (on: boolean) => {
      held.current = on;
      if (on) player.pause();
      else if (wanted.current) player.play();
    },
    [player],
  );

  /* A phone on silent should still play a preview it was asked for. */
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  /* Load the track, and carry on playing if that is what was happening. */
  useEffect(() => {
    if (!source) return;
    player.replace(source);
    if (wanted.current && !held.current) player.play();
  }, [source, player]);

  /* And pick it up again once it has actually loaded, for the times it was
     asked for before there was anything to ask. */
  useEffect(() => {
    if (!wanted.current || held.current || !loaded || playing) return;
    player.play();
  }, [loaded, playing, player]);

  /* A preview runs out after half a minute; the deck moves on to the next
     one, and keeps playing, because the intent has not changed. */
  useEffect(() => {
    if (!source || heard.current !== source) return;
    /* A real duration, really reached. A preview that reports a fraction of
       a second, or a player that blinks to "not playing" while it buffers,
       is not a track that has ended. */
    if (playing || runs < 5 || at < runs - 0.6) return;
    setIndex((current) => (current + 1) % tracks.length);
  }, [playing, at, runs, source, tracks.length]);

  const step = useCallback(
    (by: number) => {
      haptic.tick();
      setIndex((current) => (current + by + tracks.length) % tracks.length);
    },
    [tracks.length],
  );

  const play = useCallback(() => {
    want(true);
    player.play();
  }, [player, want]);

  const toggle = useCallback(() => {
    haptic.tick();
    const on = !wanted.current;
    want(on);
    if (on) player.play();
    else player.pause();
  }, [player, want]);

  /* Stable, so a caller can put these in an effect's dependencies without
     that effect running again on every render. */
  return useMemo(
    () => ({
      track,
      index,
      playing,
      /** What it is meant to be doing. The arm on the page follows this. */
      intent,
      step,
      play,
      toggle,
      hold,
    }),
    [track, index, playing, intent, step, play, toggle, hold],
  );
}

/**
 * The event page's player, ported from the web build's MiniPlayer.
 *
 * A bar that sits above the page: the record on the left with the track's
 * own cover as its label, the title and artist, and the three controls. The
 * record turns while it plays and stops when it does, which is the only
 * thing on the bar that says whether sound is coming out.
 *
 * The tracks are the Apple Music previews the event data already carries, so
 * this plays what the web build plays.
 */
export function MiniPlayer({ deck }: { deck: Deck }) {
  const reduced = useReducedMotion();
  const { track, playing, step, toggle } = deck;

  /* The record turns only while the track does. */
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!playing || reduced) return;
    const turn = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    turn.start();
    return () => turn.stop();
  }, [playing, reduced, spin]);

  if (!track) return null;

  return (
    <View style={styles.bar} accessibilityLabel="Now playing">
      {/* The bar floats over the page, so it is glass rather than a panel —
          without the blur behind it the page reads straight through the
          fill and the track's name sits on top of whatever it is over. */}
      <BlurView
        intensity={60}
        tint="dark"
        /* Renamed from experimentalBlurMethod in SDK 55. */
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[StyleSheet.absoluteFill, styles.glass]} pointerEvents="none" />
      <Animated.View
        style={[
          styles.cover,
          {
            transform: [
              {
                rotate: spin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Image
          source={image("/assets/vinyl.webp")}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
        />
        {/* The cover sits where a record's label would. */}
        {track.artworkUrl && (
          <Image
            source={{ uri: artworkAt(track.artworkUrl, 200) }}
            style={styles.label}
            contentFit="cover"
            transition={200}
          />
        )}
      </Animated.View>

      <View style={styles.text}>
        <Text variant="bodyBold" numberOfLines={1}>
          {track.title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      <View style={styles.controls}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Previous track"
          onPress={() => step(-1)}
          style={styles.key}
        >
          <Previous width={20} height={20} />
        </Tap>
        <Tap
          accessibilityRole="button"
          accessibilityState={{ selected: playing }}
          accessibilityLabel={
            playing ? `Pause ${track.title}` : `Play ${track.title}`
          }
          onPress={toggle}
          style={[styles.key, styles.keyPlay]}
        >
          {playing ? (
            <Pause width={20} height={20} />
          ) : (
            <Play width={20} height={20} />
          )}
        </Tap>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Next track"
          onPress={() => step(1)}
          style={styles.key}
        >
          <Next width={20} height={20} />
        </Tap>
      </View>
    </View>
  );
}

/** The store serves the cover at any square size; ask for a crisp one. */
export function artworkAt(url: string, px: number) {
  return url.replace(/\/\d+x\d+bb\./, `/${px}x${px}bb.`);
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.s,
    paddingRight: space.m,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  glass: { backgroundColor: "rgba(12,12,14,0.72)" },
  cover: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#000" },
  /* The web build insets the cover 22% inside the record. */
  label: {
    position: "absolute",
    left: "22%",
    top: "22%",
    width: "56%",
    height: "56%",
    borderRadius: 999,
  },
  text: { flex: 1, minWidth: 0 },
  controls: { flexDirection: "row", alignItems: "center" },
  key: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  keyPlay: { backgroundColor: colors.brand },
});
