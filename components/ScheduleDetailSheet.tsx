import React, { useState, useMemo, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, Platform, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withTiming, useSharedValue, runOnJS } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { ScheduleItem, ScheduleType, SCHEDULE_TYPE_CONFIG, EventDetail, HistoricalImpact } from "@/lib/schedule-data";
import { getScreenWidth } from "@/lib/screen-utils";
import WebModalWrapper from "./WebModalWrapper";

const SCREEN_WIDTH = getScreenWidth();

type FilterType = "all" | ScheduleType;
const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "economic", label: "경제지표" },
  { id: "lockup", label: "락업해제" },
  { id: "exchange", label: "거래소" },
];

function getWeekDates(baseOffset: number) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1) + baseOffset * 7);

  const days = [];
  const DAYS_SHORT = ["월", "화", "수", "목", "금", "토", "일"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    days.push({
      label: DAYS_SHORT[i],
      date: d.getDate(),
      month: d.getMonth() + 1,
      fullDate: `${d.getMonth() + 1}월 ${d.getDate()}일`,
      isToday,
      dateObj: d,
    });
  }

  const weekNum = Math.ceil(monday.getDate() / 7);
  const monthLabel = `${monday.getMonth() + 1}월`;

  return { days, monthLabel, weekNum };
}

function StickyCalendar({ selectedDate, onSelectDate, weekOffset, onChangeWeek, hasEvents }: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  weekOffset: number;
  onChangeWeek: (offset: number) => void;
  hasEvents: (fullDate: string) => boolean;
}) {
  const { days, monthLabel, weekNum } = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  return (
    <View style={calStyles.wrapper}>
      <View style={calStyles.row}>
        <Pressable onPress={() => onChangeWeek(weekOffset - 1)} hitSlop={12} style={calStyles.navBtn}>
          <Feather name="chevron-left" size={16} color={Colors.dark.textTertiary} />
        </Pressable>

        {days.map((day) => {
          const isSelected = day.fullDate === selectedDate;
          const hasEvt = hasEvents(day.fullDate);
          return (
            <Pressable
              key={day.date}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectDate(day.fullDate);
              }}
              style={calStyles.dayCol}
            >
              <Text style={[calStyles.dayLabel, day.isToday && calStyles.dayLabelToday]}>{day.label}</Text>
              <View style={[
                calStyles.dateCircle,
                isSelected && calStyles.dateCircleSelected,
                day.isToday && !isSelected && calStyles.dateCircleToday
              ]}>
                <Text style={[
                  calStyles.dateNum,
                  isSelected && calStyles.dateNumSelected,
                  day.isToday && !isSelected && calStyles.dateNumToday
                ]}>{day.date}</Text>
              </View>
              {hasEvt && !isSelected && <View style={calStyles.eventDot} />}
              {hasEvt && isSelected && <View style={calStyles.eventDotSelected} />}
              {!hasEvt && <View style={{ height: 4 }} />}
            </Pressable>
          );
        })}

        <Pressable onPress={() => onChangeWeek(weekOffset + 1)} hitSlop={12} style={calStyles.navBtn}>
          <Feather name="chevron-right" size={16} color={Colors.dark.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  wrapper: { paddingTop: 4, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.dark.divider },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  navBtn: { width: 28, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  dayCol: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 },
  dayLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.dark.textTertiary },
  dayLabelToday: { color: Colors.dark.accent, fontFamily: "Inter_600SemiBold" },
  dateCircle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dateCircleSelected: { backgroundColor: Colors.dark.accent },
  dateCircleToday: { backgroundColor: `${Colors.dark.accent}20` },
  dateNum: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.dark.textSecondary },
  dateNumSelected: { color: "#FFF", fontFamily: "Inter_700Bold" },
  dateNumToday: { color: Colors.dark.accent },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.dark.accent },
  eventDotSelected: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFF" },
});

