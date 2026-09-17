import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BeatsBurn from "../icons/ic-beats-burn.svg";
import BeatsEarn from "../icons/ic-beats-earn.svg";
import Crown from "../icons/ic-crown-24.svg";
import Info from "../icons/ic-info-13.svg";
import LockSmall from "../icons/ic-lock-locked-16.svg";
import Promocode from "../icons/ic-promocode-24.svg";
import Ticket from "../icons/ic-ticket-24.svg";
import TierCheck from "../icons/ic-tier-check.svg";
import TierLock from "../icons/ic-tier-lock.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Text } from "../theme/Text";
import { colors, gutter, radii, space } from "../theme/tokens";
import {
  activity,
  balance as startingBalance,
  copy,
  lifetime,
  member,
  rewards,
  tiers,
  type Reward,
} from "../data/rewards";

/**
 * SevenPM Rewards, the phone version of the web build's account screen.
 *
 * It is here as the system's proving ground rather than as the app's most
 * important screen: between them these blocks use the display face, the brand
 * accent, chips, list rows with icon tiles, a progress track and two kinds of
 * button, so anything that is wrong with the tokens shows up immediately.
 *
 * Two rules carried over from the web build, both load-bearing:
 *
 * - Whether a reward can be taken is a question of Beats, not rank. Rank only
 *   files it under a chip.
 * - Membership reads off `lifetime`, so redeeming never costs you status.
 */

