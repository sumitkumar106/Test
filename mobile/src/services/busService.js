import apiClient from '../api/apiClient';

/**
 * Search buses by from/to stands
 * @param {string} from - Start stand name
 * @param {string} to - End stand name
 * @param {string} date - Optional date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of matching buses
 */
const searchBuses = async (from, to, date = null) => {
  try {
    const params = { from, to };
    if (date) params.date = date;

    const response = await apiClient.get('/api/buses/search', { params });
    return response.data.buses;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to search buses';
    throw new Error(errorMessage);
  }
};

/**
 * Search buses by bus number or name
 * @param {string} query - Bus number or name
 * @returns {Promise<Array>} Array of matching buses
 */
const searchByNumber = async (query) => {
  try {
    const response = await apiClient.get('/api/buses/search-by-number', {
      params: { query }
    });
    return response.data.buses;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to search buses';
    throw new Error(errorMessage);
  }
};

/**
 * Get bus details by ID
 * @param {string} busId - Bus ID
 * @returns {Promise<Object>} Bus details
 */
const getBusDetails = async (busId) => {
  try {
    const response = await apiClient.get(`/api/buses/${busId}`);
    return response.data.bus;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get bus details';
    throw new Error(errorMessage);
  }
};

/**
 * Get search history for authenticated user
 * @returns {Promise<Array>} Array of search history items
 */
const getSearchHistory = async () => {
  try {
    const response = await apiClient.get('/api/buses/search-history');
    return response.data.history;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get search history';
    throw new Error(errorMessage);
  }
};

export default {
  searchBuses,
  searchByNumber,
  getBusDetails,
  getSearchHistory,
};
