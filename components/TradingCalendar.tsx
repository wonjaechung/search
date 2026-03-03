import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import {
  DayTradingData,
  getMonthTradingData,
  formatProfitShort,
  COIN_ICONS,
} from "@/lib/trading-data";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function CoinIcon({ coinId, size }: { coinId: string; size: number }) {
  const info = COIN_ICONS[coinId];
  if (!info) return null;
  if (info.lib === "material") {
    return <MaterialCommunityIcons name={info.icon as any} size={size} color={info.color} />;
  }
  return <Feather name={info.icon as any} size={size - 2} color={info.color} />;
}

interface TradingCalendarProps {
  onDayPress: (dateStr: string, dayData: DayTradingData | null) => void;
  journalDates: Set<string>;
}

export default function TradingCalendar({ onDayPress, journalDates }: TradingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const tradingData = useMemo(
    () => getMonthTradingData(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const dataMap = useMemo(() => {
    const m = new Map<number, DayTradingData>();
    tradingData.forEach((d) => {
      const day = parseInt(d.date.split("-")[2], 10);
      m.set(day, d);
    });
    return m;
  }, [tradingData]);

  const monthStats = useMemo(() => {
    const totalProfit = tradingData.reduce((s, d) => s + d.profit, 0);
    const tradeDays = tradingData.length;
    const winDays = tradingData.filter((d) => d.profit > 0).length;
    return { totalProfit, tradeDays, winDays };
  }, [tradingData]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>투자 복기</Text>
          <Text style={styles.sectionSubtitle}>매매 기록을 되돌아보세요</Text>
        </View>
        <View style={styles.statBadges}>
          <View style={[styles.statBadge, { backgroundColor: `${monthStats.totalProfit >= 0 ? Colors.dark.positive : Colors.dark.negative}15` }]}>
            <Text style={[styles.statBadgeText, { color: monthStats.totalProfit >= 0 ? Colors.dark.positive : Colors.dark.negative }]}>
              {formatProfitShort(monthStats.totalProfit)}
            </Text>
          </View>
          <View style={styles.statBadgeSub}>
            <Text style={styles.statBadgeSubText}>{monthStats.tradeDays}일 거래</Text>
          </View>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={10}>
            <Feather name="chevron-left" size={20} color={Colors.dark.textSecondary} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {viewYear}년 {viewMonth + 1}월
          </Text>
          <Pressable onPress={isCurrentMonth ? undefined : nextMonth} hitSlop={10}>
            <Feather
              name="chevron-right"
              size={20}
              color={isCurrentMonth ? Colors.dark.textTertiary : Colors.dark.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((w, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, i === 0 && { color: Colors.dark.negative }]}>
                {w}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <View key={`e-${idx}`} style={styles.dayCell} />;
            }
            const data = dataMap.get(day);
            const isToday =
              isCurrentMonth && day === today.getDate();
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasJournal = journalDates.has(dateStr);
            const isFuture = new Date(viewYear, viewMonth, day) > today;

            return (
              <Pressable
                key={`d-${day}`}
                style={[
                  styles.dayCell,
                  data && data.profit > 0 && styles.dayCellPositive,
                  data && data.profit < 0 && styles.dayCellNegative,
                  isToday && styles.dayCellToday,
                ]}
                onPress={() => {
                  if (isFuture) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDayPress(dateStr, data || null);
                }}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    isFuture && { color: Colors.dark.textTertiary },
                    idx % 7 === 0 && { color: Colors.dark.negative },
                  ]}
                >
                  {day}
                </Text>
                {data && (
                  <>
                    <Text
                      style={[
                        styles.dayProfit,
                        {
                          color:
                            data.profit >= 0
                              ? Colors.dark.positive
                              : Colors.dark.negative,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {formatProfitShort(data.profit)}
                    </Text>
                    <CoinIcon coinId={data.topCoin} size={12} />
                  </>
                )}
                {hasJournal && (
                  <View style={styles.journalDot} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: `${Colors.dark.positive}12` }]} />
            <Text style={styles.legendText}>수익</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: `${Colors.dark.negative}12` }]} />
            <Text style={styles.legendText}>손실</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDotSmall, { backgroundColor: Colors.dark.accent }]} />
            <Text style={styles.legendText}>일지 작성</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  statBadges: {
    flexDirection: "row",
    gap: 6,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  statBadgeSub: {
    backgroundColor: `${Colors.dark.accent}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statBadgeSubText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.accent,
  },
  calendarCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 14,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textTertiary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 5,
    minHeight: 56,
    borderRadius: 8,
    gap: 1,
  },
  dayCellPositive: {
    backgroundColor: `${Colors.dark.positive}08`,
  },
  dayCellNegative: {
    backgroundColor: `${Colors.dark.negative}08`,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  dayNumber: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
  },
  dayNumberToday: {
    color: Colors.dark.accent,
    fontFamily: "Inter_700Bold",
  },
  dayProfit: {
    fontSize: 8,
    fontFamily: "Inter_700Bold",
  },
  journalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
    position: "absolute",
    bottom: 3,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.dark.divider,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
});
