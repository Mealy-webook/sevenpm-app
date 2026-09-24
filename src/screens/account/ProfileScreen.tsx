import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { NavBar } from "../../components/Screen";
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
    <View style={styles.page}>
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
          <View key={section.id} style={styles.section}>
            <Text variant="titleBody" uppercase color={colors.contentPrimary}>
              {section.title}
            </Text>
            {section.fields.map((field, index) => (
              <View
                key={field.id}
                style={[
                  styles.row,
                  /* The comp rules every row but the last of its section. */
                  index < section.fields.length - 1 && styles.ruled,
                ]}
              >
                <View style={styles.rowBody}>
                  <Text variant="body" color={colors.contentPrimary}>
                    {field.label}
                  </Text>
                  <Text variant="bodyS" color={colors.contentSecondary} numberOfLines={1}>
                    {field.value ?? profileCopy.emptyValue}
                  </Text>
                </View>
                {field.action && (
                  <Button label={field.action} size="s" onPress={() => {}} />
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Its own bordered block, as the comp gives it. */}
        <View style={styles.section}>
          <Button
            label={profileCopy.deleteCta}
            tone="destructive"
            onPress={() => setDeleting(true)}
          />
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  /* The page sits on surface-base; only the title band is bg-secondary. */
  page: { flex: 1, backgroundColor: colors.surfaceBase },
  header: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: gutter,
    paddingVertical: space.xl,
  },
  body: { paddingBottom: space.section },
  /* Full width, hairline on all four sides, no fill. */
  section: {
    gap: space.s,
    paddingHorizontal: gutter,
    paddingVertical: space.xl,
    borderWidth: 1,
    borderColor: colors.borderDimmed,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.s, paddingVertical: space.m },
  ruled: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.overlay10,
  },
  rowBody: { flex: 1, minWidth: 0 },
});
