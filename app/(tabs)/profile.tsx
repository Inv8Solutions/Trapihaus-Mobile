import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  auth as firebaseAuth,
  firestore,
  isUsingNativeFirebase,
} from "@/constants/firebase";
import { useAuth } from "@/context/auth-context";

export default function ProfileScreen() {
  const { signOut } = useAuth() as any;

  const [currentUser, setCurrentUser] = useState<any>(
    typeof firebaseAuth !== "undefined" ? firebaseAuth.currentUser : null,
  );

  useEffect(() => {
    let unsub: any;
    try {
      if (isUsingNativeFirebase && firebaseAuth?.onAuthStateChanged) {
        unsub = firebaseAuth.onAuthStateChanged((u: any) => setCurrentUser(u));
      } else {
        // web SDK
        // dynamic import to avoid bundling firebase on native
        (async () => {
          const { onAuthStateChanged } = await import("firebase/auth");
          unsub = onAuthStateChanged(firebaseAuth, (u) => setCurrentUser(u));
        })();
      }
    } catch {
      // ignore
    }

    return () => {
      if (typeof unsub === "function") unsub();
      if (unsub && typeof unsub === "object" && unsub.unsubscribe)
        unsub.unsubscribe();
    };
  }, []);

  const name = currentUser?.displayName ?? "Juan Dela Cruz";
  const email = currentUser?.email ?? "juan.delacruz@email.com";

  const [dbName, setDbName] = useState<string | null>(null);

  const PROFILE_KEY = (uid: string) => `user_profile_v1_${uid}`;

  async function readCachedName(uid: string) {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY(uid));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.fullName ?? null;
    } catch {
      return null;
    }
  }

  async function writeCachedName(uid: string, fullName: string) {
    try {
      await AsyncStorage.setItem(
        PROFILE_KEY(uid),
        JSON.stringify({ fullName }),
      );
    } catch {
      // ignore
    }
  }

  async function removeCachedName(uid: string) {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY(uid));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let mounted = true;
    async function fetchNameForUser() {
      const uid = currentUser?.uid;
      if (!uid) return;

      // try cached value first
      const cached = await readCachedName(uid);
      if (cached) {
        if (mounted) setDbName(cached);
        // still attempt a fresh fetch in background
      }

      try {
        if (isUsingNativeFirebase) {
          const snapshot = await firestore.collection("users").get();
          for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data?.uid === uid) {
              const first = data.firstName ?? "";
              const last = data.lastName ?? "";
              const full = `${first} ${last}`.trim();
              if (mounted) setDbName(full);
              await writeCachedName(uid, full);
              return;
            }
          }
        } else {
          const { collection, getDocs, query, where } =
            await import("firebase/firestore");
          const q = query(
            collection(firestore, "users"),
            where("uid", "==", uid),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data: any = doc.data();
            const first = data?.firstName ?? "";
            const last = data?.lastName ?? "";
            const full = `${first} ${last}`.trim();
            if (mounted) setDbName(full);
            await writeCachedName(uid, full);
          }
        }
      } catch (e) {
        // ignore errors silently for now
      }
    }

    fetchNameForUser();
    return () => {
      mounted = false;
    };
  }, [currentUser?.uid]);

  const [bookingsCount, setBookingsCount] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      const uid = currentUser?.uid;
      if (!uid) return;

      try {
        if (isUsingNativeFirebase) {
          const resSnap = await firestore
            .collection("reservations")
            .where("userId", "==", uid)
            .get();
          const reservationsCount = resSnap.docs.length;

          const revSnap = await firestore
            .collection("reviews")
            .where("userId", "==", uid)
            .get();
          const rCount = revSnap.docs.length;

          // compute average rating from review docs if present
          let sum = 0;
          let cnt = 0;
          for (const d of revSnap.docs) {
            const data = d.data();
            const val = data?.rating ?? data?.score ?? null;
            const num = val != null ? Number(val) : NaN;
            if (!Number.isNaN(num)) {
              sum += num;
              cnt += 1;
            }
          }
          const average = cnt > 0 ? +(sum / cnt) : null;

          if (mounted) {
            setBookingsCount(reservationsCount);
            setReviewsCount(rCount);
            setAvgRating(average);
          }
        } else {
          const { collection, getDocs, query, where } =
            await import("firebase/firestore");

          const qRes = query(
            collection(firestore, "reservations"),
            where("userId", "==", uid),
          );
          const resSnap = await getDocs(qRes);
          const reservationsCount = resSnap.docs.length;

          const qRev = query(
            collection(firestore, "reviews"),
            where("userId", "==", uid),
          );
          const revSnap = await getDocs(qRev);
          const rCount = revSnap.docs.length;

          let sum = 0;
          let cnt = 0;
          for (const d of revSnap.docs) {
            const data: any = d.data();
            const val = data?.rating ?? data?.score ?? null;
            const num = val != null ? Number(val) : NaN;
            if (!Number.isNaN(num)) {
              sum += num;
              cnt += 1;
            }
          }
          const average = cnt > 0 ? +(sum / cnt) : null;

          if (mounted) {
            setBookingsCount(reservationsCount);
            setReviewsCount(rCount);
            setAvgRating(average);
          }
        }
      } catch (e) {
        // ignore for now
      }
    }

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [currentUser?.uid]);

  const stats = [
    { id: "bookings", label: "Bookings", value: bookingsCount ?? "-" },
    { id: "reviews", label: "Reviews", value: reviewsCount ?? "-" },
    {
      id: "rating",
      label: "Rating",
      value: avgRating != null ? avgRating.toFixed(1) : "-",
    },
  ];

  const items = [
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage your notifications",
      icon: "notifications-outline",
      path: "/notifications",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Password, 2FA settings",
      icon: "lock-closed-outline",
      path: "/privacy",
    },
    {
      id: "payments",
      title: "Payment Methods",
      subtitle: "Manage cards and wallets",
      icon: "card-outline",
      path: "/payments",
    },
    {
      id: "reviews",
      title: "Reviews",
      subtitle: "Your reviews and ratings",
      icon: "star-outline",
      path: "/reviews",
    },
    {
      id: "help",
      title: "Help Center",
      subtitle: "Get support",
      icon: "help-circle-outline",
      path: "/help",
    },
  ];
  const router = useRouter();

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
              <Text style={styles.name}>{dbName ?? name}</Text>
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
            <Pressable
              key={it.id}
              style={styles.listItem}
              onPress={() => it.path && router.push(it.path as any)}
            >
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
