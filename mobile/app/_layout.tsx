import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import Colors from "../constants/colors";
import { AuthProvider } from "../store/AuthContext";
import { ChatProvider } from "../store/ChatContext";

const RobinTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.secondaryBg,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ThemeProvider value={RobinTheme}>
          <StatusBar style="light" backgroundColor={Colors.background} />
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
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="subscription"
              options={{
                presentation: "modal",
                title: "RobinAI Pro",
                headerTintColor: Colors.primary,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                title: "Settings & Engine",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Quick Action",
              }}
            />
          </Stack>
        </ThemeProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
