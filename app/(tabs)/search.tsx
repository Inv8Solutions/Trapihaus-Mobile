import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Search</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#11181C" },
});
