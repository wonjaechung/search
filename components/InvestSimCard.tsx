import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ASSETS, getChartData, Period } from "@/lib/mock-data";

interface InvestSimCardProps {
  assetIds: string[];
  period: string;
  amount?: number;
}

const PERIOD_LABELS: Record<string, string> = {
  "24H": "24시간 전",
  "1W": "1주일 전",
  "1M": "1개월 전",
  "1Y": "1년 전",
};

const MY_HOLDINGS = new Set(["btc", "eth", "sol", "xrp", "bnb"]);

const TIER_INFO = {
  current: { name: "White", color: "#C0C0C0", icon: "shield-outline" as const },
  next: { name: "Blue", color: "#4A90D9" },
  remainingVolume: 8420000,
  totalRequired: 30000000,
  memberCount: 3842,
};

function formatKRW(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 100000000) {
    const eok = Math.floor(abs / 100000000);
    const man = Math.floor((abs % 100000000) / 10000);
    if (man === 0) return `${sign}${eok}억`;
    return `${sign}${eok}억 ${man.toLocaleString()}만`;
  }
  if (abs >= 10000) {
    const man = Math.floor(abs / 10000);
    const rest = Math.floor(abs % 10000);
    if (rest === 0) return `${sign}${man}만`;
    return `${sign}${man}만 ${rest.toLocaleString()}`;
  }
  return `${sign}${abs.toLocaleString()}`;
}

function formatAmount(n: number): string {
  if (n >= 100000000) return `${Math.floor(n / 100000000)}억`;
  if (n >= 10000) return `${Math.floor(n / 10000)}만`;
  return n.toLocaleString();
}

function formatPrice(n: number): string {
  if (n >= 100000000) {
    const eok = n / 100000000;
    if (eok >= 10) return `${eok.toFixed(1)}억`;
    return `${eok.toFixed(2)}억`;
  }
  if (n >= 10000) {
    const man = Math.floor(n / 10000);
    return `${man.toLocaleString()}만`;
  }
  return n.toLocaleString();
}

const MOCK_PRICES: Record<string, number> = {
  btc: 138500000,
  eth: 5120000,
  sol: 287000,
  xrp: 3450,
  bnb: 895000,
  doge: 520,
  ada: 1280,
  dot: 11500,
  avax: 52000,
  matic: 1450,
  link: 23500,
  uni: 18700,
  atom: 15200,
  trx: 385,
  shib: 0.042,
  near: 8900,
  apt: 16800,
  sui: 4500,
  sei: 780,
  arb: 1850,
  op: 3200,
  ton: 8500,
};

const TIER_AVG_OFFSET: Record<string, number> = {
  btc: -2.3,
  eth: -4.1,
  sol: 1.8,
  xrp: -1.5,
  bnb: -3.2,
  doge: 5.4,
  ada: -2.8,
  dot: -1.9,
  avax: 0.7,
  matic: -3.5,
  link: 2.1,
  uni: -0.9,
  atom: -2.4,
  trx: 1.2,
  shib: 3.8,
  near: -1.1,
  apt: -0.5,
  sui: 2.9,
  sei: -1.7,
  arb: 0.3,
  op: -2.6,
  ton: 1.5,
};

