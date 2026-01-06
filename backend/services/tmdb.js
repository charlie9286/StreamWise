const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY not set. TMDB features will not work.');
}

class TMDBService {
  async search(query, year, locale) {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const params = {
      api_key: TMDB_API_KEY,
      query: query,
      language: locale || 'en-US',
    };

    if (year) {
      params.year = year;
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params,
    });

    return response.data;
  }

  async getDetails(tmdbId, mediaType, locale) {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';

    const [detailsResponse, externalIdsResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: locale || 'en-US',
        },
      }),
      axios.get(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}/external_ids`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      }),
    ]);

    // Handle TV runtime (episode_run_time is an array)
    if (mediaType === 'tv' && !detailsResponse.data.runtime) {
      const episodeRunTime = detailsResponse.data.episode_run_time;
      if (episodeRunTime && episodeRunTime.length > 0) {
        detailsResponse.data.runtime = episodeRunTime[0];
      }
    }

    return {
      ...detailsResponse.data,
      external_ids: externalIdsResponse.data,
    };
  }
}

module.exports = {
  tmdbService: new TMDBService(),
};
