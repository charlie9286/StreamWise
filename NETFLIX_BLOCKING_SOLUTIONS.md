# Netflix Blocking Solutions

## The Problem

Netflix actively blocks requests from cloud provider IP ranges (including AWS, Vercel, Google Cloud, etc.) to prevent scraping and protect their content. This means:

- ✅ **Localhost works** - Your home/office IP isn't blocked
- ❌ **Vercel fails** - Cloud provider IPs are blocked
- ❌ **AWS Lambda will likely fail** - AWS IPs are also blocked
- ❌ **Most cloud providers fail** - Netflix blocks datacenter IPs

## Why This Happens

Netflix blocks cloud IPs to:
- Prevent automated scraping
- Reduce proxy/VPN abuse
- Protect their content distribution
- Comply with licensing agreements

## Solutions

### Option 1: Use a Proxy Service (Recommended for Production)

Use a residential proxy or scraping service that routes through real user IPs:

**Services:**
- **ScraperAPI** - https://www.scraperapi.com/ (has free tier)
- **Bright Data** - https://brightdata.com/ (enterprise)
- **Smartproxy** - https://smartproxy.com/
- **Proxy-Cheap** - https://proxy-cheap.com/

**Implementation:**
```javascript
// In backend/services/lookup.js
const axios = require('axios');

// Using ScraperAPI as example
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const netflixUrl = `https://www.netflix.com/title/${netflixId}`;

// Route through ScraperAPI
const proxyUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(netflixUrl)}`;

const response = await axios.get(proxyUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0...',
  },
});
```

### Option 2: Client-Side Scraping (Not Recommended)

Move scraping to the client (phone app), but:
- ❌ Violates Netflix Terms of Service
- ❌ Security concerns
- ❌ Performance issues
- ❌ Not scalable

### Option 3: Use Netflix's Official API (If Available)

Netflix doesn't provide a public API for this use case.

### Option 4: Alternative Data Sources

Instead of scraping Netflix, use:
- **TMDB** - Already using this for metadata ✅
- **JustWatch API** - https://www.justwatch.com/ (may have Netflix availability)
- **Unofficial Netflix APIs** - Various community projects (may break)

### Option 5: Hybrid Approach (Current Best Solution)

**For now, the app works like this:**
1. User pastes Netflix link OR title
2. If Netflix link → Try to scrape (may fail on cloud)
3. If scraping fails OR user pastes title → Search TMDB directly
4. Display results from TMDB (rating, genre, runtime)

**This means:**
- ✅ Works on localhost (scraping succeeds)
- ✅ Works on cloud (falls back to TMDB search)
- ✅ User can always paste title name if link fails

### Option 6: Keep Using Localhost for Development

Since scraping works on localhost:
- Use localhost backend for development/testing
- Deploy to AWS Lambda for production
- Accept that Netflix link scraping may fail on cloud
- Users can paste title name as fallback

## Recommended Approach

**For your use case, I recommend:**

1. **Keep the current fallback system** - If Netflix scraping fails, search TMDB by title
2. **Add a proxy service** (optional) - If you want Netflix scraping to work on cloud, use ScraperAPI or similar
3. **User education** - Make it clear users can paste the title name if the link doesn't work

## Current Status

Your app already handles this gracefully:
- ✅ Netflix link → Try scraping → If fails, user sees error message
- ✅ Title name → Direct TMDB search → Always works
- ✅ Error message tells user: "Try pasting the title name instead"

This is actually a good user experience - the app works either way!

## Next Steps

1. **Test AWS Lambda deployment** - See if it works better than Vercel (unlikely, but worth trying)
2. **If AWS also fails** - Consider adding ScraperAPI or similar proxy service
3. **Or** - Keep current fallback system (it works well!)
