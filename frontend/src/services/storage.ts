import AsyncStorage from "@react-native-async-storage/async-storage";

interface HistoryItem {
  id: string;
  input: string;
  title?: string;
  service: "netflix" | "manual";
  rating?: string;
  genre?: string;
  runtime?: string;
  imdbId?: string;
  posterUrl?: string;
  checkedAt: number;
}

const HISTORY_KEY = "@streamwise:history";

export const storageService = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading history:", error);
      return [];
    }
  },

  async saveHistoryItem(item: HistoryItem): Promise<void> {
    try {
      const history = await this.getHistory();
      
      // Normalize Netflix URLs for comparison (remove query params and country codes)
      const normalizeUrl = (url: string): string => {
        if (!url.includes('netflix.com')) return url.toLowerCase().trim();
        const titleMatch = url.match(/netflix\.com\/(?:[a-z]{2}\/)?title\/(\d+)/i);
        const jbvMatch = url.match(/netflix\.com\/[^?]*\?jbv=(\d+)/i);
        if (titleMatch) return `netflix-title-${titleMatch[1]}`;
        if (jbvMatch) return `netflix-jbv-${jbvMatch[1]}`;
        return url.toLowerCase().trim();
      };
      
      // Create a key for comparison (prefer title, fallback to normalized input)
      const itemKey = item.title 
        ? item.title.toLowerCase().trim()
        : normalizeUrl(item.input);
      
      // Find existing entry with same title or normalized input
      const existingIndex = history.findIndex((existing) => {
        const existingKey = existing.title
          ? existing.title.toLowerCase().trim()
          : normalizeUrl(existing.input);
        return itemKey === existingKey;
      });
      
      if (existingIndex !== -1) {
        // Update existing entry with new timestamp and data, then move to top
        const existing = history[existingIndex];
        const updated = {
          ...item,
          id: existing.id, // Keep the original ID
        };
        history.splice(existingIndex, 1);
        history.unshift(updated);
      } else {
        // Add new entry at the beginning
        history.unshift(item);
      }
      
      // Keep last 100 items
      const updated = history.slice(0, 100);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving history item:", error);
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = history.filter((h) => h.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  },
};
