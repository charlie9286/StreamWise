import { API_BASE_URL } from "../config";

interface LookupRequest {
  input: string;
  locale?: string;
}

interface LookupResponse {
  success: boolean;
  title?: string;
  rating?: string;
  year?: string;
  runtime?: string;
  imdbId?: string;
  error?: string;
  message?: string;
}

export const apiService = {
  async lookup(input: string, locale?: string): Promise<LookupResponse> {
    const request: LookupRequest = {
      input,
      locale,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },
};
