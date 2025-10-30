// Stoppage Input component for adding/editing bus stoppages

// Global stoppages array
let stoppagesData = [];

/**
 * Initialize stoppages array
 * @param {Array} initialStoppages - Initial stoppages data
 */
function initializeStoppages(initialStoppages = []) {
  stoppagesData = initialStoppages.length > 0 ? initialStoppages : [
    { name: '', arrivalTime: '00:00 AM', order: 0 }
  ];
}

/**
 * Render all stoppages
 * @param {string} containerId - ID of container element
 */
function renderStoppages(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Stoppages container not found:', containerId);
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Render each stoppage
  stoppagesData.forEach((stoppage, index) => {
    const stoppageElement = createStoppageElement(stoppage, index);
    container.appendChild(stoppageElement);
  });

  // Add "ADD MORE STOPPAGE" button
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'btn btn-secondary';
  addButton.textContent = 'ADD MORE STOPPAGE';
  addButton.style.marginTop = '15px';

  addButton.onclick = () => {
    addStoppage();
    renderStoppages(containerId);
  };

  container.appendChild(addButton);
}

/**
 * Create a single stoppage element
 * @param {Object} stoppage - Stoppage data
 * @param {number} index - Stoppage index
 * @returns {HTMLElement} Stoppage element
 */
function createStoppageElement(stoppage, index) {
  const container = document.createElement('div');
  container.className = 'stoppage-container';

  // Header with number and remove button
  const header = document.createElement('div');
  header.className = 'stoppage-header';

  const number = document.createElement('div');
  number.className = 'stoppage-number';
  number.textContent = index + 1;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'stoppage-remove';
  removeBtn.innerHTML = '×';
  removeBtn.title = 'Remove stoppage';

  // Only show remove button if more than one stoppage
  if (stoppagesData.length > 1) {
    removeBtn.onclick = () => {
      removeStoppage(index);
    };
    header.appendChild(number);
    header.appendChild(removeBtn);
  } else {
    header.appendChild(number);
  }

  // Stoppage name input
  const nameLabel = document.createElement('label');
  nameLabel.className = 'input-label';
  nameLabel.textContent = 'Stoppage Name';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'stoppage-input';
  nameInput.placeholder = 'Stoppage Name';
  nameInput.value = stoppage.name || '';

  nameInput.oninput = (e) => {
    stoppagesData[index].name = e.target.value;
  };

  // Arrival time picker
  const timeLabel = document.createElement('label');
  timeLabel.className = 'input-label';
  timeLabel.textContent = 'Arrival Time';
  timeLabel.style.marginTop = '10px';

  const timeSelect = document.createElement('select');
  timeSelect.className = 'stoppage-input';
  timeSelect.style.cursor = 'pointer';

  const timeOptions = generateTimeOptions();
  timeOptions.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;

    if (time === stoppage.arrivalTime) {
      option.selected = true;
    }

    timeSelect.appendChild(option);
  });

  timeSelect.onchange = (e) => {
    stoppagesData[index].arrivalTime = e.target.value;
  };

  // Assemble stoppage element
  container.appendChild(header);
  container.appendChild(nameLabel);
  container.appendChild(nameInput);
  container.appendChild(timeLabel);
  container.appendChild(timeSelect);

  return container;
}

/**
 * Add a new stoppage
 */
function addStoppage() {
  const newStoppage = {
    name: '',
    arrivalTime: '00:00 AM',
    order: stoppagesData.length
  };

  stoppagesData.push(newStoppage);
}

/**
 * Remove a stoppage by index
 * @param {number} index - Index of stoppage to remove
 */
function removeStoppage(index) {
  if (stoppagesData.length <= 1) {
    showToast('At least one stoppage is required', 'error');
    return;
  }

  stoppagesData.splice(index, 1);

  // Re-render stoppages
  const container = document.querySelector('.stoppage-container')?.parentElement;
  if (container) {
    renderStoppages(container.id);
  }
}

/**
 * Get all stoppages data
 * @returns {Array} Array of stoppage objects
 */
function getStoppagesData() {
  return stoppagesData.map((stoppage, index) => ({
    name: stoppage.name.trim(),
    arrivalTime: stoppage.arrivalTime,
    order: index
  }));
}

/**
 * Set stoppages data
 * @param {Array} stoppages - Array of stoppage objects
 */
function setStoppagesData(stoppages) {
  stoppagesData = stoppages.length > 0 ? stoppages : [
    { name: '', arrivalTime: '00:00 AM', order: 0 }
  ];
}

/**
 * Clear all stoppages (reset to single empty stoppage)
 */
function clearStoppages() {
  stoppagesData = [
    { name: '', arrivalTime: '00:00 AM', order: 0 }
  ];
}

/**
 * Validate stoppages data
 * @returns {Object} { valid: boolean, error: string }
 */
function validateStoppagesData() {
  if (stoppagesData.length === 0) {
    return { valid: false, error: 'At least one stoppage is required' };
  }

  for (let i = 0; i < stoppagesData.length; i++) {
    const stoppage = stoppagesData[i];

    if (!stoppage.name || stoppage.name.trim().length === 0) {
      return { valid: false, error: `Stoppage ${i + 1}: Name is required` };
    }

    if (stoppage.name.trim().length < 2) {
      return { valid: false, error: `Stoppage ${i + 1}: Name must be at least 2 characters` };
    }

    if (!stoppage.arrivalTime) {
      return { valid: false, error: `Stoppage ${i + 1}: Arrival time is required` };
    }
  }

  return { valid: true, error: '' };
}

/**
 * Render stoppages list (for display only, not editable)
 * @param {Array} stoppages - Array of stoppage objects
 * @returns {string} HTML string of stoppages list
 */
function renderStoppagesList(stoppages) {
  if (!stoppages || stoppages.length === 0) {
    return '<p style="color: #999; text-align: center;">No stoppages</p>';
  }

  return stoppages.map((stoppage, index) => `
    <div class="stoppage-list-item">
      <div class="stoppage-list-number">${index + 1}</div>
      <div class="stoppage-list-info">
        <div class="stoppage-list-name">${stoppage.name}</div>
        <div class="stoppage-list-time">🕐 ${stoppage.arrivalTime}</div>
      </div>
    </div>
  `).join('');
}
