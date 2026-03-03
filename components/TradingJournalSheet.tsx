import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import WebModalWrapper from "./WebModalWrapper";
import Colors from "@/constants/colors";
import {
  TradingJournalEntry,
  MOOD_OPTIONS,
  MOOD_COLORS,
  TECHNICAL_TAGS,
  REASON_TAGS,
  DayTradingData,
  formatProfitShort,
} from "@/lib/trading-data";

interface TradingJournalSheetProps {
  visible: boolean;
  onClose: () => void;
  dateStr: string;
  dayData: DayTradingData | null;
  existingEntry: TradingJournalEntry | null;
  onSave: (entry: TradingJournalEntry) => void;
}

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parseInt(parts[1])}월 ${parseInt(parts[2])}일 매매일지`;
}

export default function TradingJournalSheet({
  visible,
  onClose,
  dateStr,
  dayData,
  existingEntry,
  onSave,
}: TradingJournalSheetProps) {
  const [mood, setMood] = useState(3);
  const [score, setScore] = useState(50);
  const [technicalTags, setTechnicalTags] = useState<string[]>([]);
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (existingEntry) {
      setMood(existingEntry.mood);
      setScore(existingEntry.score);
      setTechnicalTags(existingEntry.technicalTags);
      setReasonTags(existingEntry.reasonTags);
      setMemo(existingEntry.memo);
    } else {
      setMood(3);
      setScore(50);
      setTechnicalTags([]);
      setReasonTags([]);
      setMemo("");
    }
  }, [existingEntry, dateStr]);

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (list.includes(tag)) {
      setter(list.filter((t) => t !== tag));
    } else {
      setter([...list, tag]);
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      date: dateStr,
      mood,
      score,
      technicalTags,
      reasonTags,
      memo,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <WebModalWrapper>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.headerTitle}>{formatDateLabel(dateStr)}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Feather name="x" size={20} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            {dayData && (
              <View style={styles.daySummary}>
                <View style={styles.daySummaryItem}>
                  <Text style={styles.daySummaryLabel}>손익</Text>
                  <Text
                    style={[
                      styles.daySummaryValue,
                      { color: dayData.profit >= 0 ? Colors.dark.positive : Colors.dark.negative },
                    ]}
                  >
                    {formatProfitShort(dayData.profit)}
                  </Text>
                </View>
                <View style={styles.daySummaryDivider} />
                <View style={styles.daySummaryItem}>
                  <Text style={styles.daySummaryLabel}>거래 횟수</Text>
                  <Text style={styles.daySummaryValue}>{dayData.tradeCount}회</Text>
                </View>
              </View>
            )}

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={styles.sectionLabel}>오늘의 매매 기분은?</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = mood === m.value;
                  return (
                    <Pressable
                      key={m.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setMood(m.value);
                      }}
                      style={[
                        styles.moodItem,
                        isSelected && {
                          backgroundColor: `${MOOD_COLORS[m.value]}18`,
                          borderColor: MOOD_COLORS[m.value],
                        },
                      ]}
                    >
                      <Feather
                        name={m.icon as any}
                        size={22}
                        color={isSelected ? MOOD_COLORS[m.value] : Colors.dark.textTertiary}
                      />
                      <Text
                        style={[
                          styles.moodLabel,
                          isSelected && { color: MOOD_COLORS[m.value] },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.scoreSection}>
                <View style={styles.scoreHeader}>
                  <View>
                    <Text style={styles.sectionLabel}>나의 매매 점수</Text>
                    <Text style={styles.scoreHint}>
                      수익보다 원칙 준수가 중요해요
                    </Text>
                  </View>
                  <Text style={[styles.scoreValue, { color: MOOD_COLORS[mood] }]}>
                    {score}점
                  </Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      {
                        width: `${score}%`,
                        backgroundColor: MOOD_COLORS[mood],
                      },
                    ]}
                  />
                </View>
                <View style={styles.sliderButtons}>
                  {[10, 30, 50, 70, 90].map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setScore(v);
                      }}
                      style={[
                        styles.sliderBtn,
                        score === v && { backgroundColor: `${MOOD_COLORS[mood]}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sliderBtnText,
                          score === v && { color: MOOD_COLORS[mood] },
                        ]}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionLabel}>기술적 근거</Text>
              <View style={styles.tagGrid}>
                {TECHNICAL_TAGS.map((tag) => {
                  const isActive = technicalTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag, technicalTags, setTechnicalTags)}
                      style={[styles.tag, isActive && styles.tagActive]}
                    >
                      <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>매매 심리/원인</Text>
              <View style={styles.tagGrid}>
                {REASON_TAGS.map((tag) => {
                  const isActive = reasonTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag, reasonTags, setReasonTags)}
                      style={[styles.tag, isActive && styles.tagActive]}
                    >
                      <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>매매 메모</Text>
              <TextInput
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                placeholder="오늘 매매에서 배운 점이나 내일의 전략을 적어보세요."
                placeholderTextColor={Colors.dark.textTertiary}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </ScrollView>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.saveButtonText}>저장 완료</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
      </WebModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.textTertiary,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  daySummary: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 12,
    padding: 14,
  },
  daySummaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  daySummaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  daySummaryValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  daySummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.dark.divider,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    marginBottom: 10,
    marginTop: 6,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textTertiary,
  },
  scoreSection: {
    marginBottom: 18,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scoreHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
  scoreValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sliderBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textTertiary,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  tagActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: `${Colors.dark.accent}15`,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  tagTextActive: {
    color: Colors.dark.accent,
  },
  memoInput: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    minHeight: 100,
    marginBottom: 10,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: Colors.dark.accent,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
