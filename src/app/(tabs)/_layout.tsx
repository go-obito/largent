import { CustomTabBar } from "@/components/tab-bar";
import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function TabLayout() {
	const { isLoaded, isSignedIn } = useAuth();

	if (!isLoaded) {
		return <View style={styles.loading}><ActivityIndicator color={colors.primary[600]} /></View>;
	}
	if (!isSignedIn) return <Redirect href="/onboarding" />;

	return (
		<Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
			<Tabs.Screen name="budgets" options={{ title: "Budgets" }} />
			<Tabs.Screen name="reports" options={{ title: "Reports" }} />
			<Tabs.Screen name="profile" options={{ title: "Profile" }} />
		</Tabs>
	);
}

const styles = StyleSheet.create({
	loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.neutral[50] },
});
