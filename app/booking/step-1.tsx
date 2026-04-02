import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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

function formatInputDate(date: Date | null) {
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${month}/${day}/${year}`;
}

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

  return normalizeDate(parsed);
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

export default function BookingStep1Screen() {
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [activeField, setActiveField] = useState<"checkIn" | "checkOut">(
    "checkIn",
  );
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [checkInInput, setCheckInInput] = useState("");
  const [checkOutInput, setCheckOutInput] = useState("");
  const [guests, setGuests] = useState(2);

  const calendarDays = useMemo(
    () => buildCalendarDays(displayMonth),
    [displayMonth],
  );

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const ms = checkOutDate.getTime() - checkInDate.getTime();
    const dayCount = Math.round(ms / (1000 * 60 * 60 * 24));
    return Math.max(1, dayCount);
  }, [checkInDate, checkOutDate]);

  const total = useMemo(() => {
    const nightlyRate = 2250;
    return nightlyRate * nights;
  }, [nights]);

  const monthLabel = `${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`;

  const handlePrevMonth = () => {
    setDisplayMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setDisplayMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const applyCheckInDate = (date: Date) => {
    setCheckInDate(date);
    setCheckInInput(formatInputDate(date));

    if (checkOutDate && date >= checkOutDate) {
      setCheckOutDate(null);
      setCheckOutInput("");
    }
  };

  const applyCheckOutDate = (date: Date) => {
    if (!checkInDate) {
      applyCheckInDate(date);
      setActiveField("checkOut");
      return;
    }

    if (date <= checkInDate) {
      applyCheckInDate(date);
      setActiveField("checkOut");
      return;
    }

    setCheckOutDate(date);
    setCheckOutInput(formatInputDate(date));
  };

  const onDayPress = (date: Date) => {
    if (activeField === "checkIn") {
      applyCheckInDate(date);
      setActiveField("checkOut");
      return;
    }

    applyCheckOutDate(date);
  };

  const syncInputDate = (field: "checkIn" | "checkOut", value: string) => {
    const parsed = parseInputDate(value);

    if (field === "checkIn") {
      if (!parsed) {
        setCheckInInput(checkInDate ? formatInputDate(checkInDate) : "");
        return;
      }

      applyCheckInDate(parsed);
      setDisplayMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      return;
    }

    if (!parsed) {
      setCheckOutInput(checkOutDate ? formatInputDate(checkOutDate) : "");
      return;
    }

    applyCheckOutDate(parsed);
    setDisplayMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  };

  const handleContinue = () => {
    router.push({
      pathname: "./step-2",
      params: {
        checkIn: checkInInput,
        checkOut: checkOutInput,
        guests: String(guests),
        nights: String(nights),
        total: String(total),
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
        <Text style={styles.headerTitle}>Select Date</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarMonthWrap}>
          <Pressable onPress={handlePrevMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-back" size={20} color="#1C232B" />
          </Pressable>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
          <Pressable onPress={handleNextMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-forward" size={20} color="#1C232B" />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

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
                        isToday &&
                          !isCheckIn &&
                          !isCheckOut &&
                          styles.todayText,
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

        <View style={styles.rowTwoCol}>
          <View style={styles.colField}>
            <Text style={styles.label}>Check-in</Text>
            <Pressable
              onPress={() => setActiveField("checkIn")}
              style={[
                styles.inputLike,
                activeField === "checkIn" && styles.inputLikeActive,
              ]}
            >
              <Ionicons name="calendar-outline" size={17} color="#4A5563" />
              <TextInput
                value={checkInInput}
                onChangeText={setCheckInInput}
                onFocus={() => setActiveField("checkIn")}
                onBlur={() => syncInputDate("checkIn", checkInInput)}
                placeholder="mm/dd/yyyy"
                keyboardType="numbers-and-punctuation"
                placeholderTextColor="#8B96A3"
                style={styles.inputText}
              />
            </Pressable>
          </View>

          <View style={styles.colField}>
            <Text style={styles.label}>Check-out</Text>
            <Pressable
              onPress={() => setActiveField("checkOut")}
              style={[
                styles.inputLike,
                activeField === "checkOut" && styles.inputLikeActive,
              ]}
            >
              <Ionicons name="calendar-outline" size={17} color="#4A5563" />
              <TextInput
                value={checkOutInput}
                onChangeText={setCheckOutInput}
                onFocus={() => setActiveField("checkOut")}
                onBlur={() => syncInputDate("checkOut", checkOutInput)}
                placeholder="mm/dd/yyyy"
                keyboardType="numbers-and-punctuation"
                placeholderTextColor="#8B96A3"
                style={styles.inputText}
              />
            </Pressable>
          </View>
        </View>

        <Text style={styles.label}>Number of Guests</Text>
        <View style={styles.guestCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease guests"
            onPress={() => setGuests((prev) => Math.max(1, prev - 1))}
            style={({ pressed }) => [
              styles.counterBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.counterSymbol}>-</Text>
          </Pressable>

          <Text style={styles.guestCount}>{guests}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase guests"
            onPress={() => setGuests((prev) => prev + 1)}
            style={({ pressed }) => [
              styles.counterBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.counterSymbol}>+</Text>
          </Pressable>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
        </View>

        <Text style={styles.helperText}>
          {checkInDate && checkOutDate
            ? `${nights} night${nights > 1 ? "s" : ""} • ${guests} guest${guests > 1 ? "s" : ""}`
            : "Select check-in and check-out dates"}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  },
  calendarMonthWrap: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: "#F1F1F1",
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#262B31",
  },
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
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
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
  dayBubbleStrong: {
    backgroundColor: "#1877CD",
  },
  dayBubbleSoft: {
    backgroundColor: "#D6E8FA",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A232E",
  },
  todayText: {
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  rowTwoCol: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  colField: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B242D",
    marginBottom: 10,
    marginTop: 16,
  },
  inputLike: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    gap: 8,
  },
  inputLikeActive: {
    borderWidth: 1,
    borderColor: "#1877CD",
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#343D47",
  },
  guestCard: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4E9EF",
  },
  counterSymbol: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "500",
    color: "#1877CD",
  },
  guestCount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#131A21",
  },
  totalCard: {
    marginTop: 12,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: "500",
    color: "#222A33",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#69BC2F",
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7785",
    fontWeight: "600",
  },
  actions: { marginTop: 18, paddingBottom: 6 },
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
