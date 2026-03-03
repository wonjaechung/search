import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { PresetComparison, ASSETS, getChartData } from "@/lib/mock-data";
import { getScreenWidth } from "@/lib/screen-utils";

const CARD_WIDTH = getScreenWidth() * 0.75;

interface PresetCardProps {
  preset: PresetComparison;
  isActive: boolean;
  onPress: () => void;
  onDelete?: () => void;
}

function MiniChart({ assetIds }: { assetIds: string[] }) {
  const w = CARD_WIDTH - 24;
  const h = 36;
  const padding = 2;

  const paths = useMemo(() => {
    return assetIds.map((id, idx) => {
      const data = getChartData(id, "24H");
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (w - padding * 2);
        const y = padding + ((max - val) / range) * (h - padding * 2);
        return { x, y };
      });

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx1 = prev.x + (curr.x - prev.x) * 0.3;
        const cpx2 = prev.x + (curr.x - prev.x) * 0.7;
        d += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
      }
      return { d, color: Colors.chartColors[idx] };
    });
  }, [assetIds, w, h]);

  return (
    <Svg width={w} height={h}>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} stroke={p.color} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
      ))}
    </Svg>
  );
}

function getAssetIcon(id: string, size: number) {
  const asset = ASSETS.find(a => a.id === id);
  if (!asset) return null;
  if (id === "btc") return <MaterialCommunityIcons name="bitcoin" size={size} color={asset.iconColor} />;
  if (id === "eth") return <MaterialCommunityIcons name="ethereum" size={size} color={asset.iconColor} />;
  return <Feather name={asset.icon as any} size={size - 2} color={asset.iconColor} />;
}

export default function PresetCard({ preset, isActive, onPress, onDelete }: PresetCardProps) {
  const cardStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isActive ? Colors.dark.accent : Colors.dark.cardBorder, { duration: 250 }),
    borderWidth: withTiming(isActive ? 1.5 : 1, { duration: 250 }),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [pressed && styles.cardPressed]}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        {isActive && <View style={styles.activeGlow} />}

        <View style={styles.topRow}>
          <View style={styles.avatarGroup}>
            {preset.assetIds.map((id, i) => {
              const asset = ASSETS.find(a => a.id === id);
              return (
                <View
                  key={id}
                  style={[
                    styles.avatar,
                    { backgroundColor: `${asset?.iconColor || "#555"}20`, marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i },
                  ]}
                >
                  {getAssetIcon(id, 14)}
                </View>
              );
            })}
          </View>
          <View style={styles.badgeRow}>
            {isActive && (
              <View style={styles.activeBadge}>
                <Feather name="eye" size={9} color={Colors.dark.accent} />
                <Text style={styles.activeBadgeText}>보는 중</Text>
              </View>
            )}
            {preset.isCustom && onDelete && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDelete();
                }}
                hitSlop={6}
                style={styles.deleteBtn}
              >
                <Feather name="x" size={12} color={Colors.dark.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>{preset.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{preset.subtitle}</Text>

        <View style={styles.miniChartContainer}>
          <MiniChart assetIds={preset.assetIds} />
        </View>

        <View style={styles.legendRow}>
          {preset.assetIds.map((id, i) => {
            const asset = ASSETS.find(a => a.id === id);
            return (
              <View key={id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.chartColors[i] }]} />
                <Text style={styles.legendLabel}>{asset?.symbol}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  activeGlow: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    height: 3,
    backgroundColor: Colors.dark.accent,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.surface,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${Colors.dark.textTertiary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: `${Colors.dark.accent}18`,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.accent,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeHot: {
    backgroundColor: `${Colors.dark.negative}20`,
  },
  badgeNew: {
    backgroundColor: `${Colors.dark.positive}20`,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.accent,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginBottom: 3,
  },
  miniChartContainer: {
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textTertiary,
  },
});
