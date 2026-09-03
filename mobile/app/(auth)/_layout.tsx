import { Stack } from "expo-router";
import React from "react";
import Colors from "../../constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.secondaryBg,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Log In to RobinAI" }} />
      <Stack.Screen name="register" options={{ title: "Create Account" }} />
      <Stack.Screen name="forgot" options={{ title: "Reset Password" }} />
    </Stack>
  );
}
