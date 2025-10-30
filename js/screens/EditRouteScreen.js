// Edit Route Screen - Edit existing bus route

// Edit form state
let editFormState = {
  routeId: null,
  busName: '',
  busNumber: '',
  outbound: {
    startTime: '06:00 AM',
    endTime: '10:00 PM'
  },
  returnTrip: {
    startTime: '10:00 PM',
    endTime: '06:00 AM'
  },
  runDays: {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
  }
};

/**
 * Render Edit Route Screen
 * @param {string} routeId - Route ID to edit
 */
async function renderEditRouteScreen(routeId) {
  const screen = document.getElementById('edit-route-screen');

  if (!screen) {
    console.error('Edit route screen container not found');
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
    const route = await loadRouteForEdit(routeId);

    if (!route) {
      showErrorToast('Route not found');
      navigateTo('routes-list');
      return;
    }

    // Populate form state with route data
    editFormState = {
      routeId: route.id,
      busName: route.busName,
      busNumber: route.busNumber,
      outbound: route.outbound,
      returnTrip: route.returnTrip,
      runDays: route.runDays
    };

    // Initialize stoppages
    setStoppagesData(route.stoppages || []);

    // Render form
    screen.innerHTML = `
      <!-- Back Button -->
      <div class="back-button" onclick="navigateTo('route-details', { routeId: '${routeId}' })">
        ←
      </div>

      <!-- Header -->
      <div class="header">
        <div class="header-subtitle">Edit Route</div>
        <div class="header-title">${route.busName}</div>
      </div>

      <!-- Form Container -->
      <div class="form-container">
        <!-- Route Direction Indicator -->
        <div class="route-direction">
          <span>📍</span>
          <span>↔</span>
          <span>📍</span>
        </div>

        <!-- Bus Name -->
        <div class="input-group">
          <input
            type="text"
            class="text-input"
            id="edit-busName"
            placeholder="Bus Name"
            value="${route.busName}"
          />
          <span class="input-error" id="error-busName"></span>
        </div>

        <!-- Bus Number -->
        <div class="input-group">
          <input
            type="text"
            class="text-input"
            id="edit-busNumber"
            placeholder="Bus No."
            value="${route.busNumber}"
          />
          <span class="input-error" id="error-busNumber"></span>
        </div>

        <!-- Outbound: Bus Start Time -->
        <div id="edit-outbound-start-container"></div>

        <!-- Outbound: Bus End Time -->
        <div id="edit-outbound-end-container"></div>

        <!-- Day Selector -->
        <div id="edit-day-selector-container"></div>

        <!-- Stoppages -->
        <div class="input-group">
          <div id="edit-stoppages-container"></div>
          <span class="input-error" id="error-stoppages"></span>
        </div>

        <!-- Route Direction Indicator (Return Trip) -->
        <div class="route-direction">
          <span>📍</span>
          <span>↔</span>
          <span>📍</span>
        </div>

        <!-- Return Trip: Bus Start Time -->
        <div id="edit-return-start-container"></div>

        <!-- Return Trip: Bus End Time -->
        <div id="edit-return-end-container"></div>
      </div>

      <!-- Update Button -->
      <div class="save-button-container">
        <button class="btn btn-primary" id="updateRouteBtn">Update Route</button>
      </div>
    `;

    // Initialize form components
    initializeEditRouteForm();

  } catch (error) {
    console.error('Error loading route for edit:', error);
    showErrorToast('Failed to load route for editing');
    navigateTo('routes-list');
  }
}

/**
 * Load route data for editing
 * @param {string} routeId - Route ID
 * @returns {Promise<Object|null>} Route object or null
 */
async function loadRouteForEdit(routeId) {
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
    console.error('Error loading route for edit:', error);
    throw error;
  }
}

/**
 * Initialize edit form components
 */
