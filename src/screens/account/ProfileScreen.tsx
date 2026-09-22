import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { NavBar, Page } from "../../components/Screen";
import { Text } from "../../theme/Text";
import { colors, displaySize, gutter, space, type } from "../../theme/tokens";
import { profileCopy, profileSections } from "../../data/account";

/**
 * Profile, from Figma 2173:26214: three cards of rows, each row a label, what
 * is on file, and the one thing you can do about it.
 *
 * A field with no value reads "Not provided" and offers "Add" rather than
 * "Edit" — that is how the comp distinguishes a blank you have never filled in
 * from one you could change. A row with no action is read-only and says so by
 * having no button, not by having a disabled one.
 *
 * 486:58839 restates the head of it: the page's name at display size over the
 * secondary ground rather than a word in the bar, and nothing between that and
 * the first section.
 */
export function ProfileScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [deleting, setDeleting] = useState(false);

  return (
    <Page>
      <NavBar onBack={navigation.goBack} />

      <View style={styles.header}>
        <Text
          variant="displayScreen"
          uppercase
          color={colors.white}
          numberOfLines={1}
          style={displaySize(type.displayScreen, width)}
        >
          {profileCopy.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {profileSections.map((section) => (
          <View key={section.id} style={styles.card}>
            <Text variant="titleBody" uppercase>
              {section.title}
            </Text>
            {section.fields.map((field) => (
              <View key={field.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text variant="bodyS" color={colors.contentSecondary}>
                    {field.label}
                  </Text>
                  <Text
                    variant="bodyBold"
                    color={
                      field.value ? colors.contentPrimary : colors.contentSecondary
                    }
                    numberOfLines={1}
                  >
                    {field.value ?? profileCopy.emptyValue}
                  </Text>
                </View>
                {field.action && <Button label={field.action} />}
              </View>
            ))}
          </View>
        ))}

        <Button
          label={profileCopy.deleteCta}
          tone="destructive"
          onPress={() => setDeleting(true)}
          style={styles.delete}
        />
      </ScrollView>

      <Confirm
        open={deleting}
        title={profileCopy.deleteCta}
        body="This build has no account behind it, so nothing would be deleted."
        cancel="Cancel"
        confirm={profileCopy.deleteCta}
        tone="destructive"
        onCancel={() => setDeleting(false)}
        onConfirm={() => setDeleting(false)}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  /* The comp bands the title over the secondary ground. */
  header: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: gutter,
    paddingBottom: gutter,
  },
  body: { padding: gutter, paddingBottom: space.section, gap: space.l },
  card: {
    gap: space.l,
    padding: space.l,
    backgroundColor: colors.bgSecondary,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowBody: { flex: 1, minWidth: 0, gap: space.xs },
  delete: { alignSelf: "flex-start" },
});
