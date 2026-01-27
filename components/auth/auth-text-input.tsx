import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    type TextInputProps,
    View,
} from "react-native";

const COLORS = {
  inputBg: "#F5F7FA",
  placeholder: "#9AA3AD",
  icon: "#AAB2BD",
  text: "#11181C",
};

export type AuthTextInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  leftIcon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  showVisibilityToggle?: boolean;
};

export function AuthTextInput({
  leftIcon,
  secure,
  showVisibilityToggle,
  style,
  ...rest
}: AuthTextInputProps) {
  const [isSecure, setIsSecure] = useState(Boolean(secure));

  const rightIcon = useMemo(() => {
    if (!showVisibilityToggle) return null;
    return isSecure ? "eye-off-outline" : "eye-outline";
  }, [isSecure, showVisibilityToggle]);

  return (
    <View style={styles.container}>
      <Ionicons
        name={leftIcon}
        size={18}
        color={COLORS.icon}
        style={styles.leftIcon}
      />
      <TextInput
        placeholderTextColor={COLORS.placeholder}
        secureTextEntry={isSecure}
        style={[styles.input, style]}
        {...rest}
      />
      {rightIcon ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSecure ? "Show password" : "Hide password"}
          hitSlop={12}
          onPress={() => setIsSecure((v) => !v)}
          style={styles.rightButton}
        >
          <Ionicons name={rightIcon} size={18} color={COLORS.icon} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  leftIcon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  rightButton: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },
});
