import { useRouter } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Help Center</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.paragraph}>
          Find answers to common questions or contact support for assistance.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FB" },
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#E6EEF8" },
  backBtn: { marginBottom: 8 },
  backText: { color: "#1070C9", fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "900" },
  container: { padding: 16 },
  paragraph: { color: "#11181C", lineHeight: 20 },
});
