// Routes List Screen - Display all saved bus routes

// Routes data
let allRoutes = [];
let isLoading = false;

/**
 * Render Routes List Screen
 */
function renderRoutesListScreen() {
  const screen = document.getElementById('routes-list-screen');

  if (!screen) {
    console.error('Routes list screen container not found');
    return;
  }

  screen.innerHTML = `
    <!-- Header -->
    <div class="header">
      <div class="header-title">My Bus Routes</div>
      <div class="header-subtitle">Tap any route to view details</div>
    </div>

    <!-- Loading State -->
    <div id="routes-loading" class="loading" style="display: none;">
      <div class="spinner"></div>
    </div>

    <!-- Routes Container -->
    <div id="routes-container"></div>

    <!-- Floating Action Button -->
    <div class="fab" id="add-route-fab">+</div>
  `;

  // Setup FAB click handler
  setupFAB();

  // Load routes
  loadRoutes();
}

/**
 * Setup Floating Action Button
 */
function setupFAB() {
  const fab = document.getElementById('add-route-fab');

  if (!fab) return;

  fab.onclick = () => {
    navigateTo('add-route');
  };
}

/**
 * Load all routes from Firebase/LocalStorage
 */
async function loadRoutes() {
  if (isLoading) return;

  isLoading = true;
  showLoading();

  try {
    // Try to fetch from Firestore first
    try {
      allRoutes = await getRoutes();
      console.log(`Loaded ${allRoutes.length} routes from Firestore`);
    } catch (firestoreError) {
      console.warn('Firestore fetch failed, loading from localStorage:', firestoreError);
      allRoutes = getLocalRoutes();
      console.log(`Loaded ${allRoutes.length} routes from localStorage`);
    }

    // Render routes
    renderRoutes();

  } catch (error) {
    console.error('Error loading routes:', error);
    showErrorToast('Failed to load routes. Please try again.');
    renderRoutes(); // Render empty state
  } finally {
    isLoading = false;
    hideLoading();
  }
}

/**
 * Show loading spinner
 */
function showLoading() {
  const loading = document.getElementById('routes-loading');

  if (loading) {
    loading.style.display = 'flex';
  }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  const loading = document.getElementById('routes-loading');

  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Render routes in the container
 */
function renderRoutes() {
  renderRouteCards('routes-container', allRoutes, handleRouteCardClick);
}

/**
 * Handle route card click - navigate to details
 * @param {string} routeId - Route ID
 */
function handleRouteCardClick(routeId) {
  navigateTo('route-details', { routeId });
}

/**
 * Refresh routes list
 */
async function refreshRoutes() {
  await loadRoutes();
}

/**
 * Show Routes List Screen (called by router)
 */
function showRoutesListScreen() {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show routes list screen
  const screen = document.getElementById('routes-list-screen');

  if (screen) {
    screen.classList.remove('hidden');

    // Render screen if not already rendered
    if (screen.innerHTML.trim() === '') {
      renderRoutesListScreen();
    } else {
      // Refresh routes if screen already rendered
      refreshRoutes();
    }
  }

  // Initialize ad banner
  renderAdBanner();
}

/**
 * Add search functionality
 * @param {string} query - Search query
 */
function searchRoutes(query) {
  filterRouteCards('routes-container', allRoutes, query, handleRouteCardClick);
}
