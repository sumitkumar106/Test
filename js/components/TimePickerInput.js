// Time Picker Input component

/**
 * Render time picker input
 * @param {string} containerId - ID of container element
 * @param {string} label - Label text
 * @param {string} value - Current time value (HH:MM AM/PM)
 * @param {Function} onChange - Callback when time changes
 * @param {string} inputId - ID for the input element
 */
function renderTimePickerInput(containerId, label, value = '00:00 AM', onChange, inputId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Time picker container not found:', containerId);
    return;
  }

  const html = `
    <div class="time-picker-container">
      <label class="time-picker-label">${label}</label>
      <div class="time-picker-wrapper">
        <select class="time-picker-input" id="${inputId}">
          ${generateTimeOptions().map(time =>
            `<option value="${time}" ${time === value ? 'selected' : ''}>${time}</option>`
          ).join('')}
        </select>
        <span class="time-picker-icon">▼</span>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add change event listener
  const select = document.getElementById(inputId);

  if (select && onChange) {
    select.addEventListener('change', (e) => {
      onChange(e.target.value);
    });
  }
}

/**
 * Get time value from time picker
 * @param {string} inputId - ID of input element
 * @returns {string} Selected time value
 */
function getTimePickerValue(inputId) {
  const input = document.getElementById(inputId);

  if (!input) {
    return '';
  }

  return input.value;
}

/**
 * Set time value in time picker
 * @param {string} inputId - ID of input element
 * @param {string} value - Time value to set
 */
function setTimePickerValue(inputId, value) {
  const input = document.getElementById(inputId);

  if (!input) {
    return;
  }

  input.value = value;
}

/**
 * Create a simple time input (alternative to select dropdown)
 * @param {string} containerId - ID of container element
 * @param {string} label - Label text
 * @param {string} value - Current time value
 * @param {Function} onChange - Callback when time changes
 * @param {string} inputId - ID for the input element
 */
function renderSimpleTimeInput(containerId, label, value = '00:00 AM', onChange, inputId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Time input container not found:', containerId);
    return;
  }

  const html = `
    <div class="time-picker-container">
      <label class="time-picker-label">${label}</label>
      <div class="time-picker-wrapper">
        <input
          type="text"
          class="text-input"
          id="${inputId}"
          value="${value}"
          placeholder="HH:MM AM/PM"
          readonly
          style="cursor: pointer;"
        />
        <span class="time-picker-icon">🕐</span>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const input = document.getElementById(inputId);

  if (input) {
    // Show time picker on click
    input.addEventListener('click', () => {
      showTimePickerModal(inputId, value, onChange);
    });
  }
}

/**
 * Show time picker modal
 * @param {string} inputId - ID of input element
 * @param {string} currentValue - Current time value
 * @param {Function} onChange - Callback when time selected
 */
function showTimePickerModal(inputId, currentValue, onChange) {
  const times = generateTimeOptions();

  // Create modal with time options
  const modalContainer = document.getElementById('modal-container');

  if (!modalContainer) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.maxHeight = '80vh';
  content.style.overflow = 'auto';

  const title = document.createElement('div');
  title.className = 'modal-title';
  title.textContent = 'Select Time';

  const timeList = document.createElement('div');
  timeList.style.cssText = 'max-height: 400px; overflow-y: auto;';

  times.forEach(time => {
    const timeOption = document.createElement('div');
    timeOption.className = 'suggestion-item';
    timeOption.textContent = time;
    timeOption.style.padding = '12px 15px';
    timeOption.style.cursor = 'pointer';

    if (time === currentValue) {
      timeOption.style.backgroundColor = '#f0f0f0';
      timeOption.style.fontWeight = 'bold';
    }

    timeOption.onclick = () => {
      // Update input value
      const input = document.getElementById(inputId);
      if (input) {
        input.value = time;
      }

      // Call onChange callback
      if (onChange) {
        onChange(time);
      }

      // Close modal
      if (modalContainer.contains(overlay)) {
        modalContainer.removeChild(overlay);
      }
    };

    timeList.appendChild(timeOption);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.marginTop = '15px';

  cancelBtn.onclick = () => {
    if (modalContainer.contains(overlay)) {
      modalContainer.removeChild(overlay);
    }
  };

  content.appendChild(title);
  content.appendChild(timeList);
  content.appendChild(cancelBtn);
  overlay.appendChild(content);
  modalContainer.appendChild(overlay);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      modalContainer.removeChild(overlay);
    }
  };
}
