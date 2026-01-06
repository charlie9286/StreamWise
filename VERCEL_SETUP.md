# Vercel Deployment Setup

## Backend Configuration

The backend is configured to deploy on Vercel from the `backend/` directory.

### Environment Variables

In your Vercel project settings, add these environment variables:

1. Go to: https://vercel.com/charlie9286s-projects/streamwise/settings/environment-variables
2. Add:
   - `TMDB_API_KEY` = your TMDB API key
   - `FALLBACK_API_KEY` = (optional) fallback TMDB API key
   - `NODE_ENV` = `production`

### Finding Your Vercel URL

1. Go to your Vercel dashboard: https://vercel.com/charlie9286s-projects/streamwise
2. Your deployment URL will be something like: `https://streamwise-xxx.vercel.app` or `https://streamwise-backend.vercel.app`
3. Copy this URL

### Update Frontend Config

Once you have your Vercel URL, update `frontend/src/config.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? "http://localhost:4000"
  : "https://YOUR-VERCEL-URL-HERE.vercel.app";
```

Replace `YOUR-VERCEL-URL-HERE` with your actual Vercel deployment URL.

### Testing

1. Make sure your backend is deployed on Vercel
2. Test the health endpoint: `https://your-vercel-url.vercel.app/health`
3. Update the frontend config with the Vercel URL
4. Rebuild/restart your mobile app
