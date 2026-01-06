# How to Find Your Vercel Deployment URL

## Steps:

1. Go to: https://vercel.com/charlie9286s-projects/streamwise
2. Look at the **"Domains"** section or the deployment card
3. Your URL will be one of these formats:
   - `https://streamwise-backend.vercel.app`
   - `https://streamwise-backend-xxx.vercel.app`
   - `https://streamwise.vercel.app`
   - Or a custom domain if you set one up

4. **DO NOT use:**
   - ❌ `https://vercel.com/charlie9286s-projects/streamwise/...` (this is the dashboard URL)
   - ❌ `https://vercel.com/...` (any vercel.com URL)

5. **DO use:**
   - ✅ `https://something.vercel.app` (the actual deployment URL)

## Test Your URL:

Once you have the URL, test it:
```bash
curl https://your-url.vercel.app/health
```

Should return: `{"ok":true}`

## Update Config:

Then update `frontend/src/config.ts` with the correct URL.
