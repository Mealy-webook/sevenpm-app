import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Confirm } from "../components/Confirm";
import { NavBar, Page } from "../components/Screen";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, displaySize, gutter, space, type } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { useResale } from "../resale";
import { resaleCopy } from "../data/resale";

/**
 * One resale ticket, and the decision to take it.
 *
 * The list deliberately does not sell anything: a resale ticket is a specific
 * seat from a specific person at a price they chose, and none of that fits in
 * a row. So the row opens this, which says all of it at once — whose it is,
 * which night, which gate, what it cost new and what it costs now — and puts
 * the one irreversible control at the foot of the screen behind a confirm.
 *
 * The artwork runs across the head the way it does on the ticket itself, so
 * what you are about to buy looks like what you will end up holding.
 *
 * Booking takes the listing off the market and nothing more. There is no
 * payment service behind this build, and a screen that produced a receipt
 * would be inventing one.
 */
export function ResaleListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { params } = useRoute<RouteProp<RootParamList, "ResaleListing">>();
  const { all, taken, take } = useResale();
  const [asking, setAsking] = useState(false);

  const listing = all.find((item) => item.id === params.id);

  if (!listing) {
    return (
      <Page>
        <NavBar onBack={navigation.goBack} />
        <View style={styles.gone}>
          <Text variant="body" color={colors.contentSecondary}>
            This listing is no longer up.
          </Text>
        </View>
      </Page>
    );
  }

  const starts = new Date(listing.startsAt);
  const day = starts.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = starts.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const under = listing.faceValue - listing.price;
  const gone = taken(listing.id);

  return (
    <Page>
      <NavBar onBack={navigation.goBack} floating />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.art}>
          <Image
            source={image(listing.image)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
            transition={240}
          />
          <LinearGradient
            colors={["rgba(11,11,14,0.25)", "rgba(11,11,14,0.95)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.artText}>
            <Text
              variant="displayCard"
              uppercase
              color={colors.white}
              numberOfLines={2}
              style={displaySize(type.displayCard, 390)}
            >
              {listing.eventName}
            </Text>
            <Text variant="bodyBold" color={colors.white}>
              {day} · {time}
            </Text>
          </View>
        </View>

        <View style={styles.sheet}>
          {/* What it costs, and what it cost new — the one comparison anybody
              buying second hand is actually making. */}
          <View style={styles.priceRow}>
            <Text variant="displayCurrency" color={colors.brand}>
              {resaleCopy.price(listing.price)}
            </Text>
            <View style={styles.priceAside}>
              <Text variant="bodyS" color={colors.contentSecondary}>
                {resaleCopy.faceValue(resaleCopy.price(listing.faceValue))}
              </Text>
              {under > 0 && (
                <Text variant="bodySBold" color={colors.lime}>
                  {resaleCopy.under(resaleCopy.price(under))}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.facts}>
            <Fact label={resaleCopy.seller} value={listing.seller} />
            <Fact label={resaleCopy.tier} value={listing.tier} />
            <Fact label={resaleCopy.gate} value={listing.gate} />
            <Fact label={resaleCopy.entry} value={listing.entry} />
          </View>

          <View style={styles.venue}>
            <Text variant="caption" color={colors.contentSecondary}>
              {resaleCopy.venue}
            </Text>
            <Text variant="body">{listing.venue}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, space.l) }]}>
        <LinearGradient
          colors={["rgba(11,11,14,0)", colors.bgPrimary]}
          locations={[0, 0.4]}
          style={styles.footShade}
          pointerEvents="none"
        />
        <Button
          variant="brand"
          label={gone ? resaleCopy.taken : resaleCopy.book}
          disabled={gone}
          onPress={() => setAsking(true)}
        />
      </View>

      <Confirm
        open={asking}
        title={resaleCopy.confirmTitle}
        body={resaleCopy.confirmBody(resaleCopy.price(listing.price))}
        cancel={resaleCopy.confirmCancel}
        confirm={resaleCopy.confirmBook}
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false);
          take(listing.id);
          navigation.goBack();
        }}
      />
    </Page>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text variant="caption" color={colors.contentSecondary}>
        {label}
      </Text>
      <Text variant="bodyBold">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 140 },
  gone: { padding: gutter },

  art: { height: 280, justifyContent: "flex-end" },
  artText: { padding: gutter, gap: space.xs },

  sheet: { padding: gutter, gap: space.xl },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: space.m },
  priceAside: { flex: 1, minWidth: 0, alignItems: "flex-end", gap: 2 },

  facts: { flexDirection: "row", flexWrap: "wrap" },
  fact: { width: "50%", paddingVertical: space.s, gap: 2 },
  venue: { gap: 2 },

  foot: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: gutter,
    paddingTop: space.l,
  },
  footShade: { ...StyleSheet.absoluteFill, top: -space.section },
});
