import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AlertIcon from "../../icons/ic-alert-24.svg";
import ContactsIcon from "../../icons/ic-contacts-24.svg";
import PasteIcon from "../../icons/ic-paste-20.svg";
import { NavBar } from "../../components/Screen";
import { SlideToConfirm } from "../../components/SlideToConfirm";
import { Tap } from "../../components/Tap";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import type { RootParamList } from "../../navigation/RootNavigator";
import { bookings } from "../../data/account";
import { initials, recentRecipients, sendCopy, type Recipient } from "../../data/send";

/**
 * Sending a ticket on, from Figma 161:65688.
 *
 * The screen asks for one thing — who — and offers three ways to answer it:
 * somebody you have sent to before, an address you type, or the address book.
 * The recents rail is first because it is the answer most of the time.
 *
 * **It ends in a slide rather than a tap.** Sending a ticket away is not
 * reversible from inside the app, and 162:81483 uses the Slide to Confirm
 * dock for exactly that reason.
 *
 * The warning above it is the comp's, verbatim. It is the one thing on this
 * screen that is not about the send: it is about what webook will do if the
 * send is really a sale.
 */
export function SendTicketScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "SendTicket">>();

  const booking = bookings.find((item) => item.id === params.bookingId);
  const ticket = booking?.tickets.find((item) => item.id === params.ticketId);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [recents, setRecents] = useState<Recipient[]>(recentRecipients);

  const ready = email.trim().length > 0 && name.trim().length > 0;

  const choose = (person: Recipient) => {
    setEmail(person.email);
    setName(person.name);
  };

  const send = () => {
    if (!booking || !ticket) return;
    navigation.replace("TicketSent", {
      bookingId: booking.id,
      ticketId: ticket.id,
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <View style={styles.page}>
      <NavBar onBack={navigation.goBack} />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text
            variant="displayStep"
            uppercase
            color={colors.white}
            style={displaySize(type.displayStep, width)}
          >
            {sendCopy.title(1)}
          </Text>

          {recents.length > 0 && (
            <View style={styles.recents}>
              <View style={styles.recentsHead}>
                <Text variant="bodyBold" color={colors.contentPrimary} style={styles.grow}>
                  {sendCopy.recents}
                </Text>
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={sendCopy.clear}
                  onPress={() => setRecents([])}
                >
                  <Text variant="bodySBold" color={colors.contentPrimary}>
                    {sendCopy.clear}
                  </Text>
                </Tap>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}
              >
                {recents.map((person) => (
                  <Tap
                    key={person.id}
                    accessibilityRole="button"
                    accessibilityLabel={person.name}
                    onPress={() => choose(person)}
                    scale={0.97}
                    style={styles.chip}
                  >
                    <View style={styles.avatar}>
                      <Text variant="titleSection" color={colors.contentPrimary}>
                        {initials(person.name)}
                      </Text>
                    </View>
                    <Text
                      variant="bodyS"
                      color={colors.contentPrimary}
                      numberOfLines={2}
                      style={styles.chipName}
                    >
                      {person.name}
                    </Text>
                  </Tap>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.fields}>
            <View style={styles.emailRow}>
              <View style={styles.field}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={sendCopy.email}
                  placeholderTextColor={colors.contentPrimary}
                  accessibilityLabel={sendCopy.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  selectionColor={colors.brand}
                  style={styles.input}
                />
                {/* The comp's paste control. There is nothing to read a
                    clipboard into that this build could verify, so it is drawn
                    and does not take presses. */}
                <View style={styles.fieldTrailing}>
                  <PasteIcon width={20} height={20} />
                </View>
              </View>

              {/* Likewise the address book: no contacts permission is asked
                  for, so the control is drawn rather than wired. */}
              <View style={styles.contacts}>
                <ContactsIcon width={24} height={24} />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={sendCopy.fullName}
                placeholderTextColor={colors.contentPrimary}
                accessibilityLabel={sendCopy.fullName}
                selectionColor={colors.brand}
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.alert}>
            <View style={styles.alertIcon}>
              <AlertIcon width={24} height={24} />
            </View>
            <View style={styles.alertBody}>
              <Text variant="bodyS" color={colors.contentPrimary}>
                {sendCopy.warning}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, space.m) }]}>
        <View style={styles.terms}>
          <Text variant="body" color={colors.contentSecondary} style={styles.centred}>
            {sendCopy.terms}
            <Text variant="bodyS" color={colors.contentPrimary} style={styles.link}>
              {sendCopy.termsLink}
            </Text>
          </Text>
        </View>
        <SlideToConfirm
          label={sendCopy.slide}
          disabled={!ready}
          onConfirm={send}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surfaceBase },
  body: { paddingBottom: space.section },
  /* Every section on this screen: 20 across, 16 down, 24 between its parts. */
  section: {
    paddingHorizontal: gutter,
    paddingVertical: space.l,
    gap: space.xl,
  },

  recents: { gap: space.s },
  recentsHead: { flexDirection: "row", alignItems: "center", gap: space.s },
  grow: { flex: 1, minWidth: 0 },
  rail: { flexDirection: "row", gap: space.s },
  /* 80 wide, and the name may take two lines under the circle. */
  chip: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: space.m,
    backgroundColor: colors.bgSecondary,
  },
  /* Round, because a face is — one of the standing exceptions. */
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  chipName: { textAlign: "center", alignSelf: "stretch" },

  fields: { gap: space.l },
  emailRow: { flexDirection: "row", alignItems: "flex-start", gap: space.s },
  field: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    paddingLeft: space.l,
    paddingRight: space.s,
    paddingVertical: space.m,
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 36,
    color: colors.contentPrimary,
    fontFamily: type.bodyL.font,
    fontSize: type.bodyL.size,
    letterSpacing: type.bodyL.tracking,
  },
  fieldTrailing: { padding: space.xs },
  contacts: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.overlay10,
  },

  /* 162:81454 lays 50% black over #321908 — a burnt amber that reads as a
     warning without becoming an error. */
  alert: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#1c110a" },
  alertIcon: { paddingLeft: space.l, paddingVertical: space.l },
  alertBody: { flex: 1, minWidth: 0, paddingHorizontal: space.l, paddingVertical: space.s },

  dock: {
    paddingHorizontal: gutter,
    paddingTop: space.s,
    gap: space.s,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  terms: { paddingVertical: space.s },
  centred: { textAlign: "center" },
  link: { textDecorationLine: "underline" },
});