const ICONS = { promo: Promocode, ticket: Ticket, crown: Crown };

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(startingBalance);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");

  const tier =
    [...tiers].reverse().find((t) => lifetime >= t.threshold) ?? tiers[0];
  const next = tiers.find((t) => t.threshold > lifetime);
  const reachedIndex = tiers.findIndex((t) => t.id === tier.id);

  const shown =
    filter === "all" ? rewards : rewards.filter((r) => r.tier === filter);

  const redeem = (reward: Reward) => {
    if (redeemed.includes(reward.id) || balance < reward.cost) return;
    setBalance((current) => current - reward.cost);
    setRedeemed((current) => [...current, reward.id]);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
    >
      {/* Banner — the raised band the web build puts behind the greeting. */}
      <View style={[styles.banner, { paddingTop: insets.top + space.l }]}>
        <Text variant="displayM" uppercase color={colors.white}>
          {member.name}
        </Text>

        <View style={styles.memberRow}>
          <View style={styles.memberChip}>
            <Crown width={24} height={24} />
            <Text variant="bodyBold">{copy.memberLabel(tier.name)}</Text>
          </View>
          <Text variant="caption" color={colors.contentSecondary}>
            {member.since}
          </Text>
        </View>

        {/* Beats card */}
        <View style={styles.beatsCard}>
          <View style={styles.beatsHead}>
            <View style={styles.beatsFigure}>
              <Text variant="displayL" color={colors.white}>
                {balance.toLocaleString("en-US")}
              </Text>
              <Text variant="displayL" uppercase color={colors.brand}>
                {copy.unit}
              </Text>
            </View>
            <Button label={copy.howItWorks} icon={Info} />
          </View>

          <Text variant="body" color={colors.contentSecondary}>
            {next
              ? copy.toNext(next.threshold - lifetime, next.name)
              : copy.topTier}
          </Text>

          {/* Membership track. Reached stops are brand yellow with a tick;
              the rest are outlined with a lock. The rail between two reached
              stops is white, so the journey so far reads as one line. */}
          <View style={styles.track}>
            {tiers.map((item, index) => {
              const reached = lifetime >= item.threshold;
              return (
                <View key={item.id} style={styles.trackCell}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.rail,
                        index <= reachedIndex ? styles.railOn : styles.railOff,
                      ]}
                    />
                  )}
                  <View style={styles.stop}>
                    <View
                      style={[
                        styles.stopMark,
                        reached ? styles.stopOn : styles.stopOff,
                      ]}
                    >
                      {reached ? (
                        <TierCheck width={24} height={24} />
                      ) : (
                        <TierLock width={16} height={16} />
                      )}
                    </View>
                    <Text
                      variant="captionBold"
                      color={
                        item.id === tier.id
                          ? colors.contentPrimary
                          : colors.contentSecondary
                      }
                    >
                      {item.name}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.section}>
        <Text variant="sectionTitle" uppercase>
          {copy.title}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[{ id: "all", name: copy.allMemberships }, ...tiers].map((chip) => (
            <Chip
              key={chip.id}
              label={chip.name}
              selected={filter === chip.id}
              onPress={() => setFilter(chip.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.rows}>
          {shown.map((reward) => {
            const Icon = ICONS[reward.icon];
            const taken = redeemed.includes(reward.id);
            const affordable = balance >= reward.cost;
            return (
              <View key={reward.id} style={styles.row}>
                <View style={styles.tile}>
                  <Icon width={24} height={24} />
                </View>
                <View style={styles.rowBody}>
                  <Text variant="body" numberOfLines={1}>
                    {reward.name}
                  </Text>
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {reward.cost.toLocaleString("en-US")} {copy.unit}
                  </Text>
                </View>

                {taken ? (
                  <Text variant="bodySBold" color={colors.positive}>
                    Redeemed
                  </Text>
                ) : affordable ? (
                  <Button label={copy.redeem} onPress={() => redeem(reward)} />
                ) : (
                  <Button label={copy.locked} icon={LockSmall} disabled />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Ledger */}
      <View style={styles.section}>
        <Text variant="sectionTitle" uppercase>
          {copy.activityTitle}
        </Text>
        <Text variant="bodyBold" color={colors.contentSecondary}>
          {copy.today}
        </Text>

        <View>
          {activity.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={styles.tile}>
                {entry.kind === "earn" ? (
                  <BeatsEarn width={24} height={24} />
                ) : (
                  <BeatsBurn width={24} height={24} />
                )}
              </View>
              <View style={styles.rowBody}>
                <Text variant="body" numberOfLines={1}>
                  {entry.label}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {entry.time}
                </Text>
              </View>
              <Text
                variant="bodyBold"
                color={
                  entry.kind === "earn" ? colors.positive : colors.contentPrimary
                }
              >
                {entry.kind === "earn" ? "+" : ""}
                {Math.abs(entry.beats).toLocaleString("en-US")} {copy.unit}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="caption" color={colors.contentSecondary}>
          {copy.note}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },

  banner: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: gutter,
    paddingBottom: space.xl,
    gap: space.l,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: space.m },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    backgroundColor: colors.overlay5,
    borderWidth: 1,
    borderColor: colors.overlay10,
    padding: space.s,
    paddingRight: space.l,
  },

  beatsCard: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderDimmed,
    padding: space.xl,
    gap: space.m,
  },
  beatsHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.m,
  },
  beatsFigure: { flexDirection: "row", alignItems: "flex-end", gap: space.s },

  track: { flexDirection: "row", alignItems: "flex-start", paddingTop: space.s },
  trackCell: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  rail: { height: 3, flex: 1, marginTop: 10.5 },
  railOn: { backgroundColor: colors.white },
  railOff: { backgroundColor: colors.overlay5 },
  stop: { alignItems: "center", gap: space.s, width: 62 },
  stopMark: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stopOn: { backgroundColor: colors.brand },
  stopOff: { borderWidth: 1, borderColor: colors.overlay10 },

  section: { paddingHorizontal: gutter, paddingTop: space.section, gap: space.l },
  chips: { flexDirection: "row", gap: 10, paddingRight: gutter },
  rows: { gap: space.m },
  row: { flexDirection: "row", alignItems: "center", gap: space.l, height: 66 },
  tile: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
    borderRadius: radii.none,
  },
  rowBody: { flex: 1, minWidth: 0 },
});
