import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Modal, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ASSETS, Asset } from "@/lib/mock-data";
import { filterCoins, FilterCategoryId } from "@/lib/coin-data";
import WebModalWrapper from "./WebModalWrapper";

interface AssetSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedAssets: string[];
  onToggle: (assetId: string) => void;
  chartColorMap: Record<string, string>;
}

function AssetRow({ asset, isSelected, chartColor, onToggle, disabled }: {
  asset: Asset;
  isSelected: boolean;
  chartColor?: string;
  onToggle: () => void;
  disabled: boolean;
}) {
  const getIcon = () => {
    if (asset.id === "btc") return <MaterialCommunityIcons name="bitcoin" size={20} color={asset.iconColor} />;
    if (asset.id === "eth") return <MaterialCommunityIcons name="ethereum" size={20} color={asset.iconColor} />;
    return <Feather name={asset.icon as any} size={16} color={asset.iconColor} />;
  };

  const isPositive = asset.change24h >= 0;

  return (
    <Pressable
      onPress={() => {
        if (!disabled || isSelected) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }
      }}
      style={({ pressed }) => [
        styles.assetRow,
        pressed && { opacity: 0.7 },
        disabled && !isSelected && { opacity: 0.4 },
      ]}
    >
      <View style={[styles.assetIcon, { backgroundColor: `${asset.iconColor}15` }]}>
        {getIcon()}
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
      </View>
      <Text style={[
        styles.assetChange,
        { color: isPositive ? Colors.dark.positive : Colors.dark.negative },
      ]}>
        {isPositive ? "+" : ""}{asset.change24h}%
      </Text>
      <View style={[
        styles.checkCircle,
        isSelected && { backgroundColor: chartColor || Colors.dark.accent, borderColor: chartColor || Colors.dark.accent },
      ]}>
        {isSelected && <Feather name="check" size={12} color="#FFF" />}
      </View>
    </Pressable>
  );
}

const MY_HOLDINGS = ["btc", "eth", "sol", "xrp", "bnb"];
const SAVED_FILTERS_KEY = "saved_coin_filters";

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<FilterCategoryId, string | null>;
  createdAt: number;
}

export default function AssetSearchSheet({ visible, onClose, selectedAssets, onToggle, chartColorMap }: AssetSearchSheetProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [holdingsOnly, setHoldingsOnly] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(SAVED_FILTERS_KEY).then(val => {
        if (val) {
          try { setSavedFilters(JSON.parse(val)); } catch {}
        }
      });
    }
  }, [visible]);

  const activeFilterCoinIds = useMemo(() => {
    if (!activeFilterId) return null;
    const sf = savedFilters.find(f => f.id === activeFilterId);
    if (!sf) return null;
    const coins = filterCoins(sf.filters);
    return new Set(coins.map(c => c.id));
  }, [activeFilterId, savedFilters]);

  const filteredAssets = useMemo(() => {
    let list = ASSETS;
    if (holdingsOnly) {
      list = list.filter(a => MY_HOLDINGS.includes(a.id));
    }
    if (activeFilterCoinIds) {
      list = list.filter(a => activeFilterCoinIds.has(a.id));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, holdingsOnly, activeFilterCoinIds]);

  const maxReached = selectedAssets.length >= 5;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <WebModalWrapper>
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[
          styles.sheet,
          { paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 16) },
        ]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>종목 추가</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={Colors.dark.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="이름 또는 심볼로 검색"
              placeholderTextColor={Colors.dark.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Feather name="x-circle" size={16} color={Colors.dark.textTertiary} />
              </Pressable>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHoldingsOnly(!holdingsOnly);
                if (!holdingsOnly) setActiveFilterId(null);
              }}
              style={[styles.filterChip, holdingsOnly && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, holdingsOnly && { color: Colors.dark.accent }]}>보유종목</Text>
            </Pressable>
            {savedFilters.map(sf => {
              const isActive = activeFilterId === sf.id;
              return (
                <Pressable
                  key={sf.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveFilterId(isActive ? null : sf.id);
                    if (!isActive) setHoldingsOnly(false);
                  }}
                  style={[styles.filterChip, styles.savedFilterChip, isActive && styles.filterChipActive]}
                >
                  <Feather name="bookmark" size={10} color={isActive ? Colors.dark.accent : Colors.dark.textTertiary} />
                  <Text style={[styles.filterChipText, isActive && { color: Colors.dark.accent }]} numberOfLines={1}>{sf.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              {selectedAssets.length}개 선택됨
            </Text>
            <Text style={styles.selectionLimit}>최대 5개</Text>
          </View>
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredAssets.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.includes(asset.id)}
                chartColor={chartColorMap[asset.id]}
                onToggle={() => onToggle(asset.id)}
                disabled={maxReached}
              />
            ))}
            {filteredAssets.length === 0 && (
              <View style={styles.emptySearch}>
                <Feather name="search" size={24} color={Colors.dark.textTertiary} />
                <Text style={styles.emptySearchText}>검색 결과가 없어요</Text>
              </View>
            )}
          </ScrollView>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
            style={({ pressed }) => [styles.doneButton, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.doneButtonText}>완료</Text>
          </Pressable>
        </View>
      </View>
      </WebModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.textTertiary,
    opacity: 0.3,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.text,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  savedFilterChip: {
    borderStyle: "dashed" as any,
  },
  filterChipActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: `${Colors.dark.accent}15`,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
    maxWidth: 100,
  },
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
  },
  selectionLimit: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  listScroll: {
    maxHeight: 360,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  assetInfo: {
    flex: 1,
    gap: 1,
  },
  assetName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
  },
  assetSymbol: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textTertiary,
  },
  assetChange: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginRight: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySearch: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textTertiary,
  },
  doneButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.dark.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },
});
