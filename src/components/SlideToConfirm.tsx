import { useRef } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import SlideIcon from "../icons/ic-slide-24.svg";
import { Text } from "../theme/Text";
import { tap as haptic } from "../theme/haptics";
import { colors, space } from "../theme/tokens";

/**
 * The sliding button, from Figma 98:167493.
 *
 * "A button where the user must slide a handle from one end to the other to
 * confirm the action. The slide gesture acts as an intentional confirmation
 * step" — the component's own description, and the reason this exists rather
 * than a button: sending a ticket away is not reversible from inside the app.
 *
 * Two behaviours come from that description rather than from the still: the
 * label does not change or fade while you drag, and releasing before the end
 * snaps the handle back. The action fires only on arrival.
 *
 * The track fills behind the handle as it travels, which is the "progress
 * color" the description names. It is the handle's own brand yellow at a
 * tenth, so the fill reads as the handle's wake rather than as a second
 * colour.
 */

/** The handle is square and 52 across: 14 of padding around a 24 glyph. */
const HANDLE = 52;
/** How much of the way across counts as arrival. */
const ARRIVED = 0.94;

export function SlideToConfirm({
  label,
  onConfirm,
  disabled = false,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const x = useRef(new Animated.Value(0)).current;
  /**
   * Everything the responder reads goes through a ref.
   *
   * `PanResponder.create` runs once and is held in a ref, so its handlers
   * close over the first render. Reading `disabled` directly meant the
   * handle was locked for the life of the screen: the form is empty on the
   * first render, so the gesture was refused and never re-granted.
   */
  const travel = useRef(0);
  const done = useRef(false);
  const locked = useRef(disabled);
  locked.current = disabled;
  const confirm = useRef(onConfirm);
  confirm.current = onConfirm;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked.current,
      onMoveShouldSetPanResponder: (_, g) => !locked.current && Math.abs(g.dx) > 2,
      onPanResponderMove: (_, g) => {
        if (done.current) return;
        x.setValue(Math.max(0, Math.min(g.dx, travel.current)));
      },
      onPanResponderRelease: (_, g) => {
        if (done.current) return;
        const reached = travel.current > 0 && g.dx >= travel.current * ARRIVED;
        if (reached) {
          done.current = true;
          haptic.commit();
          Animated.timing(x, {
            toValue: travel.current,
            duration: 120,
            /* The track's fill is driven off the same value and fills by
               width, which the native driver cannot animate. */
            useNativeDriver: false,
          }).start(() => confirm.current());
          return;
        }
        Animated.spring(x, {
          toValue: 0,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      },
    }),
  ).current;

  return (
    <View
      style={[styles.track, disabled && styles.disabled]}
      onLayout={(event) => {
        travel.current = event.nativeEvent.layout.width - space.xs * 2 - HANDLE;
      }}
    >
      {/* The handle's wake. */}
      <Animated.View
        style={[styles.fill, { width: Animated.add(x, new Animated.Value(HANDLE)) }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.handle, { transform: [{ translateX: x }] }]}
        {...responder.panHandlers}
      >
        <SlideIcon width={24} height={24} />
      </Animated.View>
      {/* Static, as the component's description requires. It spans the whole
          track so it stays optically centred while the handle travels, which
          puts it over the handle — so it goes in a View that refuses touches.
          `pointerEvents` is a View prop; on a Text it is quietly ignored, and
          the label swallowed the drag. */}
      <View style={styles.labelWrap} pointerEvents="none">
        <Text variant="bodyLBold" color={LABEL} style={styles.label}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/** ui/content/tinted-default — the label's colour on the filled track. */
const LABEL = "#f4f4f5";

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.xs,
    /* 56 of clearance on the right, so the label stays off the handle's end. */
    paddingRight: 56,
    backgroundColor: colors.overlay5,
  },
  disabled: { opacity: 0.4 },
  fill: {
    ...StyleSheet.absoluteFill,
    right: undefined,
    backgroundColor: "rgba(251,235,28,0.1)",
  },
  handle: {
    width: HANDLE,
    height: HANDLE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  /* Centred on the track rather than on what is left of it, so it does not
     shift as the handle moves. */
  labelWrap: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  label: { textAlign: "center" },
});