function ScheduleRow({ item, onPress }: { item: ScheduleItem; onPress: () => void }) {
  const config = SCHEDULE_TYPE_CONFIG[item.type];
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [rowStyles.container, pressed && { opacity: 0.7 }]}
    >
      <View style={[rowStyles.iconWrap, { backgroundColor: `${config.color}15` }]}>
        <Feather name={config.icon as any} size={15} color={config.color} />
      </View>
      <View style={rowStyles.content}>
        <View style={rowStyles.titleRow}>
          <Text style={rowStyles.title} numberOfLines={1}>{item.title}</Text>
          {item.importance === "high" && (
            <View style={rowStyles.importBadge}>
              <Text style={rowStyles.importText}>주요</Text>
            </View>
          )}
        </View>
        <Text style={rowStyles.subtitle} numberOfLines={1}>{item.time || item.subtitle}</Text>
      </View>
      {item.detail && (
        <Feather name="chevron-right" size={16} color={Colors.dark.textTertiary} />
      )}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.dark.text, flexShrink: 1 },
  importBadge: { backgroundColor: `${Colors.dark.negative}18`, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  importText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.dark.negative },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.dark.textTertiary },
});

function HistoricalBar({ impact }: { impact: HistoricalImpact }) {
  const isPositive = impact.btcChange >= 0;
  const barWidth = Math.min(Math.abs(impact.btcChange) * 12, 80);
  const color = isPositive ? Colors.dark.positive : Colors.dark.negative;

  return (
    <View style={hStyles.row}>
      <Text style={hStyles.date}>{impact.date}</Text>
      <View style={hStyles.barContainer}>
        {!isPositive && <View style={[hStyles.bar, hStyles.barLeft, { width: barWidth, backgroundColor: color }]} />}
        <View style={hStyles.centerLine} />
        {isPositive && <View style={[hStyles.bar, hStyles.barRight, { width: barWidth, backgroundColor: color }]} />}
      </View>
      <Text style={[hStyles.change, { color }]}>
        {isPositive ? "+" : ""}{impact.btcChange.toFixed(1)}%
      </Text>
    </View>
  );
}

const hStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  date: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.dark.textSecondary, width: 52 },
  barContainer: { flex: 1, flexDirection: "row", alignItems: "center", height: 20, position: "relative" },
  centerLine: { position: "absolute", left: "50%", width: 1, height: 20, backgroundColor: Colors.dark.divider },
  bar: { height: 14, borderRadius: 4 },
  barLeft: { position: "absolute", right: "50%", marginRight: 1 },
  barRight: { position: "absolute", left: "50%", marginLeft: 1 },
  change: { fontSize: 12, fontFamily: "Inter_700Bold", width: 50, textAlign: "right" },
});

