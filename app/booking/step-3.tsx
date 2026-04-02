import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type PaymentMethod = "gcash" | "visa" | "mastercard";

type MethodOption = {
  key: PaymentMethod;
  label: string;
  brand: string;
  brandColor: string;
};

const METHODS: MethodOption[] = [
  { key: "gcash", label: "GCash", brand: "G", brandColor: "#1877CD" },
  { key: "visa", label: "Visa", brand: "VISA", brandColor: "#0A5EA8" },
  {
    key: "mastercard",
    label: "Mastercard",
    brand: "●●",
    brandColor: "#EA001B",
  },
];

export default function BookingStep3Screen() {
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
  }>();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("gcash");

  const handleContinue = () => {
    router.push({
      pathname: "./step-4",
      params: {
        checkIn: typeof params.checkIn === "string" ? params.checkIn : "",
        checkOut: typeof params.checkOut === "string" ? params.checkOut : "",
        guests: typeof params.guests === "string" ? params.guests : "",
        nights: typeof params.nights === "string" ? params.nights : "",
        total: typeof params.total === "string" ? params.total : "",
        firstName: typeof params.firstName === "string" ? params.firstName : "",
        lastName: typeof params.lastName === "string" ? params.lastName : "",
        email: typeof params.email === "string" ? params.email : "",
        phone: typeof params.phone === "string" ? params.phone : "",
        specialRequest:
          typeof params.specialRequest === "string"
            ? params.specialRequest
            : "",
        paymentMethod: selectedMethod,
      },
    } as never);
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
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topRow}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new card"
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.addCardText}>Add New Card</Text>
          </Pressable>
        </View>

        {METHODS.map((method) => {
          const isSelected = method.key === selectedMethod;
          return (
            <Pressable
              key={method.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedMethod(method.key)}
              style={({ pressed }) => [
                styles.methodCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.methodLeft}>
                <Text style={[styles.brandText, { color: method.brandColor }]}>
                  {method.brand}
                </Text>
                <Text style={styles.methodLabel}>{method.label}</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterActive,
                ]}
              >
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>

              {method.key === "gcash" ? (
                <View style={styles.walletBadge}>
                  <Text style={styles.walletBadgeText}>L</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <View style={styles.securityCard}>
          <Text style={styles.securityIcon}>i</Text>
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityBody}>
              Your payment information is encrypted and secure. You won&apos;t
              be charged until your booking is confirmed.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: "#D9DCE0",
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
  content: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 12,
  },
  topRow: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C232B",
  },
  addCardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1877CD",
  },
  methodCard: {
    height: 78,
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    minWidth: 36,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  methodLabel: {
    fontSize: 20,
    fontWeight: "500",
    color: "#232A32",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#4EA1E8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  radioOuterActive: {
    borderColor: "#1877CD",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#1877CD",
  },
  walletBadge: {
    position: "absolute",
    left: "70%",
    top: 40,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#21B45A",
    borderWidth: 3,
    borderColor: "#E7E7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  walletBadgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  securityCard: {
    marginTop: "auto",
    borderRadius: 12,
    backgroundColor: "#ECE8D4",
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  securityIcon: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C97C00",
    textAlign: "center",
    color: "#C97C00",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    marginTop: 2,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B06C00",
  },
  securityBody: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "#B06C00",
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#D9DCE0",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  button: {
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877CD",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.85 },
});
