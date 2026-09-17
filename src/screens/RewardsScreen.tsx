import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import BeatsBurn from "../icons/ic-beats-burn.svg";
import BeatsEarn from "../icons/ic-beats-earn.svg";
import Crown from "../icons/ic-crown-24.svg";
import Info from "../icons/ic-info-13.svg";
import LockSmall from "../icons/ic-lock-locked-16.svg";
import TierCheck from "../icons/ic-tier-check.svg";
import TierLock from "../icons/ic-tier-lock.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Confirm } from "../components/Confirm";
import { ListRow } from "../components/ListRow";
import { NavBar, Page } from "../components/Screen";
import { Sheet } from "../components/Sheet";
import { icon } from "../icons";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import {
  accountUser,
  loyaltyActivity,
  loyaltyBalance,
  loyaltyCopy,
  loyaltyHowTo,
  loyaltyLifetime,
  loyaltyRewards,
  loyaltyTiers,
  type LoyaltyReward,
} from "../data/account";

/**
 * SevenPM Rewards, from Figma 2250:10073 by way of the web build's loyalty
 * panel — and the screen the design system was proved against, because
 * between them these blocks use the display face, the brand accent, chips,
 * list rows with icon tiles, a progress track and both button states, so
 * anything wrong with the tokens shows up here first.
 *
 * Two rules carried over from the web build, both load-bearing:
 *
 * - Whether a reward can be taken is a question of Beats, not rank. Rank only
 *   files it under a chip.
 * - Membership reads off `loyaltyLifetime`, which only ever goes up, so
 *   redeeming never costs you status.
 */