function initializeEditRouteForm() {
  // Initialize time pickers with existing values
  renderTimePickerInput(
    'edit-outbound-start-container',
    'Bus Start',
    editFormState.outbound.startTime,
    (value) => { editFormState.outbound.startTime = value; },
    'edit-outbound-start-time'
  );

  renderTimePickerInput(
    'edit-outbound-end-container',
    'Bus End',
    editFormState.outbound.endTime,
    (value) => { editFormState.outbound.endTime = value; },
    'edit-outbound-end-time'
  );

  renderTimePickerInput(
    'edit-return-start-container',
    'Bus Start',
    editFormState.returnTrip.startTime,
    (value) => { editFormState.returnTrip.startTime = value; },
    'edit-return-start-time'
  );

  renderTimePickerInput(
    'edit-return-end-container',
    'Bus End',
    editFormState.returnTrip.endTime,
    (value) => { editFormState.returnTrip.endTime = value; },
    'edit-return-end-time'
  );

  // Initialize day selector with existing values
  renderDaySelector(
    'edit-day-selector-container',
    editFormState.runDays,
    (selectedDays) => { editFormState.runDays = selectedDays; }
  );

  // Initialize stoppages (already set in renderEditRouteScreen)
  renderStoppages('edit-stoppages-container');

  // Setup input listeners
  setupEditInputs();

  // Setup update button
  setupUpdateButton();
}

/**
 * Setup input field listeners
 */
function setupEditInputs() {
  const busNameInput = document.getElementById('edit-busName');
  const busNumberInput = document.getElementById('edit-busNumber');

  if (busNameInput) {
    busNameInput.oninput = (e) => {
      editFormState.busName = e.target.value;
    };
  }

  if (busNumberInput) {
    busNumberInput.oninput = (e) => {
      editFormState.busNumber = e.target.value;
    };
  }
}

/**
 * Setup update button
 */
function setupUpdateButton() {
  const button = document.getElementById('updateRouteBtn');

  if (!button) return;

  button.onclick = async () => {
    await handleUpdateRoute();
  };
}

/**
 * Handle update route action
 */
async function handleUpdateRoute() {
  // Clear previous errors
  clearValidationErrors();

  // Get stoppages data
  const stoppages = getStoppagesData();

  // Build route data object
  const routeData = {
    busName: editFormState.busName.trim(),
    busNumber: editFormState.busNumber.trim(),
    outbound: {
      startTime: editFormState.outbound.startTime,
      endTime: editFormState.outbound.endTime
    },
    returnTrip: {
      startTime: editFormState.returnTrip.startTime,
      endTime: editFormState.returnTrip.endTime
    },
    runDays: editFormState.runDays,
    stoppages: stoppages
  };

  // Validate form
  const validation = validateRouteForm(routeData);

  if (!validation.valid) {
    displayValidationErrors(validation.errors);
    return;
  }

  // Disable update button during update
  const button = document.getElementById('updateRouteBtn');
  if (button) {
    button.disabled = true;
    button.textContent = 'Updating...';
  }

  try {
    const routeId = editFormState.routeId;

    // Try to update in Firestore first
    try {
      await updateRoute(routeId, routeData);
      console.log('Route updated in Firestore');
    } catch (firestoreError) {
      console.warn('Firestore update failed, updating in localStorage:', firestoreError);
      updateLocalRoute(routeId, routeData);
      console.log('Route updated in localStorage');
    }

    // Show success message
    showSuccessToast('Route updated successfully!');

    // Navigate back to route details
    navigateTo('route-details', { routeId });

  } catch (error) {
    console.error('Error updating route:', error);
    showErrorToast(error.message || 'Failed to update route. Please try again.');

    // Re-enable update button
    if (button) {
      button.disabled = false;
      button.textContent = 'Update Route';
    }
  }
}

/**
 * Show Edit Route Screen (called by router)
 * @param {Object} params - Route parameters (routeId)
 */
function showEditRouteScreen(params) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show edit route screen
  const screen = document.getElementById('edit-route-screen');

  if (screen) {
    screen.classList.remove('hidden');

    // Render edit form
    const routeId = params?.routeId;

    if (!routeId) {
      console.error('Route ID not provided');
      navigateTo('routes-list');
      return;
    }

    renderEditRouteScreen(routeId);
  }

  // Initialize ad banner
  renderAdBanner();
}
