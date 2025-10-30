// Day Selector component for selecting bus run days

/**
 * Render day selector
 * @param {string} containerId - ID of container element
 * @param {Object} selectedDays - Object with day keys and boolean values
 * @param {Function} onChange - Callback when selection changes
 */
function renderDaySelector(containerId, selectedDays = {}, onChange) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Day selector container not found:', containerId);
    return;
  }

  const days = [
    { key: 'sunday', label: 'S' },
    { key: 'monday', label: 'M' },
    { key: 'tuesday', label: 'T' },
    { key: 'wednesday', label: 'W' },
    { key: 'thursday', label: 'T' },
    { key: 'friday', label: 'F' },
    { key: 'saturday', label: 'S' }
  ];

  // Create container HTML
  const html = `
    <div class="day-selector-container">
      <label class="day-selector-label">Select Bus Run Day</label>
      <div class="day-selector" id="${containerId}-buttons"></div>
      <span class="input-error" id="error-runDays"></span>
    </div>
  `;

  container.innerHTML = html;

  // Render day buttons
  const buttonsContainer = document.getElementById(`${containerId}-buttons`);

  days.forEach(day => {
    const isSelected = selectedDays[day.key] === true;

    const button = document.createElement('div');
    button.className = `day-button ${isSelected ? 'selected' : ''}`;
    button.textContent = day.label;
    button.setAttribute('data-day', day.key);

    button.onclick = () => {
      const currentState = button.classList.contains('selected');
      button.classList.toggle('selected');

      // Update selected days object
      selectedDays[day.key] = !currentState;

      // Call onChange callback
      if (onChange) {
        onChange(selectedDays);
      }
    };

    buttonsContainer.appendChild(button);
  });
}

/**
 * Get selected days from day selector
 * @param {string} containerId - ID of container element
 * @returns {Object} Object with day keys and boolean values
 */
function getSelectedDays(containerId) {
  const container = document.getElementById(`${containerId}-buttons`);

  if (!container) {
    return {};
  }

  const selectedDays = {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
  };

  const buttons = container.querySelectorAll('.day-button');

  buttons.forEach(button => {
    const dayKey = button.getAttribute('data-day');
    const isSelected = button.classList.contains('selected');

    selectedDays[dayKey] = isSelected;
  });

  return selectedDays;
}

/**
 * Set selected days in day selector
 * @param {string} containerId - ID of container element
 * @param {Object} selectedDays - Object with day keys and boolean values
 */
function setSelectedDays(containerId, selectedDays) {
  const container = document.getElementById(`${containerId}-buttons`);

  if (!container) {
    return;
  }

  const buttons = container.querySelectorAll('.day-button');

  buttons.forEach(button => {
    const dayKey = button.getAttribute('data-day');
    const isSelected = selectedDays[dayKey] === true;

    if (isSelected) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

/**
 * Clear all selected days
 * @param {string} containerId - ID of container element
 */
function clearSelectedDays(containerId) {
  const container = document.getElementById(`${containerId}-buttons`);

  if (!container) {
    return;
  }

  const buttons = container.querySelectorAll('.day-button');

  buttons.forEach(button => {
    button.classList.remove('selected');
  });
}

/**
 * Render day badges (for display only, not interactive)
 * @param {Object} runDays - Object with day keys and boolean values
 * @returns {string} HTML string of day badges
 */
function renderDayBadges(runDays) {
  const days = [
    { key: 'sunday', label: 'S' },
    { key: 'monday', label: 'M' },
    { key: 'tuesday', label: 'T' },
    { key: 'wednesday', label: 'W' },
    { key: 'thursday', label: 'T' },
    { key: 'friday', label: 'F' },
    { key: 'saturday', label: 'S' }
  ];

  return days.map(day => {
    const isActive = runDays[day.key] === true;
    const className = isActive ? 'day-badge active' : 'day-badge inactive';

    return `<span class="${className}">${day.label}</span>`;
  }).join('');
}
