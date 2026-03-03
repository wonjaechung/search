import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 10 : 0;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: Platform.OS === "web" ? webTopInset : insets.top }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>자산현황</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Feather name="pie-chart" size={40} color={Colors.dark.textTertiary} />
        <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
        <Text style={styles.emptyDesc}>자산현황을 확인하려면 로그인해주세요</Text>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textTertiary,
  },
});
