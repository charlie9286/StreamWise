const axios = require('axios');
const cheerio = require('cheerio');
const { LRUCache } = require('lru-cache');
const { tmdbService } = require('./tmdb');

// Cache configuration
const resultCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24 * 30, // 30 days for successful results
});

const negativeCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour for negative results
});

const tmdbSearchCache = new LRUCache({
  max: 2000,
  ttl: 1000 * 60 * 60 * 24 * 7, // 7 days for TMDB searches
});

// Helper functions
function normalizeNetflixUrl(input) {
  // Normalize Netflix URLs by removing query parameters and country codes
  // Examples:
  // - https://www.netflix.com/gb/title/82177711?s=i&trkid=... -> https://www.netflix.com/title/82177711
  // - https://www.netflix.com/title/82177711?x=y -> https://www.netflix.com/title/82177711
  // - https://www.netflix.com/browse?jbv=70196147&x=y -> https://www.netflix.com/browse?jbv=70196147
  
  if (!input || !input.includes('netflix.com')) {
    return input;
  }
  
  // Extract Netflix ID and rebuild URL without query params and country codes
  const titleMatch = input.match(/netflix\.com\/(?:[a-z]{2}\/)?title\/(\d+)/i);
  const jbvMatch = input.match(/netflix\.com\/[^?]*\?jbv=(\d+)/i);
  
  if (titleMatch) {
    return `https://www.netflix.com/title/${titleMatch[1]}`;
  } else if (jbvMatch) {
    return `https://www.netflix.com/browse?jbv=${jbvMatch[1]}`;
  }
  
  // Fallback: just remove query params and country codes
  return input.split('?')[0].replace(/netflix\.com\/[a-z]{2}\//i, 'netflix.com/');
}

function detectService(input) {
  const normalized = normalizeNetflixUrl(input);
  const netflixPattern = /netflix\.com\/(?:title\/|browse\?jbv=)(\d+)/i;
  return netflixPattern.test(normalized) ? 'netflix' : 'manual';
}

function extractNetflixId(input) {
  // Normalize first, then extract ID
  const normalized = normalizeNetflixUrl(input);
  // Support both formats:
  // - https://www.netflix.com/title/70196147
  // - https://www.netflix.com/browse?jbv=70196147
  const netflixPattern = /netflix\.com\/(?:title\/|browse\?jbv=)(\d+)/i;
  const match = normalized.match(netflixPattern);
  return match ? match[1] : null;
}

class LookupService {
  async lookup(input, locale) {
    // Normalize the input URL first (removes query params and country codes)
    const normalized = normalizeNetflixUrl(input.trim());
    const cacheKey = `${normalized}:${locale || 'en'}`;

    // Check cache
    const cached = resultCache.get(cacheKey) || negativeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const service = detectService(normalized);

    if (service === 'netflix') {
      return this.lookupNetflix(normalized, locale, cacheKey);
    } else {
      return this.lookupManual(normalized, locale, cacheKey);
    }
  }

  async lookupNetflix(input, locale, cacheKey) {
    const netflixId = extractNetflixId(input);
    if (!netflixId) {
      const error = {
        success: false,
        error: 'INVALID_NETFLIX_LINK',
        message: 'Could not extract Netflix ID from link.',
      };
      negativeCache.set(cacheKey, error);
      return error;
    }

    // Try free-first: fetch Netflix public page
    let title = null;
    let year = null;

    try {
      const netflixUrl = `https://www.netflix.com/title/${netflixId}`;
      
      // Use more complete browser headers to avoid blocking
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      };
      
      const response = await axios.get(netflixUrl, {
        headers,
        timeout: 15000, // Increased timeout for serverless
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        },
      });

      const $ = cheerio.load(response.data);

      // Try to extract title from various possible selectors (in order of preference)
      const titleSelectors = [
        'h1[data-uia="hero-title"]',
        'h1.title-title',
        'h1[class*="title"]',
        'h1',
        '[data-uia="hero-title"]',
        '[class*="hero-title"]',
        'meta[property="og:title"]', // Open Graph fallback
        'meta[name="title"]', // Meta title fallback
        'title', // HTML title tag as last resort
      ];

      for (const selector of titleSelectors) {
        let titleText = '';
        if (selector.startsWith('meta')) {
          titleText = $(selector).attr('content')?.trim() || '';
        } else if (selector === 'title') {
          titleText = $('title').text().trim();
        } else {
          titleText = $(selector).first().text().trim();
        }
        
        if (titleText && titleText.length > 1) {
          // Clean up title (remove "Watch" prefix, "Netflix" suffix, etc.)
          let cleaned = titleText
            .replace(/^Watch\s+/i, '')
            .replace(/\s*on Netflix.*$/i, '')
            .replace(/\s*-\s*Netflix.*$/i, '')
            .replace(/\s*\|.*$/i, '') // Remove everything after |
            .trim();
          
          // Only use if it doesn't look like a generic Netflix page title
          if (cleaned && !cleaned.match(/^Netflix$/i) && cleaned.length > 1) {
            title = cleaned;
            console.log(`[DEBUG] Extracted title from ${selector}: "${title}"`);
            break;
          }
        }
      }
      
      // If still no title, try extracting from JSON-LD structured data
      if (!title) {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((i, elem) => {
          try {
            const jsonData = JSON.parse($(elem).html());
            if (jsonData.name && !jsonData.name.includes('Netflix')) {
              title = jsonData.name.trim();
              console.log(`[DEBUG] Extracted title from JSON-LD: "${title}"`);
              return false; // Break the loop
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        });
      }

      // Try to extract year from various sources
      const yearSelectors = [
        '[data-uia="item-year"]',
        '.year',
        '[class*="year"]',
      ];
      
      for (const selector of yearSelectors) {
        const yearText = $(selector).first().text().trim();
        if (yearText) {
          const yearMatch = yearText.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) {
            year = yearMatch[0];
            break;
          }
        }
      }
      
      // If no year found in specific selectors, search in body text
      if (!year) {
        const bodyText = $('body').text();
        const yearMatches = bodyText.match(/\b(20\d{2})\b/g);
        if (yearMatches && yearMatches.length > 0) {
          // Get the most recent year (likely the release year)
          year = yearMatches.sort().reverse()[0];
        }
      }

      // If we found a title (from initial attempt or retry), proceed to TMDB
      if (title) {
        console.log(`[DEBUG] Extracted title: "${title}", year: ${year || 'none'}`);
        // Try without year first (more flexible), then with year if that fails
        let tmdbResult = await this.fetchFromTMDB(title, null, locale);
        console.log(`[DEBUG] TMDB result (no year): success=${tmdbResult.success}`);
        if (!tmdbResult.success && year) {
          // Retry with year constraint
          console.log(`[DEBUG] Retrying with year: ${year}`);
          tmdbResult = await this.fetchFromTMDB(title, year, locale);
          console.log(`[DEBUG] TMDB result (with year): success=${tmdbResult.success}`);
        }
        
        if (tmdbResult.success) {
          // Add the extracted title to the result
          tmdbResult.title = title;
          resultCache.set(cacheKey, tmdbResult);
          return tmdbResult;
        } else {
          console.log(`[DEBUG] TMDB lookup failed for "${title}" (year: ${year || 'none'}), error: ${tmdbResult.error}`);
        }
      } else {
        console.log('[DEBUG] No title extracted from Netflix page after all attempts');
      }
    } catch (error) {
      console.log('[DEBUG] Netflix HTML fetch failed:', error.message);
      console.log('[DEBUG] Error code:', error.code);
      console.log('[DEBUG] Error response status:', error.response?.status);
      console.log('[DEBUG] Error response data:', error.response?.data?.substring(0, 200));
      
      // If it's a timeout or network error, try one more time with different approach
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response || error.response?.status >= 400) {
        console.log('[DEBUG] First attempt failed, retrying with alternative approach...');
        try {
          // Try with different User-Agent (mobile browser)
          const retryHeaders = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
          };
          
          const retryResponse = await axios.get(`https://www.netflix.com/title/${netflixId}`, {
            headers: retryHeaders,
            timeout: 20000, // Even longer timeout for retry
            maxRedirects: 5,
            validateStatus: function (status) {
              return status >= 200 && status < 400;
            },
          });
          
          const $retry = cheerio.load(retryResponse.data);
          
          // Try all title extraction methods again
          const retrySelectors = [
            'meta[property="og:title"]',
            'h1[data-uia="hero-title"]',
            'h1',
            'title',
          ];
          
          for (const selector of retrySelectors) {
            let titleText = '';
            if (selector.startsWith('meta')) {
              titleText = $retry(selector).attr('content')?.trim() || '';
            } else if (selector === 'title') {
              titleText = $retry('title').text().trim();
            } else {
              titleText = $retry(selector).first().text().trim();
            }
            
            if (titleText && titleText.length > 1) {
              let cleaned = titleText
                .replace(/^Watch\s+/i, '')
                .replace(/\s*on Netflix.*$/i, '')
                .replace(/\s*-\s*Netflix.*$/i, '')
                .trim();
              
              if (cleaned && !cleaned.match(/^Netflix$/i) && cleaned.length > 1) {
                title = cleaned;
                console.log(`[DEBUG] Retry successful, extracted title: "${title}"`);
                break;
              }
            }
          }
        } catch (retryError) {
          console.log('[DEBUG] Retry also failed:', retryError.message);
          console.log('[DEBUG] Retry error code:', retryError.code);
          console.log('[DEBUG] Retry response status:', retryError.response?.status);
        }
      }
    }

    // If all methods fail
    const error = {
      success: false,
      error: 'UNRESOLVED_NETFLIX_LINK',
      message: 'Could not resolve this Netflix link. Paste the title name instead.',
    };
    negativeCache.set(cacheKey, error);
    return error;
  }

  async lookupManual(input, locale, cacheKey) {
    // For manual input, use the input as the title
    const tmdbResult = await this.fetchFromTMDB(input, null, locale);
    if (tmdbResult.success) {
      // Add the input as the title
      tmdbResult.title = input;
      resultCache.set(cacheKey, tmdbResult);
    } else {
      negativeCache.set(cacheKey, tmdbResult);
    }
    return tmdbResult;
  }

  async fetchFromTMDB(title, year, locale) {
    const searchKey = `${title}:${year || ''}:${locale || 'en'}`;
    const cachedSearch = tmdbSearchCache.get(searchKey);

    if (cachedSearch) {
      return this.formatTMDBResponse(cachedSearch);
    }

    try {
      // Search TMDB
      const searchResult = await tmdbService.search(title, year, locale);

      if (!searchResult || searchResult.results.length === 0) {
        return {
          success: false,
          error: 'NOT_FOUND',
          message: 'Title not found in database.',
        };
      }

      // Get first result
      const firstResult = searchResult.results[0];
      const tmdbId = firstResult.id;
      const mediaType = firstResult.media_type === 'tv' ? 'tv' : 'movie';

      // Fetch details
      const details = await tmdbService.getDetails(tmdbId, mediaType, locale);
      tmdbSearchCache.set(searchKey, details);

      return this.formatTMDBResponse(details);
    } catch (error) {
      console.error('TMDB error:', error);
      return {
        success: false,
        error: 'TMDB_ERROR',
        message: 'Error fetching data from TMDB.',
      };
    }
  }

  formatTMDBResponse(details) {
    const rating = details.vote_average
      ? details.vote_average.toFixed(1)
      : undefined;

    // Handle both movie (release_date) and TV (first_air_date)
    const dateStr = details.release_date || details.first_air_date;
    const year = dateStr
      ? new Date(dateStr).getFullYear().toString()
      : undefined;

    const runtime = details.runtime ? details.runtime.toString() : undefined;

    // Get title from TMDB (name for TV shows, title for movies)
    const title = details.name || details.title;

    return {
      success: true,
      service: 'netflix',
      title: title || details.title, // Use extracted title if available, otherwise TMDB title
      rating,
      year,
      runtime,
      imdbId: details.external_ids?.imdb_id,
    };
  }
}

module.exports = {
  lookupService: new LookupService(),
};
