import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ASSETS, getChartData, Period } from "@/lib/mock-data";

interface InsightBannerProps {
  assetIds: string[];
  period: string;
}

const PERIOD_LABELS: Record<string, string> = {
  "24H": "24시간",
  "1W": "1주일",
  "1M": "1개월",
  "1Y": "1년",
};

function hasJongseong(str: string): boolean {
  if (!str) return false;
  const last = str.charCodeAt(str.length - 1);
  if (last < 0xAC00 || last > 0xD7A3) return false;
  return (last - 0xAC00) % 28 !== 0;
}

function particle(name: string, withJong: string, withoutJong: string): string {
  return name + (hasJongseong(name) ? withJong : withoutJong);
}

export default function InsightBanner({ assetIds, period }: InsightBannerProps) {
  const insight = useMemo(() => {
    if (assetIds.length < 2) return null;

    const periodLabel = PERIOD_LABELS[period] || period;

    const performances = assetIds.map(id => {
      const data = getChartData(id, period as Period);
      const asset = ASSETS.find(a => a.id === id);
      return {
        id,
        name: asset?.name || "",
        symbol: asset?.symbol || "",
        value: data[data.length - 1],
      };
    });

    const sorted = [...performances].sort((a, b) => b.value - a.value);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const allPositive = performances.every(p => p.value >= 0);
    const allNegative = performances.every(p => p.value < 0);
    const spread = Math.abs(best.value - worst.value);

    if (assetIds.length === 2) {
      const gap = spread.toFixed(1);
      if (spread < 0.5) {
        return {
          icon: "minus" as const,
          color: Colors.dark.accent,
          text: `${periodLabel} 동안 ${best.name}과 ${worst.name} 수익률 차이 ${gap}%p — 거의 동일한 흐름이에요`,
        };
      }
      if (best.value > 0 && worst.value < 0) {
        return {
          icon: "trending-up" as const,
          color: Colors.dark.positive,
          text: `${periodLabel} 기준 ${particle(best.name, "은", "는")} +${best.value.toFixed(1)}% 상승, ${particle(worst.name, "은", "는")} ${worst.value.toFixed(1)}% 하락`,
        };
      }
      return {
        icon: "zap" as const,
        color: Colors.dark.accent,
        text: `${periodLabel} 수익률 ${particle(best.name, "이", "가")} ${gap}%p 앞서는 중`,
      };
    }

    if (allPositive) {
      return {
        icon: "trending-up" as const,
        color: Colors.dark.positive,
        text: `${periodLabel} 동안 ${assetIds.length}개 종목 전부 상승! ${particle(best.name, "이", "가")} +${best.value.toFixed(1)}%로 선두`,
      };
    }

    if (allNegative) {
      return {
        icon: "trending-down" as const,
        color: Colors.dark.negative,
        text: `${periodLabel} 동안 전부 하락세, ${particle(worst.name, "이", "가")} ${worst.value.toFixed(1)}%로 낙폭 최대`,
      };
    }

    const positiveCount = performances.filter(p => p.value >= 0).length;
    return {
      icon: "bar-chart-2" as const,
      color: Colors.dark.accent,
      text: `${periodLabel} 기준 ${assetIds.length}개 중 ${positiveCount}개 상승, ${particle(best.name, "이", "가")} +${best.value.toFixed(1)}%로 선두`,
    };
  }, [assetIds, period]);

  if (!insight) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${insight.color}20` }]}>
        <Feather name={insight.icon} size={14} color={insight.color} />
      </View>
      <Text style={styles.text}>{insight.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: `${Colors.dark.accent}08`,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.dark.accent}15`,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    lineHeight: 19,
  },
});
