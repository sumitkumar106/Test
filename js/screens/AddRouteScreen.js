// Add Route Screen - Main form for creating bus routes

// Form state
let formState = {
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

// Gemini suggestions state
let suggestions = [];
let suggestionsVisible = false;

/**
 * Render Add Route Screen
 */
function renderAddRouteScreen() {
  const screen = document.getElementById('add-route-screen');

  if (!screen) {
    console.error('Add route screen container not found');
    return;
  }

  screen.innerHTML = `
    <!-- Header -->
    <div class="header">
      <div class="header-subtitle">Welcome to bus stand</div>
      <div class="header-title">Your Route, Your Way</div>
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
      <div class="input-group" style="position: relative;">
        <input
          type="text"
          class="text-input"
          id="busName"
          placeholder="Bus Name"
          autocomplete="off"
        />
        <span class="input-error" id="error-busName"></span>

        <!-- Gemini Suggestions Dropdown -->
        <div class="suggestions-dropdown" id="suggestions-dropdown" style="display: none;"></div>
      </div>

      <!-- Bus Number -->
      <div class="input-group">
        <input
          type="text"
          class="text-input"
          id="busNumber"
          placeholder="Bus No."
        />
        <span class="input-error" id="error-busNumber"></span>
      </div>

      <!-- Outbound: Bus Start Time -->
      <div id="outbound-start-container"></div>

      <!-- Outbound: Bus End Time -->
      <div id="outbound-end-container"></div>

      <!-- Day Selector -->
      <div id="day-selector-container"></div>

      <!-- Stoppages -->
      <div class="input-group">
        <div id="stoppages-container"></div>
        <span class="input-error" id="error-stoppages"></span>
      </div>

      <!-- Route Direction Indicator (Return Trip) -->
      <div class="route-direction">
        <span>📍</span>
        <span>↔</span>
        <span>📍</span>
      </div>

      <!-- Return Trip: Bus Start Time -->
      <div id="return-start-container"></div>

      <!-- Return Trip: Bus End Time -->
      <div id="return-end-container"></div>
    </div>

    <!-- Save Button -->
    <div class="save-button-container">
      <button class="btn btn-primary" id="saveRouteBtn">Save</button>
    </div>
  `;

  // Initialize form components
  initializeAddRouteForm();
}

/**
 * Initialize all form components and event listeners
 */
function initializeAddRouteForm() {
  // Initialize time pickers
  renderTimePickerInput(
    'outbound-start-container',
    'Bus Start',
    formState.outbound.startTime,
    (value) => { formState.outbound.startTime = value; },
    'outbound-start-time'
  );

  renderTimePickerInput(
    'outbound-end-container',
    'Bus End',
    formState.outbound.endTime,
    (value) => { formState.outbound.endTime = value; },
    'outbound-end-time'
  );

  renderTimePickerInput(
    'return-start-container',
    'Bus Start',
    formState.returnTrip.startTime,
    (value) => { formState.returnTrip.startTime = value; },
    'return-start-time'
  );

  renderTimePickerInput(
    'return-end-container',
    'Bus End',
    formState.returnTrip.endTime,
    (value) => { formState.returnTrip.endTime = value; },
    'return-end-time'
  );

  // Initialize day selector
  renderDaySelector(
    'day-selector-container',
    formState.runDays,
    (selectedDays) => { formState.runDays = selectedDays; }
  );

  // Initialize stoppages
  initializeStoppages();
  renderStoppages('stoppages-container');

  // Setup bus name input with Gemini suggestions
  setupBusNameInput();

  // Setup bus number input
  setupBusNumberInput();

  // Setup save button
  setupSaveButton();
}

/**
 * Setup bus name input with Gemini AI suggestions
 */
function setupBusNameInput() {
  const input = document.getElementById('busName');
  const dropdown = document.getElementById('suggestions-dropdown');

  if (!input) return;

  // Update form state on input
  input.oninput = (e) => {
    formState.busName = e.target.value;

    // Get Gemini suggestions (debounced)
    if (e.target.value.length >= 3) {
      showSuggestionsLoading();

      debouncedGetGeminiSuggestions(e.target.value)
        .then(results => {
          suggestions = results;
          renderSuggestions();
        })
        .catch(error => {
          console.error('Suggestions error:', error);
          hideSuggestions();
        });
    } else {
      hideSuggestions();
    }
  };

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target.closest('#suggestions-dropdown') === null) {
      hideSuggestions();
    }
  });
}

