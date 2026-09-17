import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import Check from "../../icons/ic-check-on.svg";
import Clear from "../../icons/ic-clear-20.svg";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Dock } from "../../components/Dock";
import { Field, Sheet, SheetPrice } from "../../components/Sheet";
import { Stepper } from "../../components/Stepper";
import { Tap } from "../../components/Tap";
import { icon } from "../../icons";
import { image } from "../../images";
import { Text } from "../../theme/Text";
import { colors, radii, space } from "../../theme/tokens";
import {
  bookingCopy,
  deliveryCountries,
  findPromo,
  formatMoney,
  pickupPoints,
  type BookingAddon,
  type BookingTicket,
} from "../../data/booking";
import { quantityOf, type Cart, type Totals } from "./cart";

/**
 * The sheets the booking journey opens. They are gathered in one module
 * because they share a shape — header, scrolling body, one dock button — and
 * splitting six near-identical files apart buries that.
 *
 * None of them own anything: each is handed its state and hands back the one
 * decision it was opened to collect.
 */

/**
 * What is in a ticket — the line-up it admits you to. Figma 346:47116.
 *
 * The sheet is titled with the ticket itself rather than with the word
 * "details", so the thing you tapped is the thing named at the top.
 */
export function TicketInfoSheet({
  ticket,
  quantity,
  onClose,
  onAdjust,
  onAdd,
}: {
  ticket: BookingTicket | null;
  /** How many are already in the basket, so the sheet opens in step with it. */
  quantity: number;
  onClose: () => void;
  onAdjust: (ticket: BookingTicket, by: number) => void;
  onAdd: (ticket: BookingTicket) => void;
}) {
  return (
    <Sheet
      open={ticket !== null}
      onClose={onClose}
      title={ticket?.name ?? ""}
      closeLabel={bookingCopy.ticketInfo.close}
      footer={
        ticket ? (
          <Dock surface="panel">
            <Button
              variant="primary"
              label={bookingCopy.ticketInfo.addToCart}
              onPress={() => onAdd(ticket)}
            />
          </Dock>
        ) : undefined
      }
    >
      <Text variant="bodyBold">{bookingCopy.ticketInfo.lineup}</Text>

      {ticket?.lineup.map((slot, index) => (
        <View key={`${slot.name}-${index}`} style={styles.slot}>
          <Image
            source={image(slot.image)}
            style={styles.slotPortrait}
            contentFit="cover"
          />
          <View style={styles.slotBody}>
            <Text variant="bodyS" numberOfLines={1}>
              {slot.name}
            </Text>
            <Text variant="caption" color={colors.contentSecondary}>
              {slot.time}
            </Text>
          </View>
        </View>
      ))}

      {ticket && (
        <>
          <View style={styles.rule} />
          <View style={styles.priceRow}>
            <SheetPrice
              price={ticket.price}
              wasPrice={ticket.wasPrice}
              discount={ticket.discount}
              suffix={bookingCopy.ticketInfo.perPerson}
              format={formatMoney}
            />
            <Stepper
              size="m"
              value={quantity}
              name={ticket.name}
              onAdd={() => onAdjust(ticket, 1)}
              onChange={(by) => onAdjust(ticket, by)}
            />
          </View>
        </>
      )}
    </Sheet>
  );
}

