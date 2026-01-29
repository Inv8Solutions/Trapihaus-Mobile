import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
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
import { router } from "expo-router";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<
    "Hotels" | "Apartments" | "Transients"
  >("Hotels");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const data: Listing[] = useMemo(
    () => [
      {
        id: "1",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
      {
        id: "2",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
      {
        id: "3",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
      {
        id: "4",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
      {
        id: "5",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
      {
        id: "6",
        title: "Lokan Heights Residences",
        subtitle: "Near Camp John Hay",
        price: "₱6,300",
        period: "month",
        verified: true,
        image: require("@/assets/images/react-logo.png"),
      },
    ],
    [],
  );

  const renderItem = ({ item }: ListRenderItemInfo<Listing>) => (
    <View style={styles.columnItem}>
      <ListingCard
        item={item}
        isSaved={Boolean(saved[item.id])}
        onToggleSaved={() =>
          setSaved((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
        }
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
                onPress={() => console.log("Location")}
                style={styles.locationWrap}
              >
                <Text style={styles.locationLabel}>Location</Text>
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={COLORS.text}
                  />
                  <Text style={styles.locationValue}>Baguio City</Text>
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
                    Add dates • Add guests
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filter"
                onPress={() => console.log("Filter")}
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
              <Text style={styles.countText}>24 accommodations found</Text>
            </View>
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
  columnItem: {
    flex: 1,
    marginBottom: 16,
  },
});
