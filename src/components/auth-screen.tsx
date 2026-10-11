import { colors, fontFamily, radii, spacing, typography } from "@/theme";
import { useSSO } from "@clerk/expo";
import { useSignIn, useSignUp } from "@clerk/expo/legacy";
import { type Href, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
  import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Mode = "sign-up" | "sign-in";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<TextInput>(null);
  const verificationInProgress = useRef(false);
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);
  const title = mode === "sign-up" ? "Create your account" : "Welcome back";

  async function continueWithEmail() {
    if (!isValidEmail || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "sign-up") {
        if (!isSignUpLoaded) return;
        await signUp.create({ emailAddress: email.trim() });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        if (!isSignInLoaded) return;
        await signIn.create({ strategy: "email_code", identifier: email.trim() });
      }
      setCode("");
      setVisible(true);
      requestAnimationFrame(() => input.current?.focus());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setCode(next);
    setError("");
    if (next.length !== 6 || verificationInProgress.current) return;

    verificationInProgress.current = true;
    setIsSubmitting(true);
    try {
      if (mode === "sign-up") {
        if (!isSignUpLoaded) return;
        const result = await signUp.attemptEmailAddressVerification({ code: next });
        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("We couldn't complete sign-up with that code. Check it and try again.");
        }
        await setSignUpActive({ session: result.createdSessionId });
      } else {
        if (!isSignInLoaded) return;
        const result = await signIn.attemptFirstFactor({ strategy: "email_code", code: next });
        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("We couldn't complete sign-in with that code. Check it and try again.");
        }
        await setSignInActive({ session: result.createdSessionId });
      }
      setVisible(false);
      router.replace("/");
    } catch (verificationError) {
      setCode("");
      setError(errorMessage(verificationError));
    } finally {
      verificationInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setError("");
    setIsSubmitting(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
      if (!createdSessionId || !setActive) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }
      await setActive({ session: createdSessionId });
      router.replace("/");
    } catch (oauthError) {
      setError(errorMessage(oauthError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>
          {mode === "sign-up" ? "Start making confident money decisions." : "Sign in to continue to your finances."}
        </Text>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.neutral[400]}
          style={styles.input}
          editable={!isSubmitting}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.primary, (!isValidEmail || !isSubmitting && !(mode === "sign-up" ? isSignUpLoaded : isSignInLoaded)) && styles.disabled]}
          disabled={!isValidEmail || !(mode === "sign-up" ? isSignUpLoaded : isSignInLoaded) || isSubmitting}
          onPress={() => void continueWithEmail()}
          accessibilityRole="button"
        >
          {isSubmitting && !visible ? <ActivityIndicator color={colors.neutral.surface} /> : <Text style={styles.primaryLabel}>{mode === "sign-up" ? "Continue with email" : "Sign in with email"}</Text>}
        </TouchableOpacity>
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={styles.social} onPress={() => void continueWithGoogle()} disabled={isSubmitting} accessibilityRole="button">
          <Text style={styles.socialLabel}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>
          {mode === "sign-up" ? "Already have an account? " : "New to Largent? "}
          <Text style={styles.link} onPress={() => router.replace((mode === "sign-up" ? "/sign-in" : "/sign-up") as Href)}>
            {mode === "sign-up" ? "Sign in" : "Create an account"}
          </Text>
        </Text>
      </ScrollView>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <KeyboardAvoidingView style={styles.scrim} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView style={styles.sheetViewport} contentContainerStyle={[styles.sheet, { paddingBottom: Math.max(spacing[6], insets.bottom + spacing[3]) }]} keyboardShouldPersistTaps="handled">
            <Text style={styles.sheetTitle}>Check your email</Text>
            <Text style={styles.sheetBody}>We sent a 6-digit verification code to {email}.</Text>
            <TextInput
              ref={input}
              value={code}
              onChangeText={(value) => void verifyCode(value)}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              style={styles.codeInput}
              editable={!isSubmitting}
              accessibilityLabel="Six-digit verification code"
            />
            {isSubmitting && visible ? <ActivityIndicator color={colors.primary[600]} /> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Text style={styles.hint}>Enter the code to verify your email address.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { flexGrow: 1, padding: spacing[5], paddingTop: spacing[10] },
  back: { width: 44, height: 44, justifyContent: "center" },
  backText: { color: colors.neutral[900], fontSize: 36, fontFamily: fontFamily.regular },
  title: { ...typography.title1, color: colors.neutral[900], marginTop: spacing[8] },
  description: { ...typography.body, color: colors.neutral[600], marginTop: spacing[2], marginBottom: spacing[8] },
  label: { ...typography.caption, fontFamily: fontFamily.medium, color: colors.neutral[700], marginBottom: spacing[2] },
  input: { height: 52, borderRadius: radii.md, backgroundColor: colors.neutral[100], paddingHorizontal: spacing[4], color: colors.neutral[900], ...typography.body },
  primary: { height: 52, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[600], marginTop: spacing[5] },
  disabled: { backgroundColor: colors.primary[300] },
  primaryLabel: { ...typography.bodyMedium, fontFamily: fontFamily.semiBold, color: colors.neutral.surface },
  divider: { flexDirection: "row", gap: spacing[3], alignItems: "center", marginVertical: spacing[6] },
  line: { flex: 1, height: 1, backgroundColor: colors.neutral[200] },
  or: { ...typography.small, color: colors.neutral[500] },
  social: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.neutral[200], backgroundColor: colors.neutral.surface, alignItems: "center", justifyContent: "center" },
  socialLabel: { ...typography.bodyMedium, fontFamily: fontFamily.semiBold, color: colors.neutral[900] },
  footer: { ...typography.caption, color: colors.neutral[600], textAlign: "center", marginTop: spacing[6] },
  link: { color: colors.primary[600], fontFamily: fontFamily.semiBold },
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.4)" },
  sheetViewport: { maxHeight: "85%", backgroundColor: colors.neutral.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl },
  sheet: { padding: spacing[6], gap: spacing[3] },
  sheetTitle: { ...typography.title2, color: colors.neutral[900] },
  sheetBody: { ...typography.body, color: colors.neutral[600] },
  codeInput: { height: 56, borderRadius: radii.md, backgroundColor: colors.neutral[100], textAlign: "center", letterSpacing: 8, color: colors.neutral[900], ...typography.title2 },
  hint: { ...typography.caption, color: colors.neutral[500], textAlign: "center" },
  error: { ...typography.caption, color: colors.semantic.expense, marginTop: spacing[2] },
});