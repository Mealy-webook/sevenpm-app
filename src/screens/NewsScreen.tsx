import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Chip } from "../components/Chip";
import { NavBar, Page } from "../components/Screen";
import { image } from "../images";
import { Text } from "../theme/Text";
import { colors, gutter, space } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";
import { newsArticles, newsCategories, newsCopy } from "../data/news";

/**
 * The newsroom, behind Discover's "Load more".
 *
 * There is no comp for this one — the app Figma file stops at the three rows
 * on Discover — so it is built out of what those rows already establish: the
 * 106px tile, the date in the accent colour, the headline at 17. The category
 * chips are the web build's, which is where this list comes from.
 *
 * Discover shows three stories and the button said "Load more". Rather than
 * appending three more rows to a home screen that is already five sections
 * long, it opens the full list — which is what somebody pressing it wants,
 * and it means the home screen stays a summary of everything rather than
 * becoming the newsroom.
 */
export function NewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const [category, setCategory] = useState<string>(newsCategories[0]);

  const shown =
    category === "All"
      ? newsArticles
      : newsArticles.filter((article) => article.category === category);

  return (
    <Page>
      <NavBar title={newsCopy.title} onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="body" color={colors.contentSecondary}>
          {newsCopy.description}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {newsCategories.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>

        <View>
          {shown.map((article) => (
            <Pressable
              key={article.slug}
              accessibilityRole="button"
              accessibilityLabel={article.title}
              onPress={() => navigation.navigate("Article", { slug: article.slug })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Image
                source={image(article.image)}
                style={styles.tile}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.rowBody}>
                <Text variant="bodySBold" color={colors.brand}>
                  {article.dateLabel}
                </Text>
                <Text variant="bodyL" color={colors.white} numberOfLines={3}>
                  {article.title}
                </Text>
                <Text variant="bodyS" color={colors.contentSecondary}>
                  {article.readingTime}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}

/** One story. The body paragraphs are already in the data; this sets them. */
export function ArticleScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootParamList, "Article">>();
  const article = newsArticles.find((item) => item.slug === params.slug);

  if (!article) {
    return (
      <Page>
        <NavBar title={newsCopy.title} onBack={navigation.goBack} />
        <View style={styles.body}>
          <Text variant="body" color={colors.contentSecondary}>
            That story is no longer here.
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <NavBar floating onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.article}>
        <Image
          source={image(article.image)}
          style={styles.hero}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.articleBody}>
          <View style={styles.meta}>
            <Text variant="bodySBold" color={colors.brand}>
              {article.dateLabel}
            </Text>
            <Text variant="bodyS" color={colors.contentSecondary}>
              {article.category} · {article.readingTime}
            </Text>
          </View>

          <Text variant="title" color={colors.white}>
            {article.title}
          </Text>

          {/* The first paragraph is the lead, so it is set a size larger. */}
          {article.body.map((paragraph, index) => (
            <Text
              key={paragraph.slice(0, 32)}
              variant={index === 0 ? "bodyL" : "body"}
              color={index === 0 ? colors.contentPrimary : colors.contentSecondary}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  body: { padding: gutter, paddingBottom: space.section, gap: space.l },
  chips: { flexDirection: "row", gap: space.s, paddingRight: gutter },
  pressed: { opacity: 0.7 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
    paddingVertical: space.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  tile: { width: 106, height: 106, backgroundColor: "#27272a" },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },

  article: { paddingBottom: space.section },
  hero: { width: "100%", height: 260, backgroundColor: colors.bgSecondary },
  articleBody: { padding: gutter, gap: space.l },
  meta: { gap: space.xs },
});
