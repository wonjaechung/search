import { Tabs } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const BASE_TAB_BAR_HEIGHT = 78;
const BASE_TAB_BAR_PADDING_BOTTOM = 8;
const BASE_TAB_BAR_PADDING_TOP = 6;

export default function TabLayout() {
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  // 웹에서는 safe area를 직접 사용하지 않고, 네이티브에서만 bottom inset을 더해 줍니다.
  const bottomInset = isWeb ? 0 : insets.bottom ?? 0;

  const tabBarHeight = isWeb
    ? BASE_TAB_BAR_HEIGHT
    : BASE_TAB_BAR_HEIGHT + bottomInset;

  const paddingBottom = isWeb
    ? BASE_TAB_BAR_PADDING_BOTTOM
    : BASE_TAB_BAR_PADDING_BOTTOM + bottomInset;

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        ...(isWeb ? { sceneContainerStyle: { flex: 1, minHeight: 0 } } : {}),
        tabBarActiveTintColor: Colors.dark.text,
        tabBarInactiveTintColor: Colors.dark.textTertiary,
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopColor: Colors.dark.divider,
          borderTopWidth: 0.5,
          height: tabBarHeight,
          paddingBottom,
          paddingTop: BASE_TAB_BAR_PADDING_TOP,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: isWeb
          ? {
              fontSize: 10,
              lineHeight: 13,
              fontFamily: "Inter_500Medium",
              marginTop: 1,
              marginBottom: 0,
            }
          : {
              fontSize: 10,
              lineHeight: 13,
              fontFamily: "Inter_500Medium",
              marginTop: 1,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "거래소",
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: "혜택/서비스",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "자산현황",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="deposit"
        options={{
          title: "입출금",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarIcon: ({ color, size }) => (
            <Feather name="more-horizontal" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