export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [balance, setBalance] = useState(loyaltyBalance);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [confirming, setConfirming] = useState<LoyaltyReward | null>(null);
  const [howTo, setHowTo] = useState(false);

  const tier =
    [...loyaltyTiers].reverse().find((t) => loyaltyLifetime >= t.threshold) ??
    loyaltyTiers[0];
  const next = loyaltyTiers.find((t) => t.threshold > loyaltyLifetime);
  const reachedIndex = loyaltyTiers.findIndex((t) => t.id === tier.id);

  const shown =
    filter === "all"
      ? loyaltyRewards
      : loyaltyRewards.filter((r) => r.tier === filter);

  const redeem = (reward: LoyaltyReward) => {
    if (redeemed.includes(reward.id) || balance < reward.cost) return;
    setBalance((current) => current - reward.cost);
    setRedeemed((current) => [...current, reward.id]);
  };

  return (
    <Page>
      {/* Rewards is reached from the account list and from the Beats figure in
          the Discover header, so it is always a push and always has a back. */}
      <NavBar floating onBack={navigation.goBack} />

      <ScrollView
        style={styles.page}
        contentContainerStyle={{ paddingBottom: space.section }}
      >
      {/* Banner — the raised band the web build puts behind the greeting. */}
      <View style={[styles.banner, { paddingTop: insets.top + 56 }]}>
        <Text variant="displayM" uppercase color={colors.white}>
          {accountUser.name}
        </Text>

        <View style={styles.memberRow}>
          <View style={styles.memberChip}>
            <Crown width={24} height={24} />
            <Text variant="bodyBold">{loyaltyCopy.memberLabel(tier.name)}</Text>
          </View>
          <Text variant="caption" color={colors.contentSecondary}>
            {loyaltyCopy.memberSince}
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
                {loyaltyCopy.unit}
              </Text>
            </View>
            <Button
              label={loyaltyCopy.howTo}
              icon={Info}
              onPress={() => setHowTo(true)}
            />
          </View>

          <Text variant="body" color={colors.contentSecondary}>
            {next
              ? `${loyaltyCopy.toNextLead} ${loyaltyCopy.toNext(
                  next.threshold - loyaltyLifetime,
                )} ${next.name} ${loyaltyCopy.toNextTail}`
              : loyaltyCopy.topTier}
          </Text>

          {/* Beats expire, so the card says when and how many. */}
          <Text variant="caption" color={colors.contentSecondary}>
            {loyaltyCopy.expiry(loyaltyCopy.expiring, loyaltyCopy.expiresAt)}
          </Text>

          {/* Membership track. Reached stops are brand yellow with a tick;
              the rest are outlined with a lock. The rail between two reached
              stops is white, so the journey so far reads as one line. */}
          <View style={styles.track}>
            {loyaltyTiers.map((item, index) => {
              const reached = loyaltyLifetime >= item.threshold;
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
          {loyaltyCopy.title}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[{ id: "all", name: loyaltyCopy.allMemberships }, ...loyaltyTiers].map(
            (chip) => (
              <Chip
                key={chip.id}
                label={chip.name}
                selected={filter === chip.id}
                onPress={() => setFilter(chip.id)}
              />
            ),
          )}
        </ScrollView>

        {shown.length === 0 ? (
          <Text variant="bodyBold" color={colors.contentSecondary}>
            {loyaltyCopy.empty}
          </Text>
        ) : (
          <View style={styles.rows}>
            {shown.map((reward) => {
              const taken = redeemed.includes(reward.id);
              const affordable = balance >= reward.cost;
              return (
                <ListRow
                  key={reward.id}
                  icon={icon(reward.icon)}
                  label={reward.name}
                  sub={`${reward.cost.toLocaleString("en-US")} ${loyaltyCopy.unit}`}
                  trailing={
                    taken ? (
                      <Text variant="bodySBold" color={colors.positive}>
                        {loyaltyCopy.redeemed}
                      </Text>
                    ) : affordable ? (
                      <Button
                        label={loyaltyCopy.redeem}
                        onPress={() => setConfirming(reward)}
                      />
                    ) : (
                      <Button
                        label={loyaltyCopy.locked}
                        icon={LockSmall}
                        disabled
                      />
                    )
                  }
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Ledger */}
      <View style={styles.section}>
        <Text variant="sectionTitle" uppercase>
          {loyaltyCopy.activityTitle}
        </Text>
        <Text variant="bodyBold" color={colors.contentSecondary}>
          {loyaltyCopy.today}
        </Text>

        <View>
          {loyaltyActivity.map((entry) => (
            <ListRow
              key={entry.id}
              icon={entry.kind === "earn" ? BeatsEarn : BeatsBurn}
              label={entry.label}
              sub={entry.time}
              trailing={
                <Text
                  variant="bodyBold"
                  color={
                    entry.kind === "earn"
                      ? colors.positive
                      : colors.contentPrimary
                  }
                >
                  {entry.kind === "earn"
                    ? loyaltyCopy.earned(entry.beats)
                    : loyaltyCopy.beats(entry.beats)}
                </Text>
              }
            />
          ))}
        </View>

        <Text variant="caption" color={colors.contentSecondary}>
          {loyaltyCopy.note}
        </Text>
      </View>

      {/* Spending Beats is not undoable, so it is asked before it is done. */}
      <Confirm
        open={confirming !== null}
        title={loyaltyCopy.confirmTitle}
        body={
          confirming
            ? loyaltyCopy.confirmBody(confirming.name, confirming.cost)
            : ""
        }
        cancel={loyaltyCopy.cancel}
        confirm={loyaltyCopy.redeem}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          if (confirming) redeem(confirming);
          setConfirming(null);
        }}
      />

      <Sheet
        open={howTo}
        onClose={() => setHowTo(false)}
        title={loyaltyHowTo.title}
        closeLabel={loyaltyHowTo.done}
        footer={
          <Button
            variant="primary"
            label={loyaltyHowTo.done}
            onPress={() => setHowTo(false)}
          />
        }
      >
        <Text variant="body" color={colors.contentSecondary}>
          {loyaltyHowTo.intro}
        </Text>

        <Text variant="titleBody" uppercase>
          {loyaltyHowTo.earnTitle}
        </Text>
        {loyaltyHowTo.earn.map((way) => (
          <ListRow
            key={way.id}
            icon={icon(way.icon)}
            label={way.label}
            sub={way.detail}
          />
        ))}

        <Text variant="titleBody" uppercase>
          {loyaltyHowTo.membershipTitle}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {loyaltyHowTo.membershipBody}
        </Text>

        <Text variant="titleBody" uppercase>
          {loyaltyHowTo.expiryTitle}
        </Text>
        <Text variant="body" color={colors.contentSecondary}>
          {loyaltyHowTo.expiryBody}
        </Text>
      </Sheet>
      </ScrollView>
    </Page>
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
  rows: { gap: space.xs },
});
