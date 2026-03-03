import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const MENU_ITEMS = [
  { icon: "user" as const, label: "내 정보" },
  { icon: "shield" as const, label: "보안설정" },
  { icon: "bell" as const, label: "알림설정" },
  { icon: "help-circle" as const, label: "고객센터" },
  { icon: "file-text" as const, label: "공지사항" },
  { icon: "settings" as const, label: "환경설정" },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 10 : 0;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: Platform.OS === "web" ? webTopInset : insets.top }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>더보기</Text>
        </View>
      </View>
      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.menuItem}>
            <Feather name={item.icon} size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={Colors.dark.textTertiary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  menuList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.divider,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.text,
  },
});
