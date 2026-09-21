import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Clear from "../../icons/ic-clear-20.svg";
import TxIn from "../../icons/ic-tx-in.svg";
import TxOut from "../../icons/ic-tx-out.svg";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { ListRow } from "../../components/ListRow";
import { NavBar, Page } from "../../components/Screen";
import { Field, Sheet } from "../../components/Sheet";
import { Option } from "../booking/BookingSheets";
import { icon } from "../../icons";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
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
  const navigation = useNavigation();
  const [extra, setExtra] = useState<WalletTransaction[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const ledger = [...extra, ...walletTransactions];
  /* Derived, never stored — same rule the data file follows. */
  const balance = ledger.reduce((total, tx) => total + tx.amount, 0);

  const days = groupByDay(ledger);

  return (
    <Page>
      {/* Wallet is both a tab and a push from the account list, so the back
          control appears only when there is something to go back to. */}
      <NavBar
        title={walletCopy.title}
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text variant="bodyS" color={colors.contentSecondary}>
            {walletCopy.balanceLabel}
          </Text>
          <View style={styles.figure}>
            <Text variant="displayL" color={colors.white}>
              {balance.toLocaleString("en-US")}
            </Text>
            <Text variant="displayM" uppercase color={colors.brand}>
              {walletCurrency}
            </Text>
          </View>
          <Button
            variant="primary"
            label={walletCopy.topUpCta}
            onPress={() => setOpen(true)}
          />
        </View>

        <Text variant="sectionTitle" uppercase>
          {walletCopy.transactionsTitle}
        </Text>

        {ledger.length === 0 ? (
          <Text variant="bodyBold" color={colors.contentSecondary}>
            {walletCopy.empty}
          </Text>
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
  body: { padding: gutter, paddingBottom: space.section, gap: space.l },
  card: {
    gap: space.m,
    padding: space.xl,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDimmed,
  },
  figure: { flexDirection: "row", alignItems: "flex-end", gap: space.s },
  detail: { paddingBottom: space.m },
  quick: { flexDirection: "row", gap: space.s, flexWrap: "wrap" },
});
