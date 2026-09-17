import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../components/Button";
import { Confirm } from "../../components/Confirm";
import { NavBar, Page } from "../../components/Screen";
import { Text } from "../../theme/Text";
import { colors, gutter, space } from "../../theme/tokens";
import { profileCopy, profileSections } from "../../data/account";

/**
 * Profile, from Figma 2173:26214: three cards of rows, each row a label, what
 * is on file, and the one thing you can do about it.
 *
 * A field with no value reads "Not provided" and offers "Add" rather than
 * "Edit" — that is how the comp distinguishes a blank you have never filled in
 * from one you could change. A row with no action is read-only and says so by
 * having no button, not by having a disabled one.
 */
export function ProfileScreen() {
  const navigation = useNavigation();
  const [deleting, setDeleting] = useState(false);

  return (
    <Page>
      <NavBar title={profileCopy.title} onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="body" color={colors.contentSecondary}>
          {profileCopy.description}
        </Text>

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
