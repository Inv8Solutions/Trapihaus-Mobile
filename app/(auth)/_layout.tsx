import { Redirect, Stack } from "expo-router";
import React from "react";

import { useAuth } from "@/context/auth-context";

export default function AuthLayout() {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) return null;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
