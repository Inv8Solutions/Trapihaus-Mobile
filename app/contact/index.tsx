import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  bg: "#FFFFFF",
  text: "#11181C",
  muted: "#8B96A3",
  primary: "#357CCB",
};

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { id, hostName } = useLocalSearchParams<{
    id?: string;
    hostName?: string;
  }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSend() {
    // placeholder behaviour — replace with real API/send logic
    Alert.alert("Message sent", "Your message was sent to the host.");
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Contact</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          {hostName ? `Contact ${hostName}` : "Contact the host"}
        </Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Full name"
        />

        <Text style={styles.label}>Your email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={[styles.input, styles.textarea]}
          placeholder="Write a short message to the host"
          multiline
        />

        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  backButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  subtitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 12,
  },
  label: { fontSize: 12, fontWeight: "900", color: COLORS.text, marginTop: 12 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#EEF1F4",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  textarea: { minHeight: 100, textAlignVertical: "top" as const },
  sendButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  pressed: { opacity: 0.85 },
});
