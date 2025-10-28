import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Register a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User's role (passenger or driver)
 * @returns {Promise<Object>} User object
 */
const register = async (name, email, password, role = 'passenger') => {
  try {
    const response = await apiClient.post('/api/auth/register', {
      name,
      email,
      password,
      role,
    });

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userProfile', JSON.stringify(user)],
    ]);

    return user;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Login existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
const login = async (email, password) => {
  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userProfile', JSON.stringify(user)],
    ]);

    return user;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 * Removes tokens from AsyncStorage and calls logout endpoint
 */
const logout = async () => {
  try {
    // Call logout endpoint (optional, JWT is stateless)
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    // Ignore errors, logout locally anyway
    console.log('Logout API call failed, clearing local data anyway');
  } finally {
    // Clear all auth data from AsyncStorage
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile']);
  }
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;

    // Update access token in AsyncStorage
    await AsyncStorage.setItem('accessToken', accessToken);

    return accessToken;
  } catch (error) {
    // Refresh failed, clear tokens
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile']);
    throw new Error('Session expired. Please login again.');
  }
};

/**
 * Get stored access token
 * @returns {Promise<string|null>} Access token or null
 */
const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get stored user profile
 * @returns {Promise<Object|null>} User object or null
 */
const getUserProfile = async () => {
  try {
    const userProfileString = await AsyncStorage.getItem('userProfile');
    return userProfileString ? JSON.parse(userProfileString) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update FCM token for push notifications
 * @param {string} fcmToken - Firebase Cloud Messaging token
 */
const updateFCMToken = async (fcmToken) => {
  try {
    await apiClient.post('/api/users/fcm-token', {
      fcm_token: fcmToken,
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  getAccessToken,
  getUserProfile,
  updateFCMToken,
};
