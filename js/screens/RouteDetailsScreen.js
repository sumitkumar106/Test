// Route Details Screen - Display full route information

// Current route data
let currentRoute = null;

/**
 * Render Route Details Screen
 * @param {string} routeId - Route ID to display
 */
async function renderRouteDetailsScreen(routeId) {
  const screen = document.getElementById('route-details-screen');

  if (!screen) {
    console.error('Route details screen container not found');
    return;
  }

  // Show loading
  screen.innerHTML = `
    <div class="loading" style="min-height: 100vh;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    // Load route data
    currentRoute = await loadRouteDetails(routeId);

    if (!currentRoute) {
      // Route not found
      screen.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-text">Route not found</div>
          <div class="empty-state-subtext">This route may have been deleted</div>
        </div>
        <div class="save-button-container">
          <button class="btn btn-secondary" onclick="navigateTo('routes-list')">
            Back to Routes
          </button>
        </div>
      `;
      return;
    }

    // Render route details
    screen.innerHTML = `
      <!-- Back Button -->
      <div class="back-button" onclick="navigateTo('routes-list')">
        ←
      </div>

      <!-- Header -->
      <div class="header">
        <div class="header-title">${currentRoute.busName}</div>
        <div class="header-subtitle">Route Details</div>
      </div>

      <!-- Route Details Container -->
      <div id="route-details-container"></div>

      <!-- Action Buttons -->
      <div class="save-button-container">
        <button class="btn btn-primary" id="editRouteBtn" style="margin-bottom: 10px;">
          Edit Route
        </button>
        <button class="btn btn-danger" id="deleteRouteBtn">
          Delete Route
        </button>
      </div>
    `;

    // Render route details
    const detailsContainer = document.getElementById('route-details-container');
    if (detailsContainer) {
      const detailsView = createRouteDetailsView(currentRoute);
      detailsContainer.appendChild(detailsView);
    }

    // Setup action buttons
    setupActionButtons(routeId);

  } catch (error) {
    console.error('Error loading route details:', error);
    showErrorToast('Failed to load route details');

    screen.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Error loading route</div>
        <div class="empty-state-subtext">Please try again</div>
      </div>
      <div class="save-button-container">
        <button class="btn btn-secondary" onclick="navigateTo('routes-list')">
          Back to Routes
        </button>
      </div>
    `;
  }
}

/**
 * Load route details from Firestore or LocalStorage
 * @param {string} routeId - Route ID
 * @returns {Promise<Object|null>} Route object or null
 */
async function loadRouteDetails(routeId) {
  try {
    // Try Firestore first
    try {
      const route = await getRouteById(routeId);
      if (route) return route;
    } catch (firestoreError) {
      console.warn('Firestore fetch failed, trying localStorage:', firestoreError);
    }

    // Fallback to localStorage
    const localRoute = getLocalRouteById(routeId);
    return localRoute;

  } catch (error) {
    console.error('Error loading route details:', error);
    throw error;
  }
}

/**
 * Setup edit and delete buttons
 * @param {string} routeId - Route ID
 */
function setupActionButtons(routeId) {
  // Edit button
  const editBtn = document.getElementById('editRouteBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      navigateTo('edit-route', { routeId });
    };
  }

  // Delete button
  const deleteBtn = document.getElementById('deleteRouteBtn');
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      await handleDeleteRoute(routeId);
    };
  }
}

/**
 * Handle delete route action
 * @param {string} routeId - Route ID to delete
 */
async function handleDeleteRoute(routeId) {
  if (!currentRoute) return;

  // Show confirmation dialog
  const confirmed = await showDeleteConfirmDialog(currentRoute.busName);

  if (!confirmed) {
    return;
  }

  // Disable delete button
  const deleteBtn = document.getElementById('deleteRouteBtn');
  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
  }

  try {
    // Try to delete from Firestore
    try {
      await deleteRoute(routeId);
      console.log('Route deleted from Firestore');
    } catch (firestoreError) {
      console.warn('Firestore delete failed, deleting from localStorage:', firestoreError);
      deleteLocalRoute(routeId);
      console.log('Route deleted from localStorage');
    }

    // Show success message
    showSuccessToast('Route deleted successfully');

    // Navigate back to routes list
    navigateTo('routes-list');

  } catch (error) {
    console.error('Error deleting route:', error);
    showErrorToast('Failed to delete route. Please try again.');

    // Re-enable delete button
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete Route';
    }
  }
}

/**
 * Show Route Details Screen (called by router)
 * @param {Object} params - Route parameters (routeId)
 */
function showRouteDetailsScreen(params) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show route details screen
  const screen = document.getElementById('route-details-screen');

  if (screen) {
    screen.classList.remove('hidden');

    // Render route details
    const routeId = params?.routeId;

    if (!routeId) {
      console.error('Route ID not provided');
      navigateTo('routes-list');
      return;
    }

    renderRouteDetailsScreen(routeId);
  }

  // Initialize ad banner
  renderAdBanner();
}
