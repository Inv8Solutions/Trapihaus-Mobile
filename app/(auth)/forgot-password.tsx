import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { sendPasswordReset } from "@/constants/firebase";
import { Colors } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const isValid = useMemo(() => email.trim().length > 0, [email]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors.light.background }]}
    >
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
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </Pressable>

          <Text style={[styles.title, { color: Colors.light.text }]}>
            Forgot password
          </Text>
          <Text style={[styles.subtitle, { color: Colors.light.icon }]}>
            Enter your email and we&apos;ll send a reset link.
          </Text>

          <View style={styles.form}>
            <AuthTextInput
              leftIcon="mail-outline"
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="done"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send reset link"
              disabled={!isValid || isSending}
              onPress={async () => {
                setStatusMessage(null);
                setErrorMessage(null);
                setIsSending(true);
                try {
                  await sendPasswordReset(email.trim());
                  setStatusMessage(
                    "If an account exists, we'll send a reset link to that email. If you don't receive an email, please check your spam folder or try again later.",
                  );
                } catch (err: any) {
                  console.error("sendPasswordResetEmail error", err);
                  const code = err?.code ?? "";
                  if (code === "auth/invalid-email")
                    setErrorMessage("Please enter a valid email address.");
                  else if (code === "auth/user-not-found")
                    setErrorMessage("No account found for that email.");
                  else
                    setErrorMessage(
                      "Failed to send reset link. Please try again later.",
                    );
                } finally {
                  setIsSending(false);
                }
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                (!isValid || isSending) && styles.primaryButtonDisabled,
                pressed && isValid && styles.primaryButtonPressed,
                { backgroundColor: Colors.light.tint },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSending ? "Sending…" : "Send reset link"}
              </Text>
            </Pressable>

            {statusMessage ? (
              <Text style={styles.statusText}>{statusMessage}</Text>
            ) : null}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 20,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 18,
  },
  form: {
    gap: 14,
  },
  primaryButton: {
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonPressed: { opacity: 0.85 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  statusText: {
    marginTop: 10,
    color: Colors.light.icon,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#D93025",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
