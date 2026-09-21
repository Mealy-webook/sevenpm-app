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
import { colors, radii, space } from "../theme/tokens";

/**
 * The sheet every dialog in the app docks into, from Figma 346:47134.
 *
 * On the web these are 378px dialogs centred in the viewport. A phone has one
 * width, so the same content docks to the bottom of the screen instead and
 * stops short of the top: the page it came from stays visible above it, which
 * is what tells you the sheet is a layer over your booking rather than the
 * next screen of it.
 *
 * **This is the third exception to the square rule**, after the switch and the
 * saved-card face. The app comps give the drawer a 38px radius on its top two
 * corners and a grabber above the title, and both earn their place: together
 * they say the panel is draggable and came from below. The earlier build of
 * this component was square on the grounds that everything else is; the comps
 * disagree, and on this the comps are right — a square-topped panel that
 * slides up from the bottom edge reads as a new screen, which is the one thing
 * a sheet must not read as.
 *
 * Everything inside it stays square.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  closeLabel,
  children,
  footer,
  align = "center",
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
  /**
   * The booking sheets centre their title between the close button and an
   * equal empty side. The rewards sheet (286:52793) puts the close on its own
   * row and the title left, below it, which gives a long title the full width.
   */
  align?: "center" | "left";
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
          {/* The grabber. It is not interactive — this sheet is dismissed by
              its close button or by the page above it — but it is what says
              the panel came from the bottom edge. */}
          <View style={styles.grabberRow}>
            <View style={styles.grabber} />
          </View>

          {align === "left" ? (
            <View style={styles.headLeft}>
              <View style={styles.headLeftActions}>
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={closeLabel}
                  onPress={onClose}
                  style={styles.close}
                >
                  <Close width={20} height={20} />
                </Tap>
              </View>
              <Text variant="titleBody" uppercase>
                {title}
              </Text>
              {subtitle && (
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {subtitle}
                </Text>
              )}
            </View>
          ) : (
          <View style={styles.head}>
            {/* The title is centred between two equal flexible sides, so it
                stays centred on the screen rather than centred in whatever
                space the close button leaves. */}
            <View style={styles.headSide} />
            <View style={styles.headText}>
              <Text variant="titleBody" uppercase numberOfLines={1} style={styles.headTitle}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  variant="caption"
                  color={colors.contentSecondary}
                  style={styles.headTitle}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={[styles.headSide, styles.headActions]}>
              <Tap
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                onPress={onClose}
                style={styles.close}
              >
                <Close width={20} height={20} />
              </Tap>
            </View>
          </View>
          )}

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
            placeholderTextColor={colors.contentPrimary}
            accessibilityLabel={label}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={editable}
            autoFocus={autoFocus}
            selectionColor={colors.brand}
            style={[styles.input, !value && styles.inputEmpty]}
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
  scrim: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  /* The comps hold the drawer 56px clear of the top, so the page it came from
     is always visible above it. */
  scrimTap: { flex: 1, minHeight: 56 },
  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    overflow: "hidden",
  },

  grabberRow: { alignItems: "center", paddingTop: 6 },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.overlay10,
  },

  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: 20,
    paddingVertical: space.xs,
  },
  /* Both sides are the close button's width, so the title is centred on the
     screen and still has the whole middle to itself. */
  headSide: { width: 40, height: 40, justifyContent: "center" },
  headActions: { alignItems: "flex-end" },
  headText: { flex: 1, minWidth: 0, gap: space.xs },
  headTitle: { textAlign: "center" },
  headLeft: { paddingHorizontal: 20, paddingTop: space.s, gap: space.xs },
  headLeftActions: { alignItems: "flex-end" },
  /* No border on the sheet's close button — the comps drop it here. */
  close: { padding: 10, backgroundColor: colors.overlay5 },
  body: { flexGrow: 0 },
  bodyInner: { paddingHorizontal: 20, paddingVertical: space.l, gap: space.l },

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
  /* Empty, the box shows its label in the comp's regular 17. */
  inputEmpty: { fontFamily: "Roboto_400Regular", fontSize: 17, lineHeight: 24, letterSpacing: 0 },
});
