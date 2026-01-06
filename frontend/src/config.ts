// API Configuration
// For physical devices in development, change this to your computer's local IP address
// e.g., "http://192.168.1.100:4000"
// For production, replace with your actual Vercel deployment URL
// Find it in: https://vercel.com/charlie9286s-projects/streamwise
export const API_BASE_URL = __DEV__
  ? "http://localhost:4000"
  : "https://YOUR-VERCEL-URL-HERE.vercel.app"; // TODO: Replace with your Vercel URL