export default function InvestSimCard({ assetIds, period, amount = 10000000 }: InvestSimCardProps) {
  const [showTierAvg, setShowTierAvg] = useState(false);

  const results = useMemo(() => {
    if (assetIds.length === 0) return [];

    return assetIds.map((id, index) => {
      const asset = ASSETS.find(a => a.id === id);
      const data = getChartData(id, period as Period);
      const change = data[data.length - 1];
      const profit = Math.round(amount * (change / 100));
      const color = Colors.chartColors[index % Colors.chartColors.length];

      const currentPrice = MOCK_PRICES[id] || 10000;
      const avgChange = data.reduce((sum, v) => sum + v, 0) / data.length;
      const vwapPrice = Math.round(currentPrice * (1 - avgChange / 200));

      const vwapDiff = ((currentPrice - vwapPrice) / vwapPrice) * 100;

      const tierOffset = TIER_AVG_OFFSET[id] || 0;
      const tierAvgChange = change + tierOffset;
      const tierAvgProfit = Math.round(amount * (tierAvgChange / 100));
      const tierAvgPrice = Math.round(currentPrice * (1 - tierAvgChange / 100));
      const myAvgPrice = Math.round(currentPrice * (1 - change / 100));
      const isHolding = MY_HOLDINGS.has(id);

      return {
        id,
        name: asset?.name || "",
        symbol: asset?.symbol || "",
        change,
        profit,
        color,
        vwapPrice,
        vwapDiff,
        currentPrice,
        tierAvgChange,
        tierAvgProfit,
        tierAvgPrice,
        myAvgPrice,
        isHolding,
      };
    });
  }, [assetIds, period, amount]);

  if (results.length === 0) return null;

  const periodLabel = PERIOD_LABELS[period] || period;
  const progressPercent = ((TIER_INFO.totalRequired - TIER_INFO.remainingVolume) / TIER_INFO.totalRequired) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Feather name="dollar-sign" size={14} color={Colors.dark.accent} />
        <Text style={styles.title}>
          {showTierAvg
            ? `멤버십 평균 vs 내 수익 비교`
            : `${periodLabel} ${formatAmount(amount)}원 투자했다면?`}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowTierAvg(!showTierAvg);
          }}
          style={[styles.toggleButton, showTierAvg && styles.toggleButtonActive]}
        >
          <Feather name="users" size={11} color={showTierAvg ? Colors.dark.accent : Colors.dark.textTertiary} />
          <Text style={[styles.toggleText, showTierAvg && { color: Colors.dark.accent }]}>멤버십 평균</Text>
        </Pressable>
      </View>

      {showTierAvg && (
        <View style={styles.tierSection}>
          <View style={styles.tierBanner}>
            <View style={styles.tierBadge}>
              <MaterialCommunityIcons name="shield-outline" size={14} color={TIER_INFO.current.color} />
              <Text style={[styles.tierName, { color: TIER_INFO.current.color }]}>{TIER_INFO.current.name}</Text>
            </View>
            <Text style={styles.tierMemberCount}>동일 등급 {TIER_INFO.memberCount.toLocaleString()}명 평균</Text>
          </View>
          <View style={styles.nextTierRow}>
            <View style={styles.nextTierLabelRow}>
              <MaterialCommunityIcons name="arrow-up-circle-outline" size={12} color={TIER_INFO.next.color} />
              <Text style={[styles.nextTierLabel, { color: TIER_INFO.next.color }]}>{TIER_INFO.next.name}</Text>
              <Text style={styles.nextTierSub}>까지</Text>
              <Text style={styles.nextTierAmount}>{formatKRW(TIER_INFO.remainingVolume)}원</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: TIER_INFO.next.color }]} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.resultList}>
        {results.map(r => {
          if (showTierAvg && !r.isHolding) {
            return (
              <View key={r.id} style={styles.resultItem}>
                <View style={styles.resultTopRow}>
                  <View style={[styles.colorBar, { backgroundColor: r.color, opacity: 0.3 }]} />
                  <Text style={[styles.assetName, { opacity: 0.4 }]}>{r.symbol}</Text>
                  <View style={styles.profitSection}>
                    <Text style={styles.notHoldingText}>미보유</Text>
                  </View>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={({ pressed }) => [styles.tradeButton, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.tradeButtonText}>거래하기</Text>
                  </Pressable>
                </View>
              </View>
            );
          }

          const displayChange = showTierAvg ? r.tierAvgChange : r.change;
          const displayProfit = showTierAvg ? r.tierAvgProfit : r.profit;
          const isPositive = displayProfit >= 0;

          return (
            <View key={r.id} style={styles.resultItem}>
              <View style={styles.resultTopRow}>
                <View style={[styles.colorBar, { backgroundColor: r.color }]} />
                <Text style={styles.assetName}>{r.symbol}</Text>
                <View style={styles.profitSection}>
                  <Text style={[
                    styles.profitAmount,
                    { color: isPositive ? Colors.dark.positive : Colors.dark.negative },
                  ]}>
                    {isPositive ? "+" : ""}{formatKRW(displayProfit)}원
                  </Text>
                  <View style={[
                    styles.percentBadge,
                    { backgroundColor: isPositive ? `${Colors.dark.positive}18` : `${Colors.dark.negative}18` },
                  ]}>
                    <Text style={[
                      styles.percentText,
                      { color: isPositive ? Colors.dark.positive : Colors.dark.negative },
                    ]}>
                      {isPositive ? "+" : ""}{displayChange.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                {showTierAvg && r.isHolding ? (
                  <View style={styles.avgPriceGroup}>
                    <View style={styles.avgPriceItem}>
                      <Text style={styles.avgPriceLabel}>내 평단가</Text>
                      <Text style={styles.avgPriceValue}>{formatPrice(r.myAvgPrice)}</Text>
                    </View>
                    <View style={styles.avgPriceDivider} />
                    <View style={styles.avgPriceItem}>
                      <Text style={[styles.avgPriceLabel, { color: TIER_INFO.current.color }]}>멤버십</Text>
                      <Text style={styles.avgPriceValue}>{formatPrice(r.tierAvgPrice)}</Text>
                    </View>
                  </View>
                ) : !showTierAvg ? (
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={({ pressed }) => [styles.tradeButton, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.tradeButtonText}>거래하기</Text>
                  </Pressable>
                ) : null}
              </View>
              {showTierAvg && r.isHolding && (
                <View style={styles.compareRow}>
                  <Text style={styles.compareLabel}>내 수익률 대비</Text>
                  {(() => {
                    const diff = displayChange - r.change;
                    const better = diff > 0;
                    return (
                      <Text style={[styles.compareDiff, { color: better ? Colors.dark.positive : Colors.dark.textTertiary }]}>
                        {better ? "+" : ""}{diff.toFixed(1)}% {better ? "높음" : "낮음"}
                      </Text>
                    );
                  })()}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    flex: 1,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toggleButtonActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: `${Colors.dark.accent}15`,
  },
  toggleText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textTertiary,
  },
  tierSection: {
    marginBottom: 14,
    gap: 8,
  },
  tierBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(192, 192, 192, 0.06)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(192, 192, 192, 0.12)",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tierName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  tierMemberCount: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  nextTierRow: {
    gap: 6,
    paddingHorizontal: 2,
  },
  nextTierLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextTierLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  nextTierSub: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  nextTierAmount: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    marginLeft: 2,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  resultList: {
    gap: 14,
  },
  resultItem: {
    gap: 6,
  },
  resultTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorBar: {
    width: 3,
    height: 28,
    borderRadius: 1.5,
  },
  assetName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    width: 50,
  },
  profitSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profitAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  percentText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  notHoldingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
    fontStyle: "italic",
  },
  tradeButton: {
    backgroundColor: `${Colors.dark.accent}20`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tradeButtonText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.accent,
  },
  avgPriceGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avgPriceItem: {
    alignItems: "center",
    gap: 1,
  },
  avgPriceDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avgPriceBadge: {
    alignItems: "center",
    gap: 1,
  },
  avgPriceLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  avgPriceValue: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.textSecondary,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 13,
    paddingLeft: 10,
  },
  compareLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  compareDiff: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  vwapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 13,
    paddingLeft: 10,
  },
  vwapLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  vwapValue: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginLeft: 2,
  },
  vwapDiff: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 2,
  },
});
