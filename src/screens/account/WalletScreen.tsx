import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Clear from "../../icons/ic-clear-20.svg";
import Plus from "../../icons/ic-plus-16.svg";
import TxIn from "../../icons/ic-tx-in.svg";
import TxOut from "../../icons/ic-tx-out.svg";
import { Button } from "../../components/Button";
import { CardZoom, type CardFrom } from "../../components/CardZoom";
import { EmptyState } from "../../components/EmptyState";
import { SignedOut } from "../../components/SignedOut";
import { Tap } from "../../components/Tap";
import { Chip } from "../../components/Chip";
import { ListRow } from "../../components/ListRow";
import { Page } from "../../components/Screen";
import { TAB_BAR_CLEARANCE } from "../../navigation/TabBar";
import { useSession } from "../../session";
import { signedOutCopy } from "../../data/session";
import { useTabBarScroll } from "../../navigation/tabBarScroll";
import { Field, Sheet } from "../../components/Sheet";
import { Option } from "../booking/BookingSheets";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { image } from "../../images";
import { colors, displaySize, gutter, scaled, space, type } from "../../theme/tokens";
import {
  formatAmount,
  walletCopy,
  walletCurrency,
  walletTransactions,
  type WalletTransaction,
} from "../../data/account";

/**
 * The wallet, from Figma 2196:12516.
 *
 * The balance in the data file is *derived* from the transactions, so the card
 * and the ledger can never disagree. A top-up in this session adds a
 * transaction and lets the same sum run again rather than nudging a stored
 * figure, for the same reason.
 *
 * Rows group under "Today" / "Yesterday" / a date, computed from each entry's
 * day offset, so those headings stay true however long this mock data lives.
 */
