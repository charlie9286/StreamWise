import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { Icon } from "./Icon";

interface LookupResponse {
  success: boolean;
  title?: string;
  rating?: string;
  year?: string;
  runtime?: string;
  imdbId?: string;
}

interface ResultCardProps {
  result: LookupResponse;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = createStyles(isDark);

        const rating = result.rating || t("result.na");
        const genre = result.genre || t("result.dash");
        const runtime = result.runtime
          ? `${result.runtime} min`
          : t("result.dash");

  return (
    <View style={styles.card}>
      {result.title && (
        <Text style={styles.title}>{result.title}</Text>
      )}
      
      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Icon
            name="star"
            size={32}
            color={isDark ? "#FFD700" : "#FFA500"}
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.label}>{t("result.rating")}</Text>
          <Text style={styles.value}>{rating}</Text>
        </View>
      </View>

            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Icon
                  name="calendar"
                  size={32}
                  color={isDark ? "#4A90E2" : "#2563EB"}
                />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.label}>{t("result.genre")}</Text>
                <Text style={styles.value}>{genre}</Text>
              </View>
            </View>

      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Icon
            name="time"
            size={32}
            color={isDark ? "#50C878" : "#059669"}
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.label}>{t("result.runtime")}</Text>
          <Text style={styles.value}>{runtime}</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      marginVertical: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 20,
      textAlign: "center",
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    iconContainer: {
      marginRight: 16,
    },
    itemContent: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      color: isDark ? "#8E8E93" : "#6B7280",
      marginBottom: 4,
      fontWeight: "500",
    },
    value: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#111827",
    },
  });
