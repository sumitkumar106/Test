// LocalStorage operations for guest mode

/**
 * Get all routes from LocalStorage
 * @returns {Array} Array of route objects
 */
function getLocalRoutes() {
  try {
    const key = CONFIG.localStorageKeys.routes;
    const routesJson = localStorage.getItem(key);

    if (!routesJson) {
      return [];
    }

    const routes = safeJSONParse(routesJson, []);

    // Filter only active routes
    return routes.filter(route => route.isActive !== false);
  } catch (error) {
    console.error('Error getting local routes:', error);
    return [];
  }
}

/**
 * Save a new route to LocalStorage
 * @param {Object} routeData - Route data object
 * @returns {string} Generated route ID
 */
function saveRouteLocally(routeData) {
  try {
    const routes = getLocalRoutes();
    const routeId = generateUUID();

    const newRoute = {
      id: routeId,
      ...routeData,
      deviceId: getOrCreateDeviceId(),
      userId: null,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      isActive: true
    };

    routes.push(newRoute);

    const key = CONFIG.localStorageKeys.routes;
    localStorage.setItem(key, JSON.stringify(routes));

    console.log('Route saved locally with ID:', routeId);
    return routeId;
  } catch (error) {
    console.error('Error saving route locally:', error);
    throw new Error('Failed to save route locally. Storage may be full.');
  }
}

/**
 * Get a single route by ID from LocalStorage
 * @param {string} routeId - Route ID
 * @returns {Object|null} Route object or null if not found
 */
function getLocalRouteById(routeId) {
  try {
    const routes = getLocalRoutes();
    const route = routes.find(r => r.id === routeId && r.isActive !== false);

    return route || null;
  } catch (error) {
    console.error('Error getting local route:', error);
    return null;
  }
}

/**
 * Update an existing route in LocalStorage
 * @param {string} routeId - Route ID
 * @param {Object} routeData - Updated route data
 * @returns {boolean} True if successful
 */
function updateLocalRoute(routeId, routeData) {
  try {
    const key = CONFIG.localStorageKeys.routes;
    const routesJson = localStorage.getItem(key);
    const routes = safeJSONParse(routesJson, []);

    const routeIndex = routes.findIndex(r => r.id === routeId);

    if (routeIndex === -1) {
      console.warn('Route not found for update:', routeId);
      return false;
    }

    routes[routeIndex] = {
      ...routes[routeIndex],
      ...routeData,
      updatedAt: getCurrentTimestamp()
    };

    localStorage.setItem(key, JSON.stringify(routes));
    console.log('Route updated locally:', routeId);

    return true;
  } catch (error) {
    console.error('Error updating local route:', error);
    throw new Error('Failed to update route locally.');
  }
}

/**
 * Soft delete a route from LocalStorage (set isActive to false)
 * @param {string} routeId - Route ID
 * @returns {boolean} True if successful
 */
function deleteLocalRoute(routeId) {
  try {
    const key = CONFIG.localStorageKeys.routes;
    const routesJson = localStorage.getItem(key);
    const routes = safeJSONParse(routesJson, []);

    const routeIndex = routes.findIndex(r => r.id === routeId);

    if (routeIndex === -1) {
      console.warn('Route not found for deletion:', routeId);
      return false;
    }

    routes[routeIndex].isActive = false;
    routes[routeIndex].updatedAt = getCurrentTimestamp();

    localStorage.setItem(key, JSON.stringify(routes));
    console.log('Route deleted locally:', routeId);

    return true;
  } catch (error) {
    console.error('Error deleting local route:', error);
    throw new Error('Failed to delete route locally.');
  }
}

/**
 * Hard delete a route from LocalStorage (permanently remove)
 * @param {string} routeId - Route ID
 * @returns {boolean} True if successful
 */
function hardDeleteLocalRoute(routeId) {
  try {
    const key = CONFIG.localStorageKeys.routes;
    const routesJson = localStorage.getItem(key);
    const routes = safeJSONParse(routesJson, []);

    const filteredRoutes = routes.filter(r => r.id !== routeId);

    localStorage.setItem(key, JSON.stringify(filteredRoutes));
    console.log('Route permanently deleted locally:', routeId);

    return true;
  } catch (error) {
    console.error('Error permanently deleting local route:', error);
    throw new Error('Failed to permanently delete route locally.');
  }
}

/**
 * Clear all routes from LocalStorage
 * @returns {boolean} True if successful
 */
function clearAllLocalRoutes() {
  try {
    const key = CONFIG.localStorageKeys.routes;
    localStorage.removeItem(key);
    console.log('All local routes cleared');

    return true;
  } catch (error) {
    console.error('Error clearing local routes:', error);
    return false;
  }
}

/**
 * Export routes to JSON file
 * @returns {string} JSON string of all routes
 */
function exportRoutesToJSON() {
  try {
    const routes = getLocalRoutes();
    return JSON.stringify(routes, null, 2);
  } catch (error) {
    console.error('Error exporting routes:', error);
    throw new Error('Failed to export routes.');
  }
}

/**
 * Import routes from JSON string
 * @param {string} jsonString - JSON string of routes
 * @returns {number} Number of routes imported
 */
function importRoutesFromJSON(jsonString) {
  try {
    const importedRoutes = safeJSONParse(jsonString, []);

    if (!Array.isArray(importedRoutes)) {
      throw new Error('Invalid JSON format');
    }

    const existingRoutes = getLocalRoutes();
    const key = CONFIG.localStorageKeys.routes;

    // Merge imported routes with existing (avoid duplicates by ID)
    const routeMap = new Map();

    existingRoutes.forEach(route => {
      routeMap.set(route.id, route);
    });

    importedRoutes.forEach(route => {
      if (route.id) {
        routeMap.set(route.id, route);
      }
    });

    const mergedRoutes = Array.from(routeMap.values());
    localStorage.setItem(key, JSON.stringify(mergedRoutes));

    console.log(`Imported ${importedRoutes.length} routes`);
    return importedRoutes.length;
  } catch (error) {
    console.error('Error importing routes:', error);
    throw new Error('Failed to import routes. Invalid file format.');
  }
}

/**
 * Get LocalStorage usage statistics
 * @returns {Object} Usage stats
 */
function getStorageStats() {
  try {
    const routes = getLocalRoutes();
    const key = CONFIG.localStorageKeys.routes;
    const routesJson = localStorage.getItem(key) || '[]';

    return {
      totalRoutes: routes.length,
      storageSize: new Blob([routesJson]).size,
      storageSizeKB: (new Blob([routesJson]).size / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalRoutes: 0,
      storageSize: 0,
      storageSizeKB: '0.00'
    };
  }
}

/**
 * Check if LocalStorage is available
 * @returns {boolean} True if available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}
