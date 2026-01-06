// API Configuration
// For development: use localhost (works on simulator) or your computer's local IP for physical devices
// For production: use your Vercel deployment URL (NOT the dashboard URL)
// 
// To find your Vercel URL:
// 1. Go to: https://vercel.com/charlie9286s-projects/streamwise
// 2. Click on your project name
// 3. Look for "Domains" section - it will show something like:
//    - streamwise.vercel.app
//    - streamwise-backend.vercel.app
//    - streamwise-xxx.vercel.app
// 4. Use that .vercel.app URL (NOT the vercel.com dashboard URL!)
//
// IMPORTANT: The URL should end in .vercel.app, NOT vercel.com!
// API Configuration
// Development: use localhost (works for simulator and when backend is running locally)
// Production: use Vercel deployment URL
export const API_BASE_URL = 
  typeof __DEV__ !== 'undefined' && __DEV__
    ? "http://localhost:4000"  // Development: localhost works for simulator
    : "https://streamwise-ecru.vercel.app"; // Production: Vercel deployment
