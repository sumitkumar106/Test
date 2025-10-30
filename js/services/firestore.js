// Firestore CRUD operations for bus routes

/**
 * Create a new route in Firestore
 * @param {Object} routeData - Route data object
 * @returns {Promise<string>} Document ID of created route
 */
async function createRoute(routeData) {
  try {
    const db = window.firebaseDB;
    const deviceId = getOrCreateDeviceId();
    const userId = window.currentUser ? window.currentUser.uid : null;

    const route = {
      ...routeData,
      userId: userId,
      deviceId: deviceId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };

    const docRef = await db.collection('routes').add(route);
    console.log('Route created with ID:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error creating route:', error);
    throw new Error('Failed to save route. Please check your internet connection.');
  }
}

/**
 * Get all routes for current device
 * @returns {Promise<Array>} Array of route objects
 */
async function getRoutes() {
  try {
    const db = window.firebaseDB;
    const deviceId = getOrCreateDeviceId();

    const snapshot = await db.collection('routes')
      .where('deviceId', '==', deviceId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const routes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      routes.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : getCurrentTimestamp(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : getCurrentTimestamp()
      });
    });

    console.log(`Fetched ${routes.length} routes from Firestore`);
    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw new Error('Failed to load routes. Please check your internet connection.');
  }
}

/**
 * Get a single route by ID
 * @param {string} routeId - Route document ID
 * @returns {Promise<Object|null>} Route object or null if not found
 */
async function getRouteById(routeId) {
  try {
    const db = window.firebaseDB;
    const doc = await db.collection('routes').doc(routeId).get();

    if (!doc.exists) {
      console.warn('Route not found:', routeId);
      return null;
    }

    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : getCurrentTimestamp(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : getCurrentTimestamp()
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    throw new Error('Failed to load route details.');
  }
}

/**
 * Update an existing route
 * @param {string} routeId - Route document ID
 * @param {Object} routeData - Updated route data
 * @returns {Promise<void>}
 */
async function updateRoute(routeId, routeData) {
  try {
    const db = window.firebaseDB;

    const updateData = {
      ...routeData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('routes').doc(routeId).update(updateData);
    console.log('Route updated:', routeId);
  } catch (error) {
    console.error('Error updating route:', error);
    throw new Error('Failed to update route. Please try again.');
  }
}

/**
 * Soft delete a route (set isActive to false)
 * @param {string} routeId - Route document ID
 * @returns {Promise<void>}
 */
async function deleteRoute(routeId) {
  try {
    const db = window.firebaseDB;

    await db.collection('routes').doc(routeId).update({
      isActive: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Route deleted (soft):', routeId);
  } catch (error) {
    console.error('Error deleting route:', error);
    throw new Error('Failed to delete route. Please try again.');
  }
}

/**
 * Hard delete a route (permanently remove from database)
 * @param {string} routeId - Route document ID
 * @returns {Promise<void>}
 */
async function hardDeleteRoute(routeId) {
  try {
    const db = window.firebaseDB;

    await db.collection('routes').doc(routeId).delete();
    console.log('Route permanently deleted:', routeId);
  } catch (error) {
    console.error('Error permanently deleting route:', error);
    throw new Error('Failed to permanently delete route.');
  }
}

/**
 * Check if Firestore is available (network connectivity)
 * @returns {Promise<boolean>} True if Firestore is reachable
 */
async function checkFirestoreConnection() {
  try {
    const db = window.firebaseDB;
    await db.collection('_health_check').limit(1).get();
    return true;
  } catch (error) {
    console.error('Firestore connection check failed:', error);
    return false;
  }
}

/**
 * Search routes by bus name
 * @param {string} searchQuery - Search query string
 * @returns {Promise<Array>} Array of matching routes
 */
async function searchRoutes(searchQuery) {
  try {
    const db = window.firebaseDB;
    const deviceId = getOrCreateDeviceId();

    // Note: Firestore doesn't support full-text search
    // This is a basic implementation - for production, consider Algolia or similar
    const snapshot = await db.collection('routes')
      .where('deviceId', '==', deviceId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const routes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const busName = (data.busName || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      if (busName.includes(query)) {
        routes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : getCurrentTimestamp(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : getCurrentTimestamp()
        });
      }
    });

    return routes;
  } catch (error) {
    console.error('Error searching routes:', error);
    throw new Error('Failed to search routes.');
  }
}