/**
 * Show loading state in suggestions dropdown
 */
function showSuggestionsLoading() {
  const dropdown = document.getElementById('suggestions-dropdown');

  if (!dropdown) return;

  dropdown.style.display = 'block';
  dropdown.innerHTML = '<div class="suggestion-loading">Getting suggestions...</div>';
}

/**
 * Render Gemini suggestions
 */
function renderSuggestions() {
  const dropdown = document.getElementById('suggestions-dropdown');

  if (!dropdown) return;

  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = '';

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = suggestion;

    item.onclick = () => {
      const input = document.getElementById('busName');
      if (input) {
        input.value = suggestion;
        formState.busName = suggestion;
      }

      hideSuggestions();
    };

    dropdown.appendChild(item);
  });
}

/**
 * Hide suggestions dropdown
 */
function hideSuggestions() {
  const dropdown = document.getElementById('suggestions-dropdown');

  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Setup bus number input
 */
function setupBusNumberInput() {
  const input = document.getElementById('busNumber');

  if (!input) return;

  input.oninput = (e) => {
    formState.busNumber = e.target.value;
  };
}

/**
 * Setup save button
 */
function setupSaveButton() {
  const button = document.getElementById('saveRouteBtn');

  if (!button) return;

  button.onclick = async () => {
    await handleSaveRoute();
  };
}

/**
 * Handle save route action
 */
async function handleSaveRoute() {
  // Clear previous errors
  clearValidationErrors();

  // Get stoppages data
  const stoppages = getStoppagesData();

  // Build route data object
  const routeData = {
    busName: formState.busName.trim(),
    busNumber: formState.busNumber.trim(),
    outbound: {
      startTime: formState.outbound.startTime,
      endTime: formState.outbound.endTime
    },
    returnTrip: {
      startTime: formState.returnTrip.startTime,
      endTime: formState.returnTrip.endTime
    },
    runDays: formState.runDays,
    stoppages: stoppages
  };

  // Validate form
  const validation = validateRouteForm(routeData);

  if (!validation.valid) {
    displayValidationErrors(validation.errors);
    return;
  }

  // Disable save button during save
  const button = document.getElementById('saveRouteBtn');
  if (button) {
    button.disabled = true;
    button.textContent = 'Saving...';
  }

  try {
    // Try to save to Firestore first
    let routeId;

    try {
      routeId = await createRoute(routeData);
      console.log('Route saved to Firestore:', routeId);
    } catch (firestoreError) {
      console.warn('Firestore save failed, falling back to localStorage:', firestoreError);
      routeId = saveRouteLocally(routeData);
      console.log('Route saved locally:', routeId);
    }

    // Show success message
    showSuccessToast('Route saved successfully!');

    // Show interstitial ad
    showInterstitialAd();

    // Reset form
    resetAddRouteForm();

    // Re-enable save button
    if (button) {
      button.disabled = false;
      button.textContent = 'Save';
    }

  } catch (error) {
    console.error('Error saving route:', error);
    showErrorToast(error.message || 'Failed to save route. Please try again.');

    // Re-enable save button
    if (button) {
      button.disabled = false;
      button.textContent = 'Save';
    }
  }
}

/**
 * Reset form to initial state
 */
function resetAddRouteForm() {
  // Reset form state
  formState = {
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

  // Reset input fields
  const busNameInput = document.getElementById('busName');
  const busNumberInput = document.getElementById('busNumber');

  if (busNameInput) busNameInput.value = '';
  if (busNumberInput) busNumberInput.value = '';

  // Reset time pickers
  setTimePickerValue('outbound-start-time', '06:00 AM');
  setTimePickerValue('outbound-end-time', '10:00 PM');
  setTimePickerValue('return-start-time', '10:00 PM');
  setTimePickerValue('return-end-time', '06:00 AM');

  // Reset day selector
  clearSelectedDays('day-selector-container');

  // Reset stoppages
  clearStoppages();
  renderStoppages('stoppages-container');

  // Clear validation errors
  clearValidationErrors();

  // Hide suggestions
  hideSuggestions();
}

/**
 * Show Add Route Screen (called by router)
 */
function showAddRouteScreen() {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show add route screen
  const screen = document.getElementById('add-route-screen');

  if (screen) {
    screen.classList.remove('hidden');

    // Render screen if not already rendered
    if (screen.innerHTML.trim() === '') {
      renderAddRouteScreen();
    }
  }

  // Initialize ad banner
  renderAdBanner();
}
