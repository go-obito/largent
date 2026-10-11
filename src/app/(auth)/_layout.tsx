import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack, usePathname } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  if (!isLoaded) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary[600]} /></View>;
  }

  if (isSignedIn && pathname !== "/onboarding") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.neutral[50] },
});