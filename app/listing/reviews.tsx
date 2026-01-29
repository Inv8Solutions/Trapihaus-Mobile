import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";

const COLORS = {
  bg: "#FFFFFF",
  text: "#11181C",
  muted: "#8B96A3",
  border: "#EEF1F4",
  primary: "#357CCB",
  chipBg: "#FFFFFF",
  chipSelectedBg: "#357CCB",
  chipText: "#357CCB",
  chipSelectedText: "#FFFFFF",
};

type Review = {
  id: string;
  name: string;
  time: string;
  rating: number;
  body: string;
};

type Filter = "all" | 5 | 4 | 3 | 2 | 1;

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { isReady, isSignedIn } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [filter, setFilter] = useState<Filter>("all");

  const allReviews = useMemo<Review[]>(
    () => [
      {
        id: "r1",
        name: "John Dela Cruz",
        time: "1 month ago",
        rating: 4.8,
        body: "Comfortable stay and great location. The place was clean and the host was responsive.",
      },
      {
        id: "r3",
        name: "John Dela Cruz",
        time: "2 weeks ago",
        rating: 5.0,
        body: "Amazing place! Very clean and comfortable. The host was very accommodating. Would definitely stay here again!",
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return allReviews;
    return allReviews.filter((r) => Math.floor(r.rating) === filter);
  }, [allReviews, filter]);

  if (!isReady) return null;
  if (!isSignedIn) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          data={["all", 5, 4, 3, 2, 1] as Filter[]}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => {
            const selected = item === filter;
            const label = item === "all" ? "All" : String(item);
            return (
              <FilterChip
                label={label}
                selected={selected}
                onPress={() => setFilter(item)}
              />
            );
          }}
        />
      </View>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingLeft}>Rating</Text>
        <View style={styles.ratingRight}>
          <Ionicons name="star" size={14} color="#C29A00" />
          <Text style={styles.ratingValue}>4.8</Text>
          <Text style={styles.ratingMeta}>(40 Reviews)</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 18 },
        ]}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar} />
              <View style={styles.meta}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <View style={styles.cardRating}>
                <Ionicons name="star" size={14} color="#C29A00" />
                <Text style={styles.cardRatingText}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ListHeaderComponent={
          id ? <Text style={styles.hiddenId}>Listing: {id}</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  pressed: {
    opacity: 0.85,
  },
  chipsWrap: {
    paddingTop: 6,
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 10,
  },
  chip: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.chipBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: COLORS.chipSelectedBg,
    borderColor: COLORS.chipSelectedBg,
  },
  chipText: {
    color: COLORS.chipText,
    fontSize: 12,
    fontWeight: "900",
  },
  chipTextSelected: {
    color: COLORS.chipSelectedText,
  },
  ratingRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
  },
  ratingLeft: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },
  ratingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  ratingMeta: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 34,
    width: 34,
    borderRadius: 999,
    backgroundColor: "#E13A3A",
  },
  meta: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  time: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardRatingText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },
  body: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6F7B88",
  },
  hiddenId: {
    display: "none",
  },
});
