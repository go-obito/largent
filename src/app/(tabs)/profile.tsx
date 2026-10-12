import { ScreenTitle, styles as ui } from "@/components/ui";
import { useBudgetStore } from "@/store/budgets";
import { useNeedsStore } from "@/store/needs";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const clearTransactions = useTransactionStore((state) => state.clear);
  const clearBudgets = useBudgetStore((state) => state.clear);
  const clearNeeds = useNeedsStore((state) => state.clear);
  const accountName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Largent account";
  const email = user?.primaryEmailAddress?.emailAddress;

  const clear = () =>
    Alert.alert("Clear local data?", "This permanently removes transactions, budgets, and prioritized needs stored on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear data", style: "destructive", onPress: () => { clearTransactions(); clearBudgets(); clearNeeds(); } },
    ]);

  const signOutUser = async () => {
    try {
      await signOut();
      router.replace("/onboarding");
    } catch {
      Alert.alert("Unable to sign out", "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle>Profile</ScreenTitle>
        <View style={ui.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{accountName.charAt(0).toUpperCase() || "L"}</Text>
            </View>
            <View style={styles.accountMeta}>
              <Text style={styles.name}>{accountName}</Text>
              {email ? <Text style={styles.email}>{email}</Text> : null}
            </View>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => void signOutUser()}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
        <Pressable style={styles.destructive} onPress={clear}>
          <Text style={styles.destructiveText}>Clear local data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { flexGrow: 1, padding: spacing[5], gap: spacing[3] },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  avatar: { width: 48, height: 48, borderRadius: radii.full, backgroundColor: colors.primary[50], alignItems: "center", justifyContent: "center" },
  avatarText: { ...typography.title3, color: colors.primary[600] },
  accountMeta: { flex: 1, minWidth: 0 },
  name: { ...typography.bodyMedium, color: colors.neutral[900], flexShrink: 1 },
  email: { ...typography.caption, color: colors.neutral[600], marginTop: spacing[1], flexShrink: 1 },
  button: { minHeight: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.neutral[200], alignItems: "center", justifyContent: "center", backgroundColor: colors.neutral.surface },
  buttonText: { ...typography.bodyMedium, color: colors.neutral[900] },
  destructive: { minHeight: 52, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.semantic.expense },
  destructiveText: { ...typography.bodyMedium, color: colors.neutral.surface },
});
