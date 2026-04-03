import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ListingCard } from "@/components/home/listing-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchListingsCollection } from "@/constants/firebase";
import { useSaved } from "@/context/saved-context";
import { router } from "expo-router";
import { ActivityIndicator, FlatList } from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const { map: saved, toggle } = useSaved();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const COLORS = {
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#11181C",
    muted: "#8B96A3",
    primary: "#357CCB",
    border: "#E8ECF0",
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await fetchListingsCollection();
        if (!mounted) return;
        const normalized = rows.map((row: any) => {
          const imageUrl =
            row.coverPhoto ??
            (Array.isArray(row.photos) ? row.photos[0] : undefined) ??
            row.imageUrl ??
            row.image ??
            row.thumbnailUrl ??
            (Array.isArray(row.images) ? row.images[0] : undefined);

          const rawPrice = row.rate;
          let price = "N/A";
          if (typeof rawPrice === "number") {
            price = `PHP ${rawPrice.toLocaleString()}`;
          } else if (typeof rawPrice === "string" && rawPrice.trim().length) {
            const parsed = Number(rawPrice);
            price = Number.isNaN(parsed)
              ? rawPrice
              : `PHP ${parsed.toLocaleString()}`;
          }

          const barangay =
            typeof row.barangay === "string" ? row.barangay.trim() : "";
          const city = typeof row.city === "string" ? row.city.trim() : "";
          const location = [barangay, city].filter(Boolean).join(", ");

          return {
            id: String(row.id),
            title: row.propertyName ?? row.title ?? "Untitled listing",
            subtitle: location || "Location unavailable",
            price,
            period:
              (typeof row.ratePeriod === "string"
                ? row.ratePeriod.replace(/^per\s+/i, "")
                : row.ratePeriod) ?? "night",
            verified: String(row.status ?? "").toLowerCase() === "approved",
            image: imageUrl
              ? { uri: String(imageUrl) }
              : require("@/assets/images/react-logo.png"),
            raw: row,
          };
        });

        setListings(normalized);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setLoadError("Could not load listings right now.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((item) => {
      const name = (item.raw?.propertyName ?? item.title ?? "")
        .toString()
        .toLowerCase();
      const type = (item.raw?.propertyType ?? "").toString().toLowerCase();
      return name.includes(q) || type.includes(q);
    });
  }, [query, listings]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.bg }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Search</ThemedText>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              { borderColor: COLORS.border, backgroundColor: COLORS.surface },
            ]}
          >
            <Ionicons name="search" size={18} color={COLORS.muted} />
            <TextInput
              placeholder="Search for locations, listings, or hosts"
              placeholderTextColor={COLORS.muted}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
                <Ionicons name="close" size={16} color={COLORS.muted} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ThemedView>

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : loadError ? (
          <Text style={{ color: "#D93025" }}>{loadError}</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <View style={styles.columnItem}>
                <ListingCard
                  item={item}
                  isSaved={Boolean(saved[item.id])}
                  onToggleSaved={() => void toggle(item)}
                  onPress={() =>
                    router.push({
                      pathname: "/listing/[id]",
                      params: { id: item.id },
                    } as never)
                  }
                />
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.helper}>
                No results. Try a different search term.
              </Text>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  searchRow: { marginTop: 10 },
  searchBox: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111" },
  clearBtn: { padding: 6 },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#11181C" },
  helper: { marginTop: 8, color: "#6B7785", fontWeight: "600" },
  columnWrapper: { paddingHorizontal: 16, gap: 14 },
  listContent: { paddingBottom: 18 },
  columnItem: {
    flexBasis: "48%",
    maxWidth: "48%",
    marginBottom: 16,
  },
});
