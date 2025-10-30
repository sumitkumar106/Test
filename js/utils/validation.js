// Form validation functions

/**
 * Validate bus name
 * @param {string} busName - Bus name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
function validateBusName(busName) {
  if (!busName || busName.trim().length === 0) {
    return { valid: false, error: 'Bus name is required' };
  }

  if (busName.trim().length < 2) {
    return { valid: false, error: 'Bus name must be at least 2 characters' };
  }

  if (busName.trim().length > 50) {
    return { valid: false, error: 'Bus name must be less than 50 characters' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate bus number
 * @param {string} busNumber - Bus number to validate
 * @returns {Object} { valid: boolean, error: string }
 */
function validateBusNumber(busNumber) {
  if (!busNumber || busNumber.trim().length === 0) {
    return { valid: false, error: 'Bus number is required' };
  }

  if (busNumber.trim().length > 20) {
    return { valid: false, error: 'Bus number must be less than 20 characters' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate time format (HH:MM AM/PM)
 * @param {string} time - Time string to validate
 * @returns {Object} { valid: boolean, error: string }
 */
function validateTime(time) {
  if (!time || time.trim().length === 0) {
    return { valid: false, error: 'Time is required' };
  }

  const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Invalid time format (use HH:MM AM/PM)' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate that end time is after start time
 * @param {string} startTime - Start time string
 * @param {string} endTime - End time string
 * @returns {Object} { valid: boolean, error: string }
 */
function validateTimeRange(startTime, endTime) {
  const startValidation = validateTime(startTime);
  if (!startValidation.valid) {
    return { valid: false, error: 'Invalid start time' };
  }

  const endValidation = validateTime(endTime);
  if (!endValidation.valid) {
    return { valid: false, error: 'Invalid end time' };
  }

  // For bus routes, end time can be before start time (overnight routes)
  // So we don't enforce end > start, just validate format
  return { valid: true, error: '' };
}

/**
 * Validate run days (at least one day must be selected)
 * @param {Object} runDays - Object with day keys (sunday, monday, etc.)
 * @returns {Object} { valid: boolean, error: string }
 */
function validateRunDays(runDays) {
  if (!runDays || typeof runDays !== 'object') {
    return { valid: false, error: 'Run days is required' };
  }

  const hasAtLeastOneDay = Object.values(runDays).some(day => day === true);

  if (!hasAtLeastOneDay) {
    return { valid: false, error: 'At least one day must be selected' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate stoppage name
 * @param {string} stoppageName - Stoppage name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
function validateStoppageName(stoppageName) {
  if (!stoppageName || stoppageName.trim().length === 0) {
    return { valid: false, error: 'Stoppage name is required' };
  }

  if (stoppageName.trim().length < 2) {
    return { valid: false, error: 'Stoppage name must be at least 2 characters' };
  }

  if (stoppageName.trim().length > 100) {
    return { valid: false, error: 'Stoppage name must be less than 100 characters' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate stoppage (name and arrival time)
 * @param {Object} stoppage - Stoppage object with name and arrivalTime
 * @returns {Object} { valid: boolean, error: string }
 */
function validateStoppage(stoppage) {
  if (!stoppage || typeof stoppage !== 'object') {
    return { valid: false, error: 'Invalid stoppage data' };
  }

  const nameValidation = validateStoppageName(stoppage.name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const timeValidation = validateTime(stoppage.arrivalTime);
  if (!timeValidation.valid) {
    return { valid: false, error: 'Invalid stoppage arrival time' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate stoppages array (at least one stoppage required)
 * @param {Array} stoppages - Array of stoppage objects
 * @returns {Object} { valid: boolean, error: string }
 */
function validateStoppages(stoppages) {
  if (!Array.isArray(stoppages)) {
    return { valid: false, error: 'Stoppages must be an array' };
  }

  if (stoppages.length === 0) {
    return { valid: false, error: 'At least one stoppage is required' };
  }

  // Validate each stoppage
  for (let i = 0; i < stoppages.length; i++) {
    const stoppageValidation = validateStoppage(stoppages[i]);
    if (!stoppageValidation.valid) {
      return { valid: false, error: `Stoppage ${i + 1}: ${stoppageValidation.error}` };
    }
  }

  return { valid: true, error: '' };
}

/**
 * Validate entire route form data
 * @param {Object} routeData - Complete route data object
 * @returns {Object} { valid: boolean, errors: Object }
 */
function validateRouteForm(routeData) {
  const errors = {};

  // Validate bus name
  const busNameValidation = validateBusName(routeData.busName);
  if (!busNameValidation.valid) {
    errors.busName = busNameValidation.error;
  }

  // Validate bus number
  const busNumberValidation = validateBusNumber(routeData.busNumber);
  if (!busNumberValidation.valid) {
    errors.busNumber = busNumberValidation.error;
  }

  // Validate outbound times
  if (routeData.outbound) {
    const outboundValidation = validateTimeRange(
      routeData.outbound.startTime,
      routeData.outbound.endTime
    );
    if (!outboundValidation.valid) {
      errors.outbound = outboundValidation.error;
    }
  } else {
    errors.outbound = 'Outbound schedule is required';
  }

  // Validate return trip times
  if (routeData.returnTrip) {
    const returnValidation = validateTimeRange(
      routeData.returnTrip.startTime,
      routeData.returnTrip.endTime
    );
    if (!returnValidation.valid) {
      errors.returnTrip = returnValidation.error;
    }
  } else {
    errors.returnTrip = 'Return trip schedule is required';
  }

  // Validate run days
  const runDaysValidation = validateRunDays(routeData.runDays);
  if (!runDaysValidation.valid) {
    errors.runDays = runDaysValidation.error;
  }

  // Validate stoppages
  const stoppagesValidation = validateStoppages(routeData.stoppages);
  if (!stoppagesValidation.valid) {
    errors.stoppages = stoppagesValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

/**
 * Show validation errors in form
 * @param {Object} errors - Errors object from validateRouteForm
 */
function displayValidationErrors(errors) {
  // Clear existing errors
  document.querySelectorAll('.input-error').forEach(el => el.textContent = '');

  // Display new errors
  Object.keys(errors).forEach(field => {
    const errorElement = document.getElementById(`error-${field}`);
    if (errorElement) {
      errorElement.textContent = errors[field];
    } else {
      console.warn(`Error element not found for field: ${field}`);
    }
  });

  // Show toast with first error
  const firstError = Object.values(errors)[0];
  if (firstError) {
    showToast(firstError, 'error');
  }
}

/**
 * Clear all validation errors
 */
function clearValidationErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
}
