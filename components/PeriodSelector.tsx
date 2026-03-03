import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Period } from "@/lib/mock-data";

const PERIODS: Period[] = ["24H", "1W", "1M", "1Y"];

interface PeriodSelectorProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

function PeriodButton({ period, isSelected, onPress }: { period: Period; isSelected: boolean; onPress: () => void }) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isSelected ? Colors.dark.accent : "transparent", { duration: 200 }),
    transform: [{ scale: withTiming(isSelected ? 1 : 0.95, { duration: 150 }) }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={[styles.buttonText, isSelected && styles.buttonTextActive]}>
          {period}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      {PERIODS.map(p => (
        <PeriodButton
          key={p}
          period={p}
          isSelected={selected === p}
          onPress={() => onSelect(p)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 52,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  buttonTextActive: {
    color: "#FFFFFF",
  },
});
