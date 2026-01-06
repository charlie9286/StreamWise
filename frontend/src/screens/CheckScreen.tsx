import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { useColorScheme } from "react-native";
import { apiService } from "../services/api";
import { storageService } from "../services/storage";
import { ResultCard } from "../components/ResultCard";

interface LookupResponse {
  success: boolean;
  title?: string;
  rating?: string;
  year?: string;
  runtime?: string;
  imdbId?: string;
  posterUrl?: string;
  error?: string;
  message?: string;
}

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

export const CheckScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastLookupInput, setLastLookupInput] = useState<string>("");

  const styles = createStyles(isDark);

  useEffect(() => {
    loadAutoPaste();
  }, []);

  const loadAutoPaste = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText && clipboardText.trim().length > 0) {
        const trimmed = clipboardText.trim();
        setInput(trimmed);
        // Auto-trigger lookup when pasting from clipboard on load
        if (trimmed.length > 0) {
          handleLookup(trimmed);
        }
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
    }
  };

  // Auto-trigger lookup when input changes (user pastes or types)
  useEffect(() => {
    const trimmed = input.trim();
    // Only auto-lookup if:
    // - Input is not empty
    // - It's different from the last lookup (avoid duplicate lookups)
    // - Not currently loading
    // - Input looks like a URL or has substantial content
    if (
      trimmed.length > 0 &&
      trimmed !== lastLookupInput &&
      !loading &&
      (trimmed.includes("netflix.com") || trimmed.length > 3)
    ) {
      // Small delay to avoid triggering on every keystroke
      const timer = setTimeout(() => {
        if (input.trim() === trimmed) {
          handleLookup(trimmed);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [input]);

  const handleLookup = async (text?: string) => {
    const lookupText = text || input.trim();
    if (!lookupText || lookupText === lastLookupInput) {
      return;
    }

    setLastLookupInput(lookupText);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const locale = i18n.language === "es" ? "es-ES" : "en-US";
      const response = await apiService.lookup(lookupText, locale);

      if (response.success) {
        setResult(response);

              const historyItem: HistoryItem = {
                id: `${Date.now()}-${Math.random()}`,
                input: lookupText,
                title: response.title,
                service: response.error ? "manual" : "netflix",
                rating: response.rating,
                year: response.year,
                runtime: response.runtime,
                imdbId: response.imdbId,
                posterUrl: response.posterUrl,
                checkedAt: Date.now(),
              };
        await storageService.saveHistoryItem(historyItem);
      } else {
        // Show specific error messages based on error type
        let errorMessage = t("check.errorMessage");
        if (response.error === "UNRESOLVED_NETFLIX_LINK") {
          errorMessage = t("check.netflixError") || response.message || errorMessage;
        } else if (response.error === "NOT_FOUND") {
          errorMessage = t("check.errorMessage");
        } else {
          errorMessage = response.message || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("[CheckScreen] Lookup error:", error);
      // Check if it's a network error
      const errorMessage = error instanceof Error && error.message.includes("fetch")
        ? t("check.networkError") || "Network error. Check your internet connection."
        : t("check.errorMessage");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.instruction}>
            {t("check.instruction") || "On Netflix, click Share and copy link, then paste it here."}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t("check.inputPlaceholder") || "Paste Netflix link or enter title..."}
            placeholderTextColor={isDark ? "#8E8E93" : "#9CA3AF"}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={() => handleLookup()}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? "#4A90E2" : "#2563EB"} />
              <Text style={styles.loadingText}>{t("check.loading") || "Looking up..."}</Text>
            </View>
          )}

          {result && result.success && <ResultCard result={result} />}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#000000" : "#F9FAFB",
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    instruction: {
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 24,
      lineHeight: 24,
      textAlign: "center",
    },
    input: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#2C2C2E" : "#E5E7EB",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: isDark ? "#8E8E93" : "#6B7280",
    },
    errorContainer: {
      backgroundColor: isDark ? "#2C1B1B" : "#FEE2E2",
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    errorText: {
      color: isDark ? "#FF6B6B" : "#DC2626",
      fontSize: 14,
    },
  });