/** A merchandise item and its sizes. Figma 346:47132. */
export function ItemDetailsSheet({
  addon,
  cart,
  onClose,
  onAdjust,
  onAdd,
}: {
  addon: BookingAddon | null;
  /**
   * The basket rather than a count: the sheet owns which size is selected, so
   * it is the only thing that can say how many of *that* size are in it.
   */
  cart: Cart;
  onClose: () => void;
  onAdjust: (addon: BookingAddon, by: number, size?: string) => void;
  onAdd: (addon: BookingAddon, size?: string) => void;
}) {
  const [size, setSize] = useState<string | undefined>();

  /* A new item opens on its first size rather than on nothing, so the dock
     button is live the moment the sheet is up. */
  useEffect(() => setSize(addon?.sizes?.[0]), [addon]);

  return (
    <Sheet
      open={addon !== null}
      onClose={onClose}
      title={bookingCopy.extras.details}
      closeLabel={bookingCopy.extras.close}
      footer={
        addon ? (
          <Dock surface="panel">
            <Button
              variant="primary"
              label={bookingCopy.extras.addToCart}
              onPress={() => onAdd(addon, size)}
            />
          </Dock>
        ) : undefined
      }
    >
      {addon?.image && (
        <Image
          source={image(addon.image)}
          style={styles.itemShot}
          contentFit="cover"
        />
      )}

      <Text variant="titleBody" uppercase>
        {addon?.name}
      </Text>

      {addon?.sizes && (
        <>
          <Text variant="bodyBold">{bookingCopy.extras.size}</Text>
          <View style={styles.sizeRow}>
            {addon.sizes.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={size === option}
                onPress={() => setSize(option)}
              />
            ))}
          </View>
        </>
      )}

      {addon && (
        <>
          <View style={styles.rule} />
          <View style={styles.priceRow}>
            <SheetPrice
              price={addon.price}
              wasPrice={addon.wasPrice}
              discount={addon.discount}
              format={formatMoney}
            />
            <Stepper
              size="m"
              value={quantityOf(cart, addon.id, size)}
              name={addon.name}
              onAdd={() => onAdjust(addon, 1, size)}
              onChange={(by) => onAdjust(addon, by, size)}
            />
          </View>
        </>
      )}
    </Sheet>
  );
}

/** Everything in the basket, priced. Figma 346:47155. */
export function OrderSummarySheet({
  open,
  onClose,
  totals,
}: {
  open: boolean;
  onClose: () => void;
  totals: Totals;
}) {
  const copy = bookingCopy.orderSummary;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      closeLabel={copy.close}
    >
      {totals.ticketLines.length > 0 && (
        <Section title={copy.tickets(totals.ticketCount)}>
          {totals.ticketLines.map((line) => (
            <LineRow
              key={line.key}
              icon={line.icon}
              name={line.name}
              qty={line.qty}
              amount={formatMoney(line.amount)}
            />
          ))}
        </Section>
      )}

      {totals.addonLines.length > 0 && (
        <Section title={copy.addons(totals.addonCount)}>
          {totals.addonLines.map((line) => (
            <LineRow
              key={line.key}
              icon={line.icon}
              name={line.name}
              sub={line.size ? copy.size(line.size) : undefined}
              qty={line.qty}
              amount={formatMoney(line.amount)}
            />
          ))}
        </Section>
      )}

      <View style={styles.rule} />

      <View style={styles.totals}>
        <TotalRow label={copy.subtotal} value={formatMoney(totals.subtotal)} />
        {totals.wallet > 0 && (
          <TotalRow
            label={copy.wallet}
            value={`-${formatMoney(totals.wallet)}`}
            tone="positive"
          />
        )}
        <TotalRow
          label={copy.total}
          value={formatMoney(totals.total)}
          strong
          note={copy.vat(formatMoney(totals.vat))}
        />
      </View>
    </Sheet>
  );
}
export function PromoSheet({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (code: string, off: number) => void;
}) {
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const copy = bookingCopy.promoDialog;

  const apply = () => {
    const promo = findPromo(code);
    if (!promo) {
      setInvalid(true);
      return;
    }
    onApply(promo.code, promo.off);
    setCode("");
    setInvalid(false);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      closeLabel={copy.close}
      footer={
        <Button
          variant="primary"
          label={copy.apply}
          disabled={code.trim().length === 0}
          onPress={apply}
        />
      }
    >
      <Field
        label={copy.label}
        value={code}
        onChange={(value) => {
          setCode(value);
          setInvalid(false);
        }}
        error={invalid ? copy.invalid : undefined}
        trailing={
          code.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.clear}
              onPress={() => setCode("")}
            >
              <Clear width={20} height={20} />
            </Pressable>
          ) : undefined
        }
      />
    </Sheet>
  );
}

export type Delivery =
  | { kind: "pickup"; point: string }
  | { kind: "address"; country: string; city: string; address: string };

