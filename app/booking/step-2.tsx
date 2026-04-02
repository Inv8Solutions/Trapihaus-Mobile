import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function BookingStep2Screen() {
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

  const [firstName, setFirstName] = useState(
    typeof params.firstName === "string" ? params.firstName : "",
  );
  const [lastName, setLastName] = useState(
    typeof params.lastName === "string" ? params.lastName : "",
  );
  const [email, setEmail] = useState(
    typeof params.email === "string" ? params.email : "",
  );
  const [phone, setPhone] = useState(
    typeof params.phone === "string" ? params.phone : "",
  );
  const [specialRequest, setSpecialRequest] = useState(
    typeof params.specialRequest === "string" ? params.specialRequest : "",
  );

  const handleContinue = () => {
    router.push({
      pathname: "./step-3",
      params: {
        checkIn: typeof params.checkIn === "string" ? params.checkIn : "",
        checkOut: typeof params.checkOut === "string" ? params.checkOut : "",
        guests: typeof params.guests === "string" ? params.guests : "",
        nights: typeof params.nights === "string" ? params.nights : "",
        total: typeof params.total === "string" ? params.total : "",
        firstName,
        lastName,
        email,
        phone,
        specialRequest,
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
          <Text style={styles.headerTitle}>Guest Details</Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.rowTwoCol}>
            <View style={styles.colField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Juan"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.colField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Dela Cruz"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="juandlc@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+63 917 XXX XXXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Special Request</Text>
            <TextInput
              value={specialRequest}
              onChangeText={setSpecialRequest}
              placeholder="E.g., Early check-in, extra pillows"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E7E7E7" },
  keyboardAvoiding: { flex: 1 },
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
  scrollContent: { paddingHorizontal: 12, paddingBottom: 24 },
  rowTwoCol: {
    marginTop: 10,
    flexDirection: "row",
    gap: 12,
  },
  colField: { flex: 1 },
  fieldWrap: { marginTop: 16 },
  label: { marginBottom: 8, fontSize: 16, fontWeight: "600", color: "#1B242D" },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F1F1F1",
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    height: 96,
    paddingTop: 12,
  },
  caption: { marginTop: 8, fontSize: 14, color: "#6F7B88" },
  actionsRow: {
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
