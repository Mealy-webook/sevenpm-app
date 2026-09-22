import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { ClipPath, Defs, G, Image as SvgImage, Path, Rect } from "react-native-svg";

import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";
import { eventCopy } from "../data/discover";
import type { TicketTier } from "../data/events";

/**
 * A paper ticket, from the event page's tickets rail (Figma 426:50829).
 *
 * The comp builds it from three pieces: a perforated grey strip either side,
 * and a paper panel between them. The strips are bitmap in Figma; here the
 * whole outline is one SVG path — quarter-circle bites at the corners, a run
 * of half-punched holes down each edge — used as a clip over the comp's own
 * paper texture. Cards sit flush in the rail, so a card's right-hand holes
 * fall exactly on its neighbour's left-hand ones and the seam reads as one
 * line of perforation.
 *
 * The stub's grey is the paper at 80 % over the page with a 10 % black wash,
 * as the comp layers it — not a flat fill — so the grain runs across the
 * whole ticket and the light panel is the same sheet, unwashed.
 */

export const STUB_WIDTH = 350;
export const STUB_HEIGHT = 262;

/** The grey strip either side, and the panel's own top and bottom margin. */
const STRIP = 23;
const MARGIN = 16;
/** Corner bites and edge holes, as the comp cuts them. */
export const TICKET_BITE = 18;
const HOLE = 7;
const HOLE_PITCH = 18;

const texture = require("../../assets/img/ticket-texture.jpg");

/**
 * The outline, clockwise from the top-left bite. Every arc is concave.
 *
 * Exported at an arbitrary size because the full-screen ticket is cut the same
 * way the rail card is — it is the same object, printed larger — and the comp
 * only draws it once. The hole count follows the height rather than being
 * fixed, so the pitch stays the comp's whatever the card is asked to be.
 */
export function ticketOutline(W = STUB_WIDTH, H = STUB_HEIGHT) {
  const holes = Math.max(2, Math.round((H - TICKET_BITE * 2) / HOLE_PITCH));
  const first = (H - HOLE_PITCH * (holes - 1)) / 2;
  const centres = Array.from({ length: holes }, (_, i) => first + i * HOLE_PITCH);

  const d: string[] = [`M ${TICKET_BITE} 0`, `L ${W - TICKET_BITE} 0`, `A ${TICKET_BITE} ${TICKET_BITE} 0 0 0 ${W} ${TICKET_BITE}`];
  for (const y of centres) {
    d.push(`L ${W} ${y - HOLE}`, `A ${HOLE} ${HOLE} 0 0 0 ${W} ${y + HOLE}`);
  }
  d.push(`L ${W} ${H - TICKET_BITE}`, `A ${TICKET_BITE} ${TICKET_BITE} 0 0 0 ${W - TICKET_BITE} ${H}`);
  d.push(`L ${TICKET_BITE} ${H}`, `A ${TICKET_BITE} ${TICKET_BITE} 0 0 0 0 ${H - TICKET_BITE}`);
  for (const y of [...centres].reverse()) {
    d.push(`L 0 ${y + HOLE}`, `A ${HOLE} ${HOLE} 0 0 0 0 ${y - HOLE}`);
  }
  d.push(`L 0 ${TICKET_BITE}`, `A ${TICKET_BITE} ${TICKET_BITE} 0 0 0 ${TICKET_BITE} 0`, "Z");
  return d.join(" ");
}

const OUTLINE = ticketOutline();

export function TicketStub({
  tier,
  onPress,
  style,
}: {
  tier: TicketTier;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const panelW = STUB_WIDTH - STRIP * 2;
  const panelH = STUB_HEIGHT - MARGIN * 2;

  return (
    <View style={[styles.stub, style]}>
      <Svg width={STUB_WIDTH} height={STUB_HEIGHT} style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id="stub">
            <Path d={OUTLINE} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#stub)">
          <SvgImage
            href={texture}
            width={STUB_WIDTH}
            height={STUB_HEIGHT}
            preserveAspectRatio="xMidYMid slice"
            opacity={0.8}
          />
          <Rect width={STUB_WIDTH} height={STUB_HEIGHT} fill="rgba(0,0,0,0.1)" />
          <SvgImage
            href={texture}
            x={STRIP}
            y={MARGIN}
            width={panelW}
            height={panelH}
            preserveAspectRatio="xMidYMid slice"
          />
        </G>
      </Svg>

      <View style={styles.panel}>
        <View style={styles.copy}>
          {/* Small star, large star, the class, large star, small star. */}
          <View style={styles.kicker}>
            <Text style={[styles.star, styles.starSmall]}>★</Text>
            <Text style={[styles.star, styles.starLarge]}>★</Text>
            <Text variant="captionBold" uppercase color={INK_SECONDARY}>
              {tier.kicker}
            </Text>
            <Text style={[styles.star, styles.starLarge]}>★</Text>
            <Text style={[styles.star, styles.starSmall]}>★</Text>
          </View>

          <Text
            variant="displayStep"
            uppercase
            color={colors.bgPrimary}
            style={styles.title}
          >
            {tier.title}
          </Text>

          <View style={styles.price}>
            <View style={styles.priceRow}>
              <Text variant="bodyL" color={colors.bgSecondary}>
                {eventCopy.from}
              </Text>
              <Text variant="bodyL" color={colors.bgPrimary} style={styles.semibold}>
                {tier.priceFrom} {tier.currency}
              </Text>
              <Text variant="body" color={colors.contentSecondary}>
                {" "}
                {eventCopy.perPerson}
              </Text>
            </View>
            {(tier.wasPrice || tier.discount) && (
              <View style={styles.priceRow}>
                {tier.wasPrice && (
                  <Text variant="tab" color={colors.contentSecondary} style={styles.struck}>
                    {tier.wasPrice} {tier.currency}
                  </Text>
                )}
                {tier.discount && (
                  <Text variant="tab" color={colors.positive}>
                    {tier.discount}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* The comp's secondary button on a light surface: a 70 % black
            backshade, so the paper shows through its edges. */}
        <Tap
          accessibilityRole="button"
          accessibilityLabel={tier.cta}
          onPress={onPress}
          style={styles.cta}
        >
          <Text variant="bodyL" color={colors.contentPrimary} style={styles.semibold}>
            {tier.cta}
          </Text>
        </Tap>
      </View>
    </View>
  );
}

/** Figma's content-secondary-inverse; only this card uses it. */
const INK_SECONDARY = "#56565d";

const styles = StyleSheet.create({
  stub: { width: STUB_WIDTH, height: STUB_HEIGHT },
  panel: {
    position: "absolute",
    left: STRIP,
    right: STRIP,
    top: MARGIN,
    bottom: MARGIN,
    paddingHorizontal: space.xl,
    paddingVertical: space.s,
    justifyContent: "center",
    alignItems: "center",
    gap: space.s,
  },
  copy: { alignItems: "center", gap: space.xs },
  kicker: { flexDirection: "row", alignItems: "center", gap: space.xs },
  star: { color: INK_SECONDARY, fontFamily: "Roboto_700Bold" },
  starSmall: { fontSize: 12, lineHeight: 16 },
  starLarge: { fontSize: 16, lineHeight: 20 },
  title: { letterSpacing: 1.12 },
  price: { alignItems: "center", gap: space.s },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  struck: { textDecorationLine: "line-through" },
  cta: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
});