/** How merchandise gets to you. Figma 2139:4597 and 2139:4953. */
export function DeliverySheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (delivery: Delivery) => void;
}) {
  const copy = bookingCopy.deliveryDialog;
  const [tab, setTab] = useState("pickup");
  const [point, setPoint] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cities =
    deliveryCountries.find((item) => item.label === country)?.cities ?? [];

  const save = () => {
    if (tab === "pickup") {
      if (!point) return setErrors({ pickup: copy.errors.pickup });
      onSave({ kind: "pickup", point });
      return;
    }
    const next: Record<string, string> = {};
    if (!country) next.country = copy.errors.country;
    if (!city) next.city = copy.errors.city;
    if (address.trim().length === 0) next.address = copy.errors.address;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ kind: "address", country: country!, city: city!, address });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      subtitle={copy.subtitle}
      closeLabel={copy.close}
      footer={<Button variant="primary" label={copy.save} onPress={save} />}
    >
      <View style={styles.sizeRow} accessibilityRole="tablist">
        {copy.tabs.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={tab === item.id}
            onPress={() => setTab(item.id)}
          />
        ))}
      </View>

      {tab === "pickup" ? (
        <View style={styles.options}>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {copy.pickupLabel}
          </Text>
          {pickupPoints.map((item) => (
            <Option
              key={item.id}
              label={item.label}
              sub={item.hint}
              selected={point === item.label}
              onPress={() => setPoint(item.label)}
            />
          ))}
          {errors.pickup && (
            <Text variant="caption" color={colors.negative}>
              {errors.pickup}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.options}>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {copy.addressLabel}
          </Text>

          <Text variant="bodySBold">{copy.country}</Text>
          <View style={styles.sizeRow}>
            {deliveryCountries.map((item) => (
              <Chip
                key={item.code}
                label={item.label}
                selected={country === item.label}
                onPress={() => {
                  setCountry(item.label);
                  setCity(null);
                }}
              />
            ))}
          </View>
          {errors.country && (
            <Text variant="caption" color={colors.negative}>
              {errors.country}
            </Text>
          )}

          {cities.length > 0 && (
            <>
              <Text variant="bodySBold">{copy.city}</Text>
              <View style={styles.sizeRow}>
                {cities.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={city === item}
                    onPress={() => setCity(item)}
                  />
                ))}
              </View>
            </>
          )}
          {errors.city && (
            <Text variant="caption" color={colors.negative}>
              {errors.city}
            </Text>
          )}

          <Field
            label={copy.address}
            value={address}
            onChange={setAddress}
            error={errors.address}
          />
        </View>
      )}
    </Sheet>
  );
}

export type SavedCard = { brand: string; last4: string; mark?: string };

/**
 * Add a card. Figma 2139:5400.
 *
 * Nothing here is sent anywhere and nothing is stored: the sheet hands back
 * the brand and the last four digits, and the number it was typed from is
 * dropped with the component.
 */
export function CardSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (card: SavedCard) => void;
}) {
  const copy = bookingCopy.cardDialog;
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const digits = number.replace(/\D/g, "");

  const submit = () => {
    const next: Record<string, string> = {};
    if (digits.length < 15) next.number = copy.errors.number;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) next.expiry = copy.errors.expiry;
    if (cvc.length < 3) next.cvc = copy.errors.cvc;
    if (name.trim().length === 0) next.name = copy.errors.name;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      brand: digits.startsWith("4") ? "Visa" : "Mastercard",
      last4: digits.slice(-4),
      mark: digits.startsWith("4")
        ? "/assets/pay-visa-mark.svg"
        : "/assets/pay-mastercard.svg",
    });
    setNumber("");
    setExpiry("");
    setCvc("");
    setName("");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      subtitle={copy.subtitle}
      closeLabel={copy.close}
      footer={<Button variant="primary" label={copy.submit} onPress={submit} />}
    >
      <Field
        label={copy.number}
        value={number}
        onChange={setNumber}
        error={errors.number}
        keyboardType="number-pad"
        maxLength={19}
      />
      <View style={styles.pair}>
        <Field
          label={copy.expiry}
          value={expiry}
          onChange={setExpiry}
          error={errors.expiry}
          keyboardType="number-pad"
          maxLength={5}
          style={styles.half}
        />
        <Field
          label={copy.cvc}
          value={cvc}
          onChange={setCvc}
          error={errors.cvc}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.half}
        />
      </View>
      <Field
        label={copy.name}
        value={name}
        onChange={setName}
        error={errors.name}
      />
      <Text variant="caption" color={colors.contentSecondary}>
        {copy.note}
      </Text>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ *
 * Shared pieces
 * ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text variant="bodySBold" color={colors.contentSecondary}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function LineRow({
  icon: path,
  name,
  sub,
  qty,
  amount,
}: {
  icon: string;
  name: string;
  sub?: string;
  qty: number;
  amount: string;
}) {
  const Mark = icon(path);
  return (
    <View style={styles.line}>
      {/* The comp leads with the count — "1x", before the mark — so a summary
          reads as a list of quantities rather than of things. */}
      <Text variant="bodyS" color={colors.contentSecondary}>
        {qty}x
      </Text>
      {Mark && <Mark width={16} height={16} />}
      <View style={styles.lineBody}>
        <Text variant="bodyS" numberOfLines={2}>
          {name}
        </Text>
        {sub && (
          <Text variant="caption" color={colors.contentSecondary}>
            {sub}
          </Text>
        )}
      </View>
      <Text variant="bodySBold">{amount}</Text>
    </View>
  );
}

