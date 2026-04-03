import { useTrip } from "@/context/trip-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const DATA: Record<string, string[]> = {
  Abra: [
    "Bangued",
    "Boliney",
    "Bucay",
    "Bucloc",
    "Daguioman",
    "Danglas",
    "Dolores",
    "La Paz",
    "Lacub",
    "Lagangilang",
    "Lagayan",
    "Langiden",
    "Licuan-Baay",
    "Luba",
    "Malibcong",
    "Manabo",
    "Peñarrubia",
    "Pidigan",
    "Pilar",
    "Sallapadan",
    "San Isidro",
    "San Juan",
    "San Quintin",
    "Tayum",
    "Tineg",
    "Tubo",
    "Villaviciosa",
  ],
  Apayao: [
    "Calanasan",
    "Conner",
    "Flora",
    "Kabugao",
    "Luna",
    "Pudtol",
    "Santa Marcela",
  ],
  Benguet: [
    "Atok",
    "Bakun",
    "Bokod",
    "Buguias",
    "Itogon",
    "Kabayan",
    "Kapangan",
    "Kibungan",
    "La Trinidad",
    "Mankayan",
    "Sablan",
    "Tuba",
    "Tublay",
  ],
  Ifugao: [
    "Aguinaldo",
    "Alfonso Lista",
    "Asipulo",
    "Banaue",
    "Hingyon",
    "Hungduan",
    "Kiangan",
    "Lagawe",
    "Lamut",
    "Mayoyao",
    "Tinoc",
  ],
  Kalinga: [
    "Balbalan",
    "Lubuagan",
    "Pasil",
    "Pinukpuk",
    "Rizal",
    "Tabuk",
    "Tanudan",
    "Tinglayan",
  ],
  "Mountain Province": [
    "Barlig",
    "Bauko",
    "Besao",
    "Bontoc",
    "Natonin",
    "Paracelis",
    "Sabangan",
    "Sadanga",
    "Sagada",
    "Tadian",
  ],
  "Baguio City": ["Baguio"],
};

export default function LocationScreen() {
  const { selection, setSelection } = useTrip();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const provinces = useMemo(() => Object.keys(DATA), []);

  const filteredProvinces = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return provinces;
    return provinces.filter((p) => p.toLowerCase().includes(term));
  }, [q, provinces]);

  const handleSelectCity = async (province: string, city: string) => {
    await setSelection({
      ...(selection ?? {}),
      location: `${city}, ${province}`,
    });
    // navigate back to dashboard so the new location shows in the header
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6B7785" />
          <TextInput
            placeholder="Search provinces or cities"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
            value={q}
            onChangeText={setQ}
          />
          {q ? (
            <Pressable onPress={() => setQ("")} style={styles.clearBtn}>
              <Ionicons name="close" size={16} color="#6B7785" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredProvinces}
        keyExtractor={(p) => p}
        renderItem={({ item: province }) => (
          <View>
            <Pressable
              style={styles.provinceRow}
              onPress={() => setOpen(open === province ? null : province)}
            >
              <Text style={styles.provinceText}>{province}</Text>
              <Ionicons
                name={open === province ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7785"
              />
            </Pressable>

            {open === province
              ? DATA[province].map((city) => (
                  <Pressable
                    key={city}
                    style={styles.cityRow}
                    onPress={() => handleSelectCity(province, city)}
                  >
                    <Text style={styles.cityText}>{city}</Text>
                  </Pressable>
                ))
              : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 12, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  searchBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F6F8FA",
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 8, color: "#111" },
  clearBtn: { padding: 6 },
  provinceRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },
  provinceText: { fontWeight: "800", color: "#11181C" },
  cityRow: {
    paddingVertical: 10,
    paddingLeft: 18,
    paddingRight: 10,
    backgroundColor: "#FFFFFF",
  },
  cityText: { color: "#6B7785", fontWeight: "700" },
  helper: { marginTop: 8, color: "#6B7785", fontWeight: "600" },
  resultsContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  resultsTitle: { fontWeight: "800", color: "#11181C", marginBottom: 8 },
  columnWrapper: { gap: 12 },
  columnItem: { flexBasis: "48%", maxWidth: "48%", marginBottom: 16 },
});
