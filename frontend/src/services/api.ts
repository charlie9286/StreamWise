import { API_BASE_URL } from "../config";

interface LookupRequest {
  input: string;
  locale?: string;
}

interface LookupResponse {
  success: boolean;
  title?: string;
  rating?: string;
  genre?: string;
  runtime?: string;
  imdbId?: string;
  posterUrl?: string;
  error?: string;
  message?: string;
}

export const apiService = {
  async lookup(input: string, locale?: string): Promise<LookupResponse> {
    const request: LookupRequest = {
      input,
      locale,
    };

    const url = `${API_BASE_URL}/lookup`;
    console.log(`[API] Making request to: ${url}`);
    console.log(`[API] Request body:`, request);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      console.log(`[API] Response status: ${response.status}`);
      console.log(`[API] Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[API] Response data:`, data);
      return data;
    } catch (error) {
      console.error("[API] Fetch error:", error);
      console.error("[API] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        url,
        input,
      });
      throw error;
    }
  },
};
