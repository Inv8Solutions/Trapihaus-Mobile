import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CategoryPills } from "@/components/home/category-pills";
import { ListingCard, type Listing } from "@/components/home/listing-card";
import {
  fetchListingsByCity,
  fetchListingsCollection,
} from "@/constants/firebase";
import { useSaved } from "@/context/saved-context";
import { useTrip } from "@/context/trip-context";
import { router } from "expo-router";

type DashboardListing = Listing & {
  category?: "Hotels" | "Apartments" | "Transients";
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<
    "Hotels" | "Apartments" | "Transients"
  >("Hotels");
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { map: saved, toggle } = useSaved();
  const { selection } = useTrip();

  // When the user sets a location (e.g. "Banaue, Ifugao"), fetch listings for that city
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!selection?.location) return;
        setIsLoading(true);
        setLoadError(null);

        const city = String(selection.location).split(",")[0].trim();
        if (!city) return;

        const rows = await fetchListingsByCity(city);
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
          const cityVal = typeof row.city === "string" ? row.city.trim() : "";
          const location = [barangay, cityVal].filter(Boolean).join(", ");

          const rawCategory =
            typeof row.propertyType === "string"
              ? row.propertyType.toLowerCase()
              : "";
          let normalizedCategory: DashboardListing["category"];
          if (rawCategory === "hotel" || rawCategory === "hotels")
            normalizedCategory = "Hotels";
          else if (rawCategory === "apartment" || rawCategory === "apartments")
            normalizedCategory = "Apartments";
          else if (rawCategory === "transient" || rawCategory === "transients")
            normalizedCategory = "Transients";

          const item: DashboardListing = {
            id: String(row.id),
            title: row.propertyName ?? "Untitled listing",
            subtitle: location || "Location unavailable",
            price,
            period:
              (typeof row.ratePeriod === "string"
                ? row.ratePeriod.replace(/^per\s+/i, "")
                : row.ratePeriod) ?? "night",
            verified: String(row.status ?? "").toLowerCase() === "approved",
            category: normalizedCategory,
            image: imageUrl
              ? { uri: String(imageUrl) }
              : require("@/assets/images/react-logo.png"),
          };

          return item;
        });

        if (!isMounted) return;
        setListings(normalized);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch listings by city", error);
        setLoadError("Could not load listings for the selected location.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selection?.location]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // If a location is selected, avoid fetching the full collection here
        // to prevent overwriting location-specific results fetched elsewhere.
        if (selection?.location) return;

        setIsLoading(true);
        setLoadError(null);

        const rows = await fetchListingsCollection();
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

          const rawCategory =
            typeof row.propertyType === "string"
              ? row.propertyType.toLowerCase()
              : "";
          let normalizedCategory: DashboardListing["category"];
          if (rawCategory === "hotel" || rawCategory === "hotels") {
            normalizedCategory = "Hotels";
          } else if (
            rawCategory === "apartment" ||
            rawCategory === "apartments"
          ) {
            normalizedCategory = "Apartments";
          } else if (
            rawCategory === "transient" ||
            rawCategory === "transients"
          ) {
            normalizedCategory = "Transients";
          }

          const item: DashboardListing = {
            id: String(row.id),
            title: row.propertyName ?? "Untitled listing",
            subtitle: location || "Location unavailable",
            price,
            period:
              (typeof row.ratePeriod === "string"
                ? row.ratePeriod.replace(/^per\s+/i, "")
                : row.ratePeriod) ?? "night",
            verified: String(row.status ?? "").toLowerCase() === "approved",
            category: normalizedCategory,
            image: imageUrl
              ? { uri: String(imageUrl) }
              : require("@/assets/images/react-logo.png"),
          };

          return item;
        });

        if (!isMounted) return;
        setListings(normalized);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch listings", error);
        setLoadError("Could not load listings right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const data = useMemo(() => {
    return listings.filter(
      (item) => !item.category || item.category === category,
    );
  }, [category, listings]);

  const renderItem = ({ item }: ListRenderItemInfo<Listing>) => (
    <View style={styles.columnItem}>
      <ListingCard
        item={item}
        isSaved={Boolean(saved[item.id])}
        onToggleSaved={() => void toggle(item)}
        onPress={() =>
          router.push({ pathname: "/listing/[id]", params: { id: item.id } })
        }
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={["top"]}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                onPress={() => console.log("Profile")}
                style={styles.avatarWrap}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change location"
                onPress={() => router.push("/location")}
                style={styles.locationWrap}
              >
                <Text style={styles.locationLabel}>Location</Text>
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={COLORS.text}
                  />
                  <Text style={styles.locationValue}>
                    {selection?.location ?? "Baguio City"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.muted}
                  />
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => console.log("Notifications")}
                style={styles.bellButton}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            <View style={styles.searchCard}>
              <View style={styles.searchLeft}>
                <View style={styles.searchIconWrap}>
                  <Ionicons name="navigate" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.searchTextWrap}>
                  <Text style={styles.searchTitle}>Where are you going?</Text>
                  <Text style={styles.searchSubtitle}>
                    {(() => {
                      const parts: string[] = [];
                      if (selection?.checkIn && selection?.checkOut) {
                        parts.push(
                          `${selection.checkIn} - ${selection.checkOut}`,
                        );
                      } else if (selection?.checkIn) {
                        parts.push(selection.checkIn as string);
                      } else {
                        parts.push("Add dates");
                      }

                      if (typeof selection?.guests === "number") {
                        parts.push(
                          `${selection?.guests} guest${selection!.guests! > 1 ? "s" : ""}`,
                        );
                      } else {
                        parts.push("Add guests");
                      }

                      return parts.join(" • ");
                    })()}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open trip details"
                onPress={() => router.push("/modal")}
                style={styles.filterButton}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <CategoryPills
              items={["Hotels", "Apartments", "Transients"]}
              value={category}
              onChange={(next) => setCategory(next as typeof category)}
            />

            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {data.length} accommodations found
              </Text>
            </View>

            {isLoading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.statusText}>Loading listings...</Text>
              </View>
            ) : null}

            {loadError ? (
              <View style={styles.statusRow}>
                <Text style={styles.errorText}>{loadError}</Text>
              </View>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#11181C",
  muted: "#8B96A3",
  primary: "#357CCB",
  border: "#E8ECF0",
  shadow: "rgba(17, 24, 28, 0.06)",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  listContent: {
    paddingBottom: 18,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarWrap: {
    height: 34,
    width: 34,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#EEF1F4",
  },
  avatar: {
    height: "100%",
    width: "100%",
  },
  locationWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  bellButton: {
    height: 34,
    width: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  searchCard: {
    marginTop: 14,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  searchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  searchIconWrap: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchTextWrap: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  searchSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  filterButton: {
    height: 38,
    width: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  countRow: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 14,
  },
  statusRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#D93025",
    fontSize: 12,
    fontWeight: "700",
  },
  columnItem: {
    flexBasis: "48%",
    maxWidth: "48%",
    marginBottom: 16,
  },
});
