import apiClient from '../api/apiClient';

/**
 * Get all buses for logged-in driver
 * @returns {Promise<Array>} Array of driver's buses
 */
const getMyBuses = async () => {
  try {
    const response = await apiClient.get('/api/driver/buses');
    return response.data.buses;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get buses';
    throw new Error(errorMessage);
  }
};

/**
 * Get single bus details (driver only)
 * @param {string} busId - Bus ID
 * @returns {Promise<Object>} Bus details
 */
const getBusDetails = async (busId) => {
  try {
    const response = await apiClient.get(`/api/driver/buses/${busId}`);
    return response.data.bus;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get bus details';
    throw new Error(errorMessage);
  }
};

/**
 * Create a new bus listing
 * @param {Object} busData - Bus data object
 * @returns {Promise<Object>} Created bus object
 */
const createBus = async (busData) => {
  try {
    const response = await apiClient.post('/api/driver/buses', busData);
    return response.data.bus;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to create bus';
    throw new Error(errorMessage);
  }
};

/**
 * Update existing bus listing
 * @param {string} busId - Bus ID
 * @param {Object} busData - Updated bus data
 * @returns {Promise<Object>} Updated bus object
 */
const updateBus = async (busId, busData) => {
  try {
    const response = await apiClient.put(`/api/driver/buses/${busId}`, busData);
    return response.data.bus;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to update bus';
    throw new Error(errorMessage);
  }
};

/**
 * Delete bus listing
 * @param {string} busId - Bus ID
 * @returns {Promise<Object>} Success message
 */
const deleteBus = async (busId) => {
  try {
    const response = await apiClient.delete(`/api/driver/buses/${busId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to delete bus';
    throw new Error(errorMessage);
  }
};

export default {
  getMyBuses,
  getBusDetails,
  createBus,
  updateBus,
  deleteBus,
};
