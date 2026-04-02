import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function BookingStep4Screen() {
  const params = useLocalSearchParams<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    nights?: string;
    total?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialRequest?: string;
    paymentMethod?: string;
  }>();

  const fullName = [params.firstName, params.lastName]
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    .join(" ");

  const detailValue = (
    value: string | undefined,
    fallback = "Not provided",
  ) => {
    if (typeof value !== "string") return fallback;
    return value.trim().length > 0 ? value : fallback;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={20} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Summary</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stay Details</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check-in</Text>
            <Text style={styles.rowValue}>{detailValue(params.checkIn)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check-out</Text>
            <Text style={styles.rowValue}>{detailValue(params.checkOut)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Guests</Text>
            <Text style={styles.rowValue}>
              {detailValue(params.guests, "1")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nights</Text>
            <Text style={styles.rowValue}>
              {detailValue(params.nights, "1")}
            </Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Total</Text>
            <Text style={styles.totalValue}>
              P {Number(params.total ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guest Details</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{fullName || "Not provided"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{detailValue(params.email)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>{detailValue(params.phone)}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Special Request</Text>
            <Text style={styles.rowValue}>
              {detailValue(params.specialRequest, "None")}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Method</Text>
            <Text style={styles.rowValue}>
              {detailValue(params.paymentMethod)}
            </Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          Please review your details before finishing your booking.
        </Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/bookings" as never)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E7E7E7" },
  header: {
    height: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 22,
    fontWeight: "600",
    color: "#11181C",
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C232B",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E8",
    paddingVertical: 8,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E6976",
  },
  rowValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "800",
    color: "#1E8C43",
  },
  helperText: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7785",
    fontWeight: "500",
  },
  bottomBar: {
    marginTop: "auto",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#D9DCE0",
    backgroundColor: "#F3F4F6",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877CD",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F4",
  },
  secondaryButtonText: { color: "#11181C", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.85 },
});
