import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Close from "../icons/ic-dialog-close.svg";
import { Tap } from "./Tap";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";

/**
 * The sheet the booking and account dialogs share — ticket info (2078:45259),
 * item details (2196:11760), order summary (2213:14113), delivery, card,
 * promocode and top-up.
 *
 * On the web these are 378px dialogs centred in the viewport. A phone has one
 * width, so the same content docks to the bottom of the screen instead and
 * stops short of the top: the page it came from stays visible above it, which
 * is what tells you the sheet is a layer over your booking rather than the
 * next screen of it.
 *
 * Square, like everything else. The rounded top edge that RN sheets usually
 * carry would be the only radius on screen.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  closeLabel,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Second line under the title, as the delivery and card dialogs carry. */
  subtitle?: string;
  closeLabel: string;
  children: React.ReactNode;
  /** Dock under the scrollable body. */
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        {/* The page above the sheet dismisses it, the sheet itself does not. */}
        <Pressable
          style={styles.scrimTap}
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.head}>
            <View style={styles.headText}>
              <Text variant="title" uppercase>
                {title}
              </Text>
              {subtitle && (
                <Text variant="caption" color={colors.contentSecondary}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Tap
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={styles.close}
            >
              <Close width={20} height={20} />
            </Tap>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyInner}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {footer}
          <View style={{ height: insets.bottom }} />
        </View>
      </View>
    </Modal>
  );
}

/** Price block the sheet docks share: amount, was-price and discount. */
export function SheetPrice({
  price,
  wasPrice,
  discount,
  suffix,
  format,
}: {
  price: number;
  wasPrice?: number;
  discount?: string;
  suffix?: string;
  format: (amount: number) => string;
}) {
  return (
    <View style={styles.price}>
      <View style={styles.priceLine}>
        <Text variant="bodyL" style={styles.semibold}>
          {format(price)}
        </Text>
        {suffix && (
          <Text variant="bodyS" color={colors.contentSecondary}>
            {suffix}
          </Text>
        )}
      </View>
      {(wasPrice !== undefined || discount) && (
        <View style={styles.priceWas}>
          {wasPrice !== undefined && (
            <Text
              variant="caption"
              color={colors.contentSecondary}
              style={styles.struck}
            >
              {wasPrice}
            </Text>
          )}
          {discount && (
            <Text variant="caption" color="#4ade80">
              {discount}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * The dialogs' text field: the label sits inside the box, small above the
 * value once there is one, and doubles as the placeholder when empty.
 */
export function Field({
  label,
  value,
  onChange,
  error,
  keyboardType,
  maxLength,
  placeholder,
  trailing,
  editable = true,
  autoFocus = false,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  placeholder?: string;
  trailing?: React.ReactNode;
  editable?: boolean;
  autoFocus?: boolean;
  style?: object;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <View style={[styles.field, style]}>
      <View
        style={[
          styles.fieldBox,
          focused && styles.fieldFocus,
          error && styles.fieldError,
          !editable && styles.fieldOff,
        ]}
      >
        <View style={styles.fieldInner}>
          {filled && (
            <Text
              variant="caption"
              color={error ? colors.negative : colors.contentSecondary}
            >
              {label}
            </Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder ?? label}
            placeholderTextColor={colors.contentSecondary}
            accessibilityLabel={label}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={editable}
            autoFocus={autoFocus}
            selectionColor={colors.brand}
            style={styles.input}
          />
        </View>
        {trailing}
      </View>
      {error && (
        <Text variant="caption" color={colors.negative} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.8)" },
  scrimTap: { flex: 1, minHeight: 80 },
  sheet: { maxHeight: "88%", backgroundColor: colors.bgSecondary },

  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.s,
    paddingHorizontal: gutter,
    paddingTop: gutter,
  },
  headText: { flex: 1, minWidth: 0, gap: space.xs },
  close: {
    padding: 10,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  body: { flexGrow: 0 },
  bodyInner: { padding: gutter, gap: space.l },

  price: { gap: 2 },
  priceLine: { flexDirection: "row", alignItems: "baseline", gap: space.xs },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  priceWas: { flexDirection: "row", alignItems: "center", gap: space.s },
  struck: { textDecorationLine: "line-through" },

  field: { gap: space.xs, minWidth: 0 },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
    backgroundColor: colors.overlay5,
    borderWidth: 1,
    borderColor: colors.overlay10,
  },
  fieldFocus: { borderColor: colors.contentPrimary },
  fieldError: { borderColor: colors.negative },
  fieldOff: { opacity: 0.6 },
  fieldInner: { flex: 1, minWidth: 0, minHeight: 36, justifyContent: "center" },
  input: {
    fontFamily: "Roboto_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.19,
    color: colors.contentPrimary,
    padding: 0,
  },
});
