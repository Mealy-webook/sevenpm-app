import { StyleSheet, View } from "react-native";

import { Button } from "./Button";
import { Sheet } from "./Sheet";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";

/**
 * The two-button confirmation the destructive actions go through — logging
 * out, removing a card, deleting an account, spending Beats.
 *
 * The cancel is the wide one and the confirm is the narrow one, because the
 * thumb lands on the wide one and the thumb should land on the harmless one.
 */
export function Confirm({
  open,
  title,
  body,
  cancel,
  confirm,
  tone = "default",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  cancel: string;
  confirm: string;
  tone?: "default" | "destructive";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Sheet open={open} onClose={onCancel} title={title} closeLabel={cancel}>
      <Text variant="body" color={colors.contentSecondary}>
        {body}
      </Text>
      <View style={styles.actions}>
        <Button
          variant="primary"
          label={cancel}
          onPress={onCancel}
          style={styles.wide}
        />
        <Button label={confirm} tone={tone} onPress={onConfirm} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingBottom: gutter,
  },
  wide: { flex: 1 },
});
