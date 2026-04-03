import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth, fetchReservationsForUser } from "@/constants/firebase";
import { useAuth } from "@/context/auth-context";

export default function BookingsScreen() {
  const { isSignedIn } = useAuth();
  const [reservations, setReservations] = useState<any[] | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "ongoing" | "completed" | "cancelled"
  >("ongoing");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Ensure we only show reservations for the currently logged-in user.
      const uid = (auth && (auth.currentUser as any)?.uid) || null;
      if (!uid) {
        setReservations([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const rows = await fetchReservationsForUser(uid);
        if (!mounted) return;
        // Extra safety: filter client-side by userId field as well
        const filtered = (rows ?? []).filter(
          (r: any) => String(r.userId) === String(uid),
        );
        setReservations(filtered);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Could not load reservations.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isSignedIn]);

  // memoized filtered reservations based on selectedTab to avoid recalculating on every render
  const filteredReservations = React.useMemo(() => {
    if (!reservations) return [];

    const tab = selectedTab;

    const normalize = (s: any) => String(s ?? "").toLowerCase();

    if (tab === "completed") {
      return reservations.filter((r) => {
        const st = normalize(r.status ?? r.bookingStatus);
        return (
          st.includes("complete") ||
          st.includes("finished") ||
          st.includes("done")
        );
      });
    }

    if (tab === "cancelled") {
      return reservations.filter((r) => {
        const st = normalize(
          r.status ?? r.bookingStatus ?? r.payment_state ?? "",
        );
        return st.includes("cancel") || st.includes("void");
      });
    }

    // ongoing: anything that's not completed or cancelled
    return reservations.filter((r) => {
      const st = normalize(r.status ?? r.bookingStatus ?? "");
      if (!st) return true;
      if (st.includes("cancel") || st.includes("void")) return false;
      if (
        st.includes("complete") ||
        st.includes("finished") ||
        st.includes("done")
      )
        return false;
      return true;
    });
  }, [reservations, selectedTab]);

  function formatToDate(value: any) {
    if (value == null || value === "") return "-";

    // Firestore Timestamp (has toDate())
    try {
      if (typeof value?.toDate === "function") {
        const d = value.toDate();
        return d.toLocaleDateString();
      }
    } catch {}

    // Firestore-like object with seconds
    if (typeof value === "object" && value?.seconds != null) {
      const ms =
        Number(value.seconds) * 1000 +
        Math.floor((Number(value.nanoseconds) || 0) / 1e6);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }

    // Numeric epoch (seconds or milliseconds)
    if (typeof value === "number") {
      // if value looks like seconds (10 digits), convert to ms
      const asMs = value < 1e12 ? value * 1000 : value;
      const d = new Date(asMs);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }

    // ISO string
    if (typeof value === "string") {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }

    return String(value ?? "-");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage your reservations</Text>

        <View style={styles.tabRow}>
          <Pressable
            style={[
              styles.tabPill,
              selectedTab === "ongoing" && styles.tabPillActive,
            ]}
            onPress={() => setSelectedTab("ongoing")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "ongoing" && styles.tabTextActive,
              ]}
            >
              Ongoing
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabPill,
              selectedTab === "completed" && styles.tabPillActive,
            ]}
            onPress={() => setSelectedTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "completed" && styles.tabTextActive,
              ]}
            >
              Completed
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabPill,
              selectedTab === "cancelled" && styles.tabPillActive,
            ]}
            onPress={() => setSelectedTab("cancelled")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "cancelled" && styles.tabTextActive,
              ]}
            >
              Cancelled
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : error ? (
          <Text style={{ color: "#D93025", marginTop: 12 }}>{error}</Text>
        ) : reservations && reservations.length ? (
          filteredReservations && filteredReservations.length ? (
            <FlatList
              data={filteredReservations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const propertyName =
                  item.propertyName ?? item.listingName ?? "-";
                const propertyLocation =
                  item.propertyLocation ?? item.location ?? item.address ?? "-";

                // Render total exactly as stored in Firestore. Prefer `total` field, fall back to common alternatives.
                const totalRaw = Object.prototype.hasOwnProperty.call(
                  item,
                  "total",
                )
                  ? item.total
                  : Object.prototype.hasOwnProperty.call(item, "amount")
                    ? item.amount
                    : (item.amountPaid ?? item.amount_total ?? "-");

                const status = item.status ?? item.bookingStatus ?? "-";
                const checkIn = formatToDate(
                  item.checkInDate ?? item.checkIn ?? "-",
                );
                const checkOut = formatToDate(
                  item.checkOutDate ?? item.checkOut ?? "-",
                );
                const paymentStatus =
                  item.paymentStatus ?? item.payment_state ?? "-";

                // try to find an image (prefer `propertyImage` if available)
                const imageUrl =
                  item.propertyImage ??
                  item.listingImage ??
                  item.imageUrl ??
                  item.coverPhoto ??
                  (Array.isArray(item.photos) ? item.photos[0] : undefined) ??
                  (item.image && item.image.uri) ??
                  null;

                return (
                  <View style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={styles.thumbWrap}>
                        {imageUrl ? (
                          <Image
                            source={{ uri: String(imageUrl) }}
                            style={styles.thumb}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.thumbPlaceholder} />
                        )}
                      </View>

                      <View style={styles.cardBody}>
                        <Text style={styles.rowTitle}>{propertyName}</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="location-sharp"
                            size={14}
                            color="#6B7785"
                          />
                          <Text style={styles.rowSub}>{propertyLocation}</Text>
                        </View>

                        <View style={{ height: 8 }} />

                        <View
                          style={{
                            flexDirection: "row",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color="#6B7785"
                            />
                            <Text style={styles.rowSub}>
                              {checkIn} — {checkOut}
                            </Text>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Ionicons name="person" size={14} color="#6B7785" />
                            <Text style={styles.rowSub}>
                              {String(item.guests ?? item.guestCount ?? "-")}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.actionsRow}>
                          <Pressable style={styles.actionBtn}>
                            <Text style={styles.actionText}>Message Host</Text>
                          </Pressable>
                          <Pressable style={styles.actionBtn}>
                            <Text style={styles.actionText}>Call</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.footerRow}>
                      <Text style={styles.metaLabel}>Total</Text>
                      <Text style={styles.totalValue}>
                        {typeof totalRaw === "object"
                          ? JSON.stringify(totalRaw)
                          : String(totalRaw)}
                      </Text>
                    </View>

                    <View style={styles.footerActions}>
                      <Pressable style={styles.outlineBtn}>
                        <Text style={styles.outlineText}>Cancel Booking</Text>
                      </Pressable>
                      <Pressable style={styles.primaryBtn}>
                        <Text style={styles.primaryText}>
                          View Accommodation
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          ) : (
            <Text style={{ marginTop: 12, color: "#6B7785" }}>
              No bookings found for this filter.
            </Text>
          )
        ) : (
          <Text style={{ marginTop: 12, color: "#6B7785" }}>
            {isSignedIn
              ? "No bookings found."
              : "Sign in to see your bookings."}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#11181C" },
  row: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF3",
    // Shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    // Elevation (Android)
    elevation: 2,
  },
  rowTitle: { fontWeight: "800", color: "#11181C" },
  rowSub: { color: "#6B7785", marginTop: 4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  metaLabel: { color: "#6B7785", fontWeight: "700" },
  metaValue: { color: "#111", fontWeight: "700" },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#11181C" },
  headerSubtitle: { color: "#6B7785", marginTop: 6, fontWeight: "600" },
  tabRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 6 },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },
  tabPillActive: { backgroundColor: "#1877CD", borderColor: "#1877CD" },
  tabText: { color: "#111", fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  thumbWrap: { width: 88, height: 68, borderRadius: 10, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    width: 88,
    height: 68,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  cardBody: { flex: 1 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  actionText: { color: "#111", fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#EEF1F4",
    marginTop: 12,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalValue: { fontWeight: "900", color: "#111", fontSize: 16 },
  footerActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  outlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1877CD",
    alignItems: "center",
  },
  outlineText: { color: "#1877CD", fontWeight: "700" },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#1877CD",
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});
