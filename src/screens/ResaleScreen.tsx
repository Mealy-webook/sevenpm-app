import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { EmptyState } from "../components/EmptyState";
import { SignedOut } from "../components/SignedOut";
import { Tag } from "../components/Tag";
import { Tap } from "../components/Tap";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, gutter, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { TAB_BAR_CLEARANCE } from "../navigation/TabBar";
import { useTabBarScroll } from "../navigation/tabBarScroll";
import { useSession } from "../session";
import { useResale } from "../resale";
import { signedOutCopy } from "../data/session";
import {
  myResaleListings,
  resaleCopy,
  type MyListing,
  type ResaleListing,
  type ResaleStatus,
} from "../data/resale";

/**
 * Resale, built to the Wallet's shape.
 *
 * No comp draws this one. The Wallet is the right thing to borrow from
 * because the two screens do the same kind of job — a page about value that
 * is yours, told as a heading, a short line saying what the section is, and
 * then a ledger of rows. So this opens the same way and reads at the same
 * pitch, and somebody who has used one has used both.
 *
 * Two sections, because there are two relationships you can have with a
 * resold ticket. **Available now** is other people's, and each row goes into
 * the ticket itself rather than buying from the list — a resale ticket is a
 * specific seat from a specific person, and nobody should part with money
 * from a row in a list. **My listings** is yours, and the only thing it has
 * to answer is where each one has got to, so the status carries the row.
 *
 * A booked listing leaves the first section rather than greying out in it.
 * The list is what is still for sale.
 */
export function ResaleScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const tabScroll = useTabBarScroll();
  const { signedIn } = useSession();
  const { open: offered } = useResale();

  const body = (
    <>
      <Text
        variant="displayName"
        uppercase
        color={colors.white}
        numberOfLines={1}
        style={displaySize(type.displayName, width)}
      >
        {resaleCopy.title}
      </Text>

      {!signedIn ? (
        <SignedOut
          art="/assets/empty-bookings.png"
          width={138}
          height={94}
          title={signedOutCopy.resale}
          style={styles.nothing}
        />
      ) : (
        <>
          <Section title={resaleCopy.availableTitle} body={resaleCopy.availableBody}>
            {offered.length === 0 ? (
              <EmptyState
                art="/assets/empty-bookings.png"
                width={138}
                height={94}
                title={resaleCopy.emptyAvailable}
                style={styles.small}
              />
            ) : (
              offered.map((listing, index) => (
                <View key={listing.id} style={styles.item}>
                  {index > 0 && <View style={styles.divider} />}
                  <OfferRow
                    listing={listing}
                    onOpen={() =>
                      navigation.navigate("ResaleListing", { id: listing.id })
                    }
                  />
                </View>
              ))
            )}
          </Section>

          <Section title={resaleCopy.mineTitle} body={resaleCopy.mineBody}>
            {myResaleListings.length === 0 ? (
              <EmptyState
                art="/assets/empty-bookings.png"
                width={138}
                height={94}
                title={resaleCopy.emptyMine}
                style={styles.small}
              />
            ) : (
              myResaleListings.map((listing, index) => (
                <View key={listing.id} style={styles.item}>
                  {index > 0 && <View style={styles.divider} />}
                  <MineRow listing={listing} />
                </View>
              ))
            )}
          </Section>
        </>
      )}
    </>
  );

  return (
    <View style={styles.page}>
      <ScrollView
        {...tabScroll}
        contentContainerStyle={[
          styles.body,
          !signedIn && styles.grow,
          { paddingTop: insets.top + gutter, paddingBottom: TAB_BAR_CLEARANCE },
        ]}
      >
        {body}
      </ScrollView>
    </View>
  );
}

/** A heading, the line that says what the section is, and its rows. */
function Section({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text variant="titleSection" uppercase color={colors.contentPrimary}>
          {title}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary}>
          {body}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** Somebody else's ticket: what it is, who has it, and what they want. */
function OfferRow({
  listing,
  onOpen,
}: {
  listing: ResaleListing;
  onOpen: () => void;
}) {
  const under = listing.faceValue - listing.price;

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={`${listing.eventName}, ${listing.tier}, ${resaleCopy.price(listing.price)}`}
      onPress={onOpen}
      scale={0.99}
      style={styles.row}
    >
      <Image
        source={image(listing.image)}
        style={styles.thumb}
        contentFit="cover"
        transition={300}
      />

      <View style={styles.rowBody}>
        <Text variant="bodyBold" color={colors.white} numberOfLines={1}>
          {listing.eventName}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
          {listing.tier}
        </Text>
        <Text variant="caption" color={colors.contentSecondary} numberOfLines={1}>
          {listing.seller} · {listing.listed}
        </Text>
      </View>

      <View style={styles.rowEnd}>
        <Text variant="bodyLBold" color={colors.brand}>
          {resaleCopy.price(listing.price)}
        </Text>
        {under > 0 && (
          <Text variant="caption2" color={colors.contentSecondary}>
            {resaleCopy.under(resaleCopy.price(under))}
          </Text>
        )}
      </View>
    </Tap>
  );
}

/** One of yours: what it is, what you asked, and where it has got to. */
function MineRow({ listing }: { listing: MyListing }) {
  return (
    <View style={styles.row}>
      <Image
        source={image(listing.image)}
        style={styles.thumb}
        contentFit="cover"
        transition={300}
      />

      <View style={styles.rowBody}>
        <Text variant="bodyBold" color={colors.white} numberOfLines={1}>
          {listing.eventName}
        </Text>
        <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
          {listing.tier}
        </Text>
        <Text variant="caption" color={colors.contentSecondary} numberOfLines={2}>
          {listing.detail}
        </Text>
      </View>

      <View style={styles.rowEnd}>
        <Text variant="bodyLBold" color={colors.contentPrimary}>
          {resaleCopy.price(listing.price)}
        </Text>
        <Status status={listing.status} />
      </View>
    </View>
  );
}

/**
 * The state of a listing.
 *
 * `Tag` is the system's status pill (454:31838) and it already has the two
 * accents this needs — lime for settled, orange for something still waiting
 * on somebody. The word is always there beside the colour, because a colour
 * on its own is not a state anybody can read.
 */
function Status({ status }: { status: ResaleStatus }) {
  return <Tag label={resaleCopy.status[status]} tone={STATUS_TONE[status]} />;
}

const STATUS_TONE: Record<ResaleStatus, "default" | "lime" | "orange"> = {
  listed: "default",
  pending: "orange",
  sold: "lime",
  withdrawn: "default",
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgPrimary },
  /* The Wallet's figures, so the two tabs open identically. */
  body: { paddingHorizontal: gutter, gap: space.l },
  grow: { flexGrow: 1 },
  nothing: { minHeight: 320 },
  small: { minHeight: 200 },

  section: { gap: space.l, paddingTop: space.s },
  sectionHead: { gap: space.xs },

  item: { gap: space.l },
  divider: { height: 1, backgroundColor: colors.overlay5 },

  row: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 44 },
  thumb: { width: 72, height: 72, backgroundColor: colors.bgTertiary },
  rowBody: { flex: 1, minWidth: 0, gap: 2 },
  rowEnd: { alignItems: "flex-end", gap: space.xs },

});
