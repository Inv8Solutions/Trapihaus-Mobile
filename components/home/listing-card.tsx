import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const COLORS = {
  text: "#11181C",
  muted: "#8B96A3",
  border: "#EEF1F4",
  verifiedBg: "#E7F7EE",
  verifiedText: "#1F8A4C",
  heartBg: "rgba(255,255,255,0.92)",
  primary: "#357CCB",
};

export type Listing = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  verified?: boolean;
  image?: any;
};

export function ListingCard({
  item,
  onPress,
  isSaved,
  onToggleSaved,
}: {
  item: Listing;
  onPress?: () => void;
  isSaved?: boolean;
  onToggleSaved?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={item.image}
          style={styles.image}
          contentFit="cover"
          transition={120}
          accessibilityLabel={item.title}
        />

        {item.verified ? (
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved ? "Unsave listing" : "Save listing"}
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSaved?.();
          }}
          style={styles.heartButton}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={18}
            color={isSaved ? COLORS.primary : COLORS.text}
          />
        </Pressable>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>
      <Text numberOfLines={1} style={styles.subtitle}>
        {item.subtitle}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.period}>/{item.period}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  imageWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F3F5F7",
    aspectRatio: 0.92,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  verifiedPill: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 999,
    backgroundColor: COLORS.verifiedBg,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.verifiedText,
  },
  heartButton: {
    position: "absolute",
    right: 10,
    top: 10,
    height: 30,
    width: 30,
    borderRadius: 999,
    backgroundColor: COLORS.heartBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },
  period: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    marginLeft: 4,
  },
});
