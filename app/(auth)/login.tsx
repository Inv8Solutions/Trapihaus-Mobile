import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { AuthTextInput } from "@/components/auth/auth-text-input";
import { SocialAuthRow } from "@/components/auth/social-auth-row";

const COLORS = {
  bg: "#FFFFFF",
  text: "#11181C",
  muted: "#8B96A3",
  link: "#357CCB",
  primary: "#357CCB",
  divider: "#E8ECF0",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
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

          <Text style={styles.title}>Login to your{`\n`}Account</Text>

          <View style={styles.form}>
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
              returnKeyType="done"
            />

            <View style={styles.forgotRow}>
              <Link href="/forgot-password" asChild>
                <Pressable accessibilityRole="button">
                  <Text style={styles.forgotText}>Forgot the password?</Text>
                </Pressable>
              </Link>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              disabled={!isValid}
              onPress={() => {
                // TODO: wire auth
                console.log("Sign in");
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                !isValid && styles.primaryButtonDisabled,
                pressed && isValid && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </Pressable>

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
              <Text style={styles.bottomText}>Don’t have an account? </Text>
              <Link href="/register" asChild>
                <Pressable accessibilityRole="button">
                  <Text style={styles.bottomLink}>Sign up</Text>
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
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -4,
    marginBottom: 8,
  },
  forgotText: {
    color: COLORS.link,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
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
