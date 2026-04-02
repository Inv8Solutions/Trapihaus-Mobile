import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  fetchListingById,
  fetchReviewsByListingId,
} from "@/constants/firebase";
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

type HeroImageSource = { uri: string } | number;

function getAmenityIcon(label: string): keyof typeof Ionicons.glyphMap {
  const value = label.toLowerCase();
  if (value.includes("wifi")) return "wifi";
  if (value.includes("pet")) return "paw-outline";
  if (value.includes("room service")) return "restaurant-outline";
  if (value.includes("parking")) return "car-outline";
  if (value.includes("ac") || value.includes("air")) return "snow-outline";
  if (value.includes("kitchen")) return "restaurant-outline";
  if (value.includes("tv")) return "tv-outline";
  if (value.includes("pool") || value.includes("tub")) return "water-outline";
  return "checkmark-circle-outline";
}

function toImageUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (
    value &&
    typeof value === "object" &&
    "url" in value &&
    typeof (value as { url?: unknown }).url === "string"
  ) {
    const maybeUrl = (value as { url: string }).url.trim();
    return maybeUrl.length > 0 ? maybeUrl : null;
  }

  return null;
}

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
  const { width: viewportWidth } = useWindowDimensions();
  const { isReady, isSignedIn } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listingDoc, setListingDoc] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    const listingId = String(id ?? "").trim();
    if (!listingId) {
      setLoadError("Listing not found.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const row = await fetchListingById(listingId);
        if (!isMounted) return;

        if (!row) {
          setLoadError("Listing not found.");
          setListingDoc(null);
          return;
        }

        setListingDoc(row);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch listing", error);
        setLoadError("Could not load listing details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const details = useMemo<ListingDetails>(() => {
    const row = listingDoc ?? {};
    const barangay =
      typeof row.barangay === "string" ? row.barangay.trim() : "";
    const city = typeof row.city === "string" ? row.city.trim() : "";
    const location = [barangay, city].filter(Boolean).join(", ");

    const rawRate = row.rate;
    let price = "N/A";
    if (typeof rawRate === "number") {
      price = `PHP ${rawRate.toLocaleString()}`;
    } else if (typeof rawRate === "string" && rawRate.trim().length > 0) {
      const parsed = Number(rawRate);
      price = Number.isNaN(parsed) ? rawRate : `PHP ${parsed.toLocaleString()}`;
    }

    const hostFirst =
      typeof row.hostFirstName === "string" ? row.hostFirstName.trim() : "";
    const hostLast =
      typeof row.hostLastName === "string" ? row.hostLastName.trim() : "";
    const hostFullName = [hostFirst, hostLast].filter(Boolean).join(" ");

    const stayParts = [row.minStay, row.maxStay]
      .filter((value: unknown) => typeof value === "string" && value.trim())
      .map((value: string) => value.trim());
    const stayRange =
      stayParts.length === 2
        ? `${stayParts[0]} - ${stayParts[1]}`
        : (stayParts[0] ?? "");

    const dynamicAmenities: Amenity[] = Array.isArray(row.amenities)
      ? row.amenities
          .filter((value: unknown) => typeof value === "string" && value.trim())
          .map((label: string, index: number) => ({
            key: `${label}-${index}`,
            label: label.trim(),
            icon: getAmenityIcon(label),
          }))
      : [];

    return {
      id: String(id ?? "1"),
      title: row.propertyName ?? "Untitled listing",
      location: location || "Location unavailable",
      rating:
        typeof row.averageRating === "number"
          ? row.averageRating.toFixed(1)
          : "N/A",
      price,
      period:
        (typeof row.ratePeriod === "string"
          ? row.ratePeriod.replace(/^per\s+/i, "")
          : row.ratePeriod) ?? "night",
      verified: String(row.status ?? "").toLowerCase() === "approved",
      hostName:
        hostFullName.length > 0
          ? `Hosted by ${hostFullName}`
          : "Hosted by Trapihaus",
      hostMeta:
        [row.availability, stayRange].filter(Boolean).join(" • ") || "Host",
      about:
        row.description ??
        "No additional description provided for this listing yet.",
      amenities:
        dynamicAmenities.length > 0
          ? dynamicAmenities
          : [
              { key: "wifi", label: "Wi‑Fi", icon: "wifi" },
              { key: "parking", label: "Parking", icon: "car-outline" },
            ],
    };
  }, [id, listingDoc]);

  const heroImageSources = useMemo<HeroImageSource[]>(() => {
    const row = listingDoc ?? {};
    const candidates: unknown[] = [
      row.coverPhoto,
      ...(Array.isArray(row.photos) ? row.photos : []),
      row.imageUrl,
      row.image,
      row.thumbnailUrl,
      ...(Array.isArray(row.images) ? row.images : []),
    ];

    const dedupedUrls = Array.from(
      new Set(
        candidates
          .map((value) => toImageUrl(value))
          .filter((value): value is string => Boolean(value)),
      ),
    );

    if (dedupedUrls.length > 0) {
      return dedupedUrls.map((uri) => ({ uri }));
    }

    return [require("@/assets/images/react-logo.png")];
  }, [listingDoc]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [heroImageSources.length, details.id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!details.id) return;
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const docs = await fetchReviewsByListingId(details.id);
        if (!mounted) return;
        const mapped: {
          id: string;
          authorName: string;
          createdAt: Date;
          rating: number;
          body: string;
        }[] = (docs || []).map((d: any) => {
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
            authorName: d.authorName ?? d.name ?? "Guest",
            createdAt: date,
            rating: Number(d.rating) || 0,
            body: d.body ?? d.text ?? "",
          };
        });
        // sort newest first by createdAt
        mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setReviews(mapped);
      } catch (err) {
        console.error("Failed to load listing reviews", err);
        if (!mounted) return;
        setReviewsError("Could not load reviews.");
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [details.id]);

  const onHeroMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (viewportWidth <= 0) return;

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / viewportWidth,
    );
    const maxIndex = Math.max(heroImageSources.length - 1, 0);
    const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
    setActiveImageIndex(clampedIndex);
  };

  if (!isReady) return null;
  if (!isSignedIn) return <Redirect href="/login" />;

  const bottomBarHeight = 86 + insets.bottom;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
            <ScrollView
              horizontal
              pagingEnabled
              bounces={false}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={heroImageSources.length > 1}
              onMomentumScrollEnd={onHeroMomentumEnd}
            >
              {heroImageSources.map((source, index) => (
                <Image
                  key={`hero-image-${index}`}
                  source={source}
                  style={[styles.heroImage, { width: viewportWidth }]}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

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
                  accessibilityLabel={
                    isSaved ? "Unsave listing" : "Save listing"
                  }
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
            ) : (
              <View style={styles.emptyCardSmall}>
                <Text style={styles.emptyTitleSmall}>No reviews yet</Text>
                <Text style={styles.emptyBodySmall}>
                  Be the first to leave a review for this listing.
                </Text>
              </View>
            )}

            {heroImageSources.length > 1 ? (
              <View style={styles.dotsRow}>
                {heroImageSources.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.dot,
                      index === activeImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.sheet}>
            {isLoading ? (
              <View style={styles.fetchStateRow}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.fetchStateText}>Loading details...</Text>
              </View>
            ) : null}

            {loadError ? (
              <View style={styles.fetchStateRow}>
                <Text style={styles.fetchStateError}>{loadError}</Text>
              </View>
            ) : null}

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

            {reviewsLoading ? (
              <View style={styles.fetchStateRow}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.fetchStateText}>Loading reviews...</Text>
              </View>
            ) : reviews.length > 0 ? (
              <View style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar} />
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>
                      {reviews[0].authorName}
                    </Text>
                    <Text style={styles.reviewTime}>
                      {
                        // pretty simple relative time
                        (() => {
                          const diff =
                            Date.now() - reviews[0].createdAt.getTime();
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          if (days <= 0) return "Today";
                          if (days === 1) return "1 day ago";
                          return `${days} days ago`;
                        })()
                      }
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={14} color="#C29A00" />
                    <Text style={styles.reviewRatingText}>
                      {reviews[0].rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewBody}>{reviews[0].body}</Text>
              </View>
            ) : null}
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
            onPress={() => router.push("/booking/step-1" as never)}
            style={({ pressed }) => [
              styles.bookButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.bookText}>Book Now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
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
  fetchStateRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fetchStateText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  fetchStateError: {
    fontSize: 12,
    fontWeight: "800",
    color: "#D93025",
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
  emptyCardSmall: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  emptyTitleSmall: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyBodySmall: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
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
