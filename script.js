// State
let selectedDays = [];
const MAX_STOPPAGES = 10;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeDayButtons();
    populateTimeSelectors();
    attachEventListeners();
    setDefaultValues();
});

// Generate time options (00:00 AM to 11:30 PM in 30-minute intervals)
function generateTimeOptions() {
    const times = [];
    const periods = ['AM', 'PM'];

    for (let period of periods) {
        for (let hour = 0; hour <= 11; hour++) {
            for (let minute of [0, 30]) {
                const displayHour = hour === 0 ? 12 : hour;
                const displayMinute = minute.toString().padStart(2, '0');
                times.push(`${displayHour.toString().padStart(2, '0')}:${displayMinute} ${period}`);
            }
        }
    }

    return times;
}

// Populate all time select elements
function populateTimeSelectors() {
    const times = generateTimeOptions();
    const selectors = document.querySelectorAll('.time-picker');

    selectors.forEach(select => {
        // Save current value
        const currentValue = select.value;

        // Clear existing options
        select.innerHTML = '';

        // Add all time options
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            select.appendChild(option);
        });

        // Restore value if it existed
        if (currentValue && times.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

// Set default values for time pickers
function setDefaultValues() {
    document.getElementById('busStartTime').value = '00:00 AM';
    document.getElementById('busEndTime').value = '00:00 PM';
    document.getElementById('returnStartTime').value = '00:00 PM';
    document.getElementById('returnEndTime').value = '00:00 AM';
}

// Initialize day buttons
function initializeDayButtons() {
    const dayButtons = document.querySelectorAll('.day-btn');

    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleDaySelection(this);
        });
    });
}

// Toggle day selection
function toggleDaySelection(button) {
    const day = button.getAttribute('data-day');

    if (button.classList.contains('selected')) {
        // Unselect
        button.classList.remove('selected');
        button.textContent = button.textContent.replace('✓', button.getAttribute('data-day').charAt(0));
        selectedDays = selectedDays.filter(d => d !== day);
    } else {
        // Select
        button.classList.add('selected');
        button.textContent = '✓';
        selectedDays.push(day);
    }
}

// Add more stoppage
function addStoppage() {
    const container = document.getElementById('stoppageContainer');
    const stoppages = container.querySelectorAll('.stoppage-entry');

    // Check maximum limit
    if (stoppages.length >= MAX_STOPPAGES) {
        alert(`Maximum ${MAX_STOPPAGES} stoppages allowed`);
        return;
    }

    // Create new stoppage entry
    const newStoppage = document.createElement('div');
    newStoppage.className = 'stoppage-entry';
    newStoppage.innerHTML = `
        <input type="text" placeholder="Stoppage Name" class="text-input stoppage-name" required>
        <div class="time-picker-group">
            <select class="time-picker stoppage-time">
                <option value="00:00 AM">00:00 AM</option>
            </select>
            <label class="arrival-time-label">Arrival Time</label>
        </div>
        <button type="button" class="remove-stoppage-btn" onclick="removeStoppage(this)">×</button>
    `;

    // Append to container
    container.appendChild(newStoppage);

    // Populate time selector for new stoppage
    const newSelect = newStoppage.querySelector('.time-picker');
    const times = generateTimeOptions();
    newSelect.innerHTML = '';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        newSelect.appendChild(option);
    });

    // Animate insertion
    newStoppage.style.opacity = '0';
    newStoppage.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        newStoppage.style.transition = 'all 0.3s ease';
        newStoppage.style.opacity = '1';
        newStoppage.style.transform = 'translateY(0)';
    }, 10);

    // Focus on new stoppage name input
    newStoppage.querySelector('.stoppage-name').focus();
}

// Remove stoppage
function removeStoppage(button) {
    const container = document.getElementById('stoppageContainer');
    const stoppages = container.querySelectorAll('.stoppage-entry');

    // Must keep at least one stoppage
    if (stoppages.length <= 1) {
        alert('At least one stoppage is required');
        return;
    }

    // Confirm removal
    if (confirm('Remove this stoppage?')) {
        const stoppageEntry = button.closest('.stoppage-entry');
        stoppageEntry.style.transition = 'all 0.3s ease';
        stoppageEntry.style.opacity = '0';
        stoppageEntry.style.transform = 'translateX(-10px)';

        setTimeout(() => {
            stoppageEntry.remove();
        }, 300);
    }
}

// Validate form
function validateForm() {
    const errors = [];

    // Check bus name
    const busName = document.getElementById('busName').value.trim();
    if (!busName) {
        errors.push('Bus Name is required');
    }

    // Check bus number
    const busNo = document.getElementById('busNo').value.trim();
    if (!busNo) {
        errors.push('Bus Number is required');
    }

    // Check at least one day selected
    if (selectedDays.length === 0) {
        errors.push('Please select at least one day');
    }

    // Check stoppages
    const stoppageEntries = document.querySelectorAll('.stoppage-entry');
    let validStoppages = 0;

    stoppageEntries.forEach((entry, index) => {
        const stoppageName = entry.querySelector('.stoppage-name').value.trim();
        if (stoppageName) {
            validStoppages++;
        }
    });

    if (validStoppages === 0) {
        errors.push('At least one stoppage with name is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Collect form data
function collectFormData() {
    const stoppages = [];
    const stoppageEntries = document.querySelectorAll('.stoppage-entry');

    stoppageEntries.forEach((entry, index) => {
        const name = entry.querySelector('.stoppage-name').value.trim();
        const arrivalTime = entry.querySelector('.stoppage-time').value;

        if (name) {
            stoppages.push({
                name: name,
                arrivalTime: arrivalTime,
                sequence: index + 1
            });
        }
    });

    const formData = {
        busName: document.getElementById('busName').value.trim(),
        busNo: document.getElementById('busNo').value.trim(),
        outboundTrip: {
            startTime: document.getElementById('busStartTime').value,
            endTime: document.getElementById('busEndTime').value,
            days: [...selectedDays],
            stoppages: stoppages
        },
        returnTrip: {
            startTime: document.getElementById('returnStartTime').value,
            endTime: document.getElementById('returnEndTime').value
        }
    };

    return formData;
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();

    // Validate form
    const validation = validateForm();

    if (!validation.isValid) {
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
    }

    // Collect form data
    const formData = collectFormData();

    // Log data to console
    console.log('Form Data:', formData);
    console.log('JSON:', JSON.stringify(formData, null, 2));

    // Show success message
    alert('Bus route saved successfully!\n\nCheck console for form data.');

    // Optional: Reset form
    if (confirm('Do you want to add another route?')) {
        resetForm();
    }
}

// Reset form
function resetForm() {
    document.getElementById('busRouteForm').reset();

    // Clear selected days
    selectedDays = [];
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = btn.getAttribute('data-day').charAt(0);
    });

    // Remove extra stoppages (keep only first one)
    const container = document.getElementById('stoppageContainer');
    const stoppages = container.querySelectorAll('.stoppage-entry');
    for (let i = 1; i < stoppages.length; i++) {
        stoppages[i].remove();
    }

    // Clear first stoppage
    const firstStoppage = container.querySelector('.stoppage-entry');
    if (firstStoppage) {
        firstStoppage.querySelector('.stoppage-name').value = '';
    }

    // Reset default values
    setDefaultValues();
}

// Attach event listeners
function attachEventListeners() {
    // Add stoppage button
    const addBtn = document.querySelector('.add-stoppage-btn');
    addBtn.addEventListener('click', addStoppage);

    // Form submission
    const form = document.getElementById('busRouteForm');
    form.addEventListener('submit', handleSubmit);
}
