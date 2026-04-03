import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTrip } from "@/context/trip-context";

export default function ModalScreen() {
  const router = useRouter();
  const { selection, setSelection } = useTrip();

  const [checkInInput, setCheckInInput] = useState(selection.checkIn ?? "");
  const [checkOutInput, setCheckOutInput] = useState(selection.checkOut ?? "");
  const [guests, setGuests] = useState<number>(selection.guests ?? 2);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [checkOutError, setCheckOutError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  function parseInputDate(value: string): Date | null {
    const trimmed = value.trim();
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  // Calendar utilities
  const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function buildCalendarDays(displayMonth: Date): (Date | null)[] {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }

  function isSameDay(a: Date | null, b: Date | null) {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  const today = useMemo(() => normalizeDate(new Date()), []);
  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [activeField, setActiveField] = useState<"checkIn" | "checkOut">(
    "checkIn",
  );
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    parseInputDate(checkInInput),
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    parseInputDate(checkOutInput),
  );

  useEffect(() => {
    setCheckInDate(parseInputDate(checkInInput));
  }, [checkInInput]);

  useEffect(() => {
    setCheckOutDate(parseInputDate(checkOutInput));
  }, [checkOutInput]);

  const calendarDays = useMemo(
    () => buildCalendarDays(displayMonth),
    [displayMonth],
  );

  const applyCheckInDate = (date: Date) => {
    const normalized = normalizeDate(date);
    setCheckInDate(normalized);
    setCheckInInput(
      `${String(normalized.getMonth() + 1).padStart(2, "0")}/${String(normalized.getDate()).padStart(2, "0")}/${normalized.getFullYear()}`,
    );
    if (checkOutDate && normalized >= checkOutDate) {
      setCheckOutDate(null);
      setCheckOutInput("");
    }
  };

  const applyCheckOutDate = (date: Date) => {
    const normalized = normalizeDate(date);
    if (!checkInDate) {
      applyCheckInDate(normalized);
      setActiveField("checkOut");
      return;
    }

    if (normalized <= checkInDate) {
      applyCheckInDate(normalized);
      setActiveField("checkOut");
      return;
    }

    setCheckOutDate(normalized);
    setCheckOutInput(
      `${String(normalized.getMonth() + 1).padStart(2, "0")}/${String(normalized.getDate()).padStart(2, "0")}/${normalized.getFullYear()}`,
    );
  };

  const onDayPress = (date: Date | null) => {
    if (!date) return;
    if (activeField === "checkIn") {
      applyCheckInDate(date);
      setActiveField("checkOut");
      return;
    }
    applyCheckOutDate(date);
  };

  const handleSave = async () => {
    // run final validation before saving
    const inDate = parseInputDate(checkInInput);
    const outDate = parseInputDate(checkOutInput);

    if (!inDate) {
      setCheckInError("Enter a valid date (mm/dd/yyyy)");
      return;
    }
    if (!outDate) {
      setCheckOutError("Enter a valid date (mm/dd/yyyy)");
      return;
    }
    if (outDate <= inDate) {
      setRangeError("Check-out must be after check-in");
      return;
    }

    await setSelection({
      checkIn: checkInInput || null,
      checkOut: checkOutInput || null,
      guests,
    });
    router.back();
  };

  // live-validate inputs
  const validation = useMemo(() => {
    const inDate = parseInputDate(checkInInput);
    const outDate = parseInputDate(checkOutInput);
    const errors: { in?: string; out?: string; range?: string } = {};

    if (checkInInput && !inDate) errors.in = "Invalid date";
    if (checkOutInput && !outDate) errors.out = "Invalid date";
    if (inDate && outDate && outDate <= inDate)
      errors.range = "Check-out must be after check-in";
    if (!checkInInput || !checkOutInput)
      errors.range = errors.range ?? "Both dates are required";

    return { inDate, outDate, errors };
  }, [checkInInput, checkOutInput]);

  // reflect errors to state for UI
  React.useEffect(() => {
    setCheckInError(validation.errors.in ?? null);
    setCheckOutError(validation.errors.out ?? null);
    setRangeError(validation.errors.range ?? null);
  }, [validation]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Trip details</ThemedText>

      <Text style={styles.label}>Select dates</Text>

      <View style={styles.calendarMonthWrap}>
        <Pressable
          onPress={() =>
            setDisplayMonth(
              (c) => new Date(c.getFullYear(), c.getMonth() - 1, 1),
            )
          }
          style={styles.monthNavBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#1C232B" />
        </Pressable>
        <Text
          style={styles.monthTitle}
        >{`${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`}</Text>
        <Pressable
          onPress={() =>
            setDisplayMonth(
              (c) => new Date(c.getFullYear(), c.getMonth() + 1, 1),
            )
          }
          style={styles.monthNavBtn}
        >
          <Ionicons name="chevron-forward" size={20} color="#1C232B" />
        </Pressable>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((d) => (
            <Text key={d} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((date, index) => {
            if (!date)
              return <View key={`empty-${index}`} style={styles.dayCell} />;

            const isCheckIn = isSameDay(date, checkInDate);
            const isCheckOut = isSameDay(date, checkOutDate);
            const isRange =
              !!checkInDate &&
              !!checkOutDate &&
              date > checkInDate &&
              date < checkOutDate;
            const isToday = isSameDay(date, today);

            return (
              <Pressable
                key={date.toISOString()}
                onPress={() => onDayPress(date)}
                style={styles.dayCell}
              >
                <View
                  style={[
                    styles.dayBubble,
                    isRange && styles.dayBubbleSoft,
                    (isCheckIn || isCheckOut) && styles.dayBubbleStrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      (isCheckIn || isCheckOut) && styles.dayTextSelected,
                      isToday && !isCheckIn && !isCheckOut && styles.todayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => {
          // reset dates
          setCheckInInput("");
          setCheckOutInput("");
          setCheckInDate(null);
          setCheckOutDate(null);
          setCheckInError(null);
          setCheckOutError(null);
          setRangeError(null);
          setActiveField("checkIn");
        }}
        style={styles.resetBtn}
      >
        <Text style={styles.resetText}>Reset dates</Text>
      </Pressable>

      <View style={styles.rowTwoCol}>
        <View style={styles.colField}>
          <Text style={styles.label}>Check-in</Text>
          <TextInput
            value={checkInInput}
            editable={false}
            placeholder="mm/dd/yyyy"
            style={styles.input}
          />
          {checkInError ? (
            <Text style={styles.errorText}>{checkInError}</Text>
          ) : null}
        </View>

        <View style={styles.colField}>
          <Text style={styles.label}>Check-out</Text>
          <TextInput
            value={checkOutInput}
            editable={false}
            placeholder="mm/dd/yyyy"
            style={styles.input}
          />
          {checkOutError ? (
            <Text style={styles.errorText}>{checkOutError}</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.label}>Guests</Text>
      <View style={styles.guestRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setGuests((g) => Math.max(1, g - 1))}
          style={styles.counterBtn}
        >
          <Text style={styles.counterSymbol}>-</Text>
        </Pressable>

        <Text style={styles.guestCount}>{guests}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => setGuests((g) => g + 1)}
          style={styles.counterBtn}
        >
          <Text style={styles.counterSymbol}>+</Text>
        </Pressable>
      </View>

      {rangeError ? <Text style={styles.errorText}>{rangeError}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={() => router.back()} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          style={[
            styles.button,
            !(
              validation.errors && Object.keys(validation.errors).length === 0
            ) && styles.buttonDisabled,
          ]}
          disabled={
            !(validation.errors && Object.keys(validation.errors).length === 0)
          }
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginTop: 14, fontSize: 13, fontWeight: "700", color: "#6B7785" },
  input: {
    height: 48,
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  guestRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowTwoCol: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  colField: { flex: 1 },
  calendarMonthWrap: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "#F1F1F1",
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: { fontSize: 16, fontWeight: "700", color: "#262B31" },
  calendarCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekDay: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "#212A33",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.285%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBubbleStrong: { backgroundColor: "#1877CD" },
  dayBubbleSoft: { backgroundColor: "#D6E8FA" },
  dayText: { fontSize: 14, fontWeight: "500", color: "#1A232E" },
  todayText: { fontWeight: "700" },
  dayTextSelected: { color: "#FFFFFF" },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E4E9EF",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  resetText: { color: "#1877CD", fontWeight: "700" },
  counterSymbol: { fontSize: 20, color: "#1877CD", fontWeight: "600" },
  guestCount: { fontSize: 20, fontWeight: "800" },
  actions: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    height: 48,
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#1877CD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  buttonText: { color: "#FFF", fontWeight: "800" },
  secondaryBtn: {
    height: 48,
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryText: { color: "#111" },
  errorText: {
    color: "#D93025",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  buttonDisabled: { opacity: 0.5 },
});
