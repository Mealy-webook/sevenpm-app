import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import ChevronLeft from "../icons/ic-chevron-left-20.svg";
import BeatsBurn from "../icons/ic-beats-burn.svg";
import BeatsEarn from "../icons/ic-beats-earn.svg";
import ChevronDown from "../icons/ic-chevron-down-16.svg";
import Help from "../icons/ic-help-20.svg";
import LockSmall from "../icons/ic-lock-locked-16.svg";
import TierCheck from "../icons/ic-tier-check.svg";
import TierLock from "../icons/ic-tier-lock.svg";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Confirm } from "../components/Confirm";
import { Dock } from "../components/Dock";
import { Odometer } from "../components/Odometer";
import { Page } from "../components/Screen";
import { Sheet } from "../components/Sheet";
import { Tap } from "../components/Tap";
import { icon } from "../icons";
import { tap } from "../theme/haptics";
import { Text } from "../theme/Text";
import { colors, displaySize, space, type } from "../theme/tokens";
import {
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
 * SevenPM Rewards, from Figma 286:51956.
 *
 * The balance is the screen's headline — the figure in white and the unit in
 * brand yellow, both at display size — and everything under it answers a
 * question about that figure: how far to the next membership, when some of it
 * expires, what it buys, and where it came from.
 *
 * Two rules carried from the web build, both load-bearing:
 *
 * - Whether a reward can be taken is a question of Beats, not rank. Rank only
 *   files it under a chip.
 * - Membership reads off `loyaltyLifetime`, which only ever goes up, so
 *   redeeming never costs you status.
 */
export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [balance, setBalance] = useState(loyaltyBalance);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [confirming, setConfirming] = useState<LoyaltyReward | null>(null);
  const [howTo, setHowTo] = useState(false);
  const [openEntry, setOpenEntry] = useState<string | null>(null);

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
    tap.commit();
    setBalance((current) => current - reward.cost);
    setRedeemed((current) => [...current, reward.id]);
  };

  const display = displaySize(type.displayStep, width);

  return (
    <Page>
      {/* Back on the left, the explainer on the right. */}
      <View style={[styles.bar, { paddingTop: insets.top + space.s }]}>
        <Tap
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={navigation.goBack}
          style={styles.barButton}
        >
          <ChevronLeft width={20} height={20} color={colors.contentPrimary} />
        </Tap>
        <View style={styles.barSpacer} />
        <Tap
          accessibilityRole="button"
          accessibilityLabel={loyaltyHowTo.title}
          onPress={() => setHowTo(true)}
          style={styles.barButton}
        >
          <Help width={20} height={20} />
        </Tap>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        <View style={styles.head}>
          <View style={styles.figure}>
            <Odometer
              value={balance.toLocaleString("en-US")}
              variant="displayStep"
              color={colors.white}
              textStyle={display}
              height={display.lineHeight}
            />
            <Text variant="displayStep" uppercase color={colors.brand} style={display}>
              {loyaltyCopy.unit}
            </Text>
          </View>

          {/* The next tier's name is the one bold word in the line. */}
          <Text variant="body" color={colors.contentSecondary}>
            {next ? (
              <>
                {`${loyaltyCopy.toNextLead} ${loyaltyCopy.toNext(
                  next.threshold - loyaltyLifetime,
                )} `}
                <Text variant="bodyBold" color={colors.contentSecondary}>
                  {next.name}
                </Text>
                {` ${loyaltyCopy.toNextTail}`}
              </>
            ) : (
              loyaltyCopy.topTier
            )}
          </Text>
          <Text variant="caption" color={colors.contentSecondary}>
            {loyaltyCopy.expiry(loyaltyCopy.expiring, loyaltyCopy.expiresAt)}
          </Text>

          {/* Membership track. Reached stops are brand yellow with a tick; the
              rest are outlined with a lock. The rail between two reached stops
              is white, so the journey so far reads as one line. */}
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
                      variant="caption"
                      color={
                        reached ? colors.contentPrimary : colors.contentSecondary
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

        {/* Rewards */}
        <View style={styles.section}>
          <Text variant="titleBody" uppercase>
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
            shown.map((reward) => {
              const Mark = icon(reward.icon);
              const taken = redeemed.includes(reward.id);
              const affordable = balance >= reward.cost;
              return (
                <View key={reward.id} style={styles.row}>
                  {Mark && <Mark width={24} height={24} />}
                  <View style={styles.rowBody}>
                    <Text variant="body" numberOfLines={2}>
                      {reward.name}
                    </Text>
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {loyaltyCopy.beats(reward.cost)}
                    </Text>
                  </View>
                  {taken ? (
                    <Text variant="bodySBold" color={colors.positive}>
                      {loyaltyCopy.redeemed}
                    </Text>
                  ) : affordable ? (
                    /* White, because taking it is the action on this row. */
                    <Button
                      variant="primary"
                      label={loyaltyCopy.redeem}
                      onPress={() => setConfirming(reward)}
                      style={styles.redeem}
                    />
                  ) : (
                    <Button label={loyaltyCopy.locked} icon={LockSmall} disabled />
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Ledger */}
        <View style={styles.section}>
          <Text variant="titleBody" uppercase>
            {loyaltyCopy.activityTitle}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {loyaltyCopy.today}
          </Text>

          {loyaltyActivity.map((entry) => {
            const open = openEntry === entry.id;
            return (
              <Tap
                key={entry.id}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => setOpenEntry(open ? null : entry.id)}
                scale={0.995}
                style={styles.entry}
              >
                <View style={styles.row}>
                  {entry.kind === "earn" ? (
                    <BeatsEarn width={24} height={24} />
                  ) : (
                    <BeatsBurn width={24} height={24} />
                  )}
                  <View style={styles.rowBody}>
                    <Text variant="body">{entry.label}</Text>
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
                    {entry.kind === "earn"
                      ? loyaltyCopy.earned(entry.beats)
                      : loyaltyCopy.beats(entry.beats)}
                  </Text>
                  <View style={open ? styles.flip : undefined}>
                    <ChevronDown width={16} height={16} />
                  </View>
                </View>
                {open && (
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {entry.detail}
                  </Text>
                )}
              </Tap>
            );
          })}

          <Text variant="caption" color={colors.contentSecondary}>
            {loyaltyCopy.note}
          </Text>
        </View>
      </ScrollView>

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

      {/* How it works — a rate card, not an essay. */}
      <Sheet
        open={howTo}
        onClose={() => setHowTo(false)}
        align="left"
        title={loyaltyHowTo.title}
        subtitle={loyaltyHowTo.intro}
        closeLabel={loyaltyHowTo.done}
        footer={
          <Dock surface="panel">
            <Button
              variant="primary"
              label={loyaltyHowTo.done}
              onPress={() => setHowTo(false)}
            />
          </Dock>
        }
      >
        {loyaltyHowTo.earn.map((way, index) => {
          const Mark = icon(way.icon);
          return (
            <View key={way.id} style={[styles.rateRow, index > 0 && styles.rateRowDivided]}>
              {Mark && <Mark width={24} height={24} />}
              <Text variant="body" style={styles.rowBody}>
                {way.label}
              </Text>
              <View style={styles.ratePill}>
                <Text variant="caption" color={colors.contentSecondary}>
                  {loyaltyHowTo.rate(way.beats)}
                </Text>
              </View>
            </View>
          );
        })}
      </Sheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bgSecondary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.xl,
    paddingBottom: space.s,
  },
  barSpacer: { flex: 1 },
  barButton: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  head: { paddingHorizontal: space.xl, paddingTop: space.m, gap: space.s , backgroundColor: colors.bgSecondary },
  figure: { flexDirection: "row", alignItems: "baseline", gap: space.m },

  track: { flexDirection: "row", alignItems: "flex-start", paddingTop: space.l },
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

  section: { paddingHorizontal: space.xl, paddingTop: space.section, gap: space.m },
  chips: { flexDirection: "row", gap: space.s, paddingRight: space.xl },

  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0 },
  redeem: { paddingHorizontal: space.l, paddingVertical: 10 },

  entry: { gap: space.s, paddingVertical: space.s },
  flip: { transform: [{ rotate: "180deg" }] },

  rateRow: { flexDirection: "row", alignItems: "center", gap: space.m },
  rateRowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderTertiary,
  },
  ratePill: {
    paddingHorizontal: space.m,
    paddingVertical: space.xs,
    backgroundColor: colors.overlay5,
  },
});
