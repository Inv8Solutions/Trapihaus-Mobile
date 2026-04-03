import React, { useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";

import { ListingCard } from "@/components/home/listing-card";
import { useSaved } from "@/context/saved-context";

export default function SavedScreen() {
  const { items, remove: removeSaved, refresh } = useSaved();

  useEffect(() => {
    // ensure fresh
    void refresh();
  }, [refresh]);

  const handleToggle = async (item: any) => {
    await removeSaved(item.id);
  };

  const renderItem = ({ item }: ListRenderItemInfo<any>) => (
    <View style={styles.columnItem}>
      <ListingCard
        item={item}
        isSaved={true}
        onToggleSaved={() => handleToggle(item)}
        onPress={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Saved</Text>

        {items.length === 0 ? (
          <Text style={styles.helper}>You have no saved listings yet.</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
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
