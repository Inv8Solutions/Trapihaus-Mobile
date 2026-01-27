import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const COLORS = {
  border: "#E8ECF0",
  bg: "#FFFFFF",
  icon: "#11181C",
};

function SocialButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <FontAwesome name={icon} size={22} color={COLORS.icon} />
    </Pressable>
  );
}

export function SocialAuthRow({
  onFacebook,
  onGoogle,
  onApple,
}: {
  onFacebook?: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
}) {
  return (
    <View style={styles.row}>
      <SocialButton
        icon="facebook"
        accessibilityLabel="Continue with Facebook"
        onPress={onFacebook}
      />
      <SocialButton
        icon="google"
        accessibilityLabel="Continue with Google"
        onPress={onGoogle}
      />
      <SocialButton
        icon="apple"
        accessibilityLabel="Continue with Apple"
        onPress={onApple}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  button: {
    height: 52,
    width: 72,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
