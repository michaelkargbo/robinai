import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import {
  Home,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
} from "lucide-react-native";
import Colors from "../../constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.secondaryBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: "800",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "RobinAI",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerTitle: "Robin AI Assistant",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="intelligence"
        options={{
          title: "Intelligence",
          headerTitle: "Crypto & Web3 Intelligence",
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerTitle: "Chat History",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "Account & Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden secondary tabs that can be navigated directly */}
      <Tabs.Screen
        name="radar"
        options={{
          href: null,
          title: "Radar",
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          href: null,
          title: "Safety",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
