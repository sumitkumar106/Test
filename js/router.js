// SPA Router - Simple routing for single page application

// Current route state
let currentRoute = {
  name: 'routes-list',
  params: {}
};

// Route history for back navigation
let routeHistory = [];

/**
 * Define available routes
 */
const routes = {
  'routes-list': {
    handler: showRoutesListScreen,
    requiresParams: false
  },
  'add-route': {
    handler: showAddRouteScreen,
    requiresParams: false
  },
  'route-details': {
    handler: showRouteDetailsScreen,
    requiresParams: true,
    paramKeys: ['routeId']
  },
  'edit-route': {
    handler: showEditRouteScreen,
    requiresParams: true,
    paramKeys: ['routeId']
  }
};

/**
 * Navigate to a route
 * @param {string} routeName - Name of the route
 * @param {Object} params - Route parameters (optional)
 */
function navigateTo(routeName, params = {}) {
  // Check if route exists
  const route = routes[routeName];

  if (!route) {
    console.error('Route not found:', routeName);
    return;
  }

  // Validate required params
  if (route.requiresParams && route.paramKeys) {
    const missingParams = route.paramKeys.filter(key => !params[key]);

    if (missingParams.length > 0) {
      console.error('Missing required params:', missingParams);
      return;
    }
  }

  // Save current route to history (except when navigating back)
  if (currentRoute.name !== routeName) {
    routeHistory.push({ ...currentRoute });

    // Limit history size
    if (routeHistory.length > 10) {
      routeHistory.shift();
    }
  }

  // Update current route
  currentRoute = {
    name: routeName,
    params: params
  };

  // Update URL hash (for browser back button support)
  updateUrlHash(routeName, params);

  // Call route handler
  route.handler(params);

  // Scroll to top
  window.scrollTo(0, 0);
}

/**
 * Navigate back to previous route
 */
function navigateBack() {
  if (routeHistory.length === 0) {
    // No history, go to routes list
    navigateTo('routes-list');
    return;
  }

  const previousRoute = routeHistory.pop();
  currentRoute = previousRoute;

  const route = routes[previousRoute.name];

  if (route) {
    updateUrlHash(previousRoute.name, previousRoute.params);
    route.handler(previousRoute.params);
    window.scrollTo(0, 0);
  }
}

/**
 * Update URL hash for browser navigation
 * @param {string} routeName - Route name
 * @param {Object} params - Route params
 */
function updateUrlHash(routeName, params) {
  let hash = `#${routeName}`;

  // Add params to hash
  if (params && Object.keys(params).length > 0) {
    const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    hash += `?${paramString}`;
  }

  // Update URL without triggering hashchange event
  history.pushState(null, null, hash);
}

/**
 * Parse URL hash and navigate
 */
function parseAndNavigateFromHash() {
  const hash = window.location.hash.slice(1); // Remove #

  if (!hash) {
    // No hash, navigate to default route
    navigateTo('routes-list');
    return;
  }

  // Split route name and params
  const [routeName, paramString] = hash.split('?');

  // Parse params
  const params = {};

  if (paramString) {
    paramString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value);
    });
  }

  // Navigate to route
  if (routes[routeName]) {
    currentRoute = { name: routeName, params };
    routes[routeName].handler(params);
  } else {
    console.error('Invalid route in URL:', routeName);
    navigateTo('routes-list');
  }
}

/**
 * Initialize router
 */
function initializeRouter() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    parseAndNavigateFromHash();
  });

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    parseAndNavigateFromHash();
  });

  // Initial route from URL or default
  if (window.location.hash) {
    parseAndNavigateFromHash();
  } else {
    navigateTo('routes-list');
  }
}

/**
 * Get current route
 * @returns {Object} Current route object
 */
function getCurrentRoute() {
  return currentRoute;
}

/**
 * Check if currently on a specific route
 * @param {string} routeName - Route name to check
 * @returns {boolean} True if on route
 */
function isOnRoute(routeName) {
  return currentRoute.name === routeName;
}