/** A row of the price block: label left, figure right. */
export function TotalRow({
  label,
  value,
  strong = false,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  strong?: boolean;
  note?: string;
  /** `positive` is money coming back — a credit, a discount. */
  tone?: "default" | "positive";
}) {
  return (
    <View style={styles.total}>
      <View style={styles.totalLine}>
        <Text
          variant={strong ? "bodyBold" : "body"}
          color={strong ? colors.contentPrimary : colors.contentSecondary}
          style={styles.totalLabel}
        >
          {label}
        </Text>
        <Text
          variant={strong ? "bodyL" : "body"}
          color={tone === "positive" ? colors.positive : undefined}
          style={strong && styles.semibold}
        >
          {value}
        </Text>
      </View>
      {note && (
        <Text variant="caption" color={colors.contentSecondary} style={styles.right}>
          {note}
        </Text>
      )}
    </View>
  );
}

/** A radio row: a tick when chosen, a hollow square when not. */
export function Option({
  label,
  sub,
  selected,
  onPress,
  trailing,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Tap
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      scale={0.99}
      style={[styles.option, selected && styles.optionOn]}
    >
      <View style={styles.optionBody}>
        <Text variant="bodyBold" numberOfLines={1}>
          {label}
        </Text>
        {sub && (
          <Text variant="bodyS" color={colors.contentSecondary}>
            {sub}
          </Text>
        )}
      </View>
      {trailing}
      {selected ? (
        <Check width={20} height={20} />
      ) : (
        <View style={styles.optionMark} />
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  semibold: { fontFamily: "Roboto_600SemiBold" },
  right: { textAlign: "right" },

  slot: { flexDirection: "row", alignItems: "center", gap: space.m },
  slotPortrait: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.bgTertiary,
  },
  slotBody: { flex: 1, minWidth: 0 },

  itemShot: { width: "100%", height: 277, backgroundColor: colors.bgTertiary },
  /* The hairline the comps draw between a sheet's content and its price. */
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderTertiary },
  priceRow: { flexDirection: "row", alignItems: "center", gap: space.l },
  sizes: { gap: space.s },
  sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: space.s },

  section: { gap: space.s },
  line: { flexDirection: "row", alignItems: "center", gap: space.s },
  lineBody: { flex: 1, minWidth: 0 },

  totals: { gap: space.s },
  total: { gap: 2 },
  totalLine: { flexDirection: "row", alignItems: "baseline", gap: space.m },
  totalLabel: { flex: 1, minWidth: 0 },

  options: { gap: space.m },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    padding: space.l,
    backgroundColor: colors.overlay5,
    borderWidth: 1,
    borderColor: colors.overlay10,
  },
  optionOn: { borderColor: colors.contentPrimary },
  optionBody: { flex: 1, minWidth: 0 },
  optionMark: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.overlay20,
  },

  pair: { flexDirection: "row", gap: space.m },
  half: { flex: 1 },
});
