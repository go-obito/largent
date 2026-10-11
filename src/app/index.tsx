import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { type Href, Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
	const { isLoaded, isSignedIn } = useAuth();

	if (!isLoaded) {
		return <View style={styles.loading}><ActivityIndicator color={colors.primary[600]} /></View>;
	}

	return <Redirect href={(isSignedIn ? "/(tabs)" : "/onboarding") as Href} />;
}

const styles = StyleSheet.create({
	loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.neutral[50] },
});
