import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withTiming, withSpring, FadeIn, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Asset, ASSETS } from "@/lib/mock-data";

interface AssetSelectorProps {
  selectedAssets: string[];
  onToggle: (assetId: string) => void;
  chartColorMap: Record<string, string>;
}

function AssetChip({ asset, isSelected, chartColor, onToggle }: {
  asset: Asset;
  isSelected: boolean;
  chartColor?: string;
  onToggle: () => void;
}) {
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isSelected ? `${chartColor || Colors.dark.accent}25` : Colors.dark.surfaceElevated,
      { duration: 200 }
    ),
    borderColor: withTiming(
      isSelected ? (chartColor || Colors.dark.accent) : Colors.dark.cardBorder,
      { duration: 200 }
    ),
    transform: [{ scale: withSpring(isSelected ? 1.02 : 1, { damping: 15 }) }],
  }));

  const getIcon = () => {
    if (asset.id === "btc") return <MaterialCommunityIcons name="bitcoin" size={16} color={asset.iconColor} />;
    if (asset.id === "eth") return <MaterialCommunityIcons name="ethereum" size={16} color={asset.iconColor} />;
    return <Feather name={asset.icon as any} size={14} color={asset.iconColor} />;
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <Animated.View style={[styles.chip, chipStyle]}>
        <View style={[styles.chipIcon, { backgroundColor: `${asset.iconColor}18` }]}>
          {getIcon()}
        </View>
        <Text style={[styles.chipName, isSelected && { color: Colors.dark.text }]}>{asset.symbol}</Text>
        {isSelected && (
          <View style={[styles.chipCheck, { backgroundColor: chartColor || Colors.dark.accent }]}>
            <Feather name="check" size={8} color="#FFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function AssetSelector({ selectedAssets, onToggle, chartColorMap }: AssetSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>종목 선택</Text>
        <Text style={styles.counter}>{selectedAssets.length}/5</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ASSETS.map(asset => (
          <AssetChip
            key={asset.id}
            asset={asset}
            isSelected={selectedAssets.includes(asset.id)}
            chartColor={chartColorMap[asset.id]}
            onToggle={() => onToggle(asset.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  counter: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  chipCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
});
