// Route Card component for displaying bus routes

/**
 * Create a route card element
 * @param {Object} route - Route data object
 * @param {Function} onClick - Callback when card is clicked
 * @returns {HTMLElement} Route card element
 */
function createRouteCard(route, onClick) {
  const card = document.createElement('div');
  card.className = 'route-card';

  // Header with bus name and number
  const header = document.createElement('div');
  header.className = 'route-card-header';

  const name = document.createElement('div');
  name.className = 'route-card-name';
  name.textContent = route.busName;

  const number = document.createElement('div');
  number.className = 'route-card-number';
  number.textContent = `Bus No. ${route.busNumber}`;

  header.appendChild(name);
  header.appendChild(number);

  // Time info
  const timeInfo = document.createElement('div');
  timeInfo.className = 'route-card-time';
  timeInfo.innerHTML = `
    <span>🕐</span>
    <span>${route.outbound.startTime} - ${route.outbound.endTime}</span>
  `;

  // Days badges
  const daysContainer = document.createElement('div');
  daysContainer.className = 'route-card-days';
  daysContainer.innerHTML = renderDayBadges(route.runDays);

  // Assemble card
  card.appendChild(header);
  card.appendChild(timeInfo);
  card.appendChild(daysContainer);

  // Add click handler
  if (onClick) {
    card.onclick = () => onClick(route.id);
  }

  return card;
}

/**
 * Render multiple route cards in a container
 * @param {string} containerId - ID of container element
 * @param {Array} routes - Array of route objects
 * @param {Function} onCardClick - Callback when card is clicked
 */
function renderRouteCards(containerId, routes, onCardClick) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Route cards container not found:', containerId);
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Show empty state if no routes
  if (!routes || routes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state-icon">🚌</div>
      <div class="empty-state-text">No routes added yet</div>
      <div class="empty-state-subtext">Tap + to create your first route</div>
    `;

    container.appendChild(emptyState);
    return;
  }

  // Render each route card
  routes.forEach(route => {
    const card = createRouteCard(route, onCardClick);
    container.appendChild(card);
  });
}

/**
 * Create a detailed route info section (for details screen)
 * @param {Object} route - Route data object
 * @returns {HTMLElement} Route info element
 */
function createRouteDetailsView(route) {
  const container = document.createElement('div');

  // Basic Information Card
  const basicCard = document.createElement('div');
  basicCard.className = 'details-card';
  basicCard.innerHTML = `
    <div class="details-card-title">Basic Information</div>
    <div class="details-row">
      <span class="details-label">Bus Name</span>
      <span class="details-value">${route.busName}</span>
    </div>
    <div class="details-row">
      <span class="details-label">Bus Number</span>
      <span class="details-value">${route.busNumber}</span>
    </div>
    <div class="details-row">
      <span class="details-label">Created</span>
      <span class="details-value">${formatDate(route.createdAt)}</span>
    </div>
  `;

  // Outbound Schedule Card
  const outboundCard = document.createElement('div');
  outboundCard.className = 'schedule-card outbound';
  outboundCard.innerHTML = `
    <div class="schedule-title">
      <span>→</span>
      <span>Outbound Schedule</span>
    </div>
    <div class="schedule-time-row">
      <span class="schedule-time-label">Start Time</span>
      <span class="schedule-time-value">${route.outbound.startTime}</span>
    </div>
    <div class="schedule-time-row">
      <span class="schedule-time-label">End Time</span>
      <span class="schedule-time-value">${route.outbound.endTime}</span>
    </div>
  `;

  // Return Trip Schedule Card
  const returnCard = document.createElement('div');
  returnCard.className = 'schedule-card return';
  returnCard.innerHTML = `
    <div class="schedule-title">
      <span>←</span>
      <span>Return Trip Schedule</span>
    </div>
    <div class="schedule-time-row">
      <span class="schedule-time-label">Start Time</span>
      <span class="schedule-time-value">${route.returnTrip.startTime}</span>
    </div>
    <div class="schedule-time-row">
      <span class="schedule-time-label">End Time</span>
      <span class="schedule-time-value">${route.returnTrip.endTime}</span>
    </div>
  `;

  // Operating Days Card
  const daysCard = document.createElement('div');
  daysCard.className = 'details-card';
  daysCard.innerHTML = `
    <div class="details-card-title">Operating Days</div>
    <div class="route-card-days" style="margin-top: 10px;">
      ${renderDayBadges(route.runDays)}
    </div>
  `;

  // Stoppages Card
  const stoppagesCard = document.createElement('div');
  stoppagesCard.className = 'details-card';
  stoppagesCard.innerHTML = `
    <div class="details-card-title">
      Stoppages (${route.stoppages ? route.stoppages.length : 0})
    </div>
    <div class="stoppage-list">
      ${renderStoppagesList(route.stoppages)}
    </div>
  `;

  // Assemble all cards
  container.appendChild(basicCard);
  container.appendChild(outboundCard);
  container.appendChild(returnCard);
  container.appendChild(daysCard);
  container.appendChild(stoppagesCard);

  return container;
}

/**
 * Update a route card with new data
 * @param {string} routeId - Route ID
 * @param {Object} newData - New route data
 */
function updateRouteCard(routeId, newData) {
  // Find the card element
  const cards = document.querySelectorAll('.route-card');

  cards.forEach(card => {
    // Check if this is the right card (you might need to add data-id attribute)
    // For now, we'll just re-render all cards
    // This is a simplified version
  });

  // In practice, you'd re-render the entire list
  // or update the specific card's innerHTML
}

/**
 * Filter route cards by search query
 * @param {string} containerId - ID of container element
 * @param {Array} routes - Array of all routes
 * @param {string} searchQuery - Search query string
 * @param {Function} onCardClick - Callback when card is clicked
 */
function filterRouteCards(containerId, routes, searchQuery, onCardClick) {
  if (!searchQuery || searchQuery.trim().length === 0) {
    renderRouteCards(containerId, routes, onCardClick);
    return;
  }

  const query = searchQuery.toLowerCase().trim();

  const filteredRoutes = routes.filter(route => {
    const busName = (route.busName || '').toLowerCase();
    const busNumber = (route.busNumber || '').toLowerCase();

    return busName.includes(query) || busNumber.includes(query);
  });

  renderRouteCards(containerId, filteredRoutes, onCardClick);
}
