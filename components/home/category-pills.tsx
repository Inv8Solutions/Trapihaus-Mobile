import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const COLORS = {
  text: "#11181C",
  muted: "#8B96A3",
  border: "#E8ECF0",
  selectedBg: "#357CCB",
  selectedText: "#FFFFFF",
  bg: "#FFFFFF",
};

export function CategoryPills({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((label) => {
          const selected = label === value;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(label)}
              style={({ pressed }) => [
                styles.pill,
                selected && styles.pillSelected,
                pressed && styles.pillPressed,
              ]}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
  },
  row: {
    paddingHorizontal: 16,
    gap: 10,
  },
  pill: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.selectedBg,
  },
  pillPressed: {
    opacity: 0.85,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  pillTextSelected: {
    color: COLORS.selectedText,
  },
});
