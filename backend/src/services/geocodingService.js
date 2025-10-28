const axios = require('axios');

// In-memory cache for geocoded locations
const geocodeCache = new Map();

/**
 * Geocode a stoppage name to get latitude and longitude
 * Uses Google Geocoding API with caching to reduce API calls
 * @param {string} stoppageName - Name of the stoppage/stand
 * @returns {Promise<Object>} Object with latitude and longitude
 */
const geocodeStoppage = async (stoppageName) => {
  try {
    // Check cache first
    const cacheKey = stoppageName.toLowerCase().trim();
    if (geocodeCache.has(cacheKey)) {
      console.log(`Geocoding cache hit for: ${stoppageName}`);
      return geocodeCache.get(cacheKey);
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GEOCODING_API_KEY) {
      console.warn('Google Geocoding API key not configured. Using default coordinates.');
      // Return default coordinates (Patna, India) for development
      return {
        latitude: 25.5941,
        longitude: 85.1376
      };
    }

    // Build search query - append "bus stand" or "bus stop" for better results
    const searchQuery = `${stoppageName} bus stand India`;

    // Call Google Geocoding API
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: searchQuery,
        key: process.env.GOOGLE_GEOCODING_API_KEY
      }
    });

    // Check if results found
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const coordinates = {
        latitude: location.lat,
        longitude: location.lng
      };

      // Cache the result
      geocodeCache.set(cacheKey, coordinates);
      console.log(`Geocoded: ${stoppageName} -> (${coordinates.latitude}, ${coordinates.longitude})`);

      return coordinates;
    } else if (response.data.status === 'ZERO_RESULTS') {
      throw new Error(`Unable to find location for stoppage: ${stoppageName}`);
    } else if (response.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Geocoding API quota exceeded. Please try again later.');
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

  } catch (error) {
    if (error.response) {
      // API error
      console.error('Geocoding API error:', error.response.data);
      throw new Error('Failed to geocode location. Please check the stoppage name.');
    } else if (error.message.includes('Unable to find location')) {
      // Re-throw location not found errors
      throw error;
    } else {
      // Network or other errors
      console.error('Geocoding error:', error.message);
      throw new Error('Geocoding service temporarily unavailable.');
    }
  }
};

/**
 * Geocode multiple stoppages in batch
 * @param {Array<string>} stoppageNames - Array of stoppage names
 * @returns {Promise<Array<Object>>} Array of coordinates objects
 */
const geocodeMultipleStoppages = async (stoppageNames) => {
  try {
    const geocodePromises = stoppageNames.map(name => geocodeStoppage(name));
    return await Promise.all(geocodePromises);
  } catch (error) {
    throw error;
  }
};

/**
 * Clear geocoding cache (useful for testing)
 */
const clearGeocodeCache = () => {
  geocodeCache.clear();
  console.log('Geocoding cache cleared');
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return {
    size: geocodeCache.size,
    entries: Array.from(geocodeCache.keys())
  };
};

module.exports = {
  geocodeStoppage,
  geocodeMultipleStoppages,
  clearGeocodeCache,
  getCacheStats
};
