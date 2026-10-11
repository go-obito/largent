import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Largent</Text>
      <Text style={styles.description}>Your personal finance tracker</Text>
      <Link href="/onboarding" style={styles.link}>
        View onboarding
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 32, color: "#0B1320" },
  description: {
    marginTop: 8,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#64748B",
  },
  link: {
    marginTop: 24,
    color: "#0F5D3B",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