export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const tabScroll = useTabBarScroll();
  const { signedIn } = useSession();
  const { width } = useWindowDimensions();
  const [extra, setExtra] = useState<WalletTransaction[]>([]);
  const [open, setOpen] = useState(false);
  /* Taking the card out: both pieces are measured where the page drew them,
     so the card can be shown coming out from behind the leather. */
  const cardRef = useRef<View>(null);
  const folderRef = useRef<View>(null);
  const [taken, setTaken] = useState<{ card: CardFrom; folder: CardFrom } | null>(
    null,
  );
  const takeOut = () => {
    cardRef.current?.measureInWindow((x, y, w, h) =>
      folderRef.current?.measureInWindow((fx, fy, fw, fh) =>
        setTaken({
          card: { x, y, width: w, height: h },
          folder: { x: fx, y: fy, width: fw, height: fh },
        }),
      ),
    );
  };
  const [expanded, setExpanded] = useState<string | null>(null);

  const ledger = [...extra, ...walletTransactions];
  /* Derived, never stored — same rule the data file follows. */
  const balance = ledger.reduce((total, tx) => total + tx.amount, 0);

  const days = groupByDay(ledger);

  /* The comp's pocket is 350 wide on a 390 frame; everything inside it is
     placed in those units and scaled to whatever screen it lands on. */
  const u = (value: number) => scaled(value, width);

  /* Nothing on this page exists without an account: the balance, the card,
     the ledger. So it offers the way in rather than an emptied version of
     itself — the title stays because it names the page, not the reader. */
  if (!signedIn) {
    return (
      <Page>
        <ScrollView
          {...tabScroll}
          contentContainerStyle={[
            styles.body,
            styles.empty,
            { paddingTop: insets.top + gutter, paddingBottom: TAB_BAR_CLEARANCE },
          ]}
        >
          <Text
            variant="displayName"
            uppercase
            color={colors.white}
            style={displaySize(type.displayName, width)}
          >
            {walletCopy.title}
          </Text>
          <SignedOut
            art="/assets/empty-transactions.png"
            width={152}
            height={101}
            title={signedOutCopy.wallet}
          />
        </ScrollView>
      </Page>
    );
  }

  return (
    <Page>
      {/* No back control: 454:67370 gives Wallet a tab of its own, so this is
          a root rather than somewhere you arrived from. The menu's Wallet row
          switches to the tab rather than pushing a second copy of it. */}
      <ScrollView
        {...tabScroll}
        /* The bar floats over the foot of this. */
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + gutter, paddingBottom: TAB_BAR_CLEARANCE },
        ]}
      >
        <Text
          variant="displayName"
          uppercase
          color={colors.white}
          style={displaySize(type.displayName, width)}
        >
          {walletCopy.title}
        </Text>

        {/* The card and the pocket it sits in are one piece of artwork in two
            parts: the card behind, the leather in front, and the card's top
            edge showing above it. Figma builds it from blurs, masks and blend
            modes that React Native has none of, so it arrives as two exported
            sheets and only the balance and its button are live.
            
            The leather export arrived with 18 rows of opaque page-black above
            it — invisible against the page on its own, but it fell between the
            card's edge and the leather and read as a gap. Cropped off the
            asset rather than absorbed here, so the two pieces meet; every
            figure below is 16.5 shorter than the comp's for the same reason. */}
        <View style={[styles.wallet, { height: u(233.5) }]}>
          {/* The card is behind the leather and only its top edge shows, so
              that edge is the whole of what can be pressed. Pressing it takes
              the card out — see `CardZoom`. */}
          {/* The ref is on the box rather than on the control, because
              `Tap` is a Pressable and does not forward one, and the box is
              what has to be measured. */}
          <View
            ref={cardRef}
            style={{
              position: "absolute",
              left: u(22),
              top: 0,
              width: u(307),
              height: u(203),
            }}
          >
            <Tap
              accessibilityRole="button"
              accessibilityLabel={walletCopy.cardTitle}
              onPress={takeOut}
              scale={1}
              style={StyleSheet.absoluteFill}
            >
              <Image
                source={image("/assets/wallet-card.png")}
                style={StyleSheet.absoluteFill}
                contentFit="fill"
              />
            </Tap>
          </View>
          <View
            ref={folderRef}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: u(43),
              height: u(190.5),
            }}
            pointerEvents="none"
          >
            <Image
              source={image("/assets/wallet-folder.png")}
              style={StyleSheet.absoluteFill}
              contentFit="fill"
            />
          </View>
          <View style={[styles.balance, { left: u(24), right: u(24), top: u(158.5) }]}>
            <View style={styles.figures}>
              <Text variant="caption" color={colors.contentSecondary}>
                {walletCopy.balanceLabel}
              </Text>
              <View style={styles.figure}>
                <Text variant="displayBalance" color={colors.contentPrimary}>
                  {balance.toLocaleString("en-US")}
                </Text>
                <Text variant="displayCurrency" uppercase color={colors.brand}>
                  {walletCurrency}
                </Text>
              </View>
            </View>
            <Button
              variant="primary"
              size="m"
              icon={Plus}
              label={walletCopy.topUpCta}
              onPress={() => setOpen(true)}
            />
          </View>
        </View>

        <View style={styles.blurb}>
          <Text variant="titleBody" uppercase>
            {walletCopy.cardTitle}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {walletCopy.cardBody}
          </Text>
        </View>

        {/* Apple's own badge, drawn to Apple's own measurements. It does
            nothing yet: there is no pass to add. */}
        <View style={styles.appleWallet}>
          <Image
            source={image("/assets/apple-wallet-mark.png")}
            style={styles.appleMark}
            contentFit="contain"
          />
          <Text variant="body" color={colors.white}>
            {walletCopy.appleWallet}
          </Text>
        </View>

        <View style={styles.blurb}>
          <Text variant="titleBody" uppercase>
            {walletCopy.transactionsTitle}
          </Text>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {walletCopy.transactionsBody}
          </Text>
        </View>

        {ledger.length === 0 ? (
          <EmptyState
            art="/assets/empty-transactions.png"
            width={152}
            height={101}
            title={walletCopy.empty}
            style={styles.nothing}
          />
        ) : (
          days.map(([heading, entries]) => (
            <View key={heading}>
              <Text variant="bodyBold" color={colors.contentSecondary}>
                {heading}
              </Text>
              {entries.map((tx) => (
                <View key={tx.id}>
                  <ListRow
                    icon={tx.kind === "topup" ? TxIn : TxOut}
                    label={tx.label}
                    sub={tx.time}
                    trailing={
                      <Text
                        variant="bodyBold"
                        color={
                          tx.amount > 0 ? colors.positive : colors.contentPrimary
                        }
                      >
                        {formatAmount(tx.amount)}
                      </Text>
                    }
                  />
                  {/* The detail is the answer to "what was that?", so it is one
                      tap away on the row rather than on a screen of its own. */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: expanded === tx.id }}
                    onPress={() => setExpanded(expanded === tx.id ? null : tx.id)}
                  >
                    <Text
                      variant="bodyS"
                      color={colors.contentSecondary}
                      style={styles.detail}
                    >
                      {expanded === tx.id ? tx.detail : "Details"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <CardZoom
        open={taken !== null}
        card={taken?.card ?? null}
        folder={taken?.folder ?? null}
        onClose={() => setTaken(null)}
      />

      <TopUpSheet
        open={open}
        balance={balance}
        onClose={() => setOpen(false)}
        onTopUp={(amount) =>
          setExtra((current) => [
            {
              id: `tx-${Date.now()}`,
              kind: "topup",
              label: walletCopy.topUp.title,
              time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
              detail: walletCopy.topUp.doneBody(`${amount} ${walletCurrency}`),
              amount,
              dayOffset: 0,
            },
            ...current,
          ])
        }
      />
    </Page>
  );
}

/** Top up, from Figma 2196:10582, 2196:11179 and 2196:12115. */
function TopUpSheet({
  open,
  balance,
  onClose,
  onTopUp,
}: {
  open: boolean;
  balance: number;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}) {
  const copy = walletCopy.topUp;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [done, setDone] = useState(false);

  const value = Number(amount.replace(/[^\d]/g, "")) || 0;
  const enough = value >= copy.minimum;

  const close = () => {
    onClose();
    setDone(false);
    setAmount("");
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title={copy.title}
      subtitle={done ? undefined : copy.balance(`${balance} ${walletCurrency}`)}
      closeLabel={copy.close}
      footer={
        done ? (
          <Button variant="primary" label={copy.done} onPress={close} />
        ) : (
          <Button
            variant="primary"
            label={copy.submit}
            disabled={!enough}
            onPress={() => {
              onTopUp(value);
              setDone(true);
            }}
          />
        )
      }
    >
      {done ? (
        <>
          <Text variant="title" uppercase>
            {copy.doneTitle}
          </Text>
          <Text variant="body" color={colors.contentSecondary}>
            {copy.doneBody(`${value} ${walletCurrency}`)}
          </Text>
        </>
      ) : (
        <>
          <Field
            label={copy.amount}
            value={amount}
            onChange={setAmount}
            keyboardType="number-pad"
            error={value > 0 && !enough ? copy.minimumHint(`${copy.minimum} ${walletCurrency}`) : undefined}
            trailing={
              amount.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.clear}
                  onPress={() => setAmount("")}
                >
                  <Clear width={20} height={20} />
                </Pressable>
              ) : undefined
            }
          />

          <View style={styles.quick}>
            {copy.quick.map((preset) => (
              <Chip
                key={preset}
                label={copy.quickLabel(`${preset} ${walletCurrency}`)}
                selected={value === preset}
                onPress={() => setAmount(String(preset))}
              />
            ))}
          </View>

          <Text variant="bodySBold" color={colors.contentSecondary}>
            {copy.payWith}
          </Text>
          {copy.methods.map((item) => {
            const Mark = icon(item.icon);
            return (
              <Option
                key={item.id}
                label={item.label}
                selected={method === item.id}
                onPress={() => setMethod(item.id)}
                icon={Mark ? <Mark width={24} height={24} /> : undefined}
              />
            );
          })}
        </>
      )}
    </Sheet>
  );
}

/** "Today" / "Yesterday" / "9 days ago", in the order the ledger is written. */
function groupByDay(ledger: WalletTransaction[]) {
  const groups = new Map<string, WalletTransaction[]>();
  for (const tx of ledger) {
    const heading =
      tx.dayOffset === 0
        ? "Today"
        : tx.dayOffset === 1
          ? "Yesterday"
          : new Date(Date.now() - tx.dayOffset * 86_400_000).toLocaleDateString(
              "en-GB",
              { day: "numeric", month: "long" },
            );
    groups.set(heading, [...(groups.get(heading) ?? []), tx]);
  }
  return [...groups.entries()];
}

const styles = StyleSheet.create({
  /* The same figures Bookings uses, so the two tabs open identically. */
  body: { paddingHorizontal: gutter, gap: space.l },
  /* With nothing in it, the page centres that nothing in what is left. */
  empty: { flexGrow: 1 },
  card: {
    gap: space.m,
    padding: space.xl,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDimmed,
  },
  /* The pocket, and the live parts that sit on it. */
  wallet: { width: "100%" },
  balance: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: space.xl,
  },
  figures: { flex: 1, minWidth: 0, gap: space.xs },
  figure: { flexDirection: "row", alignItems: "flex-end", gap: space.xs },

  blurb: { gap: space.xs },
  /* Apple draws this badge to its own measurements, not ours — including the
     one radius in this app that is neither square nor a circle. */
  appleWallet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 7.5,
    backgroundColor: "#000000",
    borderWidth: 0.67,
    borderColor: "#a6a6a6",
    borderRadius: 7,
  },
  appleMark: { width: 37, height: 27 },
  nothing: { minHeight: 280 },
  detail: { paddingBottom: space.m },
  quick: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },
});
