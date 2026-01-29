import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
    type GestureResponderEvent,
} from "react-native";
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
  green: "#59B53B",
  greenBg: "#E7F7EE",
  greenText: "#1F8A4C",
  starBg: "#FFF5CC",
};

type Amenity = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ListingDetails = {
  id: string;
  title: string;
  location: string;
  rating: string;
  price: string;
  period: string;
  verified: boolean;
  hostName: string;
  hostMeta: string;
  about: string;
  amenities: Amenity[];
};

function CircleIconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: (e: GestureResponderEvent) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={COLORS.text} />
    </Pressable>
  );
}

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isReady, isSignedIn } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const details = useMemo<ListingDetails>(() => {
    return {
      id: String(id ?? "1"),
      title: "Loakan Heights\nResidences",
      location: "Near Camp John Hay",
      rating: "4.6",
      price: "₱6,300",
      period: "month",
      verified: true,
      hostName: "Hosted by Maria Santos",
      hostMeta: "Host • Since October 2025",
      about:
        "Experience the charm of Baguio City in this beautifully appointed accommodation. Perfect for families or groups looking for a comfortable and memorable stay. Located in a prime area with easy access to major attractions and local amenities.",
      amenities: [
        { key: "wifi", label: "Wi‑Fi", icon: "wifi" },
        { key: "parking", label: "Parking", icon: "car-outline" },
        { key: "ac", label: "AC", icon: "snow-outline" },
        { key: "tv", label: "TV", icon: "tv-outline" },
        { key: "kitchen", label: "Kitchen", icon: "restaurant-outline" },
        { key: "hottub", label: "Hot Tub", icon: "water-outline" },
      ],
    };
  }, [id]);

  if (!isReady) return null;
  if (!isSignedIn) return <Redirect href="/login" />;

  const bottomBarHeight = 86 + insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomBarHeight },
        ]}
      >
        <View style={styles.hero}>
          <Image
            source={require("@/assets/images/react-logo.png")}
            style={styles.heroImage}
            contentFit="cover"
          />

          <View style={[styles.heroTopRow, { paddingTop: insets.top + 10 }]}>
            <CircleIconButton
              icon="chevron-back"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />

            <View style={styles.heroTopRight}>
              <CircleIconButton
                icon="share-social-outline"
                accessibilityLabel="Share"
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `${details.title} - ${details.location}`,
                    });
                  } catch {
                    // ignore
                  }
                }}
              />
              <CircleIconButton
                icon={isSaved ? "heart" : "heart-outline"}
                accessibilityLabel={isSaved ? "Unsave listing" : "Save listing"}
                onPress={() => setIsSaved((v) => !v)}
              />
            </View>
          </View>

          {details.verified ? (
            <View style={styles.verifiedPill}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.greenText}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}

          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{details.title}</Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color="#C29A00" />
              <Text style={styles.ratingText}>{details.rating}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.locationText}>{details.location}</Text>
          </View>

          <View style={styles.hostCard}>
            <View style={styles.hostLeft}>
              <View style={styles.hostAvatar} />
              <View style={styles.hostTextWrap}>
                <Text style={styles.hostTitle}>{details.hostName}</Text>
                <Text style={styles.hostMeta}>{details.hostMeta}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Contact host"
              onPress={() => console.log("Contact")}
              style={({ pressed }) => [
                styles.contactButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.contactText}>Contact</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {details.amenities.map((a) => (
              <View key={a.key} style={styles.amenityItem}>
                <View style={styles.amenityIconWrap}>
                  <Ionicons name={a.icon} size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.amenityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About this place</Text>
          <Text style={styles.aboutText}>{details.about}</Text>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all reviews"
              onPress={() =>
                router.push({
                  pathname: "/listing/reviews",
                  params: { id: details.id },
                })
              }
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <View style={styles.reviewAvatar} />
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>John Dela Cruz</Text>
                <Text style={styles.reviewTime}>2 weeks ago</Text>
              </View>
              <View style={styles.reviewRating}>
                <Ionicons name="star" size={14} color="#C29A00" />
                <Text style={styles.reviewRatingText}>5.0</Text>
              </View>
            </View>
            <Text style={styles.reviewBody}>
              Amazing place! Very clean and comfortable. The host was very
              accommodating. Would definitely stay here again!
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{details.price}</Text>
          <Text style={styles.bottomPeriod}>per {details.period}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Book now"
          onPress={() => console.log("Book Now")}
          style={({ pressed }) => [
            styles.bookButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.bookText}>Book Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    backgroundColor: COLORS.bg,
  },
  hero: {
    height: 310,
    backgroundColor: "#D7DCE2",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroTopRow: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTopRight: {
    flexDirection: "row",
    gap: 10,
  },
  circleButton: {
    height: 36,
    width: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  verifiedPill: {
    position: "absolute",
    left: 16,
    bottom: 16,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.greenBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.greenText,
  },
  dotsRow: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    width: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  sheet: {
    marginTop: -16,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  ratingPill: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.starBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },
  hostCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
  },
  hostLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  hostAvatar: {
    height: 34,
    width: 34,
    borderRadius: 999,
    backgroundColor: "#E13A3A",
  },
  hostTextWrap: {
    flex: 1,
  },
  hostTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  hostMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },
  contactButton: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },
  amenitiesGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  amenityItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: "#FFFFFF",
  },
  amenityIconWrap: {
    height: 28,
    width: 28,
    borderRadius: 10,
    backgroundColor: "#F1F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  aboutText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6F7B88",
  },
  sectionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  reviewCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    height: 34,
    width: 34,
    borderRadius: 999,
    backgroundColor: "#E13A3A",
  },
  reviewMeta: {
    marginLeft: 10,
    flex: 1,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  reviewTime: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },
  reviewBody: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6F7B88",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  bottomPeriod: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },
  bookButton: {
    height: 44,
    minWidth: 150,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  bookText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