function EventDetailView({ item, onClose }: { item: ScheduleItem; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const detail = item.detail!;
  const config = SCHEDULE_TYPE_CONFIG[item.type];

  return (
    <View style={[edStyles.container, { paddingTop: Platform.OS === "web" ? 16 : insets.top }]}>
      <View style={edStyles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={Colors.dark.text} />
        </Pressable>
        <View style={edStyles.headerCenter}>
          <View style={[edStyles.typeBadge, { backgroundColor: `${config.color}18` }]}>
            <Feather name={config.icon as any} size={10} color={config.color} />
            <Text style={[edStyles.typeLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={edStyles.scroll}
        contentContainerStyle={[edStyles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={edStyles.titleSection}>
          <Text style={edStyles.title}>{item.title}</Text>
          <Text style={edStyles.dateInfo}>{item.date} {item.time && `· ${item.time}`}</Text>
        </View>

        {detail.forecast && (
          <View style={edStyles.forecastCard}>
            <Text style={edStyles.forecastLabel}>{detail.forecast.label}</Text>
            <View style={edStyles.forecastGrid}>
              <View style={edStyles.forecastCol}>
                <Text style={edStyles.forecastColLabel}>{item.type === "lockup" ? "이번" : "예측치"}</Text>
                <Text style={edStyles.forecastColValue}>{detail.forecast.forecast ?? "-"}</Text>
              </View>
              <View style={edStyles.forecastDivider} />
              <View style={edStyles.forecastCol}>
                <Text style={edStyles.forecastColLabel}>{item.type === "lockup" ? "상태" : "실제 발표"}</Text>
                <Text style={[edStyles.forecastColValue, detail.forecast.actual ? { color: Colors.dark.accent } : { color: Colors.dark.textTertiary }]}>
                  {detail.forecast.actual ?? (item.type === "lockup" ? "예정" : "대기중")}
                </Text>
              </View>
              <View style={edStyles.forecastDivider} />
              <View style={edStyles.forecastCol}>
                <Text style={edStyles.forecastColLabel}>이전</Text>
                <Text style={edStyles.forecastColValue}>{detail.forecast.previous}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={edStyles.card}>
          <View style={edStyles.cardHeader}>
            <Feather name="info" size={14} color={Colors.dark.accent} />
            <Text style={edStyles.cardTitle}>이게 뭔가요?</Text>
          </View>
          <Text style={edStyles.cardBody}>{detail.description}</Text>
        </View>

        <View style={edStyles.card}>
          <View style={edStyles.cardHeader}>
            <Feather name="alert-circle" size={14} color="#FF6B9D" />
            <Text style={edStyles.cardTitle}>왜 중요한가요?</Text>
          </View>
          <Text style={edStyles.cardBody}>{detail.whyImportant}</Text>
        </View>

        <View style={edStyles.scenarioSection}>
          <View style={edStyles.scenarioCard}>
            <View style={[edStyles.scenarioHeader, { backgroundColor: `${Colors.dark.positive}12` }]}>
              <Feather name="trending-up" size={14} color={Colors.dark.positive} />
              <Text style={[edStyles.scenarioLabel, { color: Colors.dark.positive }]}>
                {item.type === "lockup" ? "매도 압력 적을 시" : "예상치 상회 시"}
              </Text>
            </View>
            <Text style={edStyles.scenarioBody}>{detail.aboveExpectation}</Text>
          </View>
          <View style={edStyles.scenarioCard}>
            <View style={[edStyles.scenarioHeader, { backgroundColor: `${Colors.dark.negative}12` }]}>
              <Feather name="trending-down" size={14} color={Colors.dark.negative} />
              <Text style={[edStyles.scenarioLabel, { color: Colors.dark.negative }]}>
                {item.type === "lockup" ? "대량 매도 발생 시" : "예상치 하회 시"}
              </Text>
            </View>
            <Text style={edStyles.scenarioBody}>{detail.belowExpectation}</Text>
          </View>
        </View>

        {detail.historicalImpacts.length > 0 && (
          <View style={edStyles.card}>
            <View style={edStyles.cardHeader}>
              <Feather name="bar-chart-2" size={14} color="#FFD93D" />
              <Text style={edStyles.cardTitle}>과거 발표 후 BTC 가격 변동</Text>
            </View>
            <Text style={edStyles.histSubtitle}>발표 후 24시간 기준</Text>
            <View style={edStyles.histList}>
              <View style={edStyles.histLabels}>
                <Text style={edStyles.histLabelLeft}>하락</Text>
                <Text style={edStyles.histLabelRight}>상승</Text>
              </View>
              {detail.historicalImpacts.map((impact, i) => (
                <View key={i}>
                  <HistoricalBar impact={impact} />
                  <Text style={edStyles.histResult}>{impact.result}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const edStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerCenter: { flexDirection: "row", alignItems: "center" },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  titleSection: { gap: 6, paddingBottom: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.dark.text },
  dateInfo: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.dark.textSecondary },
  card: { backgroundColor: Colors.dark.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.cardBorder, padding: 16, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.dark.text },
  cardBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.dark.textSecondary, lineHeight: 20 },
  scenarioSection: { gap: 10 },
  scenarioCard: { backgroundColor: Colors.dark.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.cardBorder, overflow: "hidden" },
  scenarioHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  scenarioLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  scenarioBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.dark.textSecondary, lineHeight: 20, paddingHorizontal: 16, paddingVertical: 12 },
  histSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.dark.textTertiary, marginTop: -4 },
  histList: { gap: 2 },
  histLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 60 },
  histLabelLeft: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.dark.negative },
  histLabelRight: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.dark.positive },
  histResult: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.dark.textTertiary, paddingLeft: 60, marginTop: -4, marginBottom: 4 },
  forecastCard: { backgroundColor: Colors.dark.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.cardBorder, padding: 16, gap: 14 },
  forecastLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.dark.textSecondary },
  forecastGrid: { flexDirection: "row" as const, alignItems: "center" as const },
  forecastCol: { flex: 1, alignItems: "center" as const, gap: 4 },
  forecastColLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.dark.textTertiary },
  forecastColValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.dark.text },
  forecastDivider: { width: 1, height: 36, backgroundColor: Colors.dark.divider },
});

interface ScheduleDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  items: ScheduleItem[];
  initialEventItem?: ScheduleItem | null;
}

export default function ScheduleDetailSheet({ visible, onClose, items, initialEventItem }: ScheduleDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventDetailItem, setEventDetailItem] = useState<ScheduleItem | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const groupLayoutsRef = useRef<Map<string, number>>(new Map());
  const isAutoScrolling = useRef(false);

  React.useEffect(() => {
    if (visible && initialEventItem?.detail) {
      setEventDetailItem(initialEventItem);
    }
    if (!visible) {
      setEventDetailItem(null);
      setActiveFilter("all");
      setWeekOffset(0);
      setSelectedDate(null);
    }
  }, [visible, initialEventItem]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, []);

  const allDatesWithEvents = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.date));
    return set;
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = activeFilter === "all" ? items : items.filter(i => i.type === activeFilter);
    return result;
  }, [items, activeFilter]);

  const groupedByDate = useMemo(() => {
    const groups: { date: string; dayLabel: string; daysFromNow: number; items: ScheduleItem[] }[] = [];
    const map = new Map<string, ScheduleItem[]>();
    const metaMap = new Map<string, { dayLabel: string; daysFromNow: number }>();

    for (const item of filteredItems) {
      if (!map.has(item.date)) {
        map.set(item.date, []);
        metaMap.set(item.date, { dayLabel: item.dayLabel, daysFromNow: item.daysFromNow });
      }
      map.get(item.date)!.push(item);
    }

    for (const [date, dateItems] of map) {
      const meta = metaMap.get(date)!;
      groups.push({ date, dayLabel: meta.dayLabel, daysFromNow: meta.daysFromNow, items: dateItems });
    }

    return groups.sort((a, b) => a.daysFromNow - b.daysFromNow);
  }, [filteredItems]);

  const handleGroupLayout = useCallback((date: string, y: number) => {
    groupLayoutsRef.current.set(date, y);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isAutoScrolling.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    let closestDate: string | null = null;
    let closestDist = Infinity;

    groupLayoutsRef.current.forEach((y, date) => {
      const dist = Math.abs(y - scrollY - 20);
      if (y <= scrollY + 60 && dist < closestDist) {
        closestDist = dist;
        closestDate = date;
      }
    });

    if (closestDate && closestDate !== selectedDate) {
      setSelectedDate(closestDate);
      const weekDates = getWeekDates(weekOffset);
      const isInCurrentWeek = weekDates.days.some(d => d.fullDate === closestDate);
      if (!isInCurrentWeek) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOfThisWeek = new Date(today);
        mondayOfThisWeek.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));

        const dateMatch = (closestDate as string).match(/(\d+)월\s*(\d+)일/);
        if (dateMatch) {
          const targetMonth = parseInt(dateMatch[1]) - 1;
          const targetDay = parseInt(dateMatch[2]);
          const targetDate = new Date(today.getFullYear(), targetMonth, targetDay);
          const diffDays = Math.floor((targetDate.getTime() - mondayOfThisWeek.getTime()) / (1000 * 60 * 60 * 24));
          const newWeekOffset = Math.floor(diffDays / 7);
          if (newWeekOffset !== weekOffset) {
            setWeekOffset(newWeekOffset);
          }
        }
      }
    }
  }, [selectedDate, weekOffset]);

  const scrollToDate = useCallback((date: string) => {
    const y = groupLayoutsRef.current.get(date);
    if (y !== undefined && scrollRef.current) {
      isAutoScrolling.current = true;
      scrollRef.current.scrollTo({ y: y - 8, animated: true });
      setTimeout(() => { isAutoScrolling.current = false; }, 400);
    }
    setSelectedDate(date);
  }, []);

  if (!visible) return null;

  if (eventDetailItem && eventDetailItem.detail) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <WebModalWrapper>
        <EventDetailView item={eventDetailItem} onClose={() => setEventDetailItem(null)} />
        </WebModalWrapper>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <WebModalWrapper>
      <View style={[sStyles.container, { paddingTop: Platform.OS === "web" ? 16 : insets.top }]}>
        <View style={sStyles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={Colors.dark.text} />
          </Pressable>
          <Text style={sStyles.headerTitle}>주요 일정</Text>
          <Pressable
            onPress={() => {
              setWeekOffset(0);
              setSelectedDate(todayStr);
              scrollToDate(todayStr);
            }}
            hitSlop={12}
          >
            <Text style={sStyles.todayBtn}>오늘</Text>
          </Pressable>
        </View>

        <StickyCalendar
          selectedDate={selectedDate || todayStr}
          onSelectDate={(d) => {
            scrollToDate(d);
          }}
          weekOffset={weekOffset}
          onChangeWeek={setWeekOffset}
          hasEvents={(fullDate) => allDatesWithEvents.has(fullDate)}
        />

        <View style={sStyles.filterRow}>
          {FILTERS.map((f, idx) => {
            const isActive = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter(f.id);
                }}
                style={[
                  sStyles.filterChip,
                  isActive && sStyles.filterChipActive,
                ]}
              >
                <Text style={[sStyles.filterText, isActive && sStyles.filterTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          ref={scrollRef}
          style={sStyles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {groupedByDate.length === 0 ? (
            <View style={sStyles.empty}>
              <Feather name="calendar" size={28} color={Colors.dark.textTertiary} />
              <Text style={sStyles.emptyText}>해당 카테고리의 일정이 없어요</Text>
            </View>
          ) : (
            groupedByDate.map((group) => {
              const isToday = group.daysFromNow === 0;
              const isTomorrow = group.daysFromNow === 1;
              return (
                <View
                  key={group.date}
                  onLayout={(e: LayoutChangeEvent) => handleGroupLayout(group.date, e.nativeEvent.layout.y)}
                >
                  <View style={sStyles.dateHeader}>
                    <View style={sStyles.dateLeft}>
                      <Text style={[sStyles.dateNum, isToday && { color: Colors.dark.accent }]}>
                        {group.date.match(/(\d+)일/)?.[1]}
                      </Text>
                      <Text style={[sStyles.dateDayLabel, isToday && { color: Colors.dark.accent }]}>
                        {group.dayLabel}
                      </Text>
                    </View>
                    {isToday && (
                      <View style={sStyles.todayTag}>
                        <Text style={sStyles.todayTagText}>TODAY</Text>
                      </View>
                    )}
                    {isTomorrow && (
                      <View style={sStyles.tomorrowTag}>
                        <Text style={sStyles.tomorrowTagText}>D-1</Text>
                      </View>
                    )}
                  </View>
                  <View style={sStyles.eventList}>
                    {group.items.map(item => (
                      <ScheduleRow
                        key={item.id}
                        item={item}
                        onPress={() => {
                          if (item.detail) {
                            setEventDetailItem(item);
                          }
                        }}
                      />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
      </WebModalWrapper>
    </Modal>
  );
}

const sStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.dark.text },
  todayBtn: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.dark.accent },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 6, paddingTop: 10, paddingBottom: 6 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.dark.surface },
  filterChipActive: { backgroundColor: Colors.dark.accent },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.dark.textSecondary },
  filterTextActive: { color: "#FFF" },
  scroll: { flex: 1 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.dark.textTertiary },
  dateHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  dateLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  dateNum: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.dark.text },
  dateDayLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.dark.textSecondary },
  todayTag: { backgroundColor: `${Colors.dark.accent}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  todayTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.dark.accent, letterSpacing: 0.5 },
  tomorrowTag: { backgroundColor: `${Colors.dark.accentSecondary}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tomorrowTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.dark.accentSecondary, letterSpacing: 0.5 },
  eventList: { borderTopWidth: 0.5, borderTopColor: Colors.dark.divider, marginHorizontal: 16, borderRadius: 12, backgroundColor: Colors.dark.surface, overflow: "hidden" },
});
