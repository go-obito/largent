import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary[600]} /></View>;
  }

  // Auth screens are only for signed-out users. Send authenticated users
  // directly to the protected app group instead of chaining through "/".
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.neutral[50] },
});
