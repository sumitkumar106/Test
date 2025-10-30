// Helper utility functions

/**
 * Generate a unique UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create device ID for guest mode tracking
 * @returns {string} Device ID
 */
function getOrCreateDeviceId() {
  const key = CONFIG.localStorageKeys.deviceId;
  let deviceId = localStorage.getItem(key);

  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(key, deviceId);
  }

  return deviceId;
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safely parse JSON with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
function safeJSONParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Sleep utility for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Generate time options for picker (00:00 AM to 11:45 PM in 15-min intervals)
 * @returns {Array<string>} Array of time strings
 */
function generateTimeOptions() {
  const times = [];
  const periods = ['AM', 'PM'];

  periods.forEach(period => {
    for (let hour = 0; hour < 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayHour = hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        times.push(`${displayHour.toString().padStart(2, '0')}:${displayMinute} ${period}`);
      }
    }
  });

  return times;
}

/**
 * Handle async errors with user-friendly messages
 * @param {Function} asyncFunc - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
function handleAsyncError(asyncFunc) {
  return async function(...args) {
    try {
      return await asyncFunc(...args);
    } catch (error) {
      console.error('Async error:', error);
      showToast(error.message || 'An error occurred', 'error');
      throw error;
    }
  };
}

/**
 * Check if running in development mode
 * @returns {boolean} True if development
 */
function isDevelopment() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
