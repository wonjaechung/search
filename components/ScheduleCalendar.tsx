import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { ScheduleItem, ScheduleType, SCHEDULE_TYPE_CONFIG } from "@/lib/schedule-data";

type FilterType = "all" | ScheduleType;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "economic", label: "경제지표" },
  { id: "lockup", label: "락업해제" },
  { id: "exchange", label: "거래소" },
];

function FilterChip({ filter, isActive, onPress }: { filter: { id: FilterType; label: string }; isActive: boolean; onPress: () => void }) {
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive ? Colors.dark.accent : Colors.dark.surfaceElevated, { duration: 200 }),
    borderColor: withTiming(isActive ? Colors.dark.accent : Colors.dark.cardBorder, { duration: 200 }),
  }));

  return (
    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}>
      <Animated.View style={[styles.filterChip, chipStyle]}>
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function AlarmBell({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isOn ? 1.15 : 1, { damping: 12 }) }],
    opacity: withTiming(isOn ? 1 : 0.4, { duration: 200 }),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.notificationAsync(
          isOn ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
        );
        onToggle();
      }}
      hitSlop={8}
    >
      <Animated.View style={bellStyle}>
        <Feather
          name={isOn ? "bell" : "bell-off"}
          size={16}
          color={isOn ? Colors.dark.accent : Colors.dark.textTertiary}
        />
      </Animated.View>
    </Pressable>
  );
}

function getDdayText(daysFromNow: number): string {
  if (daysFromNow === 0) return "D-DAY";
  return `D-${daysFromNow}`;
}

function ScheduleCard({ item, alarmedIds, onToggleAlarm, onPress }: {
  item: ScheduleItem;
  alarmedIds: Set<string>;
  onToggleAlarm: (id: string) => void;
  onPress?: () => void;
}) {
  const config = SCHEDULE_TYPE_CONFIG[item.type];
  const isToday = item.daysFromNow === 0;
  const isTomorrow = item.daysFromNow === 1;
  const isUrgent = item.daysFromNow <= 1;

  const ddayText = getDdayText(item.daysFromNow);
  const ddayColor = isToday
    ? Colors.dark.negative
    : isTomorrow
      ? Colors.dark.accent
      : item.daysFromNow <= 3
        ? Colors.dark.accentSecondary
        : Colors.dark.textTertiary;

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [styles.scheduleCard, isToday && styles.todayCard, pressed && onPress && { opacity: 0.7 }]}
    >
      {isToday && <View style={styles.todayStripe} />}
      <View style={styles.scheduleRow}>
        <View style={styles.ddayColumn}>
          <View style={[styles.ddayBadge, { backgroundColor: `${ddayColor}18` }]}>
            <Text style={[styles.ddayText, { color: ddayColor }]}>{ddayText}</Text>
          </View>
          <Text style={[styles.dateText, isToday && { color: Colors.dark.accent }]}>{item.date}</Text>
        </View>

        <View style={styles.scheduleContent}>
          <View style={styles.scheduleTop}>
            <View style={[styles.typeBadge, { backgroundColor: `${config.color}18` }]}>
              <Feather name={config.icon as any} size={10} color={config.color} />
              <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
            </View>
            {item.tag && (
              <View style={[styles.tagBadge, {
                backgroundColor: item.tag === "중요" ? `${Colors.dark.negative}15` :
                  item.tag === "주의" ? `${Colors.dark.accent}15` : `${Colors.dark.positive}15`
              }]}>
                <Text style={[styles.tagText, {
                  color: item.tag === "중요" ? Colors.dark.negative :
                    item.tag === "주의" ? Colors.dark.accent : Colors.dark.positive
                }]}>{item.tag}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.scheduleTitle, isToday && { color: Colors.dark.accent }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.scheduleSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>

        <View style={styles.bellColumn}>
          <AlarmBell
            isOn={alarmedIds.has(item.id)}
            onToggle={() => onToggleAlarm(item.id)}
          />
        </View>
      </View>
    </Pressable>
  );
}

interface ScheduleCalendarProps {
  items: ScheduleItem[];
  onShowMore?: () => void;
  onItemPress?: (item: ScheduleItem) => void;
}

export default function ScheduleCalendar({ items, onShowMore, onItemPress }: ScheduleCalendarProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [alarmedIds, setAlarmedIds] = useState<Set<string>>(new Set(["s1", "s4"]));

  const toggleAlarm = (id: string) => {
    setAlarmedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredItems = activeFilter === "all"
    ? items
    : items.filter(i => i.type === activeFilter);

  const todayCount = items.filter(i => i.daysFromNow === 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>주요 일정</Text>
          <Text style={styles.sectionSubtitle}>놓치면 안 되는 일정들</Text>
        </View>
        <View style={styles.headerBadges}>
          {todayCount > 0 && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>오늘 {todayCount}건</Text>
            </View>
          )}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}건</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTERS.map(f => (
          <FilterChip
            key={f.id}
            filter={f}
            isActive={activeFilter === f.id}
            onPress={() => setActiveFilter(f.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.scheduleList}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={28} color={Colors.dark.textTertiary} />
            <Text style={styles.emptyText}>해당 카테고리의 일정이 없어요</Text>
          </View>
        ) : (
          filteredItems.slice(0, 3).map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              alarmedIds={alarmedIds}
              onToggleAlarm={toggleAlarm}
              onPress={item.detail ? () => onItemPress?.(item) : undefined}
            />
          ))
        )}
        <Pressable
          style={({ pressed }) => [styles.moreButton, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShowMore?.();
          }}
        >
          <Text style={styles.moreText}>일정 더 보기</Text>
          <Feather name="chevron-right" size={14} color={Colors.dark.textSecondary} />
        </Pressable>
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
  headerBadges: {
    flexDirection: "row",
    gap: 6,
  },
  todayBadge: {
    backgroundColor: `${Colors.dark.negative}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.negative,
  },
  countBadge: {
    backgroundColor: `${Colors.dark.accent}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.accent,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  scheduleList: {
    marginHorizontal: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: "hidden",
  },
  scheduleCard: {
    paddingHorizontal: 14,
    position: "relative",
  },
  todayCard: {
    backgroundColor: `${Colors.dark.accent}08`,
  },
  todayStripe: {
    position: "absolute",
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.divider,
  },
  ddayColumn: {
    width: 52,
    alignItems: "center",
    gap: 3,
  },
  ddayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ddayText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textTertiary,
  },
  scheduleContent: {
    flex: 1,
    gap: 4,
  },
  scheduleTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  scheduleTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  scheduleSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  bellColumn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.divider,
  },
  moreText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
});
