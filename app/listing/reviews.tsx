import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { fetchReviewsByListingId } from "@/constants/firebase";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to produce a human readable relative time (e.g., "2 weeks ago")
  function timeAgo(date: Date) {
    const secs = Math.round((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.round(months / 12);
    return `${years}y ago`;
  }

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const docs = await fetchReviewsByListingId(String(id));
        if (!mounted) return;
        const mapped: Review[] = (docs || []).map((d: any) => {
          const created = d.createdAt ?? d.created_at ?? d.timestamp ?? null;
          let date = new Date();
          if (created && typeof created.toDate === "function") {
            date = created.toDate();
          } else if (created && typeof created.seconds === "number") {
            date = new Date(created.seconds * 1000);
          } else if (typeof created === "number") {
            date = new Date(created);
          } else if (typeof created === "string") {
            const parsed = Date.parse(created);
            if (!Number.isNaN(parsed)) date = new Date(parsed);
          }

          return {
            id: d.id,
            name: d.authorName ?? d.name ?? "Guest",
            time: timeAgo(date),
            rating: Number(d.rating) || 0,
            body: d.body ?? d.text ?? "",
          };
        });
        // sort newest first
        mapped.sort((a: Review, b: Review) => (a.time < b.time ? 1 : -1));
        setReviews(mapped);
      } catch (err) {
        console.error("Failed to load reviews", err);
        if (!mounted) return;
        setError("Could not load reviews.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => Math.floor(r.rating) === filter);
  }, [reviews, filter]);

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
          <Text style={styles.ratingValue}>
            {reviews.length > 0
              ? (
                  reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                ).toFixed(1)
              : "0.0"}
          </Text>
          <Text style={styles.ratingMeta}>({reviews.length} Reviews)</Text>
        </View>
      </View>

      {error ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: "#D93025", fontWeight: "800" }}>{error}</Text>
        </View>
      ) : null}

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
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.emptyText}>Loading reviews…</Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptyBody}>
                Be the first to leave a review for this listing.
              </Text>
            </View>
          );
        }}
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
  emptyWrap: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.muted,
  },
  emptyCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyBody: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6F7B88",
    textAlign: "center",
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
