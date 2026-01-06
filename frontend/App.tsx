import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import "./src/i18n";

import { CheckScreen } from "./src/screens/CheckScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { Icon } from "./src/components/Icon";

const Tab = createBottomTabNavigator();

export default function App() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: isDark ? "#4A90E2" : "#2563EB",
            tabBarInactiveTintColor: isDark ? "#8E8E93" : "#6B7280",
            tabBarStyle: {
              backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
              borderTopColor: isDark ? "#2C2C2E" : "#E5E7EB",
            },
            headerStyle: {
              backgroundColor: isDark ? "#000000" : "#FFFFFF",
            },
            headerTintColor: isDark ? "#FFFFFF" : "#111827",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Tab.Screen
            name="Check"
            component={CheckScreen}
            options={{
              title: t("check.title"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="search" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: t("history.title"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="time" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: t("settings.title"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
