import { useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import ChevronsDown from "../icons/ic-chevrons-down-20.svg";
import { Button } from "./Button";
import { Dock } from "./Dock";
import { Sheet } from "./Sheet";
import { icon } from "../icons";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, space } from "../theme/tokens";
import { bookingCopy } from "../data/booking";

/**
 * What ticket protection is, from Figma 433:3371 and its second page
 * 433:3390.
 *
 * The comp draws two screens rather than two sheets: "Read more" swaps the
 * covered-reasons list for the conditions, and the dock's one button becomes
 * "Got it". So it is one sheet with a page underneath it, and opening the
 * sheet always starts on the first page.
 */
export function ProtectionInfoSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const copy = bookingCopy.protectionSheet;
  const [expanded, setExpanded] = useState(false);

  /* Re-opening starts at the top again — the second page is a continuation,
     not a place you were left. */
  useEffect(() => {
    if (open) setExpanded(false);
  }, [open]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={expanded ? "" : copy.title}
      closeLabel={copy.close}
      footer={
        <Dock surface="panel">
          {expanded ? (
            <Button variant="primary" label={copy.gotIt} onPress={onClose} />
          ) : (
            <Button
              label={copy.readMore}
              icon={ChevronsDown}
              iconSide="right"
              onPress={() => setExpanded(true)}
            />
          )}
        </Dock>
      }
    >
      {expanded ? (
        <>
          <Bullets title={copy.conditionsTitle} items={copy.conditions} />
          <Bullets title={copy.notCoveredTitle} items={copy.notCovered} />

          <View style={styles.group}>
            <Text variant="titleBody" uppercase>
              {copy.transferTitle}
            </Text>
            {copy.transfer.map((paragraph) => (
              <Text key={paragraph} variant="bodyS" color={colors.contentSecondary}>
                {paragraph}
              </Text>
            ))}
          </View>

          <Text
            variant="bodyBold"
            accessibilityRole="link"
            onPress={() => Linking.openURL("https://sevenpm.com/terms")}
          >
            {copy.fullTerms}
          </Text>
        </>
      ) : (
        <>
          <Image
            source={image("/assets/protection-shield.png")}
            style={styles.shield}
            contentFit="contain"
            transition={200}
          />

          <Text
            variant="bodyS"
            color={colors.contentSecondary}
            style={styles.centred}
          >
            {copy.intro}
          </Text>

          <View style={styles.headingGroup}>
            <Text variant="bodyBold">{copy.coveredTitle}</Text>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {copy.coveredHint}
            </Text>
          </View>

          <View style={styles.list}>
            {copy.covered.map((reason, index) => {
              const Mark = icon(reason.icon);
              return (
                <View key={index} style={styles.reason}>
                  {Mark && <Mark width={24} height={24} />}
                  <View style={styles.reasonBody}>
                    <Text variant="body">{reason.label}</Text>
                    <Text variant="bodyS" color={colors.contentSecondary}>
                      {reason.detail}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Sheet>
  );
}

/** A heading over a run of dotted lines, as the second page sets them. */
function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.group}>
      <Text variant="titleBody" uppercase>
        {title}
      </Text>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text variant="bodyS" color={colors.contentSecondary}>
            ·
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary} style={styles.flex}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Turning protection off asks first (432:3294): the same shield, the question
 * in the sheets' own 24px Black, and the safe answer as the filled button.
 */
export function ProtectionSkipSheet({
  open,
  onClose,
  onSkip,
}: {
  open: boolean;
  /** Dismissing keeps the protection on — the sheet only ever removes it. */
  onClose: () => void;
  onSkip: () => void;
}) {
  const copy = bookingCopy.protectionSkip;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title=""
      closeLabel={copy.close}
      footer={
        <Dock surface="panel">
          <Button variant="primary" label={copy.keep} onPress={onClose} />
          <Button variant="tertiary" label={copy.skip} onPress={onSkip} />
        </Dock>
      }
    >
      <View style={styles.askBody}>
        <Image
          source={image("/assets/protection-shield.png")}
          style={styles.shield}
          contentFit="contain"
          transition={200}
        />
        <View style={styles.askText}>
          <Text variant="displayXS" uppercase style={styles.centred}>
            {copy.title}
          </Text>
          <Text variant="body" style={styles.centred}>
            {copy.body}
          </Text>
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  shield: { width: 110, height: 110, alignSelf: "center" },
  centred: { textAlign: "center" },
  flex: { flex: 1, minWidth: 0 },

  headingGroup: { gap: space.xs, width: "100%" },
  list: { width: "100%" },
  /* Each reason rules itself off underneath, as the comp's list does. */
  reason: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingVertical: space.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.overlay10,
  },
  reasonBody: { flex: 1, minWidth: 0 },

  group: { gap: space.xs, width: "100%" },
  bullet: { flexDirection: "row", gap: space.s },

  askBody: { alignItems: "center", gap: space.xl, width: "100%" },
  askText: { gap: space.s, width: "100%" },
});
