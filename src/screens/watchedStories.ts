import { useSyncExternalStore } from "react";

import { stories } from "../data/discover";

/**
 * Which stories have been watched.
 *
 * The ring around a story says whether there is anything new in it — brand
 * yellow if there is, grey once it has been seen — so it cannot be a fixed
 * field on the data: watching one has to change it, immediately, on a screen
 * that is not the one you are on.
 *
 * This is a module-level set rather than context because it is read by the
 * story rail and written by the viewer, which are on opposite sides of a
 * navigation stack, and because it has exactly one shape and no lifecycle.
 * It is session-only: like the basket and the Beats balance, it is meant to
 * go when the app does.
 *
 * Seeded from the data so the comp's one already-watched story still reads
 * that way on a cold start.
 */
const watched = new Set(
  stories.filter((story) => story.watched).map((story) => story.id),
);

const listeners = new Set<() => void>();

function snapshot() {
  return version;
}

/* `useSyncExternalStore` compares snapshots by identity, so a Set that is
   mutated in place needs a counter to tell React that anything happened. */
let version = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function markStoryWatched(id: string) {
  if (watched.has(id)) return;
  watched.add(id);
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Re-renders the caller whenever any story is watched. */
export function useWatchedStories() {
  useSyncExternalStore(subscribe, snapshot, snapshot);
  return watched;
}
