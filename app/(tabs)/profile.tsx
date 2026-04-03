import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/auth-context";

export default function ProfileScreen() {
  const { signOut, user } = useAuth() as any;

  const name = user?.displayName ?? "Juan Dela Cruz";
  const email = user?.email ?? "juan.delacruz@email.com";

  const stats = [
    { id: "bookings", label: "Bookings", value: 12 },
    { id: "reviews", label: "Reviews", value: 8 },
    { id: "rating", label: "Rating", value: "4.8" },
  ];

  const items = [
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage your notifications",
      icon: "notifications-outline",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Password, 2FA settings",
      icon: "lock-closed-outline",
    },
    {
      id: "payments",
      title: "Payment Methods",
      subtitle: "Manage cards and wallets",
      icon: "card-outline",
    },
    {
      id: "reviews",
      title: "Reviews",
      subtitle: "Your reviews and ratings",
      icon: "star-outline",
    },
    {
      id: "help",
      title: "Help Center",
      subtitle: "Get support",
      icon: "help-circle-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.avatarWrap}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.id} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.hostCard}>
          <View style={styles.hostBody}>
            <Text style={styles.hostTitle}>Become a Host</Text>
            <Text style={styles.hostDesc}>
              Earn extra income by listing your property on Trapihaus
            </Text>
            <Pressable style={styles.hostBtn}>
              <Text style={styles.hostBtnText}>Get Started</Text>
            </Pressable>
          </View>
        </Pressable>

        <View style={styles.listSection}>
          {items.map((it) => (
            <Pressable key={it.id} style={styles.listItem}>
              <View style={styles.itemLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name={it.icon as any} size={20} color="#1877CD" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.itemTitle}>{it.title}</Text>
                  <Text style={styles.itemSubtitle}>{it.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7785" />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => signOut()}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FB" },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: "#1070C9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: {
    height: 78,
    width: 78,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: "100%", height: "100%" },
  userInfo: { marginLeft: 8, flex: 1 },
  name: { color: "#fff", fontSize: 18, fontWeight: "900" },
  email: { color: "rgba(255,255,255,0.9)", marginTop: 4 },
  statsRow: { flexDirection: "row", marginTop: 14, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontWeight: "900", fontSize: 16 },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12,
  },
  hostCard: {
    backgroundColor: "#FF8A00",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  hostBody: {},
  hostTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
  },
  hostDesc: { color: "rgba(255,255,255,0.95)", marginBottom: 10 },
  hostBtn: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hostBtnText: { color: "#FF8A00", fontWeight: "800" },
  listSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    height: 38,
    width: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontWeight: "800", color: "#11181C" },
  itemSubtitle: { color: "#6B7785", marginTop: 2 },
  logoutBtn: {
    marginTop: 18,
    backgroundColor: "#357CCB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.9 },
  logoutText: { color: "#fff", fontWeight: "800" },
});
