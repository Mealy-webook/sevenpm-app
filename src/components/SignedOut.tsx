import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { signedOutCopy } from "../data/session";
import { space } from "../theme/tokens";
import type { RootParamList } from "../navigation/RootNavigator";

/**
 * What a screen shows where an account's contents would be.
 *
 * It is the empty state the comps already draw — the same illustration, the
 * same one line of title type — with the one thing that would fill it
 * underneath. Signed out is a kind of empty, not a kind of error, so it says
 * so in the app's existing words for empty rather than in an alert's.
 */
export function SignedOut({
  art,
  width,
  height,
  title,
  style,
}: {
  art: string;
  width: number;
  height: number;
  title: string;
  style?: StyleProp<ViewStyle>;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

  return (
    <View style={[styles.wrap, style]}>
      <EmptyState art={art} width={width} height={height} title={title} />
      <View style={styles.action}>
        <Button
          variant="brand"
          label={signedOutCopy.signIn}
          onPress={() => navigation.navigate("SignIn")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center" },
  /* The button is a step below the line, not part of it. */
  action: { paddingTop: space.xl, paddingHorizontal: space.xl },
});
