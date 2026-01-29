import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AuthTextInput } from "@/components/auth/auth-text-input";
import { SocialAuthRow } from "@/components/auth/social-auth-row";
import { useAuth } from "@/context/auth-context";

const COLORS = {
  bg: "#FFFFFF",
  text: "#11181C",
  muted: "#8B96A3",
  link: "#357CCB",
  primary: "#357CCB",
  divider: "#E8ECF0",
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithAdmin } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    const hasAll =
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0;
    return hasAll && password === confirmPassword;
  }, [confirmPassword, email, fullName, password]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 10 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <Text style={styles.title}>Create your{`\n`}Account</Text>

          <View style={styles.form}>
            <AuthTextInput
              leftIcon="person-outline"
              placeholder="Full Name"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              returnKeyType="next"
            />

            <AuthTextInput
              leftIcon="mail-outline"
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />

            <AuthTextInput
              leftIcon="lock-closed-outline"
              placeholder="Password"
              secure
              showVisibilityToggle
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
            />

            <AuthTextInput
              leftIcon="lock-closed-outline"
              placeholder="Confirm Password"
              secure
              showVisibilityToggle
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              returnKeyType="done"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign up"
              disabled={!isValid}
              onPress={async () => {
                setError(null);
                const ok = await signInWithAdmin(email, password);
                if (!ok) {
                  setError("Invalid credentials. Use admin / admin.");
                  return;
                }
                router.replace("/(tabs)");
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                !isValid && styles.primaryButtonDisabled,
                pressed && isValid && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Sign up</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialAuthRow
              onFacebook={() => console.log("Facebook")}
              onGoogle={() => console.log("Google")}
              onApple={() => console.log("Apple")}
            />

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable accessibilityRole="button">
                  <Text style={styles.bottomLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    color: COLORS.text,
    marginBottom: 22,
  },
  form: {
    gap: 14,
  },
  primaryButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 6,
    color: "#D93025",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  bottomLink: {
    color: COLORS.link,
    fontSize: 13,
    fontWeight: "800",
  },
});
