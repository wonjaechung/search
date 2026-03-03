import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";
import Colors from "@/constants/colors";

export type SectionId = "chart" | "coins" | "schedule";

interface Tab {
  id: SectionId;
  label: string;
  icon?: string;
}

const TABS: Tab[] = [
  { id: "chart", label: "차트 비교" },
  { id: "coins", label: "골라보기" },
  { id: "schedule", label: "일정" },
];

interface SectionTabsProps {
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
}

function TabItem({ tab, isActive, onPress }: { tab: Tab; isActive: boolean; onPress: () => void }) {
  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(isActive ? Colors.dark.text : Colors.dark.textTertiary, { duration: 200 }),
    transform: [{ scale: withSpring(isActive ? 1 : 0.95, { damping: 15 }) }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 1 : 0, { duration: 200 }),
    transform: [{ scaleX: withSpring(isActive ? 1 : 0, { damping: 15 }) }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.tab}
    >
      <Animated.Text style={[styles.tabText, textStyle, isActive && styles.tabTextActive]}>
        {tab.label}
      </Animated.Text>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </Pressable>
  );
}

export default function SectionTabs({ activeSection, onSelect }: SectionTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeSection === tab.id}
            onPress={() => onSelect(tab.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.divider,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  tabTextActive: {
    fontFamily: "Inter_700Bold",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
  },
});
