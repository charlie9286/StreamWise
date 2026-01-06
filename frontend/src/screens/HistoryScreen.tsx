import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Icon } from "../components/Icon";
import { storageService } from "../services/storage";
import { ResultCard } from "../components/ResultCard";

interface HistoryItem {
  id: string;
  input: string;
  title?: string;
  service: "netflix" | "manual";
  rating?: string;
  year?: string;
  runtime?: string;
  imdbId?: string;
  posterUrl?: string;
  checkedAt: number;
}

interface LookupResponse {
  success: boolean;
  title?: string;
  rating?: string;
  year?: string;
  runtime?: string;
  imdbId?: string;
  posterUrl?: string;
}

type FilterType = "all" | "netflix";

export const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const styles = createStyles(isDark);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    filterHistory();
  }, [history, searchQuery, filter]);

  const loadHistory = async () => {
    const items = await storageService.getHistory();
    setHistory(items);
  };

  const filterHistory = () => {
    let filtered = [...history];

    if (filter === "netflix") {
      filtered = filtered.filter((item) => item.service === "netflix");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.input.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query))
      );
    }

    setFilteredHistory(filtered);
  };

  const handleDelete = async (id: string, swipeableRef?: Swipeable) => {
    // Close swipeable if open
    if (swipeableRef) {
      swipeableRef.close();
    }
    
    // Delete immediately without confirmation
    await storageService.deleteHistoryItem(id);
    loadHistory();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const result: LookupResponse = {
      success: true,
      title: item.title,
      rating: item.rating,
      year: item.year,
      runtime: item.runtime,
      imdbId: item.imdbId,
    };

    let swipeableRef: Swipeable | null = null;

    const renderRightActions = (
      progress: Animated.AnimatedInterpolation,
      dragX: Animated.AnimatedInterpolation
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <View style={styles.deleteAction}>
          <Animated.View style={[styles.deleteActionContent, { transform: [{ scale }] }]}>
            <Text style={styles.deleteActionText}>{t("history.delete")}</Text>
          </Animated.View>
        </View>
      );
    };

    return (
      <Swipeable
        ref={(ref) => {
          swipeableRef = ref;
        }}
        renderRightActions={renderRightActions}
        rightThreshold={80}
        overshootRight={false}
        onSwipeableOpen={(direction) => {
          if (direction === 'right') {
            // Auto-delete when swipe is fully opened
            handleDelete(item.id, swipeableRef || undefined);
          }
        }}
      >
               <TouchableOpacity
                 style={styles.historyItem}
                 onPress={() => setSelectedItem(item)}
                 activeOpacity={0.7}
               >
                 {item.posterUrl && (
                   <Image
                     source={{ uri: item.posterUrl }}
                     style={styles.posterImage}
                     resizeMode="cover"
                   />
                 )}
                 <View style={styles.historyItemContent}>
                   <Text style={styles.historyItemTitle} numberOfLines={1}>
                     {item.title || item.input}
                   </Text>
                   <View style={styles.historyItemMeta}>
                     <Text style={styles.historyItemMetaText}>
                       {item.rating && `⭐ ${item.rating}`}
                       {item.year && ` • ${item.year}`}
                       {item.runtime && ` • ${item.runtime} min`}
                     </Text>
                     <Text style={styles.historyItemDate}>
                       {formatDate(item.checkedAt)}
                     </Text>
                   </View>
                 </View>
                 <Icon
                   name="chevron-forward"
                   size={20}
                   color={isDark ? "#8E8E93" : "#6B7280"}
                 />
               </TouchableOpacity>
      </Swipeable>
    );
  };

         if (selectedItem) {
           const result: LookupResponse = {
             success: true,
             title: selectedItem.title,
             rating: selectedItem.rating,
             year: selectedItem.year,
             runtime: selectedItem.runtime,
             imdbId: selectedItem.imdbId,
             posterUrl: selectedItem.posterUrl,
           };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedItem(null)}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={isDark ? "#FFFFFF" : "#111827"}
          />
          <Text style={styles.backButtonText}>{t("history.title")}</Text>
        </TouchableOpacity>
        <View style={styles.resultContainer}>
          <ResultCard result={result} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("history.searchPlaceholder")}
          placeholderTextColor={isDark ? "#8E8E93" : "#9CA3AF"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "all" && styles.filterButtonTextActive,
            ]}
          >
            {t("history.filterAll")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "netflix" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("netflix")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "netflix" && styles.filterButtonTextActive,
            ]}
          >
            {t("history.filterNetflix")}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("history.noHistory")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#000000" : "#F9FAFB",
    },
    searchContainer: {
      padding: 16,
      backgroundColor: isDark ? "#000000" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2C2C2E" : "#E5E7EB",
    },
    searchInput: {
      backgroundColor: isDark ? "#1C1C1E" : "#F3F4F6",
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    filterContainer: {
      flexDirection: "row",
      padding: 16,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#1C1C1E" : "#E5E7EB",
      alignItems: "center",
      marginRight: 6,
    },
    filterButtonActive: {
      backgroundColor: isDark ? "#4A90E2" : "#2563EB",
    },
    filterButtonText: {
      color: isDark ? "#8E8E93" : "#6B7280",
      fontSize: 14,
      fontWeight: "500",
    },
    filterButtonTextActive: {
      color: "#FFFFFF",
    },
    listContent: {
      padding: 16,
    },
           historyItem: {
             flexDirection: "row",
             alignItems: "center",
             backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
             borderRadius: 12,
             padding: 16,
             marginBottom: 12,
             shadowColor: "#000",
             shadowOffset: { width: 0, height: 1 },
             shadowOpacity: 0.05,
             shadowRadius: 2,
             elevation: 2,
           },
           posterImage: {
             width: 50,
             height: 75,
             borderRadius: 8,
             marginRight: 12,
             backgroundColor: isDark ? "#2C2C2E" : "#E5E7EB",
           },
           historyItemContent: {
             flex: 1,
           },
    historyItemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 8,
    },
    historyItemMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    historyItemMetaText: {
      fontSize: 14,
      color: isDark ? "#8E8E93" : "#6B7280",
    },
    historyItemDate: {
      fontSize: 12,
      color: isDark ? "#8E8E93" : "#9CA3AF",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#8E8E93" : "#6B7280",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDark ? "#000000" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2C2C2E" : "#E5E7EB",
    },
    backButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
      marginLeft: 8,
    },
    resultContainer: {
      flex: 1,
      padding: 16,
    },
    deleteAction: {
      flex: 1,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "flex-end",
      borderRadius: 12,
      marginBottom: 12,
    },
    deleteActionContent: {
      width: 100,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingRight: 20,
    },
    deleteActionText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });
