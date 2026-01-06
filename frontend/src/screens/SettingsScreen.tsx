import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storageService } from "../services/storage";

const SETTINGS_KEY = "@streamwise:settings";
const AUTO_PASTE_KEY = "@streamwise:autoPaste";

interface AppSettings {
  language: "auto" | "en" | "es";
  autoPaste: boolean;
}

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [language, setLanguage] = useState<"auto" | "en" | "es">("auto");
  const [autoPaste, setAutoPaste] = useState(true);

  const styles = createStyles(isDark);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsData) {
        const settings: AppSettings = JSON.parse(settingsData);
        setLanguage(settings.language || "auto");
        setAutoPaste(settings.autoPaste !== false);
      }

      const autoPasteData = await AsyncStorage.getItem(AUTO_PASTE_KEY);
      if (autoPasteData !== null) {
        setAutoPaste(JSON.parse(autoPasteData));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveLanguage = async (lang: "auto" | "en" | "es") => {
    setLanguage(lang);
    try {
      const settings: AppSettings = {
        language: lang,
        autoPaste,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      if (lang === "auto") {
        const Localization = require("expo-localization");
        const locale = Localization.getLocales()[0]?.languageCode || "en";
        i18n.changeLanguage(locale);
      } else {
        i18n.changeLanguage(lang);
      }
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const saveAutoPaste = async (value: boolean) => {
    setAutoPaste(value);
    try {
      await AsyncStorage.setItem(AUTO_PASTE_KEY, JSON.stringify(value));
      const settings: AppSettings = {
        language,
        autoPaste: value,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving auto-paste:", error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      t("settings.clearHistory"),
      t("settings.clearHistoryConfirm"),
      [
        { text: t("settings.cancel"), style: "cancel" },
        {
          text: t("settings.confirm"),
          style: "destructive",
          onPress: async () => {
            await storageService.clearHistory();
            Alert.alert("", "History cleared");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>

        <TouchableOpacity
          style={[
            styles.option,
            language === "auto" && styles.optionActive,
          ]}
          onPress={() => saveLanguage("auto")}
        >
          <Text
            style={[
              styles.optionText,
              language === "auto" && styles.optionTextActive,
            ]}
          >
            {t("settings.languageAuto")}
          </Text>
          {language === "auto" && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, language === "en" && styles.optionActive]}
          onPress={() => saveLanguage("en")}
        >
          <Text
            style={[
              styles.optionText,
              language === "en" && styles.optionTextActive,
            ]}
          >
            {t("settings.languageEn")}
          </Text>
          {language === "en" && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, language === "es" && styles.optionActive]}
          onPress={() => saveLanguage("es")}
        >
          <Text
            style={[
              styles.optionText,
              language === "es" && styles.optionTextActive,
            ]}
          >
            {t("settings.languageEs")}
          </Text>
          {language === "es" && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t("settings.autoPaste")}</Text>
          <Switch
            value={autoPaste}
            onValueChange={saveAutoPaste}
            trackColor={{
              false: isDark ? "#2C2C2E" : "#E5E7EB",
              true: isDark ? "#4A90E2" : "#2563EB",
            }}
            thumbColor={autoPaste ? "#FFFFFF" : "#FFFFFF"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.dangerButtonText}>
            {t("settings.clearHistory")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
        <Text style={styles.aboutText}>{t("settings.aboutText")}</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#000000" : "#F9FAFB",
    },
    section: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      marginTop: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#8E8E93" : "#6B7280",
      textTransform: "uppercase",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2C2C2E" : "#E5E7EB",
    },
    optionActive: {
      backgroundColor: isDark ? "#2C2C2E" : "#F3F4F6",
    },
    optionText: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
    },
    optionTextActive: {
      fontWeight: "600",
    },
    checkmark: {
      fontSize: 18,
      color: isDark ? "#4A90E2" : "#2563EB",
      fontWeight: "bold",
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    switchLabel: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      flex: 1,
    },
    dangerButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dangerButtonText: {
      fontSize: 16,
      color: isDark ? "#FF6B6B" : "#DC2626",
      fontWeight: "600",
    },
    aboutText: {
      fontSize: 14,
      color: isDark ? "#8E8E93" : "#6B7280",
      paddingHorizontal: 16,
      paddingVertical: 8,
      lineHeight: 20,
    },
  });
